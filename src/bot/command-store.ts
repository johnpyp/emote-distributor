import { Command } from "./command";

export class CommandStore {
  private commands: Map<string, Command> = new Map();

  private aliases: Map<string, string> = new Map();

  public register(command: Command): void {
    const { id } = command;
    if (this.commands.has(id)) throw new Error(`Command '${id}' already registered`);

    this.commands.set(id, command);
    command.aliases.forEach((alias) => {
      this.aliases.set(alias, id);
    });
  }

  public deregister(id: string): void {
    const command = this.commands.get(id);
    if (!command) return;

    this.commands.delete(id);
    command.aliases.forEach((alias) => {
      if (this.aliases.get(alias) === id) this.aliases.delete(id);
    });
  }

  public get(id: string | undefined): Command | undefined {
    if (!id) return;
    return this.commands.get(id);
  }

  public aliasFind(id: string | undefined): Command | undefined {
    if (!id) return;
    const foundAlias = this.aliases.get(id);
    if (!foundAlias) return;

    return this.commands.get(id);
  }

  public list(): Command[] {
    return [...this.commands.values()];
  }
}
