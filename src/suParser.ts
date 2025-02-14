import * as vscode from 'vscode';
import { readLines } from './common';
import { log } from './outputChannel';
import { SymbolArray } from './types/symbol';

const stackusage = /^(.+):(\d+):(\d+):(\S+)\t(\d+)\t(static|dynamic|bounded)$/;

export async function parseSu(suUri: vscode.Uri) {
    log(`parsing ${suUri.fsPath}`);

    const lines = await readLines(suUri);

    let symbols: SymbolArray = {};

    for (const line of lines) {
        let matches;

        if (matches = stackusage.exec(line)) {
            const source_file = matches[1];
            const line = Number(matches[2]);
            // ignore column matches[3]
            const name: string = matches[4];
            const stack_usage = Number(matches[5]);
            const qualifier = matches[6];

            symbols[name] = { name, stack_usage, source_file, line };
        } else {
            console.error("could not match su line %s", line);
        }
    }

    return symbols;
}
