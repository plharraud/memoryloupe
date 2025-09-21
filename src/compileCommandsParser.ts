import * as vscode from 'vscode';

interface CompileCommand {
    directory: string;
    command?: string;
    // arguments?: string[];
    file: string;
    output?: string;
}


export async function loadCompileCommands(compileCommandsUri: vscode.Uri): Promise<CompileCommand[]> {
    const bytes = await vscode.workspace.fs.readFile(compileCommandsUri);
    const content = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(content) as CompileCommand[];
}

export async function parseCompileCommands(compileCommandsUri: vscode.Uri): Promise<Record<string, string>> {

    let compileCommands: CompileCommand[] = await loadCompileCommands(compileCommandsUri);

    let assocations: Record<string, string> = {};
    for (const el of compileCommands) {
        if (el.output) {
            assocations[el.output] = el.file;
        }
    }

    return assocations;
}
