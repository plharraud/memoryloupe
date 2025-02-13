import * as vscode from 'vscode';
import { parseMap } from './mapParser';
import { parseSu } from './suParser';
import { Symbol, SymbolArray } from './types/symbol';
import { log } from './outputChannel';

const mapGlob = "**/*.map";
const suGlob = "**/*.su";

export class SymbolStore {

    private symbols: SymbolArray = {};

    private buildDirUri: vscode.Uri;

    private mapRelGlob: vscode.RelativePattern;
    public mapWatcher: vscode.FileSystemWatcher | undefined;

    private suRelGlob: vscode.RelativePattern;
    public suWatcher: vscode.FileSystemWatcher | undefined;

    constructor(buildDirUri: vscode.Uri) {
        this.buildDirUri = buildDirUri;
        this.mapRelGlob = new vscode.RelativePattern(this.buildDirUri.fsPath, mapGlob);
        this.suRelGlob = new vscode.RelativePattern(this.buildDirUri.fsPath, suGlob);

        this.parseAll();
        this.initWatchers();
    }

    public clear() {
        this.symbols = {};
    }

    public async parseAll() {
        let mapFiles = await vscode.workspace.findFiles(this.mapRelGlob, null, 1);
        if (mapFiles.length > 0) {
            this.merge(await parseMap(mapFiles[0]));
        }

        vscode.workspace.findFiles(this.suRelGlob).then((files) => {
            files.forEach(async (uri) => {
                this.merge(await parseSu(uri));
            });
        });
    }

    public initWatchers() {
        if (!this.buildDirUri) { return; }

        if (this.suWatcher) { this.suWatcher.dispose(); }
        const relSuGlob = new vscode.RelativePattern(this.buildDirUri.fsPath, suGlob);
        this.suWatcher = vscode.workspace.createFileSystemWatcher(relSuGlob);

        this.suWatcher.onDidCreate(async (uri) => { this.merge(await parseSu(uri)); });
        this.suWatcher.onDidChange(async (uri) => { this.merge(await parseSu(uri)); });

        if (this.mapWatcher) { this.mapWatcher.dispose(); }
        const relMapGlob = new vscode.RelativePattern(this.buildDirUri.fsPath, mapGlob);
        this.mapWatcher = vscode.workspace.createFileSystemWatcher(relMapGlob);

        this.mapWatcher.onDidCreate(async (uri) => { this.merge(await parseMap(uri)); });
        this.mapWatcher.onDidChange(async (uri) => { this.merge(await parseMap(uri)); });

    }

    public getByName(symbolName: string): Symbol {
        return this.symbols[symbolName];
    }

    public merge(symbols: SymbolArray) {
        let name: keyof SymbolArray;
        for (const name in symbols) {
            this.symbols[name] = { ...this.symbols[name], ...symbols[name] };
            // log(`updated ${name}`);
        }
        log(`updated ${Object.keys(symbols).length} symbols`);
    }
}