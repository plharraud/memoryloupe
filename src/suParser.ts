import * as vscode from 'vscode';
import { readLines } from './common';
import { Symbol } from './types/symbol';

export class SuParser {

    symbols: Symbol[];

    constructor() {
        this.symbols = [];
    }

    clear() {
        this.symbols = [];
    }

    async parse(suFileUri: vscode.Uri) {
        const lines = await readLines(suFileUri);

        const stackusage = /^(.+):(\d+):(\d+):(\S+)\t(\d+)\t(static|dynamic|bounded)$/;

        let symbols: Symbol[] = [];

        for (const line of lines) {
            let matches;

            if (matches = stackusage.exec(line)) {
                const source_file = matches[1];
                const line_number = Number(matches[2]);
                const name = matches[4];
                const stack_usage = Number(matches[5]);
                const qualifier = matches[6];

                symbols.push({
                    name,
                    stack_usage,
                });

            } else {
                console.error("could not match su line %s", line);
            }

        }

        this.symbols = this.symbols.concat(symbols);
    }
}