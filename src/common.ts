import * as vscode from 'vscode';

/**
 * 
 * @param mapFileUri .map file
 * @returns array of lines strings, trimmed and no empty lines
 */
export async function readLines(mapFileUri: vscode.Uri): Promise<string[]> {
    const file = await vscode.workspace.fs.readFile(mapFileUri);
    const content = Buffer.from(file).toString("utf-8");
    const lines = content.split("\n");
    return lines
        .map((l) => l.trimEnd()) // remove \r on windows files
        .filter((l) => l !== "");
}
