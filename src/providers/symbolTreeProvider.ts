import * as vscode from 'vscode';
import { Symbol, SymbolMap, SymbolTreeBranch, SymbolTreeNode, TreeNode } from '../types';
import { config } from '../config';
import { formatSymbolInfo } from '../format';
import { symbolProvider } from './symbolProvider';
import { buildSymbolTree, buildSymbolTreeFlat } from '../tree';

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

      const lenseFormat = config.getLenseFormat();

      this.description = formatSymbolInfo(lenseFormat, {
        "name": symbol.name,
        "section": symbol.section,
        "address": symbol.address ? `0x${symbol.address.toString(16)}` : undefined,
        "size": symbol.size ? `${symbol.size}B` : undefined,
        "status": symbol.discarded ? 'discarded' : undefined,
        "stack": symbol.stack_usage ? `${symbol.stack_usage}B` : undefined,
      });

      this.iconPath = new vscode.ThemeIcon("symbol-method");
      if (source_file && symbol.sourceLineNumber) {
        this.contextValue = "symbol";
      }
    } else if (type === "object_file") {
      this.iconPath = new vscode.ThemeIcon("file");
    } else { // root or di
      this.iconPath = new vscode.ThemeIcon("folder");
    }
  }
}



class SymbolTreeProvider implements vscode.TreeDataProvider<TreeNode>, vscode.Disposable {
  private _onDidChangeTreeData: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private tree: SymbolTreeBranch | undefined;

  getTreeItem(el: TreeNode): vscode.TreeItem {
    if (el.type === "symbol") {
      const source_file = el.sourceFile;
      return new SymbolNode(el.type, el, el.name, vscode.TreeItemCollapsibleState.None, [], source_file);
    }
    else {
      if (el.type === "object_file") { return new SymbolNode(el.type, undefined, el.name, vscode.TreeItemCollapsibleState.Collapsed, Object.values(el.symbols)); } // todo filer direct le set

      return new SymbolNode(el.type, undefined, el.name, vscode.TreeItemCollapsibleState.Collapsed, Object.values(el.children));
    }
  }

  getChildren(element?: TreeNode): TreeNode[] {
    if (!this.tree) {
      return [];
    }
    else if (!element) { // root node
      return Object.values(this.tree["children"]);
    }
    else if (element.type === "object_file") {
      return Object.values(element.symbols).sort((a, b) => (b?.size ?? 0) - (a?.size ?? 0));
    }
    else if (element.type === "symbol") { // no child
      return [];
    }
    else {
      return Object.values(element.children);
    }
  }

  dispose() {
    this._onDidChangeTreeData.dispose();
  }

  refresh(): void {
    // this.tree = buildSymbolTree();
    this.tree = buildSymbolTreeFlat();
    this._onDidChangeTreeData.fire();
  }
}

export const symbolTreeProvider = new SymbolTreeProvider();