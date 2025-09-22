import { window, workspace } from "vscode";
import { config } from "../config";

export async function setBuildDir() {
    const uris = await window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: "Set directory to look for .map, .su and compile_commands.json files",
        defaultUri: workspace.workspaceFolders?.at(0)?.uri
    });

    if (!uris) { return; }

    config.setBuildDir(uris[0]);
}