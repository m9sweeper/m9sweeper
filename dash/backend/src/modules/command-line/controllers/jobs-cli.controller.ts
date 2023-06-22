import {Injectable} from '@nestjs/common';
import {CliCommandBuilderService} from '../services/cli-command-builder.service';

@Injectable()
export class JobsCliController {
  constructor(
    protected readonly cliCommandBuilderService: CliCommandBuilderService
  ) {
  }

  async executeCommand(rawArgs: string[]): Promise<boolean> {
    // Remove the path to node & the js file
    let trimmed = rawArgs.slice(2);
    // The first argument is the command
    const cliCommand = trimmed[0];
    // Any additional argument(s) are parameters
    const args = trimmed.slice(1);

    const command = this.cliCommandBuilderService.findCommand(cliCommand);
    let success = false;
    if (command) {
      success = await command.execute(args);
    } else {
      this.cliCommandBuilderService.printHelp();
    }

    return success;
  }
}