import { from, Observable } from 'rxjs';
/**
 * '_executeValidators' utility function
 *
 * Validates a control against an array of validators, and returns
 * an array of the same length containing a combination of error messages
 * (from invalid validators) and null values (from valid validators)
 *
 * //  { AbstractControl } control - control to validate
 * //  { IValidatorFn[] } validators - array of validators
 * //  { boolean } invert - invert?
 * // { PlainObject[] } - array of nulls and error message
 */
export function _executeValidators(control, validators, invert = false) {
    return validators.map(validator => validator(control, invert));
}
/**
 * '_executeAsyncValidators' utility function
 *
 * Validates a control against an array of async validators, and returns
 * an array of observabe results of the same length containing a combination of
 * error messages (from invalid validators) and null values (from valid ones)
 *
 * //  { AbstractControl } control - control to validate
 * //  { AsyncIValidatorFn[] } validators - array of async validators
 * //  { boolean } invert - invert?
 * //  - array of observable nulls and error message
 */
export function _executeAsyncValidators(control, validators, invert = false) {
    return validators.map(validator => validator(control, invert));
}
/**
 * '_mergeObjects' utility function
 *
 * Recursively Merges one or more objects into a single object with combined keys.
 * Automatically detects and ignores null and undefined inputs.
 * Also detects duplicated boolean 'not' keys and XORs their values.
 *
 * //  { PlainObject[] } objects - one or more objects to merge
 * // { PlainObject } - merged object
 */
export function _mergeObjects(...objects) {
    const mergedObject = {};
    for (const currentObject of objects) {
        if (isObject(currentObject)) {
            for (const key of Object.keys(currentObject)) {
                const currentValue = currentObject[key];
                const mergedValue = mergedObject[key];
                mergedObject[key] = !isDefined(mergedValue) ? currentValue :
                    key === 'not' && isBoolean(mergedValue, 'strict') &&
                        isBoolean(currentValue, 'strict') ? xor(mergedValue, currentValue) :
                        getType(mergedValue) === 'object' && getType(currentValue) === 'object' ?
                            _mergeObjects(mergedValue, currentValue) :
                            currentValue;
            }
        }
    }
    return mergedObject;
}
/**
 * '_mergeErrors' utility function
 *
 * Merges an array of objects.
 * Used for combining the validator errors returned from 'executeValidators'
 *
 * //  { PlainObject[] } arrayOfErrors - array of objects
 * // { PlainObject } - merged object, or null if no usable input objectcs
 */
export function _mergeErrors(arrayOfErrors) {
    const mergedErrors = _mergeObjects(...arrayOfErrors);
    return isEmpty(mergedErrors) ? null : mergedErrors;
}
/**
 * 'isDefined' utility function
 *
 * Checks if a variable contains a value of any type.
 * Returns true even for otherwise 'falsey' values of 0, '', and false.
 *
 * //   value - the value to check
 * // { boolean } - false if undefined or null, otherwise true
 */
export function isDefined(value) {
    return value !== undefined && value !== null;
}
/**
 * 'hasValue' utility function
 *
 * Checks if a variable contains a value.
 * Returs false for null, undefined, or a zero-length strng, '',
 * otherwise returns true.
 * (Stricter than 'isDefined' because it also returns false for '',
 * though it stil returns true for otherwise 'falsey' values 0 and false.)
 *
 * //   value - the value to check
 * // { boolean } - false if undefined, null, or '', otherwise true
 */
export function hasValue(value) {
    return value !== undefined && value !== null && value !== '';
}
/**
 * 'isEmpty' utility function
 *
 * Similar to !hasValue, but also returns true for empty arrays and objects.
 *
 * //   value - the value to check
 * // { boolean } - false if undefined, null, or '', otherwise true
 */
export function isEmpty(value) {
    if (isArray(value)) {
        return !value.length;
    }
    if (isObject(value)) {
        return !Object.keys(value).length;
    }
    return value === undefined || value === null || value === '';
}
/**
 * 'isString' utility function
 *
 * Checks if a value is a string.
 *
 * //   value - the value to check
 * // { boolean } - true if string, false if not
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * 'isNumber' utility function
 *
 * Checks if a value is a regular number, numeric string, or JavaScript Date.
 *
 * //   value - the value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // { boolean } - true if number, false if not
 */
export function isNumber(value, strict = false) {
    if (strict && typeof value !== 'number') {
        return false;
    }
    return !isNaN(value) && value !== value / 0;
}
/**
 * 'isInteger' utility function
 *
 * Checks if a value is an integer.
 *
 * //   value - the value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // {boolean } - true if number, false if not
 */
export function isInteger(value, strict = false) {
    if (strict && typeof value !== 'number') {
        return false;
    }
    return !isNaN(value) && value !== value / 0 && value % 1 === 0;
}
/**
 * 'isBoolean' utility function
 *
 * Checks if a value is a boolean.
 *
 * //   value - the value to check
 * //  { any = null } option - if 'strict', also checks JavaScript type
 *                              if TRUE or FALSE, checks only for that value
 * // { boolean } - true if boolean, false if not
 */
export function isBoolean(value, option = null) {
    if (option === 'strict') {
        return value === true || value === false;
    }
    if (option === true) {
        return value === true || value === 1 || value === 'true' || value === '1';
    }
    if (option === false) {
        return value === false || value === 0 || value === 'false' || value === '0';
    }
    return value === true || value === 1 || value === 'true' || value === '1' ||
        value === false || value === 0 || value === 'false' || value === '0';
}
export function isFunction(item) {
    return typeof item === 'function';
}
export function isObject(item) {
    return item !== null && typeof item === 'object';
}
export function isArray(item) {
    return Array.isArray(item);
}
export function isDate(item) {
    return !!item && Object.prototype.toString.call(item) === '[object Date]';
}
export function isMap(item) {
    return !!item && Object.prototype.toString.call(item) === '[object Map]';
}
export function isSet(item) {
    return !!item && Object.prototype.toString.call(item) === '[object Set]';
}
export function isSymbol(item) {
    return typeof item === 'symbol';
}
/**
 * 'getType' function
 *
 * Detects the JSON Schema Type of a value.
 * By default, detects numbers and integers even if formatted as strings.
 * (So all integers are also numbers, and any number may also be a string.)
 * However, it only detects true boolean values (to detect boolean values
 * in non-boolean formats, use isBoolean() instead).
 *
 * If passed a second optional parameter of 'strict', it will only detect
 * numbers and integers if they are formatted as JavaScript numbers.
 *
 * Examples:
 * getType('10.5') = 'number'
 * getType(10.5) = 'number'
 * getType('10') = 'integer'
 * getType(10) = 'integer'
 * getType('true') = 'string'
 * getType(true) = 'boolean'
 * getType(null) = 'null'
 * getType({ }) = 'object'
 * getType([]) = 'array'
 *
 * getType('10.5', 'strict') = 'string'
 * getType(10.5, 'strict') = 'number'
 * getType('10', 'strict') = 'string'
 * getType(10, 'strict') = 'integer'
 * getType('true', 'strict') = 'string'
 * getType(true, 'strict') = 'boolean'
 *
 * //   value - value to check
 * //  { any = false } strict - if truthy, also checks JavaScript tyoe
 * // { SchemaType }
 */
export function getType(value, strict = false) {
    if (!isDefined(value)) {
        return 'null';
    }
    if (isArray(value)) {
        return 'array';
    }
    if (isObject(value)) {
        return 'object';
    }
    if (isBoolean(value, 'strict')) {
        return 'boolean';
    }
    if (isInteger(value, strict)) {
        return 'integer';
    }
    if (isNumber(value, strict)) {
        return 'number';
    }
    if (isString(value) || (!strict && isDate(value))) {
        return 'string';
    }
    return null;
}
/**
 * 'isType' function
 *
 * Checks wether an input (probably string) value contains data of
 * a specified JSON Schema type
 *
 * //  { PrimitiveValue } value - value to check
 * //  { SchemaPrimitiveType } type - type to check
 * // { boolean }
 */
export function isType(value, type) {
    switch (type) {
        case 'string':
            return isString(value) || isDate(value);
        case 'number':
            return isNumber(value);
        case 'integer':
            return isInteger(value);
        case 'boolean':
            return isBoolean(value);
        case 'null':
            return !hasValue(value);
        default:
            console.error(`isType error: "${type}" is not a recognized type.`);
            return null;
    }
}
/**
 * 'isPrimitive' function
 *
 * Checks wether an input value is a JavaScript primitive type:
 * string, number, boolean, or null.
 *
 * //   value - value to check
 * // { boolean }
 */
export function isPrimitive(value) {
    return (isString(value) || isNumber(value) ||
        isBoolean(value, 'strict') || value === null);
}
/**
 *
 * @param date
 * @returns {string}
 * exmaple:
 * toDateString('2018-01-01') = '2018-01-01'
 * toDateString('2018-01-30T00:00:00.000Z') = '2018-01-30'
 */
