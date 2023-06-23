import {CliCommands} from '../enums/cli-commands';

type funcType = (...args: string[]) => Promise<boolean> | boolean;
export class CliCommand {
  constructor(command: CliCommands, description: string, func: funcType, positionalArgs: string[] = []) {
    this.command = command;
    this.description = description;
    this.func = func;
    this.positionalArgs = positionalArgs;
  }

  /** The command the user will enter to trigger this job */
  readonly command: CliCommands;

  /** Any arguments that should be provided */
  readonly positionalArgs: string[];

  /** Description to be printed when user uses help command of enters invalid arguments */
  readonly description: string;

  /** The function to execute */
  readonly func: funcType

  /** Run the command */
  async execute(args: string[]) {
    if (!this.validateArgs(args)) {
      this.printHelp();
      throw new Error('Invalid Arguments');
    }
    return this.func(...args);
  }

  protected validateArgs(args: string[]): boolean {
    if (args?.length !== this.positionalArgs?.length) {
      console.error(`Arguments expected: ${this.positionalArgs?.length}, received: ${args?.length}`);
      return false;
    }
    return true;
  }

  printHelp() {
    // Generates the string: 'command <arg0> ... <argN>';
    const sampleCommand = [this.command, ...this.positionalArgs.map(arg => `<${arg}>`)].join(' ');
    console.log(sampleCommand + ' - ' + this.description);
  }

}
