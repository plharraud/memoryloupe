import * as vscode from 'vscode';
import { mapParser } from './extension';
import { suParser } from './extension';
import { SymbolStatus } from './types/symbol';

export class SymbolCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        console.log("providing codelenses for %s", document.fileName);

        const documentSymbols: vscode.SymbolInformation[] = await vscode.commands.executeCommand(
            "vscode.executeDocumentSymbolProvider",
            document.uri,
        );
        if (!documentSymbols) { return []; }

        const lenses: vscode.CodeLens[] = [];
        documentSymbols.forEach((ds) => {
            const symbol_name = ds.name.split("(")[0];
            const mapfile_symbol = mapParser.symbols.find(s => s.name === symbol_name);
            const sufile_symbol = suParser.symbols.find(s => s.name === symbol_name);

            if (mapfile_symbol) {
                let title = `size: ${mapfile_symbol.size}B`;
                if (mapfile_symbol.status === SymbolStatus.discarded) {
                    title += " (discarded)";
                }

                if (sufile_symbol) {
                    title += ` stack: ${sufile_symbol.stack_usage}B`;
                }

                lenses.push(new vscode.CodeLens(
                    ds.location.range,
                    { title, command: "" }
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
