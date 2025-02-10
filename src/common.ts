import * as vscode from 'vscode';

export async function readLines(mapFileUri: vscode.Uri) {
    const file = await vscode.workspace.fs.readFile(mapFileUri);
    const content = Buffer.from(file).toString("utf-8");
    const lines = content.split("\n");
    return lines.filter((l) => l !== "");
}
