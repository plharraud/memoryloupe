
export type SymbolMap = Map<string, Symbol>;

export interface Symbol extends Record<string, any> { // must be kept flat for Object.assign to work (shallow)
    type: "symbol";
    name: string; // symbol name
    section?: string; // section from .map
    address?: number; // address in executable from .map
    size?: number; // symbol size in bytes
    stack_usage?: number; // stack usage in bytes from .su
    discarded?: boolean;
    objectFile?: string; // .o
    sourceFile?: string; // .c
    sourceLineNumber?: number; // line in source file
    mapLineNumber?: number; // line in .map file
};

export interface SymbolTreeLeaf {
    type: "object_file";
    symbols: Record<string, Symbol>;
    total_size: number;
    name: string;
}

export interface SymbolTreeBranch {
    type: "root" | "directory";
    children: Record<string, SymbolTreeNode>;
    name: string;
}

export type SymbolTreeNode = SymbolTreeBranch | SymbolTreeLeaf;
export type TreeNode = SymbolTreeNode | Symbol;
