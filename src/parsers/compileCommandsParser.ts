import { Uri, workspace } from 'vscode';
import { logger } from '../logger';
import { symbolProvider } from '../providers/symbolProvider';

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

    for (const el of compileCommands) {
        if (el.output) {
            assocations.set(el.output, el.file);
            logger.debug("cc.json: object:", el.output, "source:", el.file);
        }
    }

    for (const symbol of symbolProvider.getAll().values()) {
        if (symbol.file.object && assocations.has(symbol.file.object)) {
            symbol.file.source = assocations.get(symbol.file.object);
            logger.debug("found source for symbol", symbol.name, "obj:", symbol.file.object, "src:", symbol.file.source);
        } else {
            logger.debug("no source found for symbol", symbol.name);
        }
    }

}
