export class EnsureArrayTyping {
    /** Sufficiently large arrays sent via HTTP requests can be automatically cast
     * into objects. Takes an array input and ensures it matches its expected type */
    static ensureArrayTyping<T>(input?: Array<T> | Object): Array<T> {
        if (!input) {
            return null;
        }
        if (Array.isArray(input)) {
            return input;
        } else {
            const result = new Array<T>();
            Object.keys(input).forEach(key => {
                result.push(input[key]);
            });
            return result;
        }
    }
}