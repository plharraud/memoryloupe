import { Uri, workspace } from 'vscode';
import { logger } from '../logger';
import { symbolProvider } from '../providers/symbolProvider';
import { resolveSourceFile } from '../common';
import { config } from '../config';
import path from 'path';

interface CompileCommand {
    directory: string;
    command?: string;
    // arguments?: string[];
    file: string;
    output?: string;
}

type ObjectFilePath = string;
type SourceFilePath = string;

type ObjectSourceAssociation = Map<ObjectFilePath, SourceFilePath>;

async function loadCompileCommands(compileCommandsUri: Uri): Promise<CompileCommand[]> {
    const bytes = await workspace.fs.readFile(compileCommandsUri);
    const content = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(content) as CompileCommand[];
}

export async function parseCompileCommands(compileCommandsUri: Uri) {

    logger.info("parsing", compileCommandsUri.fsPath);

    const compileCommands = await loadCompileCommands(compileCommandsUri);

    let assocations: ObjectSourceAssociation = new Map();

    const jsonDir = path.dirname(path.resolve(compileCommandsUri.fsPath)); // todo use cc.directory instead

    for (const el of compileCommands) {
        if (el.output) { // .file is always there right ?
            const sourceFilePath = resolveSourceFile(jsonDir, el.file);
            assocations.set(el.output, sourceFilePath);
            logger.debug("cc.json: object:", el.output, "source:", sourceFilePath);
        }
    }

    for (const symbol of symbolProvider.getAll().values()) {
        logger.debug("cc.json: associating symbol", symbol);
        if (symbol.objectFile && assocations.has(symbol.objectFile)) {
            symbol.sourceFile = assocations.get(symbol.objectFile);
            logger.debug("cc.json: found source for symbol", symbol.name, "obj:", symbol.objectFile, "src:", symbol.sourceFile);
        } else {
            logger.debug("cc.json: no source found for symbol", symbol.name, symbol.objectFile);
        }
    }

}
