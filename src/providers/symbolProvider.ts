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
        let s = this.symbolMap.get(symbol.name);
        if (s) {
            Object.assign(s, symbol); // edit object in place
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