export const toIsoString = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
};
/**
 * 'toJavaScriptType' function
 *
 * Converts an input (probably string) value to a JavaScript primitive type -
 * 'string', 'number', 'boolean', or 'null' - before storing in a JSON object.
 *
 * Does not coerce values (other than null), and only converts the types
 * of values that would otherwise be valid.
 *
 * If the optional third parameter 'strictIntegers' is TRUE, and the
 * JSON Schema type 'integer' is specified, it also verifies the input value
 * is an integer and, if it is, returns it as a JaveScript number.
 * If 'strictIntegers' is FALSE (or not set) the type 'integer' is treated
 * exactly the same as 'number', and allows decimals.
 *
 * Valid Examples:
 * toJavaScriptType('10',   'number' ) = 10   // '10'   is a number
 * toJavaScriptType('10',   'integer') = 10   // '10'   is also an integer
 * toJavaScriptType( 10,    'integer') = 10   //  10    is still an integer
 * toJavaScriptType( 10,    'string' ) = '10' //  10    can be made into a string
 * toJavaScriptType('10.5', 'number' ) = 10.5 // '10.5' is a number
 *
 * Invalid Examples:
 * toJavaScriptType('10.5', 'integer') = null // '10.5' is not an integer
 * toJavaScriptType( 10.5,  'integer') = null //  10.5  is still not an integer
 *
 * //  { PrimitiveValue } value - value to convert
 * //  { SchemaPrimitiveType | SchemaPrimitiveType[] } types - types to convert to
 * //  { boolean = false } strictIntegers - if FALSE, treat integers as numbers
 * // { PrimitiveValue }
 */
export function toJavaScriptType(value, types, strictIntegers = true) {
    if (!isDefined(value)) {
        return null;
    }
    if (isString(types)) {
        types = [types];
    }
    if (strictIntegers && inArray('integer', types)) {
        if (isInteger(value, 'strict')) {
            return value;
        }
        if (isInteger(value)) {
            return parseInt(value, 10);
        }
    }
    if (inArray('number', types) || (!strictIntegers && inArray('integer', types))) {
        if (isNumber(value, 'strict')) {
            return value;
        }
        if (isNumber(value)) {
            return parseFloat(value);
        }
    }
    if (inArray('string', types)) {
        if (isString(value)) {
            return value;
        }
        // If value is a date, and types includes 'string',
        // convert the date to a string
        if (isDate(value)) {
            return toIsoString(value);
        }
        if (isNumber(value)) {
            return value.toString();
        }
    }
    // If value is a date, and types includes 'integer' or 'number',
    // but not 'string', convert the date to a number
    if (isDate(value) && (inArray('integer', types) || inArray('number', types))) {
        return value.getTime();
    }
    if (inArray('boolean', types)) {
        if (isBoolean(value, true)) {
            return true;
        }
        if (isBoolean(value, false)) {
            return false;
        }
    }
    return null;
}
/**
 * 'toSchemaType' function
 *
 * Converts an input (probably string) value to the "best" JavaScript
 * equivalent available from an allowed list of JSON Schema types, which may
 * contain 'string', 'number', 'integer', 'boolean', and/or 'null'.
 * If necssary, it does progressively agressive type coersion.
 * It will not return null unless null is in the list of allowed types.
 *
 * Number conversion examples:
 * toSchemaType('10', ['number','integer','string']) = 10 // integer
 * toSchemaType('10', ['number','string']) = 10 // number
 * toSchemaType('10', ['string']) = '10' // string
 * toSchemaType('10.5', ['number','integer','string']) = 10.5 // number
 * toSchemaType('10.5', ['integer','string']) = '10.5' // string
 * toSchemaType('10.5', ['integer']) = 10 // integer
 * toSchemaType(10.5, ['null','boolean','string']) = '10.5' // string
 * toSchemaType(10.5, ['null','boolean']) = true // boolean
 *
 * String conversion examples:
 * toSchemaType('1.5x', ['boolean','number','integer','string']) = '1.5x' // string
 * toSchemaType('1.5x', ['boolean','number','integer']) = '1.5' // number
 * toSchemaType('1.5x', ['boolean','integer']) = '1' // integer
 * toSchemaType('1.5x', ['boolean']) = true // boolean
 * toSchemaType('xyz', ['number','integer','boolean','null']) = true // boolean
 * toSchemaType('xyz', ['number','integer','null']) = null // null
 * toSchemaType('xyz', ['number','integer']) = 0 // number
 *
 * Boolean conversion examples:
 * toSchemaType('1', ['integer','number','string','boolean']) = 1 // integer
 * toSchemaType('1', ['number','string','boolean']) = 1 // number
 * toSchemaType('1', ['string','boolean']) = '1' // string
 * toSchemaType('1', ['boolean']) = true // boolean
 * toSchemaType('true', ['number','string','boolean']) = 'true' // string
 * toSchemaType('true', ['boolean']) = true // boolean
 * toSchemaType('true', ['number']) = 0 // number
 * toSchemaType(true, ['number','string','boolean']) = true // boolean
 * toSchemaType(true, ['number','string']) = 'true' // string
 * toSchemaType(true, ['number']) = 1 // number
 *
 * //  { PrimitiveValue } value - value to convert
 * //  { SchemaPrimitiveType | SchemaPrimitiveType[] } types - allowed types to convert to
 * // { PrimitiveValue }
 */
export function toSchemaType(value, types) {
    if (!isArray(types)) {
        types = [types];
    }
    if (types.includes('null') && !hasValue(value)) {
        return null;
    }
    if (types.includes('boolean') && !isBoolean(value, 'strict')) {
        return value;
    }
    if (types.includes('integer')) {
        const testValue = toJavaScriptType(value, 'integer');
        if (testValue !== null) {
            return +testValue;
        }
    }
    if (types.includes('number')) {
        const testValue = toJavaScriptType(value, 'number');
        if (testValue !== null) {
            return +testValue;
        }
    }
    if ((isString(value) || isNumber(value, 'strict')) &&
        types.includes('string')) { // Convert number to string
        return toJavaScriptType(value, 'string');
    }
    if (types.includes('boolean') && isBoolean(value)) {
        return toJavaScriptType(value, 'boolean');
    }
    if (types.includes('string')) { // Convert null & boolean to string
        if (value === null) {
            return '';
        }
        const testValue = toJavaScriptType(value, 'string');
        if (testValue !== null) {
            return testValue;
        }
    }
    if ((types.includes('number') ||
        types.includes('integer'))) {
        if (value === true) {
            return 1;
        } // Convert boolean & null to number
        if (value === false || value === null || value === '') {
            return 0;
        }
    }
    if (types.includes('number')) { // Convert mixed string to number
        const testValue = parseFloat(value);
        if (!!testValue) {
            return testValue;
        }
    }
    if (types.includes('integer')) { // Convert string or number to integer
        const testValue = parseInt(value, 10);
        if (!!testValue) {
            return testValue;
        }
    }
    if (types.includes('boolean')) { // Convert anything to boolean
        return !!value;
    }
    if ((types.includes('number') ||
        types.includes('integer')) && !types.includes('null')) {
        return 0; // If null not allowed, return 0 for non-convertable values
    }
}
/**
 * 'isPromise' function
 *
 * //   object
 * // { boolean }
 */
export function isPromise(object) {
    return !!object && typeof object.then === 'function';
}
/**
 * 'isObservable' function
 *
 * //   object
 * // { boolean }
 */
export function isObservable(object) {
    return !!object && typeof object.subscribe === 'function';
}
/**
 * '_toPromise' function
 *
 * //  { object } object
 * // { Promise<any> }
 */
export function _toPromise(object) {
    return isPromise(object) ? object : object.toPromise();
}
/**
 * 'toObservable' function
 *
 * //  { object } object
 * // { Observable<any> }
 */
export function toObservable(object) {
    const observable = isPromise(object) ? from(object) : object;
    if (isObservable(observable)) {
        return observable;
    }
    console.error('toObservable error: Expected validator to return Promise or Observable.');
    return new Observable();
}
/**
 * 'inArray' function
 *
 * Searches an array for an item, or one of a list of items, and returns true
 * as soon as a match is found, or false if no match.
 *
 * If the optional third parameter allIn is set to TRUE, and the item to find
 * is an array, then the function returns true only if all elements from item
 * are found in the array list, and false if any element is not found. If the
 * item to find is not an array, setting allIn to TRUE has no effect.
 *
 * //  { any|any[] } item - the item to search for
 * //   array - the array to search
 * //  { boolean = false } allIn - if TRUE, all items must be in array
 * // { boolean } - true if item(s) in array, false otherwise
 */
export function inArray(item, array, allIn = false) {
    if (!isDefined(item) || !isArray(array)) {
        return false;
    }
    return isArray(item) ?
        item[allIn ? 'every' : 'some'](subItem => array.includes(subItem)) :
        array.includes(item);
}
/**
 * 'xor' utility function - exclusive or
 *
 * Returns true if exactly one of two values is truthy.
 *
 * //   value1 - first value to check
 * //   value2 - second value to check
 * // { boolean } - true if exactly one input value is truthy, false if not
 */
