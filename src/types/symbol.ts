export type SymbolSet = Record<string, Symbol>

type datatype = "symbol" | "obj" | "dir";

export interface Symbol {
    type: Extract<datatype, "symbol">,
    name: string; // symbol name
    section?: string; // section from .map
    address?: number; // address in executable from .map
    size?: number; // symbol sizy in bytes
    status?: SymbolStatus;
    object?: string; // .o
    source_file?: string; // .c
    stack_usage?: number; // stack usage in bytes from .su
    line?: number; // line in source_file
    mapFileLine?: number;
}

type a = Map<string, Symbol>

export enum SymbolStatus {
    "used",
    "discarded",
}


export interface SymbolTreeLeafNode {
    type: "object_file";
    symbols: SymbolSet;
    total_size: number;
    name: string;
}

export interface SymbolTreeBranchNode {
    type: "root" | "directory";
    children: Record<string, SymbolTreeNode>;
    name: string;
}

export type SymbolTreeNode = SymbolTreeBranchNode | SymbolTreeLeafNode