import * as vscode from 'vscode';
import { SymbolStore } from './symbolStore';
import { Symbol, SymbolStatus, SymbolTreeBranchNode, SymbolTreeNode } from './types/symbol';
import { extConfig } from './config';
import { formatLense } from './symbolCodeLensProvider';

export class SymbolNode extends vscode.TreeItem {
  constructor(
    public readonly type: string,
    public readonly symbol: Symbol | undefined,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly children: TreeNode[] = [],
    public readonly source_file: string | undefined = undefined,
  ) {
    super(label, collapsibleState);

    if (type === "symbol" && symbol) {

      const lenseFormat = extConfig.getLenseFormat();

      this.description = formatLense(lenseFormat, {
        "name": symbol.name,
        "section": symbol.section,
        "address": symbol.address ? `0x${symbol.address.toString(16)}` : undefined,
        "size": symbol.size ? `${symbol.size}B` : undefined,
        "status": symbol.status === SymbolStatus.discarded ? 'discarded' : undefined,
        "stack": symbol.stack_usage ? `${symbol.stack_usage}B` : undefined,
      });

      this.iconPath = new vscode.ThemeIcon("symbol-method")
      if (source_file && symbol.line) {
        this.contextValue = "symbol";
      }
    } else if (type === "object_file") {
      this.iconPath = new vscode.ThemeIcon("file")
    } else { // root or di
      this.iconPath = new vscode.ThemeIcon("folder")
    }
  }
}
type TreeNode = SymbolTreeNode | Symbol;
export class SymbolTreeProvider implements vscode.TreeDataProvider<TreeNode>, vscode.Disposable {
  private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private symbolStore: SymbolStore | undefined;
  private tree: SymbolTreeBranchNode | undefined;

  setSymbolStore(symbolStore: SymbolStore) {
    this.symbolStore = symbolStore;
    this.refresh();
  }

  getTreeItem(el: TreeNode): vscode.TreeItem {
    if (el.type === "symbol") {
      const source_file = el.source_file ?? this.symbolStore?.getSourceFile(el.object);
      return new SymbolNode(el.type, el, el.name, vscode.TreeItemCollapsibleState.None, [], source_file);
    }
    else {
      if (el.type === "object_file")
        return new SymbolNode(el.type, undefined, el.name, vscode.TreeItemCollapsibleState.Collapsed, Object.values(el.symbols)) // todo filer direct le set

      return new SymbolNode(el.type, undefined, el.name, vscode.TreeItemCollapsibleState.Collapsed, Object.values(el.children))
    }
  }

  getChildren(element?: TreeNode): TreeNode[] {
    if (!this.tree)
      return [];

    else if (!element) // root node
      return Object.values(this.tree["children"])

    else if (element.type === "object_file")
      return Object.values(element.symbols).sort((a, b) => (b?.size ?? 0) - (a?.size ?? 0))

    else if (element.type === "symbol")
      return []; // no child

    else
      return Object.values(element.children);
  }

  dispose() {
    this._onDidChangeTreeData.dispose();
  }

  refresh(): void {
    let syms = this.symbolStore?.getAll()!;

    // build tree by reducing other each symbol
    let system_symbols = Object();
    let tree: SymbolTreeBranchNode = Object.values(syms).reduce((tree, cur_symbol) => {

      let src = this.symbolStore?.getSourceFile(cur_symbol.object);

      if (src) {

        src.split("/").reduce((tree_acc, current_part, i, splits) => {
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
        system_symbols[cur_symbol.name] = cur_symbol
      }
      return tree;

    }, Object({ type: "root", children: {} }));

    console.log(tree);
    console.log(system_symbols);

    // eliminate dirs with only one children
    // finds the top level of the source files
    function eliminate(t: SymbolTreeNode): SymbolTreeBranchNode {
      if (t.type === "object_file") {
        const newRoot: SymbolTreeBranchNode = {
          type: "root",
          name: "root",
          children: { [t.name]: t }
        }
        return newRoot;
      }

      const children = Object.values(t["children"])
      if (children.length > 1) {
        t["type"] = "root";
        return t;
      }
      else return eliminate(children[0]);
    }

    this.tree = eliminate(tree);
    this._onDidChangeTreeData.fire();
  }
}
