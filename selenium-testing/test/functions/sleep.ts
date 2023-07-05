/**
 * Creates a promise that will wait the specified amount of time before resolving.
 * @param ms the number of ms to wait
 */
export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}