
/**
 * A simple function to clean helm commands given by the m9sweeper UI for usage in the exec function
 * @param command The raw command string from the m9sweeper UI
 * @returns The single-line formatted command string
 */
export function cleanCommand(command: string): string {
    return command.replaceAll('\\', ' ').replace(/\s+/gm, ' ');
}