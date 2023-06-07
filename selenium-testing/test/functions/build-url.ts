import config from '../config.js';

/**
 * Appends the path provided to the base url
 *
 * @param path the routing path
 */
export function buildUrl(path: string): string {
    return !!path
        ? `${config.BASE_URL}${path.charAt(0) === '/' ? '' : '/'}${path}`
        : config.BASE_URL;
}