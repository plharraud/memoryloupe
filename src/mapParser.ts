import * as vscode from 'vscode';
import { readLines } from './common';
import { log } from './outputChannel';
import { SymbolArray, SymbolStatus } from './types/symbol';

const symbol_complete = /^\s(\S+)\s+(0x\S+)\s+(0x\S+)\s+(.+)$/;
const symbol_only = /^\s(\S+)$/;
const symbol_remaining = /^\s+(0x\S+)\s+(0x\S+)\s+(.+)$/;
const object_loads = /^(LOAD|START|END)\s/;
const output = /^OUTPUT/;

export async function parseMap(mapUri: vscode.Uri): Promise<SymbolArray> {
    // log(`parsing ${mapUri.fsPath}`);

    const lines = await readLines(mapUri);

    let parsed_symbols: string[][] = [];

    let state = "start";
    let previous_symbol_name = "";

    for (const line of lines) {
        let matches;

        if (state === "start") {
            if (line === "Discarded input sections" || line === "There are no discarded input sections") {
                state = "discarded";
            } else { // dont care about archive members
                continue;
            }
        } else if (state === "discarded") {
            if (matches = symbol_complete.exec(line)) {
                parsed_symbols.push(matches.slice(1).concat(["discarded"]));

            } else if (matches = symbol_only.exec(line)) {
                if (previous_symbol_name === "") {
                    previous_symbol_name = matches.slice(1)[0];
                    // console.log("found symbol only %s", previous_symbol_name);
                } else {
                    console.error("discarded: found symbol only but previous was not handled");
                    console.error(line);
                }

            } else if (matches = symbol_remaining.exec(line)) {
                if (previous_symbol_name !== "") {
                    parsed_symbols.push([previous_symbol_name].concat(matches.slice(1), ["discarded"]));
                    previous_symbol_name = "";
                    // console.log("found symbol remaining %s", discarded_symbols.at(-1));
                } else {
                    console.error("discarded: found remaining without previous symbol");
                    console.error(line);
                }

            } else if (line === "Memory Configuration") {
                state = "memory_configuration";
                previous_symbol_name = ""; // just in case

            } else {
                console.error("discarded: unhandled line type");
                console.error(line);
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
                previous_symbol_name = "";

            } else if (matches = symbol_only.exec(line)) {
                previous_symbol_name = matches.slice(1)[0]; // overwrite to use only last

            } else if (matches = symbol_remaining.exec(line)) {
                if (previous_symbol_name !== "") {
                    parsed_symbols.push([previous_symbol_name].concat(matches.slice(1)));
                    previous_symbol_name = "";
                } else {
                    // console.error("discarded: found remaining without previous symbol");
                    // console.error(line);
                }
            } else if (output.exec(line)) {
                break;

            } else {
                // console.error("memory_map: unhandled line type");
                // console.error(line);
            }
        } else {
            console.error("unhandled state");
        }
    }

    let symbols: SymbolArray = {};

    for (const matches of parsed_symbols) {
        const splits = matches[0].split("."); // ['', 'section', 'symbol']

        if (splits.length < 3) { // no symbol name, only section, don't care
            continue;
        }
        const section = "." + splits[1];
        const name = splits.at(-1)!; // take only last split
        const address = Number(matches[1]);
        const size = Number(matches[2]);
        const object = matches[3];
        const status = matches[4] === "discarded" ? SymbolStatus.discarded : SymbolStatus.used;

        symbols[name] = { name, section, address, size, status, object };
    }

    return symbols;
}
