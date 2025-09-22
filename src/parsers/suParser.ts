import { Uri } from 'vscode';
import { readLines } from '../common';
import { logger } from '../logger';
import { symbolProvider } from '../providers/symbolProvider';
import { Symbol } from '../types';

const stackusage = /^(.+):(\d+):(\d+):(\S+)\t(\d+)\t(static|dynamic|bounded)$/;

export async function parseSu(suUri: Uri) {
    logger.info("parsing", suUri.fsPath);

    const lines = await readLines(suUri);

    for (const line of lines) {
        if (line === "") { continue; }

        const matches = stackusage.exec(line);
        if (matches) {
            const source_file = matches[1];
            const lineNumber = Number(matches[2]);
            // const column = matches[3]; // ignored
            const name: string = matches[4];
            const stack_usage = Number(matches[5]);
            // const qualifier = matches[6]; // ignored

            const s: Symbol = {
                type: "symbol",
                name,
                stack_usage,
                lineNumber: {
                    source: lineNumber
                },
                file: {
                    source: source_file
                }
            };

            symbolProvider.set(s);

        } else {
            logger.error("could not match %s line %s", suUri.fsPath, line);
        }
    }

}
