import * as vscode from 'vscode';


export class ExtensionConfig {

    private getConfig() {
        return vscode.workspace.getConfiguration("memoryloupe");
    }

    setBuildDir(buildDirUri: vscode.Uri) {
        this.getConfig().update("buildDir", buildDirUri.fsPath, null);
    }

    getBuildDir(): vscode.Uri | undefined {
        const path = this.getConfig().get<string>("buildDir");
        if (path) {
            return vscode.Uri.file(path);
        }
        return undefined;
    }

}

export const extConfig = new ExtensionConfig();
