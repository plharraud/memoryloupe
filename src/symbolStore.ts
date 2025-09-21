import * as vscode from 'vscode';
import { parseMap } from './mapParser';
import { log } from './outputChannel';
import { parseSu } from './suParser';
import { Symbol, SymbolSet } from './types/symbol';
import { parseCompileCommands } from './compileCommandsParser';

const mapGlob = "**/*.map";
const suGlob = "**/*.su";
const compileCommandsGlob = "**/compile_commands.json";

export class SymbolStore implements vscode.Disposable {

    private symbols: SymbolSet = {};

    private buildDirUri!: vscode.Uri;

    private mapRelGlob!: vscode.RelativePattern;
    public mapWatcher!: vscode.FileSystemWatcher;

    private suRelGlob!: vscode.RelativePattern;
    public suWatcher!: vscode.FileSystemWatcher;

    private compileCommandsRelGlob!: vscode.RelativePattern;
    public compileCommandsWatcher!: vscode.FileSystemWatcher;

    public mapFile!: vscode.Uri;

    private objSrcAssociations!: Record<string, string>;

    dispose() {
        this.mapWatcher.dispose();
        this.suWatcher.dispose();
        this.compileCommandsWatcher.dispose();
    }

    async setBuildDir(buildDirUri: vscode.Uri) {
        this.symbols = {};
        this.buildDirUri = buildDirUri;
        this.mapRelGlob = new vscode.RelativePattern(this.buildDirUri.fsPath, mapGlob);
        this.suRelGlob = new vscode.RelativePattern(this.buildDirUri.fsPath, suGlob);
        this.compileCommandsRelGlob = new vscode.RelativePattern(this.buildDirUri.fsPath, compileCommandsGlob);
        await this.parseAll();
        this.initWatchers();
    }

    async parseAll() {
        let mapFiles = await vscode.workspace.findFiles(this.mapRelGlob, null, 1);
        if (mapFiles.length > 0) {
            this.pushSymbols(await parseMap(mapFiles[0]));
            this.mapFile = mapFiles[0];
        }

        vscode.workspace.findFiles(this.suRelGlob).then((files) => {
            files.forEach(async (uri) => {
                this.pushSymbols(await parseSu(uri));
            });
        });

        let compile_commands = await vscode.workspace.findFiles(this.compileCommandsRelGlob, null, 1);
        if (compile_commands.length > 0) {
            this.objSrcAssociations = await parseCompileCommands(compile_commands[0]);
        }
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


        if (this.compileCommandsWatcher) { this.compileCommandsWatcher.dispose(); }
        this.compileCommandsWatcher = vscode.workspace.createFileSystemWatcher(this.compileCommandsRelGlob);
        this.compileCommandsWatcher.onDidCreate(async (uri) => { this.objSrcAssociations = await parseCompileCommands(uri); });
        this.compileCommandsWatcher.onDidChange(async (uri) => { this.objSrcAssociations = await parseCompileCommands(uri); });
    }

    getByName(symbolName: string): Symbol {
        return this.symbols[symbolName];
    }

    getAll(): SymbolSet {
        return this.symbols;
    }

    getSourceFile(objectFile: string | undefined): string | undefined {
        if (objectFile && objectFile in this.objSrcAssociations) {
            return this.objSrcAssociations[objectFile];
        }
        return undefined;
    }

    /*
     * Merge symbols to symbol store, replacing existing fields
     */
    pushSymbols(symbols: SymbolSet) {
        let name: keyof SymbolSet;
        for (name in symbols) {
            this.symbols[name] = { ...this.symbols[name], ...symbols[name] };
            // log(`updated ${name}`);
        }
        // log(`updated ${Object.keys(symbols).length} symbols`);
    }
}