import * as vscode from 'vscode';
import { BuildDir } from './buildDir';
import { extConfig } from './config';
import { log } from './outputChannel';
import { SymbolCodeLensProvider } from './symbolCodeLensProvider';
import { SymbolStore } from './symbolStore';
import { SymbolNode, SymbolTreeProvider } from './symbolTreeProvider';
import { resolveSourceFile } from './common';

export function activate(context: vscode.ExtensionContext) {
    const buildDir = new BuildDir();
    const symbolStore = new SymbolStore();
    const symbolCodeLensProvider = new SymbolCodeLensProvider();
    const symbolTreeProvider = new SymbolTreeProvider();

    context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.selectBuildDir", () => { buildDir.selectBuildDir(); }));
    context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.toggleCodeLenses", () => {
        extConfig.setCodeLensesEnabled(!symbolCodeLensProvider.enabled); // update config, then config watcher updates provider
    }));
    context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.goToSymbolSourcefile", (node: SymbolNode) => {
        // button to run command is not shown if !source_file so symbol and source_file are defined for sure
        const symbol = node.symbol!;
        const source_file = vscode.Uri.file(node.source_file!);
        const buildDirUri = extConfig.getBuildDir();

        console.log("gotosymbol callback", buildDirUri, symbol);

        if (buildDirUri) {
            vscode.window.showTextDocument(resolveSourceFile(buildDirUri, source_file),
                { selection: symbol.line ? new vscode.Range(symbol.line - 1, 0, symbol.line - 1, 0) : undefined });
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.goToSymbolMapfile", (node: SymbolNode) => {
        const symbol = node.symbol!;

        if (symbolStore.mapFile)
            vscode.window.showTextDocument(symbolStore.mapFile,
                { selection: symbol.mapFileLine ? new vscode.Range(symbol.mapFileLine - 1, 0, symbol.mapFileLine - 1, 0) : undefined });

    }));
    context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.refreshTreeview", () => {
        symbolTreeProvider.refresh();
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
    context.subscriptions.push(vscode.window.createTreeView("memoryloupeTreeview", {
        showCollapseAll: true,
        treeDataProvider: symbolTreeProvider
    }));

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((e) => {
        if (e && ['c', 'cpp'].includes(e.document.languageId)) {
            symbolCodeLensProvider.refresh();
        }
    }));

    context.subscriptions.push(buildDir);
    context.subscriptions.push(symbolStore);
    context.subscriptions.push(symbolCodeLensProvider);
    context.subscriptions.push(symbolTreeProvider);

    context.subscriptions.push(buildDir.onDidChangeBuildDir(async function (buildDirUri) {
        log(`build directory: ${buildDirUri.fsPath}`);

        await symbolStore.setBuildDir(buildDirUri);
        symbolCodeLensProvider.setSymbolStore(symbolStore);
        symbolTreeProvider.setSymbolStore(symbolStore);
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
