

import { logger } from "./logger";
import { symbolProvider } from "./providers/symbolProvider";
import { Symbol, SymbolTreeBranch, SymbolTreeLeaf, SymbolTreeNode } from "./types";

// eliminate dirs with only one children
// finds the top level of the source files
function eliminateSingleParent(t: SymbolTreeNode): SymbolTreeBranch {
    if (t.type === "object_file") {
        const newRoot: SymbolTreeBranch = {
            type: "directory",
            name: "EEE",
            children: { [t.name]: t }
        };
        logger.info("tree eliminate: single object file", newRoot);
        return newRoot;
    }

    const children = Object.values(t["children"]);
    if (children.length > 1) {
        // t["type"] = "root";
        logger.info("tree eliminate: found node with more than 1 child", t);
        return t;
    }
    else {
        logger.info("tree eliminate: eliminating node with one child", t);
        return eliminateSingleParent(children[0]);
    }
}

export function buildSymbolTreeFlat(): SymbolTreeBranch {
    let symbols = Object.fromEntries(symbolProvider.getAll().entries());

    return {
        type: "root",
        name: "root",
        children: {
            symbols: {
                type: "object_file",
                name: "symbols",
                total_size: 0,
                symbols,
            }
        }
    };
}


export function buildSymbolTree(): SymbolTreeBranch {

    let syms = symbolProvider.getAll();

    // build tree by reducing over each symbol
    let system_symbols: Record<string, Symbol> = Object();
    let tree: SymbolTreeBranch = syms.values().reduce((tree, cur_symbol) => {

        if (cur_symbol.sourceFile) {
            const chunks = cur_symbol.sourceFile.split("/");
            if (chunks[0] == "..") {
                console.log("..", cur_symbol);
            }
            chunks.reduce((tree_acc, current_part, i, splits) => {
                const isLeaf = (splits.length - i) === 1;
                if (!tree_acc["children"].hasOwnProperty(current_part)) { // current_part not yet in tree
                    if (isLeaf) { // leaf (file.c)
                        tree_acc["children"][current_part] = { type: "object_file", name: current_part, symbols: { [cur_symbol.name]: cur_symbol }, total_size: cur_symbol.size }; // create leaf object with one symbol
                    } else { // branch (dir)
                        tree_acc["children"][current_part] = { type: "directory", name: current_part, children: {} }; // create dir object
                    }
                } else { // current_part already exists in tree
                    if (isLeaf) { // leaf (file.c)
                        tree_acc["children"][current_part]["symbols"][cur_symbol.name] = cur_symbol; // add symbol to leaf object
                        tree_acc["children"][current_part]["total_size"] += cur_symbol.size;
                    }
                }
                return tree_acc["children"][current_part];
            }, tree);
        } else {
            system_symbols[cur_symbol.name] = cur_symbol;
        }
        return tree;

    }, Object({ type: "root", children: {} }));

    console.log(tree);
    console.log(system_symbols);

    let t: SymbolTreeBranch = {
        type: "root",
        name: "root",
        children: {
            system: {
                type: "object_file",
                name: "orphans",
                symbols: system_symbols,
                total_size: 0
            },
            project: eliminateSingleParent(tree)
        }
    }

    return t;



}