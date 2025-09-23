import { commands, ExtensionContext, languages, Range, Uri, window, workspace } from 'vscode';
import * as packageJson from '../package.json';
import { setBuildDir } from './commands/setBuildDir';
import { config, onDidChangeConfiguration } from './config';
import { logger } from './logger';
import { SymbolCodeLensProvider } from './providers/symbolCodeLensProvider';
import { SymbolNode, symbolTreeProvider } from './providers/symbolTreeProvider';
import { watchers } from './watchers';
import { Symbol } from './types';


export function activate(ctx: ExtensionContext) {
    logger.info("activating memoryloupe version %s", packageJson.version);

    const symbolCodeLensProvider = new SymbolCodeLensProvider();

    let buildDir: Uri | undefined;

    if (config.getBuildDir()) {
        buildDir = config.getBuildDir(); // todo sanitize / resolve
    } else if (workspace.workspaceFolders) {
        buildDir = workspace.workspaceFolders[0].uri;
    }

    ctx.subscriptions.push(watchers);
    watchers.setBuildDir(buildDir);

    ctx.subscriptions.push(symbolCodeLensProvider);
    ctx.subscriptions.push(languages.registerCodeLensProvider({ language: "c", scheme: "file" }, symbolCodeLensProvider));
    ctx.subscriptions.push(languages.registerCodeLensProvider({ language: "cpp", scheme: "file" }, symbolCodeLensProvider));

    ctx.subscriptions.push(commands.registerCommand("memoryloupe.setBuildDir", setBuildDir));

    // command or user sets config, config updates, fires event, updates watchers
    // watchers updates symbolprovider ?

    ctx.subscriptions.push(workspace.onDidChangeConfiguration(onDidChangeConfiguration));

    ctx.subscriptions.push(commands.registerCommand("memoryloupe.goToSymbolSourcefile", (symbol: Symbol) => {
        // button to run command is not shown if !source_file so symbol and source_file are defined for sure
        const source_file = Uri.file(symbol.sourceFile!);

        window.showTextDocument(source_file, { selection: symbol.sourceLineNumber ? new Range(symbol.sourceLineNumber - 1, 0, symbol.sourceLineNumber - 1, 0) : undefined });
    }));

    ctx.subscriptions.push(commands.registerCommand("memoryloupe.goToSymbolMapfile", (symbol: Symbol) => {
        window.showTextDocument(watchers.mapFile, { selection: symbol.mapLineNumber ? new Range(symbol.mapLineNumber - 1, 0, symbol.mapLineNumber - 1, 0) : undefined });
    }));



    ctx.subscriptions.push(symbolTreeProvider);
    ctx.subscriptions.push(window.createTreeView("memoryloupeTreeview", {
        showCollapseAll: true,
        treeDataProvider: symbolTreeProvider
    }));




    // context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.toggleCodeLenses", () => {
    //     extConfig.setCodeLensesEnabled(!symbolCodeLensProvider.enabled); // update config, then config watcher updates provider
    // }));
    // context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.goToSymbolSourcefile", (node: SymbolNode) => {
    //     // button to run command is not shown if !source_file so symbol and source_file are defined for sure
    //     const symbol = node.symbol!;
    //     const source_file = vscode.Uri.file(node.source_file!);
    //     const buildDirUri = extConfig.getBuildDir();

    //     console.log("gotosymbol callback", buildDirUri, symbol);

    //     if (buildDirUri) {
    //         vscode.window.showTextDocument(resolveSourceFile(buildDirUri, source_file),
    //             { selection: symbol.line ? new vscode.Range(symbol.line - 1, 0, symbol.line - 1, 0) : undefined });
    //     }
    // }));

    // context.subscriptions.push(vscode.commands.registerCommand("memoryloupe.goToSymbolMapfile", (node: SymbolNode) => {
    //     const symbol = node.symbol!;

    //     if (symbolStore.mapFile)
    //         vscode.window.showTextDocument(symbolStore.mapFile,
    //             { selection: symbol.mapFileLine ? new vscode.Range(symbol.mapFileLine - 1, 0, symbol.mapFileLine - 1, 0) : undefined });

    // }));
    ctx.subscriptions.push(commands.registerCommand("memoryloupe.refreshTreeview", () => {
        symbolTreeProvider.refresh();
    }));


}
