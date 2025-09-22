import { window } from 'vscode';
import { format } from 'node:util';
import { config } from './config';

class Logger {
    private outputChannel = window.createOutputChannel("memoryloupe");

    debug(...args: any[]) {
        this.outputChannel.appendLine(`debug: ${format(...args)}`);
    }

    info(...args: any[]) {
        this.outputChannel.appendLine(`info: ${format(...args)}`);
    }

    error(...args: any[]) {
        this.outputChannel.appendLine(`error: ${format(...args)}`);
    }

}

export const logger = new Logger();
