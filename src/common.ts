import * as vscode from 'vscode';
import path from 'path';

/**
 * @param mapFileUri .map file
 * @returns array of lines strings, trimmed and no empty lines
 */
export async function readLines(mapFileUri: vscode.Uri): Promise<string[]> {
    const bytes = await vscode.workspace.fs.readFile(mapFileUri);
    const content = new TextDecoder("utf-8").decode(bytes);
    const lines = content.split("\n");
    return lines
        .map((l) => l.trimEnd()) // remove \r on windows generated files
    // .filter((l) => l !== ""); // remove empty lines
}

export function resolveSourceFile(buildDir: vscode.Uri, filePath: vscode.Uri): vscode.Uri {
    console.log(filePath, buildDir);
    if (path.isAbsolute(filePath.fsPath)) return filePath;

    const absPath = path.resolve(buildDir.fsPath, filePath.fsPath);
    return vscode.Uri.file(absPath);
}


export function resolveIfAbsolute(filePath: string) {
    if (process.platform === "win32") {
        if (path.win32.isAbsolute(filePath))
            return path.win32.resolve(filePath);
    } else {
        if (path.posix.isAbsolute(filePath))
            return path.posix.resolve(filePath);
    }
    return filePath;
}