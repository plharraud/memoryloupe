import * as vscode from 'vscode';
import { BuildDir } from './buildDir';
import { extConfig } from './config';
import { log } from './outputChannel';
import { SymbolCodeLensProvider } from './symbolCodeLensProvider';
import { SymbolStore } from './symbolStore';

export function activate(context: vscode.ExtensionContext) {
    const buildDir = new BuildDir();
    const symbolStore = new SymbolStore();
    const symbolCodeLensProvider = new SymbolCodeLensProvider();

    context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.selectBuildDir", () => { buildDir.selectBuildDir(); }));
    context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.toggleCodeLenses", () => {
        extConfig.setCodeLensesEnabled(!symbolCodeLensProvider.enabled); // update config, then config watcher updates provider
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("memoryloupe.buildDir")) {
            let buildDirUri = extConfig.getBuildDir();
            if (buildDirUri) {
                buildDir.set(buildDirUri);
            }
        }
        if (e.affectsConfiguration("memoryloupe.codeLensesEnabled")) {
            const enabled = extConfig.getCodeLensesEnabled();
            symbolCodeLensProvider.setEnabled(enabled);
        }
    }));

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

    context.subscriptions.push(buildDir.onDidChangeBuildDir(async function (buildDirUri) {
        log(`build directory: ${buildDirUri.fsPath}`);

        await symbolStore.setBuildDir(buildDirUri);
        symbolCodeLensProvider.setSymbolStore(symbolStore);
    }));

    if (vscode.workspace.workspaceFolders) {
        const buildDirUri = extConfig.getBuildDir();
        if (buildDirUri) { // use saved build dir
            buildDir.set(buildDirUri);
        } else { // or set default to project root
            buildDir.set(vscode.workspace.workspaceFolders[0].uri);
        }
    }
}
