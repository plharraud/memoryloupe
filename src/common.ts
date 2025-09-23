import * as vscode from 'vscode';
import path from 'path';
import { workspace } from 'vscode';
import { TextDecoder } from 'node:util';

/**
 * @param mapFileUri .map file
 * @returns array of lines strings, trimmed and no empty lines
 */
export async function readLines(mapFileUri: vscode.Uri): Promise<string[]> {
    const bytes = await workspace.fs.readFile(mapFileUri);
    const content = new TextDecoder("utf-8").decode(bytes);
    const lines = content.split("\n");
    return lines.map((l) => l.trimEnd()); // remove \r on windows generated files
}

export function resolveSourceFile(parentPath: string, filePath: string): string {
    if (process.platform === "win32") {
        if (path.win32.isAbsolute(filePath)) {
            return path.win32.resolve(filePath); // in case the path is like C:/A/B/../C -> C:/A/C
        } else {
            return path.win32.resolve(parentPath, filePath); // resolve the file path relative to the parent
        }
    } else {
        if (path.posix.isAbsolute(filePath)) {
            return path.posix.resolve(filePath); // in case the path is like /A/B/../C -> /A/C
        } else {
            return path.posix.resolve(parentPath, filePath); // resolve the file path relative to the parent
        }
    }
}

export function resolveIfAbsolute(filePath: string) {
    return filePath;
}