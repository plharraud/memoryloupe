import { Disposable, EventEmitter, Event } from "vscode";
import { SymbolMap, Symbol } from "../types";

class SymbolProvider implements Disposable {
    private _onDidChange: EventEmitter<void> = new EventEmitter<void>();
    readonly onDidChange: Event<void> = this._onDidChange.event;

    private symbolMap: SymbolMap = new Map();

    dispose() {
        this.symbolMap.clear();
        this._onDidChange.dispose();
    }

    public clear() {
        this.symbolMap.clear();
        this.refresh();
    }

    public set(symbol: Symbol) {
        if (this.symbolMap.has(symbol.name)) {
            let s = this.symbolMap.get(symbol.name)!;
            // Object.assign(s, symbol); // edit object in place, does not seem to work
            for (const [k, v] of Object.entries(symbol)) {
                s[k] = v;
            }
        } else {
            this.symbolMap.set(symbol.name, symbol);
        }
    }

    public get(name: string): Symbol | undefined {
        return this.symbolMap.get(name);
    }

    public getAll(): SymbolMap {
        return this.symbolMap;
    }

    public refresh() {
        this._onDidChange.fire();
    }
}

export const symbolProvider = new SymbolProvider();