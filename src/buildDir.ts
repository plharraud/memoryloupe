import * as vscode from 'vscode';
import { extConfig } from './config';

export class BuildDir implements vscode.Disposable {
    private _onDidChangeBuildDir: vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter<vscode.Uri>();
    readonly onDidChangeBuildDir: vscode.Event<vscode.Uri> = this._onDidChangeBuildDir.event;

    dispose() {
        this._onDidChangeBuildDir.dispose();
    }

    set(buildDirUri: vscode.Uri) {
        this._onDidChangeBuildDir.fire(buildDirUri);
    }

    async selectBuildDir(): Promise<boolean> {
        const uris = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            title: "directory to look for .map and .su files",
            defaultUri: vscode.workspace.workspaceFolders?.at(0)?.uri
        });

        if (!uris) { return false; }
        extConfig.setBuildDir(uris[0]);
        // this.set(uris[0]); // setBuildDir triggers event watched in activate, uncommenting would update twice
        return true;
    }
}
