import * as vscode from 'vscode';
import { onBuildDirSelected, selectBuildDir, setBuildDir } from './commands';
import { log } from './outputChannel';
import { SymbolCodeLensProvider } from './symbolCodeLensProvider';
import { SymbolStore } from './symbolStore';


export function activate(context: vscode.ExtensionContext) {
    let symbolStore;

    vscode.commands.registerCommand("memoryloupe.selectBuildDir", selectBuildDir);    

    onBuildDirSelected((buildDirUri) => {
        log(`selected build directory: ${buildDirUri.fsPath}`);

        symbolStore = new SymbolStore(buildDirUri);

        const symbolCodeLensProvider = new SymbolCodeLensProvider(symbolStore);

        vscode.window.onDidChangeActiveTextEditor((e) => {
            if (e?.document) {
                symbolCodeLensProvider.refresh();
            }
        });

        context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: "c", scheme: "file" }, symbolCodeLensProvider));
        context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: "cpp", scheme: "file" }, symbolCodeLensProvider));

        symbolCodeLensProvider.refresh();
    });

    if (vscode.workspace.workspaceFolders) {
        setBuildDir(vscode.workspace.workspaceFolders[0].uri);
    }
}