export function xor(value1, value2) {
    return (!!value1 && !value2) || (!value1 && !!value2);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yLmZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvbGliL3NoYXJlZC92YWxpZGF0b3IuZnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBZ0R4Qzs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sR0FBRyxLQUFLO0lBQ3BFLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEdBQUcsS0FBSztJQUN6RSxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDakUsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSxhQUFhLENBQUMsR0FBRyxPQUFPO0lBQ3RDLE1BQU0sWUFBWSxHQUFnQixFQUFHLENBQUM7SUFDdEMsS0FBSyxNQUFNLGFBQWEsSUFBSSxPQUFPLEVBQUU7UUFDbkMsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDM0IsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUM1QyxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMs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OztHQWVHO0FBQ0gsTUFBTSxVQUFVLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssR0FBRyxLQUFLO0lBQ2hELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFBRSxPQUFPLEtBQUssQ0FBQztLQUFFO0lBQzFELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTTtJQUNoQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBYnN0cmFjdENvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBmcm9tLCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogVmFsaWRhdG9yIHV0aWxpdHkgZnVuY3Rpb24gbGlicmFyeTpcbiAqXG4gKiBWYWxpZGF0b3IgYW5kIGVycm9yIHV0aWxpdGllczpcbiAqICAgX2V4ZWN1dGVWYWxpZGF0b3JzLCBfZXhlY3V0ZUFzeW5jVmFsaWRhdG9ycywgX21lcmdlT2JqZWN0cywgX21lcmdlRXJyb3JzXG4gKlxuICogSW5kaXZpZHVhbCB2YWx1ZSBjaGVja2luZzpcbiAqICAgaXNEZWZpbmVkLCBoYXNWYWx1ZSwgaXNFbXB0eVxuICpcbiAqIEluZGl2aWR1YWwgdHlwZSBjaGVja2luZzpcbiAqICAgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0ludGVnZXIsIGlzQm9vbGVhbiwgaXNGdW5jdGlvbiwgaXNPYmplY3QsIGlzQXJyYXksXG4gKiAgIGlzTWFwLCBpc1NldCwgaXNQcm9taXNlLCBpc09ic2VydmFibGVcbiAqXG4gKiBNdWx0aXBsZSB0eXBlIGNoZWNraW5nIGFuZCBmaXhpbmc6XG4gKiAgIGdldFR5cGUsIGlzVHlwZSwgaXNQcmltaXRpdmUsIHRvSmF2YVNjcmlwdFR5cGUsIHRvU2NoZW1hVHlwZSxcbiAqICAgX3RvUHJvbWlzZSwgdG9PYnNlcnZhYmxlXG4gKlxuICogVXRpbGl0eSBmdW5jdGlvbnM6XG4gKiAgIGluQXJyYXksIHhvclxuICpcbiAqIFR5cGVzY3JpcHQgdHlwZXMgYW5kIGludGVyZmFjZXM6XG4gKiAgIFNjaGVtYVByaW1pdGl2ZVR5cGUsIFNjaGVtYVR5cGUsIEphdmFTY3JpcHRQcmltaXRpdmVUeXBlLCBKYXZhU2NyaXB0VHlwZSxcbiAqICAgUHJpbWl0aXZlVmFsdWUsIFBsYWluT2JqZWN0LCBJVmFsaWRhdG9yRm4sIEFzeW5jSVZhbGlkYXRvckZuXG4gKlxuICogTm90ZTogJ0lWYWxpZGF0b3JGbicgaXMgc2hvcnQgZm9yICdpbnZlcnRhYmxlIHZhbGlkYXRvciBmdW5jdGlvbicsXG4gKiAgIHdoaWNoIGlzIGEgdmFsaWRhdG9yIGZ1bmN0aW9ucyB0aGF0IGFjY2VwdHMgYW4gb3B0aW9uYWwgc2Vjb25kXG4gKiAgIGFyZ3VtZW50IHdoaWNoLCBpZiBzZXQgdG8gVFJVRSwgY2F1c2VzIHRoZSB2YWxpZGF0b3IgdG8gcGVyZm9ybVxuICogICB0aGUgb3Bwb3NpdGUgb2YgaXRzIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICovXG5cbmV4cG9ydCB0eXBlIFNjaGVtYVByaW1pdGl2ZVR5cGUgPVxuICAnc3RyaW5nJyB8ICdudW1iZXInIHwgJ2ludGVnZXInIHwgJ2Jvb2xlYW4nIHwgJ251bGwnO1xuZXhwb3J0IHR5cGUgU2NoZW1hVHlwZSA9XG4gICdzdHJpbmcnIHwgJ251bWJlcicgfCAnaW50ZWdlcicgfCAnYm9vbGVhbicgfCAnbnVsbCcgfCAnb2JqZWN0JyB8ICdhcnJheSc7XG5leHBvcnQgdHlwZSBKYXZhU2NyaXB0UHJpbWl0aXZlVHlwZSA9XG4gICdzdHJpbmcnIHwgJ251bWJlcicgfCAnYm9vbGVhbicgfCAnbnVsbCcgfCAndW5kZWZpbmVkJztcbmV4cG9ydCB0eXBlIEphdmFTY3JpcHRUeXBlID1cbiAgJ3N0cmluZycgfCAnbnVtYmVyJyB8ICdib29sZWFuJyB8ICdudWxsJyB8ICd1bmRlZmluZWQnIHwgJ29iamVjdCcgfCAnYXJyYXknIHxcbiAgJ21hcCcgfCAnc2V0JyB8ICdhcmd1bWVudHMnIHwgJ2RhdGUnIHwgJ2Vycm9yJyB8ICdmdW5jdGlvbicgfCAnanNvbicgfFxuICAnbWF0aCcgfCAncmVnZXhwJzsgLy8gTm90ZTogdGhpcyBsaXN0IGlzIGluY29tcGxldGVcbmV4cG9ydCB0eXBlIFByaW1pdGl2ZVZhbHVlID0gc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQ7XG5leHBvcnQgaW50ZXJmYWNlIFBsYWluT2JqZWN0IHsgW2s6IHN0cmluZ106IGFueTsgfVxuXG5leHBvcnQgdHlwZSBJVmFsaWRhdG9yRm4gPSAoYzogQWJzdHJhY3RDb250cm9sLCBpPzogYm9vbGVhbikgPT4gUGxhaW5PYmplY3Q7XG5leHBvcnQgdHlwZSBBc3luY0lWYWxpZGF0b3JGbiA9IChjOiBBYnN0cmFjdENvbnRyb2wsIGk/OiBib29sZWFuKSA9PiBhbnk7XG5cbi8qKlxuICogJ19leGVjdXRlVmFsaWRhdG9ycycgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIFZhbGlkYXRlcyBhIGNvbnRyb2wgYWdhaW5zdCBhbiBhcnJheSBvZiB2YWxpZGF0b3JzLCBhbmQgcmV0dXJuc1xuICogYW4gYXJyYXkgb2YgdGhlIHNhbWUgbGVuZ3RoIGNvbnRhaW5pbmcgYSBjb21iaW5hdGlvbiBvZiBlcnJvciBtZXNzYWdlc1xuICogKGZyb20gaW52YWxpZCB2YWxpZGF0b3JzKSBhbmQgbnVsbCB2YWx1ZXMgKGZyb20gdmFsaWQgdmFsaWRhdG9ycylcbiAqXG4gKiAvLyAgeyBBYnN0cmFjdENvbnRyb2wgfSBjb250cm9sIC0gY29udHJvbCB0byB2YWxpZGF0ZVxuICogLy8gIHsgSVZhbGlkYXRvckZuW10gfSB2YWxpZGF0b3JzIC0gYXJyYXkgb2YgdmFsaWRhdG9yc1xuICogLy8gIHsgYm9vbGVhbiB9IGludmVydCAtIGludmVydD9cbiAqIC8vIHsgUGxhaW5PYmplY3RbXSB9IC0gYXJyYXkgb2YgbnVsbHMgYW5kIGVycm9yIG1lc3NhZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9leGVjdXRlVmFsaWRhdG9ycyhjb250cm9sLCB2YWxpZGF0b3JzLCBpbnZlcnQgPSBmYWxzZSkge1xuICByZXR1cm4gdmFsaWRhdG9ycy5tYXAodmFsaWRhdG9yID0+IHZhbGlkYXRvcihjb250cm9sLCBpbnZlcnQpKTtcbn1cblxuLyoqXG4gKiAnX2V4ZWN1dGVBc3luY1ZhbGlkYXRvcnMnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBWYWxpZGF0ZXMgYSBjb250cm9sIGFnYWluc3QgYW4gYXJyYXkgb2YgYXN5bmMgdmFsaWRhdG9ycywgYW5kIHJldHVybnNcbiAqIGFuIGFycmF5IG9mIG9ic2VydmFiZSByZXN1bHRzIG9mIHRoZSBzYW1lIGxlbmd0aCBjb250YWluaW5nIGEgY29tYmluYXRpb24gb2ZcbiAqIGVycm9yIG1lc3NhZ2VzIChmcm9tIGludmFsaWQgdmFsaWRhdG9ycykgYW5kIG51bGwgdmFsdWVzIChmcm9tIHZhbGlkIG9uZXMpXG4gKlxuICogLy8gIHsgQWJzdHJhY3RDb250cm9sIH0gY29udHJvbCAtIGNvbnRyb2wgdG8gdmFsaWRhdGVcbiAqIC8vICB7IEFzeW5jSVZhbGlkYXRvckZuW10gfSB2YWxpZGF0b3JzIC0gYXJyYXkgb2YgYXN5bmMgdmFsaWRhdG9yc1xuICogLy8gIHsgYm9vbGVhbiB9IGludmVydCAtIGludmVydD9cbiAqIC8vICAtIGFycmF5IG9mIG9ic2VydmFibGUgbnVsbHMgYW5kIGVycm9yIG1lc3NhZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9leGVjdXRlQXN5bmNWYWxpZGF0b3JzKGNvbnRyb2wsIHZhbGlkYXRvcnMsIGludmVydCA9IGZhbHNlKSB7XG4gIHJldHVybiB2YWxpZGF0b3JzLm1hcCh2YWxpZGF0b3IgPT4gdmFsaWRhdG9yKGNvbnRyb2wsIGludmVydCkpO1xufVxuXG4vKipcbiAqICdfbWVyZ2VPYmplY3RzJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogUmVjdXJzaXZlbHkgTWVyZ2VzIG9uZSBvciBtb3JlIG9iamVjdHMgaW50byBhIHNpbmdsZSBvYmplY3Qgd2l0aCBjb21iaW5lZCBrZXlzLlxuICogQXV0b21hdGljYWxseSBkZXRlY3RzIGFuZCBpZ25vcmVzIG51bGwgYW5kIHVuZGVmaW5lZCBpbnB1dHMuXG4gKiBBbHNvIGRldGVjdHMgZHVwbGljYXRlZCBib29sZWFuICdub3QnIGtleXMgYW5kIFhPUnMgdGhlaXIgdmFsdWVzLlxuICpcbiAqIC8vICB7IFBsYWluT2JqZWN0W10gfSBvYmplY3RzIC0gb25lIG9yIG1vcmUgb2JqZWN0cyB0byBtZXJnZVxuICogLy8geyBQbGFpbk9iamVjdCB9IC0gbWVyZ2VkIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gX21lcmdlT2JqZWN0cyguLi5vYmplY3RzKSB7XG4gIGNvbnN0IG1lcmdlZE9iamVjdDogUGxhaW5PYmplY3QgPSB7IH07XG4gIGZvciAoY29uc3QgY3VycmVudE9iamVjdCBvZiBvYmplY3RzKSB7XG4gICAgaWYgKGlzT2JqZWN0KGN1cnJlbnRPYmplY3QpKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhjdXJyZW50T2JqZWN0KSkge1xuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBjdXJyZW50T2JqZWN0W2tleV07XG4gICAgICAgIGNvbnN0IG1lcmdlZFZhbHVlID0gbWVyZ2VkT2JqZWN0W2tleV07XG4gICAgICAgIG1lcmdlZE9iamVjdFtrZXldID0gIWlzRGVmaW5lZChtZXJnZWRWYWx1ZSkgPyBjdXJyZW50VmFsdWUgOlxuICAgICAgICAgIGtleSA9PT0gJ25vdCcgJiYgaXNCb29sZWFuKG1lcmdlZFZhbHVlLCAnc3RyaWN0JykgJiZcbiAgICAgICAgICAgIGlzQm9vbGVhbihjdXJyZW50VmFsdWUsICdzdHJpY3QnKSA/IHhvcihtZXJnZWRWYWx1ZSwgY3VycmVudFZhbHVlKSA6XG4gICAgICAgICAgZ2V0VHlwZShtZXJnZWRWYWx1ZSkgPT09ICdvYmplY3QnICYmIGdldFR5cGUoY3VycmVudFZhbHVlKSA9PT0gJ29iamVjdCcgP1xuICAgICAgICAgICAgX21lcmdlT2JqZWN0cyhtZXJnZWRWYWx1ZSwgY3VycmVudFZhbHVlKSA6XG4gICAgICAgICAgICBjdXJyZW50VmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtZXJnZWRPYmplY3Q7XG59XG5cbi8qKlxuICogJ19tZXJnZUVycm9ycycgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIE1lcmdlcyBhbiBhcnJheSBvZiBvYmplY3RzLlxuICogVXNlZCBmb3IgY29tYmluaW5nIHRoZSB2YWxpZGF0b3IgZXJyb3JzIHJldHVybmVkIGZyb20gJ2V4ZWN1dGVWYWxpZGF0b3JzJ1xuICpcbiAqIC8vICB7IFBsYWluT2JqZWN0W10gfSBhcnJheU9mRXJyb3JzIC0gYXJyYXkgb2Ygb2JqZWN0c1xuICogLy8geyBQbGFpbk9iamVjdCB9IC0gbWVyZ2VkIG9iamVjdCwgb3IgbnVsbCBpZiBubyB1c2FibGUgaW5wdXQgb2JqZWN0Y3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIF9tZXJnZUVycm9ycyhhcnJheU9mRXJyb3JzKSB7XG4gIGNvbnN0IG1lcmdlZEVycm9ycyA9IF9tZXJnZU9iamVjdHMoLi4uYXJyYXlPZkVycm9ycyk7XG4gIHJldHVybiBpc0VtcHR5KG1lcmdlZEVycm9ycykgPyBudWxsIDogbWVyZ2VkRXJyb3JzO1xufVxuXG4vKipcbiAqICdpc0RlZmluZWQnIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgaWYgYSB2YXJpYWJsZSBjb250YWlucyBhIHZhbHVlIG9mIGFueSB0eXBlLlxuICogUmV0dXJucyB0cnVlIGV2ZW4gZm9yIG90aGVyd2lzZSAnZmFsc2V5JyB2YWx1ZXMgb2YgMCwgJycsIGFuZCBmYWxzZS5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfSAtIGZhbHNlIGlmIHVuZGVmaW5lZCBvciBudWxsLCBvdGhlcndpc2UgdHJ1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZpbmVkKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsO1xufVxuXG4vKipcbiAqICdoYXNWYWx1ZScgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBpZiBhIHZhcmlhYmxlIGNvbnRhaW5zIGEgdmFsdWUuXG4gKiBSZXR1cnMgZmFsc2UgZm9yIG51bGwsIHVuZGVmaW5lZCwgb3IgYSB6ZXJvLWxlbmd0aCBzdHJuZywgJycsXG4gKiBvdGhlcndpc2UgcmV0dXJucyB0cnVlLlxuICogKFN0cmljdGVyIHRoYW4gJ2lzRGVmaW5lZCcgYmVjYXVzZSBpdCBhbHNvIHJldHVybnMgZmFsc2UgZm9yICcnLFxuICogdGhvdWdoIGl0IHN0aWwgcmV0dXJucyB0cnVlIGZvciBvdGhlcndpc2UgJ2ZhbHNleScgdmFsdWVzIDAgYW5kIGZhbHNlLilcbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfSAtIGZhbHNlIGlmIHVuZGVmaW5lZCwgbnVsbCwgb3IgJycsIG90aGVyd2lzZSB0cnVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJyc7XG59XG5cbi8qKlxuICogJ2lzRW1wdHknIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBTaW1pbGFyIHRvICFoYXNWYWx1ZSwgYnV0IGFsc28gcmV0dXJucyB0cnVlIGZvciBlbXB0eSBhcnJheXMgYW5kIG9iamVjdHMuXG4gKlxuICogLy8gICB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH0gLSBmYWxzZSBpZiB1bmRlZmluZWQsIG51bGwsIG9yICcnLCBvdGhlcndpc2UgdHJ1ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNFbXB0eSh2YWx1ZSkge1xuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHsgcmV0dXJuICF2YWx1ZS5sZW5ndGg7IH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkgeyByZXR1cm4gIU9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGg7IH1cbiAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnO1xufVxuXG4vKipcbiAqICdpc1N0cmluZycgdXRpbGl0eSBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBpZiBhIHZhbHVlIGlzIGEgc3RyaW5nLlxuICpcbiAqIC8vICAgdmFsdWUgLSB0aGUgdmFsdWUgdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiBzdHJpbmcsIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogJ2lzTnVtYmVyJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYSByZWd1bGFyIG51bWJlciwgbnVtZXJpYyBzdHJpbmcsIG9yIEphdmFTY3JpcHQgRGF0ZS5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyAgeyBhbnkgPSBmYWxzZSB9IHN0cmljdCAtIGlmIHRydXRoeSwgYWxzbyBjaGVja3MgSmF2YVNjcmlwdCB0eW9lXG4gKiAvLyB7IGJvb2xlYW4gfSAtIHRydWUgaWYgbnVtYmVyLCBmYWxzZSBpZiBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyKHZhbHVlLCBzdHJpY3Q6IGFueSA9IGZhbHNlKSB7XG4gIGlmIChzdHJpY3QgJiYgdHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykgeyByZXR1cm4gZmFsc2U7IH1cbiAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgdmFsdWUgIT09IHZhbHVlIC8gMDtcbn1cblxuLyoqXG4gKiAnaXNJbnRlZ2VyJyB1dGlsaXR5IGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIGlmIGEgdmFsdWUgaXMgYW4gaW50ZWdlci5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdGhlIHZhbHVlIHRvIGNoZWNrXG4gKiAvLyAgeyBhbnkgPSBmYWxzZSB9IHN0cmljdCAtIGlmIHRydXRoeSwgYWxzbyBjaGVja3MgSmF2YVNjcmlwdCB0eW9lXG4gKiAvLyB7Ym9vbGVhbiB9IC0gdHJ1ZSBpZiBudW1iZXIsIGZhbHNlIGlmIG5vdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJbnRlZ2VyKHZhbHVlLCBzdHJpY3Q6IGFueSA9IGZhbHNlKSB7XG4gIGlmIChzdHJpY3QgJiYgdHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykgeyByZXR1cm4gZmFsc2U7IH1cbiAgcmV0dXJuICFpc05hTih2YWx1ZSkgJiYgIHZhbHVlICE9PSB2YWx1ZSAvIDAgJiYgdmFsdWUgJSAxID09PSAwO1xufVxuXG4vKipcbiAqICdpc0Jvb2xlYW4nIHV0aWxpdHkgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgaWYgYSB2YWx1ZSBpcyBhIGJvb2xlYW4uXG4gKlxuICogLy8gICB2YWx1ZSAtIHRoZSB2YWx1ZSB0byBjaGVja1xuICogLy8gIHsgYW55ID0gbnVsbCB9IG9wdGlvbiAtIGlmICdzdHJpY3QnLCBhbHNvIGNoZWNrcyBKYXZhU2NyaXB0IHR5cGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgVFJVRSBvciBGQUxTRSwgY2hlY2tzIG9ubHkgZm9yIHRoYXQgdmFsdWVcbiAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiBib29sZWFuLCBmYWxzZSBpZiBub3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQm9vbGVhbih2YWx1ZSwgb3B0aW9uOiBhbnkgPSBudWxsKSB7XG4gIGlmIChvcHRpb24gPT09ICdzdHJpY3QnKSB7IHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2U7IH1cbiAgaWYgKG9wdGlvbiA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gMSB8fCB2YWx1ZSA9PT0gJ3RydWUnIHx8IHZhbHVlID09PSAnMSc7XG4gIH1cbiAgaWYgKG9wdGlvbiA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IGZhbHNlIHx8IHZhbHVlID09PSAwIHx8IHZhbHVlID09PSAnZmFsc2UnIHx8IHZhbHVlID09PSAnMCc7XG4gIH1cbiAgcmV0dXJuIHZhbHVlID09PSB0cnVlIHx8IHZhbHVlID09PSAxIHx8IHZhbHVlID09PSAndHJ1ZScgfHwgdmFsdWUgPT09ICcxJyB8fFxuICAgIHZhbHVlID09PSBmYWxzZSB8fCB2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA9PT0gJ2ZhbHNlJyB8fCB2YWx1ZSA9PT0gJzAnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QoaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBpdGVtICE9PSBudWxsICYmIHR5cGVvZiBpdGVtID09PSAnb2JqZWN0Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQXJyYXkoaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGl0ZW0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRlKGl0ZW06IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFpdGVtICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVtKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNNYXAoaXRlbTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAhIWl0ZW0gJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGl0ZW0pID09PSAnW29iamVjdCBNYXBdJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2V0KGl0ZW06IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFpdGVtICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVtKSA9PT0gJ1tvYmplY3QgU2V0XSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N5bWJvbChpdGVtOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBpdGVtID09PSAnc3ltYm9sJztcbn1cblxuLyoqXG4gKiAnZ2V0VHlwZScgZnVuY3Rpb25cbiAqXG4gKiBEZXRlY3RzIHRoZSBKU09OIFNjaGVtYSBUeXBlIG9mIGEgdmFsdWUuXG4gKiBCeSBkZWZhdWx0LCBkZXRlY3RzIG51bWJlcnMgYW5kIGludGVnZXJzIGV2ZW4gaWYgZm9ybWF0dGVkIGFzIHN0cmluZ3MuXG4gKiAoU28gYWxsIGludGVnZXJzIGFyZSBhbHNvIG51bWJlcnMsIGFuZCBhbnkgbnVtYmVyIG1heSBhbHNvIGJlIGEgc3RyaW5nLilcbiAqIEhvd2V2ZXIsIGl0IG9ubHkgZGV0ZWN0cyB0cnVlIGJvb2xlYW4gdmFsdWVzICh0byBkZXRlY3QgYm9vbGVhbiB2YWx1ZXNcbiAqIGluIG5vbi1ib29sZWFuIGZvcm1hdHMsIHVzZSBpc0Jvb2xlYW4oKSBpbnN0ZWFkKS5cbiAqXG4gKiBJZiBwYXNzZWQgYSBzZWNvbmQgb3B0aW9uYWwgcGFyYW1ldGVyIG9mICdzdHJpY3QnLCBpdCB3aWxsIG9ubHkgZGV0ZWN0XG4gKiBudW1iZXJzIGFuZCBpbnRlZ2VycyBpZiB0aGV5IGFyZSBmb3JtYXR0ZWQgYXMgSmF2YVNjcmlwdCBudW1iZXJzLlxuICpcbiAqIEV4YW1wbGVzOlxuICogZ2V0VHlwZSgnMTAuNScpID0gJ251bWJlcidcbiAqIGdldFR5cGUoMTAuNSkgPSAnbnVtYmVyJ1xuICogZ2V0VHlwZSgnMTAnKSA9ICdpbnRlZ2VyJ1xuICogZ2V0VHlwZSgxMCkgPSAnaW50ZWdlcidcbiAqIGdldFR5cGUoJ3RydWUnKSA9ICdzdHJpbmcnXG4gKiBnZXRUeXBlKHRydWUpID0gJ2Jvb2xlYW4nXG4gKiBnZXRUeXBlKG51bGwpID0gJ251bGwnXG4gKiBnZXRUeXBlKHsgfSkgPSAnb2JqZWN0J1xuICogZ2V0VHlwZShbXSkgPSAnYXJyYXknXG4gKlxuICogZ2V0VHlwZSgnMTAuNScsICdzdHJpY3QnKSA9ICdzdHJpbmcnXG4gKiBnZXRUeXBlKDEwLjUsICdzdHJpY3QnKSA9ICdudW1iZXInXG4gKiBnZXRUeXBlKCcxMCcsICdzdHJpY3QnKSA9ICdzdHJpbmcnXG4gKiBnZXRUeXBlKDEwLCAnc3RyaWN0JykgPSAnaW50ZWdlcidcbiAqIGdldFR5cGUoJ3RydWUnLCAnc3RyaWN0JykgPSAnc3RyaW5nJ1xuICogZ2V0VHlwZSh0cnVlLCAnc3RyaWN0JykgPSAnYm9vbGVhbidcbiAqXG4gKiAvLyAgIHZhbHVlIC0gdmFsdWUgdG8gY2hlY2tcbiAqIC8vICB7IGFueSA9IGZhbHNlIH0gc3RyaWN0IC0gaWYgdHJ1dGh5LCBhbHNvIGNoZWNrcyBKYXZhU2NyaXB0IHR5b2VcbiAqIC8vIHsgU2NoZW1hVHlwZSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlKHZhbHVlLCBzdHJpY3Q6IGFueSA9IGZhbHNlKSB7XG4gIGlmICghaXNEZWZpbmVkKHZhbHVlKSkgeyByZXR1cm4gJ251bGwnOyB9XG4gIGlmIChpc0FycmF5KHZhbHVlKSkgeyByZXR1cm4gJ2FycmF5JzsgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7IHJldHVybiAnb2JqZWN0JzsgfVxuICBpZiAoaXNCb29sZWFuKHZhbHVlLCAnc3RyaWN0JykpIHsgcmV0dXJuICdib29sZWFuJzsgfVxuICBpZiAoaXNJbnRlZ2VyKHZhbHVlLCBzdHJpY3QpKSB7IHJldHVybiAnaW50ZWdlcic7IH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlLCBzdHJpY3QpKSB7IHJldHVybiAnbnVtYmVyJzsgfVxuICBpZiAoaXNTdHJpbmcodmFsdWUpIHx8ICghc3RyaWN0ICYmIGlzRGF0ZSh2YWx1ZSkpKSB7IHJldHVybiAnc3RyaW5nJzsgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiAnaXNUeXBlJyBmdW5jdGlvblxuICpcbiAqIENoZWNrcyB3ZXRoZXIgYW4gaW5wdXQgKHByb2JhYmx5IHN0cmluZykgdmFsdWUgY29udGFpbnMgZGF0YSBvZlxuICogYSBzcGVjaWZpZWQgSlNPTiBTY2hlbWEgdHlwZVxuICpcbiAqIC8vICB7IFByaW1pdGl2ZVZhbHVlIH0gdmFsdWUgLSB2YWx1ZSB0byBjaGVja1xuICogLy8gIHsgU2NoZW1hUHJpbWl0aXZlVHlwZSB9IHR5cGUgLSB0eXBlIHRvIGNoZWNrXG4gKiAvLyB7IGJvb2xlYW4gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUeXBlKHZhbHVlLCB0eXBlKSB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gaXNTdHJpbmcodmFsdWUpIHx8IGlzRGF0ZSh2YWx1ZSk7XG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc051bWJlcih2YWx1ZSk7XG4gICAgY2FzZSAnaW50ZWdlcic6XG4gICAgICByZXR1cm4gaXNJbnRlZ2VyKHZhbHVlKTtcbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiBpc0Jvb2xlYW4odmFsdWUpO1xuICAgIGNhc2UgJ251bGwnOlxuICAgICAgcmV0dXJuICFoYXNWYWx1ZSh2YWx1ZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUuZXJyb3IoYGlzVHlwZSBlcnJvcjogXCIke3R5cGV9XCIgaXMgbm90IGEgcmVjb2duaXplZCB0eXBlLmApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiAnaXNQcmltaXRpdmUnIGZ1bmN0aW9uXG4gKlxuICogQ2hlY2tzIHdldGhlciBhbiBpbnB1dCB2YWx1ZSBpcyBhIEphdmFTY3JpcHQgcHJpbWl0aXZlIHR5cGU6XG4gKiBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwgb3IgbnVsbC5cbiAqXG4gKiAvLyAgIHZhbHVlIC0gdmFsdWUgdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZSh2YWx1ZSkge1xuICByZXR1cm4gKGlzU3RyaW5nKHZhbHVlKSB8fCBpc051bWJlcih2YWx1ZSkgfHxcbiAgICBpc0Jvb2xlYW4odmFsdWUsICdzdHJpY3QnKSB8fCB2YWx1ZSA9PT0gbnVsbCk7XG59XG5cbi8qKlxuICogXG4gKiBAcGFyYW0gZGF0ZSBcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiBleG1hcGxlOlxuICogdG9EYXRlU3RyaW5nKCcyMDE4LTAxLTAxJykgPSAnMjAxOC0wMS0wMSdcbiAqIHRvRGF0ZVN0cmluZygnMjAxOC0wMS0zMFQwMDowMDowMC4wMDBaJykgPSAnMjAxOC0wMS0zMCdcbiAqL1xuZXhwb3J0IGNvbnN0IHRvSXNvU3RyaW5nID0gKGRhdGU6IERhdGUpID0+IHtcbiAgY29uc3QgZGF5ID0gZGF0ZS5nZXREYXRlKCk7XG4gIGNvbnN0IG1vbnRoID0gZGF0ZS5nZXRNb250aCgpICsgMTtcbiAgY29uc3QgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgcmV0dXJuIGAke3llYXJ9LSR7bW9udGggPCAxMCA/ICcwJyArIG1vbnRoIDogbW9udGh9LSR7ZGF5IDwgMTAgPyAnMCcgKyBkYXkgOiBkYXl9YDtcbn1cblxuLyoqXG4gKiAndG9KYXZhU2NyaXB0VHlwZScgZnVuY3Rpb25cbiAqXG4gKiBDb252ZXJ0cyBhbiBpbnB1dCAocHJvYmFibHkgc3RyaW5nKSB2YWx1ZSB0byBhIEphdmFTY3JpcHQgcHJpbWl0aXZlIHR5cGUgLVxuICogJ3N0cmluZycsICdudW1iZXInLCAnYm9vbGVhbicsIG9yICdudWxsJyAtIGJlZm9yZSBzdG9yaW5nIGluIGEgSlNPTiBvYmplY3QuXG4gKlxuICogRG9lcyBub3QgY29lcmNlIHZhbHVlcyAob3RoZXIgdGhhbiBudWxsKSwgYW5kIG9ubHkgY29udmVydHMgdGhlIHR5cGVzXG4gKiBvZiB2YWx1ZXMgdGhhdCB3b3VsZCBvdGhlcndpc2UgYmUgdmFsaWQuXG4gKlxuICogSWYgdGhlIG9wdGlvbmFsIHRoaXJkIHBhcmFtZXRlciAnc3RyaWN0SW50ZWdlcnMnIGlzIFRSVUUsIGFuZCB0aGVcbiAqIEpTT04gU2NoZW1hIHR5cGUgJ2ludGVnZXInIGlzIHNwZWNpZmllZCwgaXQgYWxzbyB2ZXJpZmllcyB0aGUgaW5wdXQgdmFsdWVcbiAqIGlzIGFuIGludGVnZXIgYW5kLCBpZiBpdCBpcywgcmV0dXJucyBpdCBhcyBhIEphdmVTY3JpcHQgbnVtYmVyLlxuICogSWYgJ3N0cmljdEludGVnZXJzJyBpcyBGQUxTRSAob3Igbm90IHNldCkgdGhlIHR5cGUgJ2ludGVnZXInIGlzIHRyZWF0ZWRcbiAqIGV4YWN0bHkgdGhlIHNhbWUgYXMgJ251bWJlcicsIGFuZCBhbGxvd3MgZGVjaW1hbHMuXG4gKlxuICogVmFsaWQgRXhhbXBsZXM6XG4gKiB0b0phdmFTY3JpcHRUeXBlKCcxMCcsICAgJ251bWJlcicgKSA9IDEwICAgLy8gJzEwJyAgIGlzIGEgbnVtYmVyXG4gKiB0b0phdmFTY3JpcHRUeXBlKCcxMCcsICAgJ2ludGVnZXInKSA9IDEwICAgLy8gJzEwJyAgIGlzIGFsc28gYW4gaW50ZWdlclxuICogdG9KYXZhU2NyaXB0VHlwZSggMTAsICAgICdpbnRlZ2VyJykgPSAxMCAgIC8vICAxMCAgICBpcyBzdGlsbCBhbiBpbnRlZ2VyXG4gKiB0b0phdmFTY3JpcHRUeXBlKCAxMCwgICAgJ3N0cmluZycgKSA9ICcxMCcgLy8gIDEwICAgIGNhbiBiZSBtYWRlIGludG8gYSBzdHJpbmdcbiAqIHRvSmF2YVNjcmlwdFR5cGUoJzEwLjUnLCAnbnVtYmVyJyApID0gMTAuNSAvLyAnMTAuNScgaXMgYSBudW1iZXJcbiAqXG4gKiBJbnZhbGlkIEV4YW1wbGVzOlxuICogdG9KYXZhU2NyaXB0VHlwZSgnMTAuNScsICdpbnRlZ2VyJykgPSBudWxsIC8vICcxMC41JyBpcyBub3QgYW4gaW50ZWdlclxuICogdG9KYXZhU2NyaXB0VHlwZSggMTAuNSwgICdpbnRlZ2VyJykgPSBudWxsIC8vICAxMC41ICBpcyBzdGlsbCBub3QgYW4gaW50ZWdlclxuICpcbiAqIC8vICB7IFByaW1pdGl2ZVZhbHVlIH0gdmFsdWUgLSB2YWx1ZSB0byBjb252ZXJ0XG4gKiAvLyAgeyBTY2hlbWFQcmltaXRpdmVUeXBlIHwgU2NoZW1hUHJpbWl0aXZlVHlwZVtdIH0gdHlwZXMgLSB0eXBlcyB0byBjb252ZXJ0IHRvXG4gKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBzdHJpY3RJbnRlZ2VycyAtIGlmIEZBTFNFLCB0cmVhdCBpbnRlZ2VycyBhcyBudW1iZXJzXG4gKiAvLyB7IFByaW1pdGl2ZVZhbHVlIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvSmF2YVNjcmlwdFR5cGUodmFsdWUsIHR5cGVzLCBzdHJpY3RJbnRlZ2VycyA9IHRydWUpICB7XG4gIGlmICghaXNEZWZpbmVkKHZhbHVlKSkgeyByZXR1cm4gbnVsbDsgfVxuICBpZiAoaXNTdHJpbmcodHlwZXMpKSB7IHR5cGVzID0gW3R5cGVzXTsgfVxuICBpZiAoc3RyaWN0SW50ZWdlcnMgJiYgaW5BcnJheSgnaW50ZWdlcicsIHR5cGVzKSkge1xuICAgIGlmIChpc0ludGVnZXIodmFsdWUsICdzdHJpY3QnKSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICBpZiAoaXNJbnRlZ2VyKHZhbHVlKSkgeyByZXR1cm4gcGFyc2VJbnQodmFsdWUsIDEwKTsgfVxuICB9XG4gIGlmIChpbkFycmF5KCdudW1iZXInLCB0eXBlcykgfHwgKCFzdHJpY3RJbnRlZ2VycyAmJiBpbkFycmF5KCdpbnRlZ2VyJywgdHlwZXMpKSkge1xuICAgIGlmIChpc051bWJlcih2YWx1ZSwgJ3N0cmljdCcpKSB7IHJldHVybiB2YWx1ZTsgfVxuICAgIGlmIChpc051bWJlcih2YWx1ZSkpIHsgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpOyB9XG4gIH1cbiAgaWYgKGluQXJyYXkoJ3N0cmluZycsIHR5cGVzKSkge1xuICAgIGlmIChpc1N0cmluZyh2YWx1ZSkpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgLy8gSWYgdmFsdWUgaXMgYSBkYXRlLCBhbmQgdHlwZXMgaW5jbHVkZXMgJ3N0cmluZycsXG4gICAgLy8gY29udmVydCB0aGUgZGF0ZSB0byBhIHN0cmluZ1xuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7IHJldHVybiB0b0lzb1N0cmluZyh2YWx1ZSk7IH1cbiAgICBpZiAoaXNOdW1iZXIodmFsdWUpKSB7IHJldHVybiB2YWx1ZS50b1N0cmluZygpOyB9XG4gIH1cbiAgLy8gSWYgdmFsdWUgaXMgYSBkYXRlLCBhbmQgdHlwZXMgaW5jbHVkZXMgJ2ludGVnZXInIG9yICdudW1iZXInLFxuICAvLyBidXQgbm90ICdzdHJpbmcnLCBjb252ZXJ0IHRoZSBkYXRlIHRvIGEgbnVtYmVyXG4gIGlmIChpc0RhdGUodmFsdWUpICYmIChpbkFycmF5KCdpbnRlZ2VyJywgdHlwZXMpIHx8IGluQXJyYXkoJ251bWJlcicsIHR5cGVzKSkpIHtcbiAgICByZXR1cm4gdmFsdWUuZ2V0VGltZSgpO1xuICB9XG4gIGlmIChpbkFycmF5KCdib29sZWFuJywgdHlwZXMpKSB7XG4gICAgaWYgKGlzQm9vbGVhbih2YWx1ZSwgdHJ1ZSkpIHsgcmV0dXJuIHRydWU7IH1cbiAgICBpZiAoaXNCb29sZWFuKHZhbHVlLCBmYWxzZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogJ3RvU2NoZW1hVHlwZScgZnVuY3Rpb25cbiAqXG4gKiBDb252ZXJ0cyBhbiBpbnB1dCAocHJvYmFibHkgc3RyaW5nKSB2YWx1ZSB0byB0aGUgXCJiZXN0XCIgSmF2YVNjcmlwdFxuICogZXF1aXZhbGVudCBhdmFpbGFibGUgZnJvbSBhbiBhbGxvd2VkIGxpc3Qgb2YgSlNPTiBTY2hlbWEgdHlwZXMsIHdoaWNoIG1heVxuICogY29udGFpbiAnc3RyaW5nJywgJ251bWJlcicsICdpbnRlZ2VyJywgJ2Jvb2xlYW4nLCBhbmQvb3IgJ251bGwnLlxuICogSWYgbmVjc3NhcnksIGl0IGRvZXMgcHJvZ3Jlc3NpdmVseSBhZ3Jlc3NpdmUgdHlwZSBjb2Vyc2lvbi5cbiAqIEl0IHdpbGwgbm90IHJldHVybiBudWxsIHVubGVzcyBudWxsIGlzIGluIHRoZSBsaXN0IG9mIGFsbG93ZWQgdHlwZXMuXG4gKlxuICogTnVtYmVyIGNvbnZlcnNpb24gZXhhbXBsZXM6XG4gKiB0b1NjaGVtYVR5cGUoJzEwJywgWydudW1iZXInLCdpbnRlZ2VyJywnc3RyaW5nJ10pID0gMTAgLy8gaW50ZWdlclxuICogdG9TY2hlbWFUeXBlKCcxMCcsIFsnbnVtYmVyJywnc3RyaW5nJ10pID0gMTAgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUoJzEwJywgWydzdHJpbmcnXSkgPSAnMTAnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKCcxMC41JywgWydudW1iZXInLCdpbnRlZ2VyJywnc3RyaW5nJ10pID0gMTAuNSAvLyBudW1iZXJcbiAqIHRvU2NoZW1hVHlwZSgnMTAuNScsIFsnaW50ZWdlcicsJ3N0cmluZyddKSA9ICcxMC41JyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgnMTAuNScsIFsnaW50ZWdlciddKSA9IDEwIC8vIGludGVnZXJcbiAqIHRvU2NoZW1hVHlwZSgxMC41LCBbJ251bGwnLCdib29sZWFuJywnc3RyaW5nJ10pID0gJzEwLjUnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKDEwLjUsIFsnbnVsbCcsJ2Jvb2xlYW4nXSkgPSB0cnVlIC8vIGJvb2xlYW5cbiAqXG4gKiBTdHJpbmcgY29udmVyc2lvbiBleGFtcGxlczpcbiAqIHRvU2NoZW1hVHlwZSgnMS41eCcsIFsnYm9vbGVhbicsJ251bWJlcicsJ2ludGVnZXInLCdzdHJpbmcnXSkgPSAnMS41eCcgLy8gc3RyaW5nXG4gKiB0b1NjaGVtYVR5cGUoJzEuNXgnLCBbJ2Jvb2xlYW4nLCdudW1iZXInLCdpbnRlZ2VyJ10pID0gJzEuNScgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUoJzEuNXgnLCBbJ2Jvb2xlYW4nLCdpbnRlZ2VyJ10pID0gJzEnIC8vIGludGVnZXJcbiAqIHRvU2NoZW1hVHlwZSgnMS41eCcsIFsnYm9vbGVhbiddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKCd4eXonLCBbJ251bWJlcicsJ2ludGVnZXInLCdib29sZWFuJywnbnVsbCddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKCd4eXonLCBbJ251bWJlcicsJ2ludGVnZXInLCdudWxsJ10pID0gbnVsbCAvLyBudWxsXG4gKiB0b1NjaGVtYVR5cGUoJ3h5eicsIFsnbnVtYmVyJywnaW50ZWdlciddKSA9IDAgLy8gbnVtYmVyXG4gKlxuICogQm9vbGVhbiBjb252ZXJzaW9uIGV4YW1wbGVzOlxuICogdG9TY2hlbWFUeXBlKCcxJywgWydpbnRlZ2VyJywnbnVtYmVyJywnc3RyaW5nJywnYm9vbGVhbiddKSA9IDEgLy8gaW50ZWdlclxuICogdG9TY2hlbWFUeXBlKCcxJywgWydudW1iZXInLCdzdHJpbmcnLCdib29sZWFuJ10pID0gMSAvLyBudW1iZXJcbiAqIHRvU2NoZW1hVHlwZSgnMScsIFsnc3RyaW5nJywnYm9vbGVhbiddKSA9ICcxJyAvLyBzdHJpbmdcbiAqIHRvU2NoZW1hVHlwZSgnMScsIFsnYm9vbGVhbiddKSA9IHRydWUgLy8gYm9vbGVhblxuICogdG9TY2hlbWFUeXBlKCd0cnVlJywgWydudW1iZXInLCdzdHJpbmcnLCdib29sZWFuJ10pID0gJ3RydWUnIC8vIHN0cmluZ1xuICogdG9TY2hlbWFUeXBlKCd0cnVlJywgWydib29sZWFuJ10pID0gdHJ1ZSAvLyBib29sZWFuXG4gKiB0b1NjaGVtYVR5cGUoJ3RydWUnLCBbJ251bWJlciddKSA9IDAgLy8gbnVtYmVyXG4gKiB0b1NjaGVtYVR5cGUodHJ1ZSwgWydudW1iZXInLCdzdHJpbmcnLCdib29sZWFuJ10pID0gdHJ1ZSAvLyBib29sZWFuXG4gKiB0b1NjaGVtYVR5cGUodHJ1ZSwgWydudW1iZXInLCdzdHJpbmcnXSkgPSAndHJ1ZScgLy8gc3RyaW5nXG4gKiB0b1NjaGVtYVR5cGUodHJ1ZSwgWydudW1iZXInXSkgPSAxIC8vIG51bWJlclxuICpcbiAqIC8vICB7IFByaW1pdGl2ZVZhbHVlIH0gdmFsdWUgLSB2YWx1ZSB0byBjb252ZXJ0XG4gKiAvLyAgeyBTY2hlbWFQcmltaXRpdmVUeXBlIHwgU2NoZW1hUHJpbWl0aXZlVHlwZVtdIH0gdHlwZXMgLSBhbGxvd2VkIHR5cGVzIHRvIGNvbnZlcnQgdG9cbiAqIC8vIHsgUHJpbWl0aXZlVmFsdWUgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9TY2hlbWFUeXBlKHZhbHVlLCB0eXBlcykge1xuICBpZiAoIWlzQXJyYXkoPFNjaGVtYVByaW1pdGl2ZVR5cGU+dHlwZXMpKSB7XG4gICAgdHlwZXMgPSA8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPlt0eXBlc107XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnbnVsbCcpICYmICFoYXNWYWx1ZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdib29sZWFuJykgJiYgIWlzQm9vbGVhbih2YWx1ZSwgJ3N0cmljdCcpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ2ludGVnZXInKSkge1xuICAgIGNvbnN0IHRlc3RWYWx1ZSA9IHRvSmF2YVNjcmlwdFR5cGUodmFsdWUsICdpbnRlZ2VyJyk7XG4gICAgaWYgKHRlc3RWYWx1ZSAhPT0gbnVsbCkgeyByZXR1cm4gK3Rlc3RWYWx1ZTsgfVxuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bWJlcicpKSB7XG4gICAgY29uc3QgdGVzdFZhbHVlID0gdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgJ251bWJlcicpO1xuICAgIGlmICh0ZXN0VmFsdWUgIT09IG51bGwpIHsgcmV0dXJuICt0ZXN0VmFsdWU7IH1cbiAgfVxuICBpZiAoXG4gICAgKGlzU3RyaW5nKHZhbHVlKSB8fCBpc051bWJlcih2YWx1ZSwgJ3N0cmljdCcpKSAmJlxuICAgICg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnc3RyaW5nJylcbiAgKSB7IC8vIENvbnZlcnQgbnVtYmVyIHRvIHN0cmluZ1xuICAgIHJldHVybiB0b0phdmFTY3JpcHRUeXBlKHZhbHVlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnYm9vbGVhbicpICYmIGlzQm9vbGVhbih2YWx1ZSkpIHtcbiAgICByZXR1cm4gdG9KYXZhU2NyaXB0VHlwZSh2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgfVxuICBpZiAoKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdzdHJpbmcnKSkgeyAvLyBDb252ZXJ0IG51bGwgJiBib29sZWFuIHRvIHN0cmluZ1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkgeyByZXR1cm4gJyc7IH1cbiAgICBjb25zdCB0ZXN0VmFsdWUgPSB0b0phdmFTY3JpcHRUeXBlKHZhbHVlLCAnc3RyaW5nJyk7XG4gICAgaWYgKHRlc3RWYWx1ZSAhPT0gbnVsbCkgeyByZXR1cm4gdGVzdFZhbHVlOyB9XG4gIH1cbiAgaWYgKChcbiAgICAoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bWJlcicpIHx8XG4gICAgKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdpbnRlZ2VyJykpXG4gICkge1xuICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkgeyByZXR1cm4gMTsgfSAvLyBDb252ZXJ0IGJvb2xlYW4gJiBudWxsIHRvIG51bWJlclxuICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09ICcnKSB7IHJldHVybiAwOyB9XG4gIH1cbiAgaWYgKCg8U2NoZW1hUHJpbWl0aXZlVHlwZVtdPnR5cGVzKS5pbmNsdWRlcygnbnVtYmVyJykpIHsgLy8gQ29udmVydCBtaXhlZCBzdHJpbmcgdG8gbnVtYmVyXG4gICAgY29uc3QgdGVzdFZhbHVlID0gcGFyc2VGbG9hdCg8c3RyaW5nPnZhbHVlKTtcbiAgICBpZiAoISF0ZXN0VmFsdWUpIHsgcmV0dXJuIHRlc3RWYWx1ZTsgfVxuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ2ludGVnZXInKSkgeyAvLyBDb252ZXJ0IHN0cmluZyBvciBudW1iZXIgdG8gaW50ZWdlclxuICAgIGNvbnN0IHRlc3RWYWx1ZSA9IHBhcnNlSW50KDxzdHJpbmc+dmFsdWUsIDEwKTtcbiAgICBpZiAoISF0ZXN0VmFsdWUpIHsgcmV0dXJuIHRlc3RWYWx1ZTsgfVxuICB9XG4gIGlmICgoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ2Jvb2xlYW4nKSkgeyAvLyBDb252ZXJ0IGFueXRoaW5nIHRvIGJvb2xlYW5cbiAgICByZXR1cm4gISF2YWx1ZTtcbiAgfVxuICBpZiAoKFxuICAgICAgKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdudW1iZXInKSB8fFxuICAgICAgKDxTY2hlbWFQcmltaXRpdmVUeXBlW10+dHlwZXMpLmluY2x1ZGVzKCdpbnRlZ2VyJylcbiAgICApICYmICEoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT50eXBlcykuaW5jbHVkZXMoJ251bGwnKVxuICApIHtcbiAgICByZXR1cm4gMDsgLy8gSWYgbnVsbCBub3QgYWxsb3dlZCwgcmV0dXJuIDAgZm9yIG5vbi1jb252ZXJ0YWJsZSB2YWx1ZXNcbiAgfVxufVxuXG4vKipcbiAqICdpc1Byb21pc2UnIGZ1bmN0aW9uXG4gKlxuICogLy8gICBvYmplY3RcbiAqIC8vIHsgYm9vbGVhbiB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2Uob2JqZWN0KTogb2JqZWN0IGlzIFByb21pc2U8YW55PiB7XG4gIHJldHVybiAhIW9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0LnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogJ2lzT2JzZXJ2YWJsZScgZnVuY3Rpb25cbiAqXG4gKiAvLyAgIG9iamVjdFxuICogLy8geyBib29sZWFuIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzT2JzZXJ2YWJsZShvYmplY3QpOiBvYmplY3QgaXMgT2JzZXJ2YWJsZTxhbnk+IHtcbiAgcmV0dXJuICEhb2JqZWN0ICYmIHR5cGVvZiBvYmplY3Quc3Vic2NyaWJlID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqICdfdG9Qcm9taXNlJyBmdW5jdGlvblxuICpcbiAqIC8vICB7IG9iamVjdCB9IG9iamVjdFxuICogLy8geyBQcm9taXNlPGFueT4gfVxuICovXG5leHBvcnQgZnVuY3Rpb24gX3RvUHJvbWlzZShvYmplY3QpOiBQcm9taXNlPGFueT4ge1xuICByZXR1cm4gaXNQcm9taXNlKG9iamVjdCkgPyBvYmplY3QgOiBvYmplY3QudG9Qcm9taXNlKCk7XG59XG5cbi8qKlxuICogJ3RvT2JzZXJ2YWJsZScgZnVuY3Rpb25cbiAqXG4gKiAvLyAgeyBvYmplY3QgfSBvYmplY3RcbiAqIC8vIHsgT2JzZXJ2YWJsZTxhbnk+IH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvT2JzZXJ2YWJsZShvYmplY3QpOiBPYnNlcnZhYmxlPGFueT4ge1xuICBjb25zdCBvYnNlcnZhYmxlID0gaXNQcm9taXNlKG9iamVjdCkgPyBmcm9tKG9iamVjdCkgOiBvYmplY3Q7XG4gIGlmIChpc09ic2VydmFibGUob2JzZXJ2YWJsZSkpIHsgcmV0dXJuIG9ic2VydmFibGU7IH1cbiAgY29uc29sZS5lcnJvcigndG9PYnNlcnZhYmxlIGVycm9yOiBFeHBlY3RlZCB2YWxpZGF0b3IgdG8gcmV0dXJuIFByb21pc2Ugb3IgT2JzZXJ2YWJsZS4nKTtcbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKCk7XG59XG5cbi8qKlxuICogJ2luQXJyYXknIGZ1bmN0aW9uXG4gKlxuICogU2VhcmNoZXMgYW4gYXJyYXkgZm9yIGFuIGl0ZW0sIG9yIG9uZSBvZiBhIGxpc3Qgb2YgaXRlbXMsIGFuZCByZXR1cm5zIHRydWVcbiAqIGFzIHNvb24gYXMgYSBtYXRjaCBpcyBmb3VuZCwgb3IgZmFsc2UgaWYgbm8gbWF0Y2guXG4gKlxuICogSWYgdGhlIG9wdGlvbmFsIHRoaXJkIHBhcmFtZXRlciBhbGxJbiBpcyBzZXQgdG8gVFJVRSwgYW5kIHRoZSBpdGVtIHRvIGZpbmRcbiAqIGlzIGFuIGFycmF5LCB0aGVuIHRoZSBmdW5jdGlvbiByZXR1cm5zIHRydWUgb25seSBpZiBhbGwgZWxlbWVudHMgZnJvbSBpdGVtXG4gKiBhcmUgZm91bmQgaW4gdGhlIGFycmF5IGxpc3QsIGFuZCBmYWxzZSBpZiBhbnkgZWxlbWVudCBpcyBub3QgZm91bmQuIElmIHRoZVxuICogaXRlbSB0byBmaW5kIGlzIG5vdCBhbiBhcnJheSwgc2V0dGluZyBhbGxJbiB0byBUUlVFIGhhcyBubyBlZmZlY3QuXG4gKlxuICogLy8gIHsgYW55fGFueVtdIH0gaXRlbSAtIHRoZSBpdGVtIHRvIHNlYXJjaCBmb3JcbiAqIC8vICAgYXJyYXkgLSB0aGUgYXJyYXkgdG8gc2VhcmNoXG4gKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBhbGxJbiAtIGlmIFRSVUUsIGFsbCBpdGVtcyBtdXN0IGJlIGluIGFycmF5XG4gKiAvLyB7IGJvb2xlYW4gfSAtIHRydWUgaWYgaXRlbShzKSBpbiBhcnJheSwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbkFycmF5KGl0ZW0sIGFycmF5LCBhbGxJbiA9IGZhbHNlKSB7XG4gIGlmICghaXNEZWZpbmVkKGl0ZW0pIHx8ICFpc0FycmF5KGFycmF5KSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgcmV0dXJuIGlzQXJyYXkoaXRlbSkgP1xuICAgIGl0ZW1bYWxsSW4gPyAnZXZlcnknIDogJ3NvbWUnXShzdWJJdGVtID0+IGFycmF5LmluY2x1ZGVzKHN1Ykl0ZW0pKSA6XG4gICAgYXJyYXkuaW5jbHVkZXMoaXRlbSk7XG59XG5cbi8qKlxuICogJ3hvcicgdXRpbGl0eSBmdW5jdGlvbiAtIGV4Y2x1c2l2ZSBvclxuICpcbiAqIFJldHVybnMgdHJ1ZSBpZiBleGFjdGx5IG9uZSBvZiB0d28gdmFsdWVzIGlzIHRydXRoeS5cbiAqXG4gKiAvLyAgIHZhbHVlMSAtIGZpcnN0IHZhbHVlIHRvIGNoZWNrXG4gKiAvLyAgIHZhbHVlMiAtIHNlY29uZCB2YWx1ZSB0byBjaGVja1xuICogLy8geyBib29sZWFuIH0gLSB0cnVlIGlmIGV4YWN0bHkgb25lIGlucHV0IHZhbHVlIGlzIHRydXRoeSwgZmFsc2UgaWYgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB4b3IodmFsdWUxLCB2YWx1ZTIpIHtcbiAgcmV0dXJuICghIXZhbHVlMSAmJiAhdmFsdWUyKSB8fCAoIXZhbHVlMSAmJiAhIXZhbHVlMik7XG59XG4iXX0=