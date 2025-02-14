import * as vscode from 'vscode';
import { SymbolStore } from './symbolStore';
import { SymbolStatus } from './types/symbol';

async function getDocumentSymbols(documentUri: vscode.Uri): Promise<vscode.SymbolInformation[]> {
    return await vscode.commands.executeCommand(
        "vscode.executeDocumentSymbolProvider",
        documentUri,
    );
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

        documentSymbols.forEach((ds) => {
            const symbol_name = ds.name.split("(")[0];
            const symbol = this.symbolStore?.getByName(symbol_name);

            if (symbol) {
                let bits = [];
                bits.push(`size: ${symbol.size ?? 0}B`);

                bits.push(` stack: ${symbol.stack_usage ?? 0}B`);

                if (symbol.address) {
                    bits.push(`0x${symbol.address.toString(16)}`);
                } else if (symbol.status === SymbolStatus.discarded) {
                    bits.push("discarded");
                }

                lenses.push(new vscode.CodeLens(
                    ds.location.range,
                    { title: bits.join(", "), command: "" }
                ));
            }
        });

        return lenses;
    }

    refresh() {
        console.log("refresh code lenses");
        this._onDidChangeCodeLenses.fire();
    }

}
