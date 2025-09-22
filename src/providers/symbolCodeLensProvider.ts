import { CodeLensProvider, Disposable, EventEmitter, Event, Uri, SymbolInformation, commands, TextDocument, CancellationToken, CodeLens } from 'vscode';
import { config } from '../config';
import { symbolProvider } from './symbolProvider';
import { logger } from '../logger';
import { formatSymbolInfo } from '../format';

export class SymbolCodeLensProvider implements CodeLensProvider, Disposable {
    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
        // if (!this.enabled) { return []; }
        logger.info("providing codelenses for", document.fileName);

        const documentSymbols = await commands.executeCommand<SymbolInformation[]>("vscode.executeDocumentSymbolProvider", document.uri);
        const lenseFormat = config.getLenseFormat();
        const lenses: CodeLens[] = [];

        for (const documentSymbol of documentSymbols.values()) {

            const symbol_name = documentSymbol.name.split("(")[0];
            const symbol = symbolProvider.get(symbol_name);

            if (symbol) {
                const title = formatSymbolInfo(lenseFormat, {
                    "name": symbol.name,
                    "section": symbol.section,
                    "address": symbol.address ? `0x${symbol.address.toString(16)}` : undefined,
                    "size": symbol.size ? `${symbol.size}B` : undefined,
                    "discarded": symbol.discarded ? 'discarded' : undefined,
                    "stack": symbol.stack_usage ? `${symbol.stack_usage}B` : undefined,
                });

                lenses.push(new CodeLens(documentSymbol.location.range, { title, command: "" }));
            }
        }

        return lenses;
    }


    dispose() {
        this._onDidChangeCodeLenses.dispose();
    }

    refresh() {
        logger.info("refresh code lenses");
        this._onDidChangeCodeLenses.fire();
    }

}
