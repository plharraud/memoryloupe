import * as vscode from 'vscode';
import { readLines } from '../common';
import { logger } from '../logger';
import { symbolProvider } from '../providers/symbolProvider';
import { Symbol } from '../types';

const symbol_complete = /^\s(\S+)\s+(0x\S+)\s+(0x\S+)\s+(.+)$/;
const symbol_only = /^\s(\S+)$/;
const symbol_remaining = /^\s+(0x\S+)\s+(0x\S+)\s+(.+)$/;
const object_loads = /^(LOAD|START|END)\s/;
const output = /^OUTPUT/;

type mapState = "start" | "discarded" | "memory_configuration" | "memory_map";

export async function parseMap(mapUri: vscode.Uri) {
    logger.info("parsing", mapUri.fsPath);

    const lines = await readLines(mapUri);

    let parsed_symbols: string[][] = [];
    let lineNumbers: number[] = [];

    let state: mapState = "start";
    let previous_symbol_name = "";

    for (const [lineNumber, line] of lines.entries()) {
        if (line === "") { continue; }

        let matches;

        if (state === "start") {
            if (line === "Discarded input sections" || line === "There are no discarded input sections") {
                state = "discarded";
            } else { // dont care about archive members
                continue;
            }
        } else if (state === "discarded") {
            if (matches = symbol_complete.exec(line)) {
                logger.debug("discarded: found complete", previous_symbol_name, matches.slice(1));
                parsed_symbols.push(matches.slice(1).concat(["discarded"]));
                lineNumbers.push(lineNumber);

            } else if (matches = symbol_only.exec(line)) {
                if (previous_symbol_name === "") {
                    previous_symbol_name = matches.slice(1)[0];
                    logger.debug("discarded: found symbol only", previous_symbol_name);
                } else {
                    logger.error("discarded: found symbol only but previous was not handled", line);
                }

            } else if (matches = symbol_remaining.exec(line)) {
                if (previous_symbol_name !== "") {
                    logger.debug("discarded: found remaining", previous_symbol_name, matches.slice(1));
                    parsed_symbols.push([previous_symbol_name].concat(matches.slice(1), ["discarded"]));
                    lineNumbers.push(lineNumber - 1);
                    previous_symbol_name = "";
                } else {
                    logger.error("discarded: found remaining without previous symbol");
                    logger.error(line);
                }

            } else if (line === "Memory Configuration") {
                state = "memory_configuration";
                previous_symbol_name = ""; // just in case

            } else {
                logger.error("discarded: unhandled line type");
                logger.error(line);
            }
        } else if (state === "memory_configuration") {
            if (line === "Linker script and memory map") {
                state = "memory_map";
            }
        } else if (state === "memory_map") {
            if (object_loads.exec(line)) {
                continue;

            } else if (matches = symbol_complete.exec(line)) {
                parsed_symbols.push(matches.slice(1));
                lineNumbers.push(lineNumber);
                previous_symbol_name = "";

            } else if (matches = symbol_only.exec(line)) {
                previous_symbol_name = matches.slice(1)[0]; // overwrite to use only last

            } else if (matches = symbol_remaining.exec(line)) {
                if (previous_symbol_name !== "") {
                    parsed_symbols.push([previous_symbol_name].concat(matches.slice(1)));
                    lineNumbers.push(lineNumber - 1);
                    previous_symbol_name = "";
                } else {
                    logger.error("memory_map: found remaining without previous symbol");
                    logger.error(line);
                }
            } else if (output.exec(line)) {
                break;

            } else {
                logger.error("memory_map: unhandled line type");
                logger.error(line);
            }
        }
    }

    for (const [i, matches] of parsed_symbols.entries()) {
        const splits = matches[0].split("."); // ['', 'section', 'symbol', 'number']

        if (splits.length < 3) { // no symbol name, only section, don't care
            logger.debug("map: no symbol name, only section", splits);
            continue;
        }
        const section = "." + splits[1];
        const name = splits.slice(2).join("."); // take everything after section
        const address = Number(matches[1]);
        const size = Number(matches[2]);
        const object = matches[3];
        const discarded = matches[4] === "discarded";
        const mapLineNumber = lineNumbers[i] + 1; // zero indexed

        const s: Symbol = {
            type: "symbol",
            name,
            section,
            address,
            size,
            discarded,
            objectFile: object,
            mapLineNumber: mapLineNumber
        };

        symbolProvider.set(s);

    }

}
