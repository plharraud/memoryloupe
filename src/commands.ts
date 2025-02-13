import * as vscode from 'vscode';
import { log } from './outputChannel';
import { EventEmitter } from 'stream';

const _onBuildDirSelected = new vscode.EventEmitter<vscode.Uri>();
export const onBuildDirSelected = _onBuildDirSelected.event;

export async function setBuildDir(buildDirUri: vscode.Uri) {
    _onBuildDirSelected.fire(buildDirUri);
}

export async function selectBuildDir(defaultUri: vscode.Uri | undefined): Promise<boolean> {
    const res = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Select",
        title: "build directory to search for .map and .su files",
        defaultUri: vscode.workspace.workspaceFolders?.at(0)?.uri
    });

    if (res && res.length > 0) {
        _onBuildDirSelected.fire(res[0]);
        return true;
    }
    return false;
}