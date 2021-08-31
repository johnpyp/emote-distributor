/* eslint-disable max-classes-per-file */

import { Command } from "../bot/command";
import { formatHelpCommand } from "../bot/util";

interface DisplayableError {
  createUserMessage: (command: Command) => string;
}
export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserError extends BaseError implements DisplayableError {
  createUserMessage(_command: Command): string {
    return `${this.message} ❌`;
  }
}
export class ArgsError extends BaseError implements DisplayableError {
  createUserMessage(command: Command): string {
    const help = formatHelpCommand(command) ?? [];
    return [`${this.message} ❌`, ``, `Usage:`, ...help].join("\n");
  }
}
