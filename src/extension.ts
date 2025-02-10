import * as vscode from 'vscode';
import { MapParser } from './mapParser';
import { SuParser } from './suParser';
import { SymbolCodeLensProvider } from './symbolCodeLensProvider';

export const mapParser = new MapParser(); // TODO export this but subscribe for dispose
export const suParser = new SuParser();

const mapGlob = "**/*.map";
const suGlob = "**/*.su";

function initParsers() {

    vscode.workspace.findFiles(mapGlob).then((files) => {
        files.forEach((uri) => {
            mapParser.parse(uri);
        });
    });

    vscode.workspace.findFiles(suGlob).then((files) => {
        files.forEach((uri) => {
            suParser.parse(uri);
        });
    });
}

export function activate(context: vscode.ExtensionContext) {

    const symbolCodeLensProvider = new SymbolCodeLensProvider();

    vscode.window.onDidChangeActiveTextEditor((e) => {
        if (e?.document.fileName) {
            symbolCodeLensProvider.refresh();
        }
    });

    context.subscriptions.push(vscode.languages.registerCodeLensProvider(
        { language: "c", scheme: "file" },
        symbolCodeLensProvider,
    ));
    context.subscriptions.push(vscode.languages.registerCodeLensProvider(
        { language: "cpp", scheme: "file" },
        symbolCodeLensProvider,
    ));

    initParsers();

    const suWatcher = vscode.workspace.createFileSystemWatcher(suGlob);
    suWatcher.onDidChange(async (uri) => {
        await suParser.parse(uri);
        symbolCodeLensProvider.refresh();
    });
    context.subscriptions.push(suWatcher);
    
    const mapWatcher = vscode.workspace.createFileSystemWatcher(mapGlob);
    mapWatcher.onDidChange(async (uri) => {
        await mapParser.parse(uri);
        symbolCodeLensProvider.refresh();
    });
    context.subscriptions.push(mapWatcher);
}

export function deactivate() { }
