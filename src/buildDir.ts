import * as vscode from 'vscode';

export class BuildDir implements vscode.Disposable {
    private _onBuildDirSelected: vscode.EventEmitter<vscode.Uri> = new vscode.EventEmitter<vscode.Uri>();
    readonly onBuildDirSelected: vscode.Event<vscode.Uri> = this._onBuildDirSelected.event;

    dispose() {
        this._onBuildDirSelected.dispose();
    }

    set(buildDirUri: vscode.Uri) {
        this._onBuildDirSelected.fire(buildDirUri);
    }

    async selectBuildDir(): Promise<boolean> {
        const uris = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            title: "build directory to search for .map and .su files",
            defaultUri: vscode.workspace.workspaceFolders?.at(0)?.uri
        });

        if (!uris) { return false; }
        this.set(uris[0]);
        return true;
    }
}
