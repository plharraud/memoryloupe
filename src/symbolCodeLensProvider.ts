import * as vscode from 'vscode';
import { SymbolStore } from './symbolStore';
import { SymbolStatus } from './types/symbol';
import { extConfig } from './config';

async function getDocumentSymbols(documentUri: vscode.Uri): Promise<vscode.SymbolInformation[]> {
    return await vscode.commands.executeCommand(
        "vscode.executeDocumentSymbolProvider",
        documentUri,
    );
}

const template_regex = /\$(?:\[([^\{\}]+)\])?\{(\w+)\}/g; // matches $[prefix]{key} or ${key}

export function formatLense(lenseFormat: string, values: { [name: string]: string | undefined }) {
    return lenseFormat.replace(template_regex, (_, prefix, key) => {
        return key in values && values[key]
            ? (prefix ?? '') + values[key]
            : '';
    });
}

export class SymbolCodeLensProvider implements vscode.CodeLensProvider, vscode.Disposable {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    private symbolStore: SymbolStore | undefined;
    public enabled: boolean;

    constructor() {
        this.enabled = extConfig.getCodeLensesEnabled();
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    setSymbolStore(symbolStore: SymbolStore) {
        this.symbolStore = symbolStore;
        this.refresh();
    }

    async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        if (!this.enabled) { return []; }
        console.log("providing codelenses for %s", document.fileName);

        const lenses: vscode.CodeLens[] = [];
        const documentSymbols = await getDocumentSymbols(document.uri);

        const lenseFormat = extConfig.getLenseFormat();

        documentSymbols.forEach((ds) => {
            const symbol_name = ds.name.split("(")[0];
            const symbol = this.symbolStore?.getByName(symbol_name);

            if (symbol) {
                const title = formatLense(lenseFormat, {
                    "name": symbol.name,
                    "section": symbol.section,
                    "address": symbol.address ? `0x${symbol.address.toString(16)}` : undefined,
                    "size": symbol.size ? `${symbol.size}B` : undefined,
                    "status": symbol.status === SymbolStatus.discarded ? 'discarded' : undefined,
                    "stack": symbol.stack_usage ? `${symbol.stack_usage}B` : undefined,
                });

                lenses.push(new vscode.CodeLens(ds.location.range, { title, command: "" }));
            }
        });

        return lenses;
    }


    dispose() {
        this._onDidChangeCodeLenses.dispose();
    }

    refresh() {
        console.log("refresh code lenses");
        this._onDidChangeCodeLenses.fire();
    }

}
