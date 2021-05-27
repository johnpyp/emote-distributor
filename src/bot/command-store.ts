import { Command } from "./command";
import { PrefixRouter } from "./prefix-router";

export class CommandStore {
  private commands: Map<string, Command> = new Map();

  private aliases: PrefixRouter<string> = new PrefixRouter();

  public register(command: Command): void {
    const { id } = command;
    if (this.commands.has(id)) throw new Error(`Command '${id}' already registered`);

    this.commands.set(id, command);
    command.aliases.forEach((alias) => {
      this.aliases.set(alias.split(" "), id);
    });
  }

  public deregister(id: string): void {
    const command = this.commands.get(id);
    if (!command) return;

    this.commands.delete(id);
    command.aliases.forEach((alias) => {
      this.aliases.delete(alias.split(" "));
    });
  }

  public get(id: string | undefined): Command | undefined {
    if (!id) return;
    return this.commands.get(id);
  }

  public aliasFind(args: string[] | undefined): Command | Command[] | undefined {
    if (!args) return;
    const foundAlias = this.aliases.search(args);
    if (!foundAlias) return;

    if (Array.isArray(foundAlias)) {
      return foundAlias
        .map((alias) => this.commands.get(alias))
        .flatMap((command) => command ?? []);
    }

    return this.commands.get(foundAlias);
  }

  public list(): Command[] {
    return [...this.commands.values()];
  }
}
