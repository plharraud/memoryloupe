import { ConfigurationChangeEvent, Uri, workspace } from 'vscode';
import { watchers } from './watchers';

class ExtensionConfig {

    private getConfig() {
        return workspace.getConfiguration("memoryloupe");
    }

    setBuildDir(buildDirUri: Uri) {
        this.getConfig().update("buildDir", buildDirUri.fsPath, null);
    }

    getBuildDir(): Uri | undefined {
        const path = this.getConfig().get<string>("buildDir");
        if (path) {
            return Uri.file(path);
        }
        return undefined;
    }

    getLenseFormat(): string {
        const lenseFormat = this.getConfig().get<string>("lenseFormat");
        if (lenseFormat) {
            return lenseFormat;
        }
        return this.getConfig().inspect<string>("lenseFormat")?.defaultValue ?? "error: configure memoryloupe.lenseFormat";
    }

    getCodeLensesEnabled(): boolean {
        const enabled = this.getConfig().get<boolean>("codeLensesEnabled");
        return enabled ?? true;
    }

    setCodeLensesEnabled(enabled: boolean) {
        this.getConfig().update("codeLensesEnabled", enabled, null);
    }

    getLogLevel(): string {
        return this.getConfig().get<string>("logLevel") ?? "info";
    }

}

export const config = new ExtensionConfig();

export function onDidChangeConfiguration(event: ConfigurationChangeEvent) {
    if (event.affectsConfiguration("memoryloupe.buildDir")) {
        let buildDirUri = config.getBuildDir();
        if (buildDirUri) {
            watchers.setBuildDir(buildDirUri);
        }
    }
}