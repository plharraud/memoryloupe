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

const template_regex = /%(\w+)/g;

function formatLense(lenseFormat: string, values: { [name: string]: string }) {
    return lenseFormat.replace(template_regex, (_, k) => {
        return k in values ? values[k] : _;
    });
}

export class SymbolCodeLensProvider implements vscode.CodeLensProvider, vscode.Disposable {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    private symbolStore: SymbolStore | undefined;

    dispose() {
        this._onDidChangeCodeLenses.dispose();
    }

    setSymbolStore(symbolStore: SymbolStore) {
        this.symbolStore = symbolStore;
        this.refresh();
    }

    async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
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
                    "section": symbol.section ?? '',
                    "address": symbol.address ? `0x${symbol.address.toString(16)}` : '',
                    "size": `${symbol.size ?? 0}B`,
                    "status": symbol.status === SymbolStatus.discarded ? 'discarded' : '',
                    "stack": `${symbol.stack_usage ?? 0}B`,
                });

                lenses.push(new vscode.CodeLens(ds.location.range, { title, command: "" }));
            }
        });

        return lenses;
    }

    refresh() {
        console.log("refresh code lenses");
        this._onDidChangeCodeLenses.fire();
    }

}
