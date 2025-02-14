import * as vscode from 'vscode';
import { BuildDir } from './buildDir';
import { log } from './outputChannel';
import { SymbolCodeLensProvider } from './symbolCodeLensProvider';
import { SymbolStore } from './symbolStore';


export function activate(context: vscode.ExtensionContext) {
    const buildDir = new BuildDir();
    const symbolStore = new SymbolStore();
    const symbolCodeLensProvider = new SymbolCodeLensProvider();

    context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.selectBuildDir", () => { buildDir.selectBuildDir(); }));

    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: "c", scheme: "file" }, symbolCodeLensProvider));
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: "cpp", scheme: "file" }, symbolCodeLensProvider));

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((e) => {
        if (e && ['c', 'cpp'].includes(e.document.languageId)) {
            symbolCodeLensProvider.refresh();
        }
    }));

    context.subscriptions.push(buildDir);
    context.subscriptions.push(symbolStore);
    context.subscriptions.push(symbolCodeLensProvider);

    context.subscriptions.push(buildDir.onBuildDirSelected(async function(buildDirUri) {
        log(`selected build directory: ${buildDirUri.fsPath}`);

        await symbolStore.setBuildDir(buildDirUri);
        symbolCodeLensProvider.setSymbolStore(symbolStore);
    }));

    if (vscode.workspace.workspaceFolders) { // set default build dir to project root
        buildDir.set(vscode.workspace.workspaceFolders[0].uri);
    }
}
