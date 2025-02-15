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

    getLenseFormat(): string {
        const lenseFormat = this.getConfig().get<string>("lenseFormat");
        if (lenseFormat) {
            return lenseFormat;
        }
        return this.getConfig().inspect<string>("lenseFormat")?.defaultValue ?? "error, please define memoryloupe.lenseFormat config";
    }

    getCodeLensesEnabled(): boolean {
        const enabled = this.getConfig().get<boolean>("codeLensesEnabled");
        return enabled ?? true;
    }

    setCodeLensesEnabled(enabled: boolean) {
        this.getConfig().update("codeLensesEnabled", enabled, null);
    }

}

export const extConfig = new ExtensionConfig();
