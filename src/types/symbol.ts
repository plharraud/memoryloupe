export enum SymbolStatus {
    "used",
    "discarded",
}

export interface Symbol {
    name: string;
    section?: string;
    status?: SymbolStatus;
    size?: number;
    address?: number;
    object?: string;
    stack_usage?: number;
    source_file?: string;
    line?: number;
}
