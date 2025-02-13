import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel("memoryloupe");

export function log(message: string) {
    outputChannel.appendLine(message);
}
