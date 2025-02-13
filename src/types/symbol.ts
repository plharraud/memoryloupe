export interface SymbolArray {
    [name: string]: Symbol;
}

export interface Symbol {
    name: string;
    section?: string;
    address?: number;
    size?: number;
    status?: SymbolStatus;
    object?: string;
    source_file?: string;
    stack_usage?: number;
    line?: number;
}

export enum SymbolStatus {
    "used",
    "discarded",
}
