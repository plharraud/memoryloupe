
export type SymbolMap = Map<string, Symbol>;

export interface Symbol {
    type: "symbol";
    name: string; // symbol name
    section?: string; // section from .map
    address?: number; // address in executable from .map
    size?: number; // symbol size in bytes
    stack_usage?: number; // stack usage in bytes from .su
    discarded?: boolean;
    file: {
        object?: string; // .o
        source?: string; // .c
    };
    lineNumber: {
        source?: number; // line in source file
        map?: number; // line in .map file
    };
};

export interface SymbolTreeLeaf {
    type: "object_file";
    symbols: SymbolMap;
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
