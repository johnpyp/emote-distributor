/* eslint-disable max-classes-per-file */
export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserError extends BaseError {}
export class ArgsError extends BaseError {}
