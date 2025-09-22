import { Disposable, Uri, RelativePattern, FileSystemWatcher, workspace } from 'vscode';
import { parseMap } from './parsers/mapParser';
import { parseSu } from './parsers/suParser';
import { parseCompileCommands } from './parsers/compileCommandsParser';
import { logger } from './logger';

const mapGlob = "**/*.map";
const suGlob = "**/*.su";
const compileCommandsGlob = "**/compile_commands.json";

export class Watchers implements Disposable {

    private buildDirPath!: string;

    private mapRelGlob!: RelativePattern;
    public mapWatcher!: FileSystemWatcher;

    private suRelGlob!: RelativePattern;
    public suWatcher!: FileSystemWatcher;

    private compileCommandsRelGlob!: RelativePattern;
    public compileCommandsWatcher!: FileSystemWatcher;

    dispose() {
        this.mapWatcher.dispose();
        this.suWatcher.dispose();
        this.compileCommandsWatcher.dispose();
    }

    async setBuildDir(buildDirUri: Uri | undefined) {
        if (!buildDirUri) {
            logger.error("no buildDir set");
            return;
        }
        this.buildDirPath = buildDirUri.fsPath;

        this.mapRelGlob = new RelativePattern(this.buildDirPath, mapGlob);
        this.suRelGlob = new RelativePattern(this.buildDirPath, suGlob);
        this.compileCommandsRelGlob = new RelativePattern(this.buildDirPath, compileCommandsGlob);

        this.initWatchers();
        await this.parseAll();
    }

    async parseAll() {
        await workspace.findFiles(this.mapRelGlob, null, 1).then(async (files) => {
            if (files.length) {
                logger.debug("parsing", files[0].fsPath);
                return parseMap(files[0]);
            }
        });

        await workspace.findFiles(this.suRelGlob).then(async (files) => {
            await Promise.all(files.map(f => {
                logger.debug("parsing", f.fsPath);
                return parseSu(f);
            }));
        });

        await workspace.findFiles(this.compileCommandsRelGlob, null, 1).then(async (files) => {
            if (files.length) {
                logger.debug("parsing", files[0].fsPath);
                return parseCompileCommands(files[0]);
            }
        });
    }

    private initWatchers() {
        if (this.mapWatcher) { this.mapWatcher.dispose(); }
        this.mapWatcher = workspace.createFileSystemWatcher(this.mapRelGlob);
        this.mapWatcher.onDidCreate(async (uri) => { await parseMap(uri); });
        this.mapWatcher.onDidChange(async (uri) => { await parseMap(uri); });


        if (this.suWatcher) { this.suWatcher.dispose(); }
        this.suWatcher = workspace.createFileSystemWatcher(this.suRelGlob);
        this.suWatcher.onDidCreate(async (uri) => { parseSu(uri); });
        this.suWatcher.onDidChange(async (uri) => { parseSu(uri); });

        if (this.compileCommandsWatcher) { this.compileCommandsWatcher.dispose(); }
        this.compileCommandsWatcher = workspace.createFileSystemWatcher(this.compileCommandsRelGlob);
        this.compileCommandsWatcher.onDidCreate(async (uri) => { parseCompileCommands(uri); });
        this.compileCommandsWatcher.onDidChange(async (uri) => { parseCompileCommands(uri); });
    }

}

export const watchers = new Watchers();
