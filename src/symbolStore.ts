import * as vscode from 'vscode';
import { parseMap } from './mapParser';
import { log } from './outputChannel';
import { parseSu } from './suParser';
import { Symbol, SymbolArray } from './types/symbol';

const mapGlob = "**/*.map";
const suGlob = "**/*.su";

export class SymbolStore implements vscode.Disposable {

    private symbols: SymbolArray = {};

    private buildDirUri!: vscode.Uri;

    private mapRelGlob!: vscode.RelativePattern;
    public mapWatcher!: vscode.FileSystemWatcher;

    private suRelGlob!: vscode.RelativePattern;
    public suWatcher!: vscode.FileSystemWatcher;

    dispose() {
        this.mapWatcher.dispose();
        this.suWatcher.dispose();
    }

    async setBuildDir(buildDirUri: vscode.Uri) {
        this.symbols = {};
        this.buildDirUri = buildDirUri;
        this.mapRelGlob = new vscode.RelativePattern(this.buildDirUri.fsPath, mapGlob);
        this.suRelGlob = new vscode.RelativePattern(this.buildDirUri.fsPath, suGlob);
        await this.parseAll();
        this.initWatchers();
    }

    async parseAll() {
        let mapFiles = await vscode.workspace.findFiles(this.mapRelGlob, null, 1);
        if (mapFiles.length > 0) {
            this.pushSymbols(await parseMap(mapFiles[0]));
        }

        vscode.workspace.findFiles(this.suRelGlob).then((files) => {
            files.forEach(async (uri) => {
                this.pushSymbols(await parseSu(uri));
            });
        });
    }

    initWatchers() {
        if (!this.buildDirUri) { return; }

        if (this.mapWatcher) { this.mapWatcher.dispose(); }
        this.mapWatcher = vscode.workspace.createFileSystemWatcher(this.mapRelGlob);

        this.mapWatcher.onDidCreate(async (uri) => { this.pushSymbols(await parseMap(uri)); });
        this.mapWatcher.onDidChange(async (uri) => { this.pushSymbols(await parseMap(uri)); });

        if (this.suWatcher) { this.suWatcher.dispose(); }
        this.suWatcher = vscode.workspace.createFileSystemWatcher(this.suRelGlob);

        this.suWatcher.onDidCreate(async (uri) => { this.pushSymbols(await parseSu(uri)); });
        this.suWatcher.onDidChange(async (uri) => { this.pushSymbols(await parseSu(uri)); });
    }

    getByName(symbolName: string): Symbol {
        return this.symbols[symbolName];
    }

    /*
     * Merge symbols to symbol store, replacing existing fields
     */
    pushSymbols(symbols: SymbolArray) {
        let name: keyof SymbolArray;
        for (name in symbols) {
            this.symbols[name] = { ...this.symbols[name], ...symbols[name] };
            // log(`updated ${name}`);
        }
        // log(`updated ${Object.keys(symbols).length} symbols`);
    }
}