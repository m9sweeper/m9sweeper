import { cleanValueOfQuotes, copy, getExpressionType, getKeyAndValueByExpressionType, hasOwn, isEqual, isNotEqual, isNotExpression } from './utility.functions.mjs';
import { Injectable } from '@angular/core';
import { isArray, isDefined, isEmpty, isMap, isNumber, isObject, isString } from './validator.functions.mjs';
import * as i0 from "@angular/core";
export class JsonPointer {
    /**
     * 'get' function
     *
     * Uses a JSON Pointer to retrieve a value from an object.
     *
     * //  { object } object - Object to get value from
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { number = 0 } startSlice - Zero-based index of first Pointer key to use
     * //  { number } endSlice - Zero-based index of last Pointer key to use
     * //  { boolean = false } getBoolean - Return only true or false?
     * //  { boolean = false } errors - Show error if not found?
     * // { object } - Located value (or true or false if getBoolean = true)
     */
    static get(object, pointer, startSlice = 0, endSlice = null, getBoolean = false, errors = false) {
        if (object === null) {
            return getBoolean ? false : undefined;
        }
        let keyArray = this.parse(pointer, errors);
        if (typeof object === 'object' && keyArray !== null) {
            let subObject = object;
            if (startSlice >= keyArray.length || endSlice <= -keyArray.length) {
                return object;
            }
            if (startSlice <= -keyArray.length) {
                startSlice = 0;
            }
            if (!isDefined(endSlice) || endSlice >= keyArray.length) {
                endSlice = keyArray.length;
            }
            keyArray = keyArray.slice(startSlice, endSlice);
            for (let key of keyArray) {
                if (key === '-' && isArray(subObject) && subObject.length) {
                    key = subObject.length - 1;
                }
                if (isMap(subObject) && subObject.has(key)) {
                    subObject = subObject.get(key);
                }
                else if (typeof subObject === 'object' && subObject !== null &&
                    hasOwn(subObject, key)) {
                    subObject = subObject[key];
                }
                else {
                    const evaluatedExpression = JsonPointer.evaluateExpression(subObject, key);
                    if (evaluatedExpression.passed) {
                        subObject = evaluatedExpression.key ? subObject[evaluatedExpression.key] : subObject;
                    }
                    else {
                        this.logErrors(errors, key, pointer, object);
                        return getBoolean ? false : undefined;
                    }
                }
            }
            return getBoolean ? true : subObject;
        }
        if (errors && keyArray === null) {
            console.error(`get error: Invalid JSON Pointer: ${pointer}`);
        }
        if (errors && typeof object !== 'object') {
            console.error('get error: Invalid object:');
            console.error(object);
        }
        return getBoolean ? false : undefined;
    }
    static logErrors(errors, key, pointer, object) {
        if (errors) {
            console.error(`get error: "${key}" key not found in object.`);
            console.error(pointer);
            console.error(object);
        }
    }
    /**
     * Evaluates conditional expression in form of `model.<property>==<value>` or
     * `model.<property>!=<value>` where the first one means that the value must match to be
     * shown in a form, while the former shows the property only when the property value is not
     * set, or does not equal the given value.
     *
     * // { subObject } subObject -  an object containing the data values of properties
     * // { key } key - the key from the for loop in a form of `<property>==<value>`
     *
     * Returns the object with two properties. The property passed informs whether
     * the expression evaluated successfully and the property key returns either the same
     * key if it is not contained inside the subObject or the key of the property if it is contained.
     */
    static evaluateExpression(subObject, key) {
        const defaultResult = { passed: false, key: key };
        const keysAndExpression = this.parseKeysAndExpression(key, subObject);
        if (!keysAndExpression) {
            return defaultResult;
        }
        const ownCheckResult = this.doOwnCheckResult(subObject, keysAndExpression);
        if (ownCheckResult) {
            return ownCheckResult;
        }
        const cleanedValue = cleanValueOfQuotes(keysAndExpression.keyAndValue[1]);
        const evaluatedResult = this.performExpressionOnValue(keysAndExpression, cleanedValue, subObject);
        if (evaluatedResult) {
            return evaluatedResult;
        }
        return defaultResult;
    }
    /**
     * Performs the actual evaluation on the given expression with given values and keys.
     * // { cleanedValue } cleanedValue - the given valued cleaned of quotes if it had any
     * // { subObject } subObject - the object with properties values
     * // { keysAndExpression } keysAndExpression - an object holding the expressions with
     */
    static performExpressionOnValue(keysAndExpression, cleanedValue, subObject) {
        const propertyByKey = subObject[keysAndExpression.keyAndValue[0]];
        if (this.doComparisonByExpressionType(keysAndExpression.expressionType, propertyByKey, cleanedValue)) {
            return { passed: true, key: keysAndExpression.keyAndValue[0] };
        }
        return null;
    }
    static doComparisonByExpressionType(expressionType, propertyByKey, cleanedValue) {
        if (isEqual(expressionType)) {
            return propertyByKey === cleanedValue;
        }
        if (isNotEqual(expressionType)) {
            return propertyByKey !== cleanedValue;
        }
        return false;
    }
    /**
     * Does the checks when the parsed key is actually no a property inside subObject.
     * That would mean that the equal comparison makes no sense and thus the negative result
     * is returned, and the not equal comparison is not necessary because it doesn't equal
     * obviously. Returns null when the given key is a real property inside the subObject.
     * // { subObject } subObject - the object with properties values
     * // { keysAndExpression } keysAndExpression - an object holding the expressions with
     * the associated keys.
     */
    static doOwnCheckResult(subObject, keysAndExpression) {
        let ownCheckResult = null;
        if (!hasOwn(subObject, keysAndExpression.keyAndValue[0])) {
            if (isEqual(keysAndExpression.expressionType)) {
                ownCheckResult = { passed: false, key: null };
            }
            if (isNotEqual(keysAndExpression.expressionType)) {
                ownCheckResult = { passed: true, key: null };
            }
        }
        return ownCheckResult;
    }
    /**
     * Does the basic checks and tries to parse an expression and a pair
     * of key and value.
     * // { key } key - the original for loop created value containing key and value in one string
     * // { subObject } subObject - the object with properties values
     */
    static parseKeysAndExpression(key, subObject) {
        if (this.keyOrSubObjEmpty(key, subObject)) {
            return null;
        }
        const expressionType = getExpressionType(key.toString());
        if (isNotExpression(expressionType)) {
            return null;
        }
        const keyAndValue = getKeyAndValueByExpressionType(expressionType, key);
        if (!keyAndValue || !keyAndValue[0] || !keyAndValue[1]) {
            return null;
        }
        return { expressionType: expressionType, keyAndValue: keyAndValue };
    }
    static keyOrSubObjEmpty(key, subObject) {
        return !key || !subObject;
    }
    /**
     * 'getCopy' function
     *
     * Uses a JSON Pointer to deeply clone a value from an object.
     *
     * //  { object } object - Object to get value from
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { number = 0 } startSlice - Zero-based index of first Pointer key to use
     * //  { number } endSlice - Zero-based index of last Pointer key to use
     * //  { boolean = false } getBoolean - Return only true or false?
     * //  { boolean = false } errors - Show error if not found?
     * // { object } - Located value (or true or false if getBoolean = true)
     */
    static getCopy(object, pointer, startSlice = 0, endSlice = null, getBoolean = false, errors = false) {
        const objectToCopy = this.get(object, pointer, startSlice, endSlice, getBoolean, errors);
        return this.forEachDeepCopy(objectToCopy);
    }
    /**
     * 'getFirst' function
     *
     * Takes an array of JSON Pointers and objects,
     * checks each object for a value specified by the pointer,
     * and returns the first value found.
     *
     * //  { [object, pointer][] } items - Array of objects and pointers to check
     * //  { any = null } defaultValue - Value to return if nothing found
     * //  { boolean = false } getCopy - Return a copy instead?
     * //  - First value found
     */
    static getFirst(items, defaultValue = null, getCopy = false) {
        if (isEmpty(items)) {
            return;
        }
        if (isArray(items)) {
            for (const item of items) {
                if (isEmpty(item)) {
                    continue;
                }
                if (isArray(item) && item.length >= 2) {
                    if (isEmpty(item[0]) || isEmpty(item[1])) {
                        continue;
                    }
                    const value = getCopy ?
                        this.getCopy(item[0], item[1]) :
                        this.get(item[0], item[1]);
                    if (value) {
                        return value;
                    }
                    continue;
                }
                console.error('getFirst error: Input not in correct format.\n' +
                    'Should be: [ [ object1, pointer1 ], [ object 2, pointer2 ], etc... ]');
                return;
            }
            return defaultValue;
        }
        if (isMap(items)) {
            for (const [object, pointer] of items) {
                if (object === null || !this.isJsonPointer(pointer)) {
                    continue;
                }
                const value = getCopy ?
                    this.getCopy(object, pointer) :
                    this.get(object, pointer);
                if (value) {
                    return value;
                }
            }
            return defaultValue;
        }
        console.error('getFirst error: Input not in correct format.\n' +
            'Should be: [ [ object1, pointer1 ], [ object 2, pointer2 ], etc... ]');
        return defaultValue;
    }
    /**
     * 'getFirstCopy' function
     *
     * Similar to getFirst, but always returns a copy.
     *
     * //  { [object, pointer][] } items - Array of objects and pointers to check
     * //  { any = null } defaultValue - Value to return if nothing found
     * //  - Copy of first value found
     */
    static getFirstCopy(items, defaultValue = null) {
        const firstCopy = this.getFirst(items, defaultValue, true);
        return firstCopy;
    }
    /**
     * 'set' function
     *
     * Uses a JSON Pointer to set a value on an object.
     * Also creates any missing sub objects or arrays to contain that value.
     *
     * If the optional fourth parameter is TRUE and the inner-most container
     * is an array, the function will insert the value as a new item at the
     * specified location in the array, rather than overwriting the existing
     * value (if any) at that location.
     *
     * So set([1, 2, 3], '/1', 4) => [1, 4, 3]
     * and
     * So set([1, 2, 3], '/1', 4, true) => [1, 4, 2, 3]
     *
     * //  { object } object - The object to set value in
     * //  { Pointer } pointer - The JSON Pointer (string or array)
     * //   value - The new value to set
     * //  { boolean } insert - insert value?
     * // { object } - The original object, modified with the set value
     */
    static set(object, pointer, value, insert = false) {
        const keyArray = this.parse(pointer);
        if (keyArray !== null && keyArray.length) {
            let subObject = object;
            for (let i = 0; i < keyArray.length - 1; ++i) {
                let key = keyArray[i];
                if (key === '-' && isArray(subObject)) {
                    key = subObject.length;
                }
                if (isMap(subObject) && subObject.has(key)) {
                    subObject = subObject.get(key);
                }
                else {
                    if (!hasOwn(subObject, key)) {
                        subObject[key] = (keyArray[i + 1].match(/^(\d+|-)$/)) ? [] : {};
                    }
                    subObject = subObject[key];
                }
            }
            const lastKey = keyArray[keyArray.length - 1];
            if (isArray(subObject) && lastKey === '-') {
                subObject.push(value);
            }
            else if (insert && isArray(subObject) && !isNaN(+lastKey)) {
                subObject.splice(lastKey, 0, value);
            }
            else if (isMap(subObject)) {
                subObject.set(lastKey, value);
            }
            else {
                subObject[lastKey] = value;
            }
            return object;
        }
        console.error(`set error: Invalid JSON Pointer: ${pointer}`);
        return object;
    }
    /**
     * 'setCopy' function
     *
     * Copies an object and uses a JSON Pointer to set a value on the copy.
     * Also creates any missing sub objects or arrays to contain that value.
     *
     * If the optional fourth parameter is TRUE and the inner-most container
     * is an array, the function will insert the value as a new item at the
     * specified location in the array, rather than overwriting the existing value.
     *
     * //  { object } object - The object to copy and set value in
     * //  { Pointer } pointer - The JSON Pointer (string or array)
     * //   value - The value to set
     * //  { boolean } insert - insert value?
     * // { object } - The new object with the set value
     */
    static setCopy(object, pointer, value, insert = false) {
        const keyArray = this.parse(pointer);
        if (keyArray !== null) {
            const newObject = copy(object);
            let subObject = newObject;
            for (let i = 0; i < keyArray.length - 1; ++i) {
                let key = keyArray[i];
                if (key === '-' && isArray(subObject)) {
                    key = subObject.length;
                }
                if (isMap(subObject) && subObject.has(key)) {
                    subObject.set(key, copy(subObject.get(key)));
                    subObject = subObject.get(key);
                }
                else {
                    if (!hasOwn(subObject, key)) {
                        subObject[key] = (keyArray[i + 1].match(/^(\d+|-)$/)) ? [] : {};
                    }
                    subObject[key] = copy(subObject[key]);
                    subObject = subObject[key];
                }
            }
            const lastKey = keyArray[keyArray.length - 1];
            if (isArray(subObject) && lastKey === '-') {
                subObject.push(value);
            }
            else if (insert && isArray(subObject) && !isNaN(+lastKey)) {
                subObject.splice(lastKey, 0, value);
            }
            else if (isMap(subObject)) {
                subObject.set(lastKey, value);
            }
            else {
                subObject[lastKey] = value;
            }
            return newObject;
        }
        console.error(`setCopy error: Invalid JSON Pointer: ${pointer}`);
        return object;
    }
    /**
     * 'insert' function
     *
     * Calls 'set' with insert = TRUE
     *
     * //  { object } object - object to insert value in
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //   value - value to insert
     * // { object }
     */
    static insert(object, pointer, value) {
        const updatedObject = this.set(object, pointer, value, true);
        return updatedObject;
    }
    /**
     * 'insertCopy' function
     *
     * Calls 'setCopy' with insert = TRUE
     *
     * //  { object } object - object to insert value in
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //   value - value to insert
     * // { object }
     */
    static insertCopy(object, pointer, value) {
        const updatedObject = this.setCopy(object, pointer, value, true);
        return updatedObject;
    }
    /**
     * 'remove' function
     *
     * Uses a JSON Pointer to remove a key and its attribute from an object
     *
     * //  { object } object - object to delete attribute from
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * // { object }
     */
    static remove(object, pointer) {
        const keyArray = this.parse(pointer);
        if (keyArray !== null && keyArray.length) {
            let lastKey = keyArray.pop();
            const parentObject = this.get(object, keyArray);
            if (isArray(parentObject)) {
                if (lastKey === '-') {
                    lastKey = parentObject.length - 1;
                }
                parentObject.splice(lastKey, 1);
            }
            else if (isObject(parentObject)) {
                delete parentObject[lastKey];
            }
            return object;
        }
        console.error(`remove error: Invalid JSON Pointer: ${pointer}`);
        return object;
    }
    /**
     * 'has' function
     *
     * Tests if an object has a value at the location specified by a JSON Pointer
     *
     * //  { object } object - object to chek for value
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * // { boolean }
     */
    static has(object, pointer) {
        const hasValue = this.get(object, pointer, 0, null, true);
        return hasValue;
    }
    /**
     * 'dict' function
     *
     * Returns a (pointer -> value) dictionary for an object
     *
     * //  { object } object - The object to create a dictionary from
     * // { object } - The resulting dictionary object
     */
    static dict(object) {
        const results = {};
        this.forEachDeep(object, (value, pointer) => {
            if (typeof value !== 'object') {
                results[pointer] = value;
            }
        });
        return results;
    }
    /**
     * 'forEachDeep' function
     *
     * Iterates over own enumerable properties of an object or items in an array
     * and invokes an iteratee function for each key/value or index/value pair.
     * By default, iterates over items within objects and arrays after calling
     * the iteratee function on the containing object or array itself.
     *
     * The iteratee is invoked with three arguments: (value, pointer, rootObject),
     * where pointer is a JSON pointer indicating the location of the current
     * value within the root object, and rootObject is the root object initially
     * submitted to th function.
     *
     * If a third optional parameter 'bottomUp' is set to TRUE, the iterator
     * function will be called on sub-objects and arrays after being
     * called on their contents, rather than before, which is the default.
     *
     * This function can also optionally be called directly on a sub-object by
     * including optional 4th and 5th parameterss to specify the initial
     * root object and pointer.
     *
     * //  { object } object - the initial object or array
     * //  { (v: any, p?: string, o?: any) => any } function - iteratee function
     * //  { boolean = false } bottomUp - optional, set to TRUE to reverse direction
     * //  { object = object } rootObject - optional, root object or array
     * //  { string = '' } pointer - optional, JSON Pointer to object within rootObject
     * // { object } - The modified object
     */
    static forEachDeep(object, fn = (v) => v, bottomUp = false, pointer = '', rootObject = object) {
        if (typeof fn !== 'function') {
            console.error(`forEachDeep error: Iterator is not a function:`, fn);
            return;
        }
        if (!bottomUp) {
            fn(object, pointer, rootObject);
        }
        if (isObject(object) || isArray(object)) {
            for (const key of Object.keys(object)) {
                const newPointer = pointer + '/' + this.escape(key);
                this.forEachDeep(object[key], fn, bottomUp, newPointer, rootObject);
            }
        }
        if (bottomUp) {
            fn(object, pointer, rootObject);
        }
    }
    /**
     * 'forEachDeepCopy' function
     *
     * Similar to forEachDeep, but returns a copy of the original object, with
     * the same keys and indexes, but with values replaced with the result of
     * the iteratee function.
     *
     * //  { object } object - the initial object or array
     * //  { (v: any, k?: string, o?: any, p?: any) => any } function - iteratee function
     * //  { boolean = false } bottomUp - optional, set to TRUE to reverse direction
     * //  { object = object } rootObject - optional, root object or array
     * //  { string = '' } pointer - optional, JSON Pointer to object within rootObject
     * // { object } - The copied object
     */
    static forEachDeepCopy(object, fn = (v) => v, bottomUp = false, pointer = '', rootObject = object) {
        if (typeof fn !== 'function') {
            console.error(`forEachDeepCopy error: Iterator is not a function:`, fn);
            return null;
        }
        if (isObject(object) || isArray(object)) {
            let newObject = isArray(object) ? [...object] : { ...object };
            if (!bottomUp) {
                newObject = fn(newObject, pointer, rootObject);
            }
            for (const key of Object.keys(newObject)) {
                const newPointer = pointer + '/' + this.escape(key);
                newObject[key] = this.forEachDeepCopy(newObject[key], fn, bottomUp, newPointer, rootObject);
            }
            if (bottomUp) {
                newObject = fn(newObject, pointer, rootObject);
            }
            return newObject;
        }
        else {
            return fn(object, pointer, rootObject);
        }
    }
    /**
     * 'escape' function
     *
     * Escapes a string reference key
     *
     * //  { string } key - string key to escape
     * // { string } - escaped key
     */
    static escape(key) {
        const escaped = key.toString().replace(/~/g, '~0').replace(/\//g, '~1');
        return escaped;
    }
    /**
     * 'unescape' function
     *
     * Unescapes a string reference key
     *
     * //  { string } key - string key to unescape
     * // { string } - unescaped key
     */
    static unescape(key) {
        const unescaped = key.toString().replace(/~1/g, '/').replace(/~0/g, '~');
        return unescaped;
    }
    /**
     * 'parse' function
     *
     * Converts a string JSON Pointer into a array of keys
     * (if input is already an an array of keys, it is returned unchanged)
     *
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { boolean = false } errors - Show error if invalid pointer?
     * // { string[] } - JSON Pointer array of keys
     */
    static parse(pointer, errors = false) {
        if (!this.isJsonPointer(pointer)) {
            if (errors) {
                console.error(`parse error: Invalid JSON Pointer: ${pointer}`);
            }
            return null;
        }
        if (isArray(pointer)) {
            return pointer;
        }
        if (typeof pointer === 'string') {
            if (pointer[0] === '#') {
                pointer = pointer.slice(1);
            }
            if (pointer === '' || pointer === '/') {
                return [];
            }
            return pointer.slice(1).split('/').map(this.unescape);
        }
    }
    /**
     * 'compile' function
     *
     * Converts an array of keys into a JSON Pointer string
     * (if input is already a string, it is normalized and returned)
     *
     * The optional second parameter is a default which will replace any empty keys.
     *
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { string | number = '' } defaultValue - Default value
     * //  { boolean = false } errors - Show error if invalid pointer?
     * // { string } - JSON Pointer string
     */
    static compile(pointer, defaultValue = '', errors = false) {
        if (pointer === '#') {
            return '';
        }
        if (!this.isJsonPointer(pointer)) {
            if (errors) {
                console.error(`compile error: Invalid JSON Pointer: ${pointer}`);
            }
            return null;
        }
        if (isArray(pointer)) {
            if (pointer.length === 0) {
                return '';
            }
            return '/' + pointer.map(key => key === '' ? defaultValue : this.escape(key)).join('/');
        }
        if (typeof pointer === 'string') {
            if (pointer[0] === '#') {
                pointer = pointer.slice(1);
            }
            return pointer;
        }
    }
    /**
     * 'toKey' function
     *
     * Extracts name of the final key from a JSON Pointer.
     *
     * //  { Pointer } pointer - JSON Pointer (string or array)
     * //  { boolean = false } errors - Show error if invalid pointer?
     * // { string } - the extracted key
     */
    static toKey(pointer, errors = false) {
        const keyArray = this.parse(pointer, errors);
        if (keyArray === null) {
            return null;
        }
        if (!keyArray.length) {
            return '';
        }
        return keyArray[keyArray.length - 1];
    }
    /**
     * 'isJsonPointer' function
     *
     * Checks a string or array value to determine if it is a valid JSON Pointer.
     * Returns true if a string is empty, or starts with '/' or '#/'.
     * Returns true if an array contains only string values.
     *
     * //   value - value to check
     * // { boolean } - true if value is a valid JSON Pointer, otherwise false
     */
    static isJsonPointer(value) {
        if (isArray(value)) {
            return value.every(key => typeof key === 'string');
        }
        else if (isString(value)) {
            if (value === '' || value === '#') {
                return true;
            }
            if (value[0] === '/' || value.slice(0, 2) === '#/') {
                return !/(~[^01]|~$)/g.test(value);
            }
        }
        return false;
    }
    /**
     * 'isSubPointer' function
     *
     * Checks whether one JSON Pointer is a subset of another.
     *
     * //  { Pointer } shortPointer - potential subset JSON Pointer
     * //  { Pointer } longPointer - potential superset JSON Pointer
     * //  { boolean = false } trueIfMatching - return true if pointers match?
     * //  { boolean = false } errors - Show error if invalid pointer?
     * // { boolean } - true if shortPointer is a subset of longPointer, false if not
     */
    static isSubPointer(shortPointer, longPointer, trueIfMatching = false, errors = false) {
        if (!this.isJsonPointer(shortPointer) || !this.isJsonPointer(longPointer)) {
            if (errors) {
                let invalid = '';
                if (!this.isJsonPointer(shortPointer)) {
                    invalid += ` 1: ${shortPointer}`;
                }
                if (!this.isJsonPointer(longPointer)) {
                    invalid += ` 2: ${longPointer}`;
                }
                console.error(`isSubPointer error: Invalid JSON Pointer ${invalid}`);
            }
            return;
        }
        shortPointer = this.compile(shortPointer, '', errors);
        longPointer = this.compile(longPointer, '', errors);
        return shortPointer === longPointer ? trueIfMatching :
            `${shortPointer}/` === longPointer.slice(0, shortPointer.length + 1);
    }
    /**
     * 'toIndexedPointer' function
     *
     * Merges an array of numeric indexes and a generic pointer to create an
     * indexed pointer for a specific item.
     *
     * For example, merging the generic pointer '/foo/-/bar/-/baz' and
     * the array [4, 2] would result in the indexed pointer '/foo/4/bar/2/baz'
     *
     *
     * //  { Pointer } genericPointer - The generic pointer
     * //  { number[] } indexArray - The array of numeric indexes
     * //  { Map<string, number> } arrayMap - An optional array map
     * // { string } - The merged pointer with indexes
     */
    static toIndexedPointer(genericPointer, indexArray, arrayMap = null) {
        if (this.isJsonPointer(genericPointer) && isArray(indexArray)) {
            let indexedPointer = this.compile(genericPointer);
            if (isMap(arrayMap)) {
                let arrayIndex = 0;
                return indexedPointer.replace(/\/\-(?=\/|$)/g, (key, stringIndex) => arrayMap.has(indexedPointer.slice(0, stringIndex)) ?
                    '/' + indexArray[arrayIndex++] : key);
            }
            else {
                for (const pointerIndex of indexArray) {
                    indexedPointer = indexedPointer.replace('/-', '/' + pointerIndex);
                }
                return indexedPointer;
            }
        }
        if (!this.isJsonPointer(genericPointer)) {
            console.error(`toIndexedPointer error: Invalid JSON Pointer: ${genericPointer}`);
        }
        if (!isArray(indexArray)) {
            console.error(`toIndexedPointer error: Invalid indexArray: ${indexArray}`);
        }
    }
    /**
     * 'toGenericPointer' function
     *
     * Compares an indexed pointer to an array map and removes list array
     * indexes (but leaves tuple arrray indexes and all object keys, including
     * numeric keys) to create a generic pointer.
     *
     * For example, using the indexed pointer '/foo/1/bar/2/baz/3' and
     * the arrayMap [['/foo', 0], ['/foo/-/bar', 3], ['/foo/-/bar/-/baz', 0]]
     * would result in the generic pointer '/foo/-/bar/2/baz/-'
     * Using the indexed pointer '/foo/1/bar/4/baz/3' and the same arrayMap
     * would result in the generic pointer '/foo/-/bar/-/baz/-'
     * (the bar array has 3 tuple items, so index 2 is retained, but 4 is removed)
     *
     * The structure of the arrayMap is: [['path to array', number of tuple items]...]
     *
     *
     * //  { Pointer } indexedPointer - The indexed pointer (array or string)
     * //  { Map<string, number> } arrayMap - The optional array map (for preserving tuple indexes)
     * // { string } - The generic pointer with indexes removed
     */
    static toGenericPointer(indexedPointer, arrayMap = new Map()) {
        if (this.isJsonPointer(indexedPointer) && isMap(arrayMap)) {
            const pointerArray = this.parse(indexedPointer);
            for (let i = 1; i < pointerArray.length; i++) {
                const subPointer = this.compile(pointerArray.slice(0, i));
                if (arrayMap.has(subPointer) &&
                    arrayMap.get(subPointer) <= +pointerArray[i]) {
                    pointerArray[i] = '-';
                }
            }
            return this.compile(pointerArray);
        }
        if (!this.isJsonPointer(indexedPointer)) {
            console.error(`toGenericPointer error: invalid JSON Pointer: ${indexedPointer}`);
        }
        if (!isMap(arrayMap)) {
            console.error(`toGenericPointer error: invalid arrayMap: ${arrayMap}`);
        }
    }
    /**
     * 'toControlPointer' function
     *
     * Accepts a JSON Pointer for a data object and returns a JSON Pointer for the
     * matching control in an Angular FormGroup.
     *
     * //  { Pointer } dataPointer - JSON Pointer (string or array) to a data object
     * //  { FormGroup } formGroup - Angular FormGroup to get value from
     * //  { boolean = false } controlMustExist - Only return if control exists?
     * // { Pointer } - JSON Pointer (string) to the formGroup object
     */
    static toControlPointer(dataPointer, formGroup, controlMustExist = false) {
        const dataPointerArray = this.parse(dataPointer);
        const controlPointerArray = [];
        let subGroup = formGroup;
        if (dataPointerArray !== null) {
            for (const key of dataPointerArray) {
                if (hasOwn(subGroup, 'controls')) {
                    controlPointerArray.push('controls');
                    subGroup = subGroup.controls;
                }
                if (isArray(subGroup) && (key === '-')) {
                    controlPointerArray.push((subGroup.length - 1).toString());
                    subGroup = subGroup[subGroup.length - 1];
                }
                else if (hasOwn(subGroup, key)) {
                    controlPointerArray.push(key);
                    subGroup = subGroup[key];
                }
                else if (controlMustExist) {
                    console.error(`toControlPointer error: Unable to find "${key}" item in FormGroup.`);
                    console.error(dataPointer);
                    console.error(formGroup);
                    return;
                }
                else {
                    controlPointerArray.push(key);
                    subGroup = { controls: {} };
                }
            }
            return this.compile(controlPointerArray);
        }
        console.error(`toControlPointer error: Invalid JSON Pointer: ${dataPointer}`);
    }
    /**
     * 'toSchemaPointer' function
     *
     * Accepts a JSON Pointer to a value inside a data object and a JSON schema
     * for that object.
     *
     * Returns a Pointer to the sub-schema for the value inside the object's schema.
     *
     * //  { Pointer } dataPointer - JSON Pointer (string or array) to an object
     * //   schema - JSON schema for the object
     * // { Pointer } - JSON Pointer (string) to the object's schema
     */
    static toSchemaPointer(dataPointer, schema) {
        if (this.isJsonPointer(dataPointer) && typeof schema === 'object') {
            const pointerArray = this.parse(dataPointer);
            if (!pointerArray.length) {
                return '';
            }
            const firstKey = pointerArray.shift();
            if (schema.type === 'object' || schema.properties || schema.additionalProperties) {
                if ((schema.properties || {})[firstKey]) {
                    return `/properties/${this.escape(firstKey)}` +
                        this.toSchemaPointer(pointerArray, schema.properties[firstKey]);
                }
                else if (schema.additionalProperties) {
                    return '/additionalProperties' +
                        this.toSchemaPointer(pointerArray, schema.additionalProperties);
                }
            }
            if ((schema.type === 'array' || schema.items) &&
                (isNumber(firstKey) || firstKey === '-' || firstKey === '')) {
                const arrayItem = firstKey === '-' || firstKey === '' ? 0 : +firstKey;
                if (isArray(schema.items)) {
                    if (arrayItem < schema.items.length) {
                        return '/items/' + arrayItem +
                            this.toSchemaPointer(pointerArray, schema.items[arrayItem]);
                    }
                    else if (schema.additionalItems) {
                        return '/additionalItems' +
                            this.toSchemaPointer(pointerArray, schema.additionalItems);
                    }
                }
                else if (isObject(schema.items)) {
                    return '/items' + this.toSchemaPointer(pointerArray, schema.items);
                }
                else if (isObject(schema.additionalItems)) {
                    return '/additionalItems' +
                        this.toSchemaPointer(pointerArray, schema.additionalItems);
                }
            }
            console.error(`toSchemaPointer error: Data pointer ${dataPointer} ` +
                `not compatible with schema ${schema}`);
            return null;
        }
        if (!this.isJsonPointer(dataPointer)) {
            console.error(`toSchemaPointer error: Invalid JSON Pointer: ${dataPointer}`);
        }
        if (typeof schema !== 'object') {
            console.error(`toSchemaPointer error: Invalid JSON Schema: ${schema}`);
        }
        return null;
    }
    /**
     * 'toDataPointer' function
     *
     * Accepts a JSON Pointer to a sub-schema inside a JSON schema and the schema.
     *
     * If possible, returns a generic Pointer to the corresponding value inside
     * the data object described by the JSON schema.
     *
     * Returns null if the sub-schema is in an ambiguous location (such as
     * definitions or additionalProperties) where the corresponding value
     * location cannot be determined.
     *
     * //  { Pointer } schemaPointer - JSON Pointer (string or array) to a JSON schema
     * //   schema - the JSON schema
     * //  { boolean = false } errors - Show errors?
     * // { Pointer } - JSON Pointer (string) to the value in the data object
     */
    static toDataPointer(schemaPointer, schema, errors = false) {
        if (this.isJsonPointer(schemaPointer) && typeof schema === 'object' &&
            this.has(schema, schemaPointer)) {
            const pointerArray = this.parse(schemaPointer);
            if (!pointerArray.length) {
                return '';
            }
            const firstKey = pointerArray.shift();
            if (firstKey === 'properties' ||
                (firstKey === 'items' && isArray(schema.items))) {
                const secondKey = pointerArray.shift();
                const pointerSuffix = this.toDataPointer(pointerArray, schema[firstKey][secondKey]);
                return pointerSuffix === null ? null : '/' + secondKey + pointerSuffix;
            }
            else if (firstKey === 'additionalItems' ||
                (firstKey === 'items' && isObject(schema.items))) {
                const pointerSuffix = this.toDataPointer(pointerArray, schema[firstKey]);
                return pointerSuffix === null ? null : '/-' + pointerSuffix;
            }
            else if (['allOf', 'anyOf', 'oneOf'].includes(firstKey)) {
                const secondKey = pointerArray.shift();
                return this.toDataPointer(pointerArray, schema[firstKey][secondKey]);
            }
            else if (firstKey === 'not') {
                return this.toDataPointer(pointerArray, schema[firstKey]);
            }
            else if (['contains', 'definitions', 'dependencies', 'additionalItems',
                'additionalProperties', 'patternProperties', 'propertyNames'].includes(firstKey)) {
                if (errors) {
                    console.error(`toDataPointer error: Ambiguous location`);
                }
            }
            return '';
        }
        if (errors) {
            if (!this.isJsonPointer(schemaPointer)) {
                console.error(`toDataPointer error: Invalid JSON Pointer: ${schemaPointer}`);
            }
            if (typeof schema !== 'object') {
                console.error(`toDataPointer error: Invalid JSON Schema: ${schema}`);
            }
            if (typeof schema !== 'object') {
                console.error(`toDataPointer error: Pointer ${schemaPointer} invalid for Schema: ${schema}`);
            }
        }
        return null;
    }
    /**
     * 'parseObjectPath' function
     *
     * Parses a JavaScript object path into an array of keys, which
     * can then be passed to compile() to convert into a string JSON Pointer.
     *
     * Based on mike-marcacci's excellent objectpath parse function:
     * https://github.com/mike-marcacci/objectpath
     *
     * //  { Pointer } path - The object path to parse
     * // { string[] } - The resulting array of keys
     */
    static parseObjectPath(path) {
        if (isArray(path)) {
            return path;
        }
        if (this.isJsonPointer(path)) {
            return this.parse(path);
        }
        if (typeof path === 'string') {
            let index = 0;
            const parts = [];
            while (index < path.length) {
                const nextDot = path.indexOf('.', index);
                const nextOB = path.indexOf('[', index); // next open bracket
                if (nextDot === -1 && nextOB === -1) { // last item
                    parts.push(path.slice(index));
                    index = path.length;
                }
                else if (nextDot !== -1 && (nextDot < nextOB || nextOB === -1)) { // dot notation
                    parts.push(path.slice(index, nextDot));
                    index = nextDot + 1;
                }
                else { // bracket notation
                    if (nextOB > index) {
                        parts.push(path.slice(index, nextOB));
                        index = nextOB;
                    }
                    const quote = path.charAt(nextOB + 1);
                    if (quote === '"' || quote === '\'') { // enclosing quotes
                        let nextCB = path.indexOf(quote + ']', nextOB); // next close bracket
                        while (nextCB !== -1 && path.charAt(nextCB - 1) === '\\') {
                            nextCB = path.indexOf(quote + ']', nextCB + 2);
                        }
                        if (nextCB === -1) {
                            nextCB = path.length;
                        }
                        parts.push(path.slice(index + 2, nextCB)
                            .replace(new RegExp('\\' + quote, 'g'), quote));
                        index = nextCB + 2;
                    }
                    else { // no enclosing quotes
                        let nextCB = path.indexOf(']', nextOB); // next close bracket
                        if (nextCB === -1) {
                            nextCB = path.length;
                        }
                        parts.push(path.slice(index + 1, nextCB));
                        index = nextCB + 1;
                    }
                    if (path.charAt(index) === '.') {
                        index++;
                    }
                }
            }
            return parts;
        }
        console.error('parseObjectPath error: Input object path must be a string.');
    }
}
JsonPointer.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonPointer, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
JsonPointer.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonPointer });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonPointer, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbnBvaW50ZXIuZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYWpzZi1jb3JlL3NyYy9saWIvc2hhcmVkL2pzb25wb2ludGVyLmZ1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsa0JBQWtCLEVBQ2xCLElBQUksRUFFSixpQkFBaUIsRUFDakIsOEJBQThCLEVBQzlCLE1BQU0sRUFDTixPQUFPLEVBQ1AsVUFBVSxFQUNWLGVBQWUsRUFDaEIsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7QUFtQnZHLE1BQU0sT0FBTyxXQUFXO0lBRXRCOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILE1BQU0sQ0FBQyxHQUFHLENBQ1IsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLEdBQUcsQ0FBQyxFQUFFLFdBQW1CLElBQUksRUFDeEQsVUFBVSxHQUFHLEtBQUssRUFBRSxNQUFNLEdBQUcsS0FBSztRQUVsQyxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7WUFBRSxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7U0FBRTtRQUMvRCxJQUFJLFFBQVEsR0FBVSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ25ELElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQztZQUN2QixJQUFJLFVBQVUsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLFFBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQUUsT0FBTyxNQUFNLENBQUM7YUFBRTtZQUNyRixJQUFJLFVBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQzthQUFFO1lBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQUUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFBRTtZQUN4RixRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDaEQsS0FBSyxJQUFJLEdBQUcsSUFBSSxRQUFRLEVBQUU7Z0JBQ3hCLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtvQkFDekQsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QjtnQkFDRCxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUMxQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDaEM7cUJBQU0sSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksU0FBUyxLQUFLLElBQUk7b0JBQzVELE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQ3RCO29CQUNBLFNBQVMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzVCO3FCQUFNO29CQUNMLE1BQU0sbUJBQW1CLEdBQUcsV0FBVyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDM0UsSUFBSSxtQkFBbUIsQ0FBQyxNQUFNLEVBQUU7d0JBQzlCLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO3FCQUN0Rjt5QkFBTTt3QkFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUM3QyxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7cUJBQ3ZDO2lCQUNGO2FBQ0Y7WUFDRCxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7U0FDdEM7UUFDRCxJQUFJLE1BQU0sSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDOUQ7UUFDRCxJQUFJLE1BQU0sSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFDeEMsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDdkI7UUFDRCxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDeEMsQ0FBQztJQUVPLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTTtRQUNuRCxJQUFJLE1BQU0sRUFBRTtZQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLDRCQUE0QixDQUFDLENBQUM7WUFDOUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxTQUFpQixFQUFFLEdBQVE7UUFDbkQsTUFBTSxhQUFhLEdBQUcsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUMsQ0FBQztRQUNoRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3RCLE9BQU8sYUFBYSxDQUFDO1NBQ3RCO1FBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzNFLElBQUksY0FBYyxFQUFFO1lBQ2xCLE9BQU8sY0FBYyxDQUFDO1NBQ3ZCO1FBRUQsTUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFMUUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGlCQUFpQixFQUFFLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNsRyxJQUFJLGVBQWUsRUFBRTtZQUNuQixPQUFPLGVBQWUsQ0FBQztTQUN4QjtRQUVELE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxpQkFBc0IsRUFBRSxZQUFvQixFQUFFLFNBQWlCO1FBQ3JHLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsYUFBYSxFQUFFLFlBQVksQ0FBQyxFQUFFO1lBQ3BHLE9BQU8sRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztTQUM5RDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxjQUE4QixFQUFFLGFBQWEsRUFBRSxZQUFvQjtRQUM3RyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUMzQixPQUFPLGFBQWEsS0FBSyxZQUFZLENBQUM7U0FDdkM7UUFDRCxJQUFJLFVBQVUsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUM5QixPQUFPLGFBQWEsS0FBSyxZQUFZLENBQUM7U0FDdkM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNLLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLGlCQUFpQjtRQUNsRSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDeEQsSUFBSSxPQUFPLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQzdDLGNBQWMsR0FBRyxFQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDO2FBQzdDO1lBQ0QsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQ2hELGNBQWMsR0FBRyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDO2FBQzVDO1NBQ0Y7UUFDRCxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxNQUFNLENBQUMsc0JBQXNCLENBQUMsR0FBVyxFQUFFLFNBQVM7UUFDMUQsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLGVBQWUsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUNuQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsTUFBTSxXQUFXLEdBQUcsOEJBQThCLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3hFLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdEQsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE9BQU8sRUFBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRU8sTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQVEsRUFBRSxTQUFpQjtRQUN6RCxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxNQUFNLENBQUMsT0FBTyxDQUNaLE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBVSxHQUFHLENBQUMsRUFBRSxXQUFtQixJQUFJLEVBQ3hELFVBQVUsR0FBRyxLQUFLLEVBQUUsTUFBTSxHQUFHLEtBQUs7UUFFbEMsTUFBTSxZQUFZLEdBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RSxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVEOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsZUFBb0IsSUFBSSxFQUFFLE9BQU8sR0FBRyxLQUFLO1FBQzlELElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQUUsT0FBTztTQUFFO1FBQy9CLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2xCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN4QixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFBRSxTQUFTO2lCQUFFO2dCQUNoQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtvQkFDckMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUFFLFNBQVM7cUJBQUU7b0JBQ3ZELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDO3dCQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxLQUFLLEVBQUU7d0JBQUUsT0FBTyxLQUFLLENBQUM7cUJBQUU7b0JBQzVCLFNBQVM7aUJBQ1Y7Z0JBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxnREFBZ0Q7b0JBQzVELHNFQUFzRSxDQUFDLENBQUM7Z0JBQzFFLE9BQU87YUFDUjtZQUNELE9BQU8sWUFBWSxDQUFDO1NBQ3JCO1FBQ0QsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDaEIsS0FBSyxNQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEtBQUssRUFBRTtnQkFDckMsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFBRSxTQUFTO2lCQUFFO2dCQUNsRSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQztvQkFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzVCLElBQUksS0FBSyxFQUFFO29CQUFFLE9BQU8sS0FBSyxDQUFDO2lCQUFFO2FBQzdCO1lBQ0QsT0FBTyxZQUFZLENBQUM7U0FDckI7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLGdEQUFnRDtZQUM1RCxzRUFBc0UsQ0FBQyxDQUFDO1FBQzFFLE9BQU8sWUFBWSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLGVBQW9CLElBQUk7UUFDakQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFDSCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxLQUFLO1FBQy9DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDeEMsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDO1lBQ3ZCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtnQkFDNUMsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNyQyxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztpQkFDeEI7Z0JBQ0QsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDMUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2hDO3FCQUFNO29CQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxFQUFFO3dCQUMzQixTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztxQkFDakU7b0JBQ0QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDNUI7YUFDRjtZQUNELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLE9BQU8sS0FBSyxHQUFHLEVBQUU7Z0JBQ3pDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdkI7aUJBQU0sSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzNELFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNyQztpQkFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDM0IsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDL0I7aUJBQU07Z0JBQ0wsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUM1QjtZQUNELE9BQU8sTUFBTSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzdELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7O09BZUc7SUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sR0FBRyxLQUFLO1FBQ25ELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQixJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO2dCQUM1QyxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQ3JDLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO2lCQUN4QjtnQkFDRCxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUMxQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdDLFNBQVMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNoQztxQkFBTTtvQkFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsRUFBRTt3QkFDM0IsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7cUJBQ2pFO29CQUNELFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3RDLFNBQVMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzVCO2FBQ0Y7WUFDRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxPQUFPLEtBQUssR0FBRyxFQUFFO2dCQUN6QyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3ZCO2lCQUFNLElBQUksTUFBTSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMzRCxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDckM7aUJBQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQzNCLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQy9CO2lCQUFNO2dCQUNMLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDNUI7WUFDRCxPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsd0NBQXdDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDakUsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLO1FBQ2xDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0QsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLO1FBQ3RDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakUsT0FBTyxhQUFhLENBQUM7SUFDdkIsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTztRQUMzQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLElBQUksUUFBUSxLQUFLLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQ3hDLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM3QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNoRCxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDekIsSUFBSSxPQUFPLEtBQUssR0FBRyxFQUFFO29CQUFFLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztpQkFBRTtnQkFDM0QsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDakM7aUJBQU0sSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ2pDLE9BQU8sWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzlCO1lBQ0QsT0FBTyxNQUFNLENBQUM7U0FDZjtRQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDaEUsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTztRQUN4QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTTtRQUNoQixNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDMUMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQzthQUFFO1FBQzlELENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0EyQkc7SUFDSCxNQUFNLENBQUMsV0FBVyxDQUNoQixNQUFNLEVBQUUsS0FBMkMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFDM0QsUUFBUSxHQUFHLEtBQUssRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFLFVBQVUsR0FBRyxNQUFNO1FBRW5ELElBQUksT0FBTyxFQUFFLEtBQUssVUFBVSxFQUFFO1lBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0RBQWdELEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEUsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQUU7UUFDbkQsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZDLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDckMsTUFBTSxVQUFVLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNyRTtTQUNGO1FBQ0QsSUFBSSxRQUFRLEVBQUU7WUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztTQUFFO0lBQ3BELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsTUFBTSxDQUFDLGVBQWUsQ0FDcEIsTUFBTSxFQUFFLEtBQTJDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQzNELFFBQVEsR0FBRyxLQUFLLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxVQUFVLEdBQUcsTUFBTTtRQUVuRCxJQUFJLE9BQU8sRUFBRSxLQUFLLFVBQVUsRUFBRTtZQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLG9EQUFvRCxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDdkMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLEdBQUcsTUFBTSxDQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQztZQUNoRSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUFFLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQzthQUFFO1lBQ2xFLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDeEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwRCxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FDbkMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FDckQsQ0FBQzthQUNIO1lBQ0QsSUFBSSxRQUFRLEVBQUU7Z0JBQUUsU0FBUyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQUU7WUFDakUsT0FBTyxTQUFTLENBQUM7U0FDbEI7YUFBTTtZQUNMLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDeEM7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRztRQUNmLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEUsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUc7UUFDakIsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN6RSxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxHQUFHLEtBQUs7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxNQUFNLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQ0FBc0MsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUFFO1lBQy9FLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUFFLE9BQWlCLE9BQU8sQ0FBQztTQUFFO1FBQ25ELElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQy9CLElBQWEsT0FBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtnQkFBRSxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUFFO1lBQ2pFLElBQVksT0FBTyxLQUFLLEVBQUUsSUFBWSxPQUFPLEtBQUssR0FBRyxFQUFFO2dCQUFFLE9BQU8sRUFBRSxDQUFDO2FBQUU7WUFDckUsT0FBZ0IsT0FBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNqRTtJQUNILENBQUM7SUFFRDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxZQUFZLEdBQUcsRUFBRSxFQUFFLE1BQU0sR0FBRyxLQUFLO1FBQ3ZELElBQUksT0FBTyxLQUFLLEdBQUcsRUFBRTtZQUFFLE9BQU8sRUFBRSxDQUFDO1NBQUU7UUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDaEMsSUFBSSxNQUFNLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUFFO1lBQ2pGLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNwQixJQUFlLE9BQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUFFLE9BQU8sRUFBRSxDQUFDO2FBQUU7WUFDcEQsT0FBTyxHQUFHLEdBQWMsT0FBUSxDQUFDLEdBQUcsQ0FDbEMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ3BELENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2I7UUFDRCxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtZQUMvQixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQUUsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUN2RCxPQUFPLE9BQU8sQ0FBQztTQUNoQjtJQUNILENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sR0FBRyxLQUFLO1FBQ2xDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1NBQUU7UUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFBRSxPQUFPLEVBQUUsQ0FBQztTQUFFO1FBQ3BDLE9BQU8sUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSztRQUN4QixJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNsQixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQztTQUNwRDthQUFNLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzFCLElBQUksS0FBSyxLQUFLLEVBQUUsSUFBSSxLQUFLLEtBQUssR0FBRyxFQUFFO2dCQUFFLE9BQU8sSUFBSSxDQUFDO2FBQUU7WUFDbkQsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDbEQsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEM7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7Ozs7Ozs7O09BVUc7SUFDSCxNQUFNLENBQUMsWUFBWSxDQUNqQixZQUFZLEVBQUUsV0FBVyxFQUFFLGNBQWMsR0FBRyxLQUFLLEVBQUUsTUFBTSxHQUFHLEtBQUs7UUFFakUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3pFLElBQUksTUFBTSxFQUFFO2dCQUNWLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQUUsT0FBTyxJQUFJLE9BQU8sWUFBWSxFQUFFLENBQUM7aUJBQUU7Z0JBQzVFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUFFLE9BQU8sSUFBSSxPQUFPLFdBQVcsRUFBRSxDQUFDO2lCQUFFO2dCQUMxRSxPQUFPLENBQUMsS0FBSyxDQUFDLDRDQUE0QyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQ3RFO1lBQ0QsT0FBTztTQUNSO1FBQ0QsWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RCxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELE9BQU8sWUFBWSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDcEQsR0FBRyxZQUFZLEdBQUcsS0FBSyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FDckIsY0FBYyxFQUFFLFVBQVUsRUFBRSxXQUFnQyxJQUFJO1FBRWhFLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0QsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNsRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbkIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixPQUFPLGNBQWMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxFQUFFLENBQ2xFLFFBQVEsQ0FBQyxHQUFHLENBQVUsY0FBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1RCxHQUFHLEdBQUcsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FDdkMsQ0FBQzthQUNIO2lCQUFNO2dCQUNMLEtBQUssTUFBTSxZQUFZLElBQUksVUFBVSxFQUFFO29CQUNyQyxjQUFjLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDO2lCQUNuRTtnQkFDRCxPQUFPLGNBQWMsQ0FBQzthQUN2QjtTQUNGO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxpREFBaUQsY0FBYyxFQUFFLENBQUMsQ0FBQztTQUNsRjtRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDeEIsT0FBTyxDQUFDLEtBQUssQ0FBQywrQ0FBK0MsVUFBVSxFQUFFLENBQUMsQ0FBQztTQUM1RTtJQUNILENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLFdBQVcsSUFBSSxHQUFHLEVBQWtCO1FBQzFFLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDekQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNoRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDNUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO29CQUMxQixRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUM1QztvQkFDQSxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO2lCQUN2QjthQUNGO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxpREFBaUQsY0FBYyxFQUFFLENBQUMsQ0FBQztTQUNsRjtRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyw2Q0FBNkMsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUN4RTtJQUNILENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEdBQUcsS0FBSztRQUN0RSxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakQsTUFBTSxtQkFBbUIsR0FBYSxFQUFFLENBQUM7UUFDekMsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDO1FBQ3pCLElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO1lBQzdCLEtBQUssTUFBTSxHQUFHLElBQUksZ0JBQWdCLEVBQUU7Z0JBQ2xDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRTtvQkFDaEMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNyQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztpQkFDOUI7Z0JBQ0QsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUU7b0JBQ3RDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztvQkFDM0QsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUMxQztxQkFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ2hDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDOUIsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDMUI7cUJBQU0sSUFBSSxnQkFBZ0IsRUFBRTtvQkFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDO29CQUNwRixPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUN6QixPQUFPO2lCQUNSO3FCQUFNO29CQUNMLG1CQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDOUIsUUFBUSxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDO2lCQUM3QjthQUNGO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7U0FDMUM7UUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLGlEQUFpRCxXQUFXLEVBQUUsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNILE1BQU0sQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLE1BQU07UUFDeEMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtZQUNqRSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO2dCQUFFLE9BQU8sRUFBRSxDQUFDO2FBQUU7WUFDeEMsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RDLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsb0JBQW9CLEVBQUU7Z0JBQ2hGLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUN2QyxPQUFPLGVBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDM0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2lCQUNuRTtxQkFBTyxJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRTtvQkFDdkMsT0FBTyx1QkFBdUI7d0JBQzVCLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNuRTthQUNGO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssT0FBTyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQzNDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsS0FBSyxHQUFHLElBQUksUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUMzRDtnQkFDQSxNQUFNLFNBQVMsR0FBRyxRQUFRLEtBQUssR0FBRyxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQ3RFLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDekIsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7d0JBQ25DLE9BQU8sU0FBUyxHQUFHLFNBQVM7NEJBQzFCLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztxQkFDL0Q7eUJBQU0sSUFBSSxNQUFNLENBQUMsZUFBZSxFQUFFO3dCQUNqQyxPQUFPLGtCQUFrQjs0QkFDdkIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO3FCQUM5RDtpQkFDRjtxQkFBTSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2pDLE9BQU8sUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDcEU7cUJBQU0sSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxFQUFFO29CQUMzQyxPQUFPLGtCQUFrQjt3QkFDdkIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUM5RDthQUNGO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsV0FBVyxHQUFHO2dCQUNqRSw4QkFBOEIsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUMxQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDcEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsV0FBVyxFQUFFLENBQUMsQ0FBQztTQUM5RTtRQUNELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0NBQStDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDeEU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7OztPQWdCRztJQUNILE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsS0FBSztRQUN4RCxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUTtZQUNqRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsRUFDL0I7WUFDQSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO2dCQUFFLE9BQU8sRUFBRSxDQUFDO2FBQUU7WUFDeEMsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RDLElBQUksUUFBUSxLQUFLLFlBQVk7Z0JBQzNCLENBQUMsUUFBUSxLQUFLLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQy9DO2dCQUNBLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDdkMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BGLE9BQU8sYUFBYSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLGFBQWEsQ0FBQzthQUN4RTtpQkFBTSxJQUFJLFFBQVEsS0FBSyxpQkFBaUI7Z0JBQ3ZDLENBQUMsUUFBUSxLQUFLLE9BQU8sSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ2hEO2dCQUNBLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUN6RSxPQUFPLGFBQWEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQzthQUM3RDtpQkFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3pELE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDdkMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUN0RTtpQkFBTSxJQUFJLFFBQVEsS0FBSyxLQUFLLEVBQUU7Z0JBQzdCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDM0Q7aUJBQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLGlCQUFpQjtnQkFDdEUsc0JBQXNCLEVBQUUsbUJBQW1CLEVBQUUsZUFBZSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUNoRjtnQkFDQSxJQUFJLE1BQU0sRUFBRTtvQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7aUJBQUU7YUFDMUU7WUFDRCxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsSUFBSSxNQUFNLEVBQUU7WUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsYUFBYSxFQUFFLENBQUMsQ0FBQzthQUM5RTtZQUNELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO2dCQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQ3RFO1lBQ0QsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQzlCLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLGFBQWEsd0JBQXdCLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDOUY7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJO1FBQ3pCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBaUIsSUFBSSxDQUFDO1NBQUU7UUFDN0MsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQUU7UUFDMUQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDNUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFDO1lBQzNCLE9BQU8sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLG9CQUFvQjtnQkFDN0QsSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsWUFBWTtvQkFDakQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQzlCLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO2lCQUNyQjtxQkFBTSxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxlQUFlO29CQUNqRixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ3ZDLEtBQUssR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2lCQUNyQjtxQkFBTSxFQUFFLG1CQUFtQjtvQkFDMUIsSUFBSSxNQUFNLEdBQUcsS0FBSyxFQUFFO3dCQUNsQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ3RDLEtBQUssR0FBRyxNQUFNLENBQUM7cUJBQ2hCO29CQUNELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN0QyxJQUFJLEtBQUssS0FBSyxHQUFHLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxFQUFFLG1CQUFtQjt3QkFDeEQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCO3dCQUNyRSxPQUFPLE1BQU0sS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7NEJBQ3hELE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxHQUFHLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO3lCQUNoRDt3QkFDRCxJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRTs0QkFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzt5QkFBRTt3QkFDNUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDOzZCQUNyQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNsRCxLQUFLLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztxQkFDcEI7eUJBQU0sRUFBRSxzQkFBc0I7d0JBQzdCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCO3dCQUM3RCxJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRTs0QkFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzt5QkFBRTt3QkFDNUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzt3QkFDMUMsS0FBSyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7cUJBQ3BCO29CQUNELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUU7d0JBQUUsS0FBSyxFQUFFLENBQUM7cUJBQUU7aUJBQzdDO2FBQ0Y7WUFDRCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0lBQzlFLENBQUM7O3dHQW45QlUsV0FBVzs0R0FBWCxXQUFXOzJGQUFYLFdBQVc7a0JBRHZCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBjbGVhblZhbHVlT2ZRdW90ZXMsXG4gIGNvcHksXG4gIEV4cHJlc3Npb25UeXBlLFxuICBnZXRFeHByZXNzaW9uVHlwZSxcbiAgZ2V0S2V5QW5kVmFsdWVCeUV4cHJlc3Npb25UeXBlLFxuICBoYXNPd24sXG4gIGlzRXF1YWwsXG4gIGlzTm90RXF1YWwsXG4gIGlzTm90RXhwcmVzc2lvblxufSBmcm9tICcuL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2lzQXJyYXksIGlzRGVmaW5lZCwgaXNFbXB0eSwgaXNNYXAsIGlzTnVtYmVyLCBpc09iamVjdCwgaXNTdHJpbmd9IGZyb20gJy4vdmFsaWRhdG9yLmZ1bmN0aW9ucyc7XG5cbi8qKlxuICogJ0pzb25Qb2ludGVyJyBjbGFzc1xuICpcbiAqIFNvbWUgdXRpbGl0aWVzIGZvciB1c2luZyBKU09OIFBvaW50ZXJzIHdpdGggSlNPTiBvYmplY3RzXG4gKiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNjkwMVxuICpcbiAqIGdldCwgZ2V0Q29weSwgZ2V0Rmlyc3QsIHNldCwgc2V0Q29weSwgaW5zZXJ0LCBpbnNlcnRDb3B5LCByZW1vdmUsIGhhcywgZGljdCxcbiAqIGZvckVhY2hEZWVwLCBmb3JFYWNoRGVlcENvcHksIGVzY2FwZSwgdW5lc2NhcGUsIHBhcnNlLCBjb21waWxlLCB0b0tleSxcbiAqIGlzSnNvblBvaW50ZXIsIGlzU3ViUG9pbnRlciwgdG9JbmRleGVkUG9pbnRlciwgdG9HZW5lcmljUG9pbnRlcixcbiAqIHRvQ29udHJvbFBvaW50ZXIsIHRvU2NoZW1hUG9pbnRlciwgdG9EYXRhUG9pbnRlciwgcGFyc2VPYmplY3RQYXRoXG4gKlxuICogU29tZSBmdW5jdGlvbnMgYmFzZWQgb24gbWFudWVsc3RvZmVyJ3MganNvbi1wb2ludGVyIHV0aWxpdGllc1xuICogaHR0cHM6Ly9naXRodWIuY29tL21hbnVlbHN0b2Zlci9qc29uLXBvaW50ZXJcbiAqL1xuZXhwb3J0IHR5cGUgUG9pbnRlciA9IHN0cmluZyB8IHN0cmluZ1tdO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSnNvblBvaW50ZXIge1xuXG4gIC8qKlxuICAgKiAnZ2V0JyBmdW5jdGlvblxuICAgKlxuICAgKiBVc2VzIGEgSlNPTiBQb2ludGVyIHRvIHJldHJpZXZlIGEgdmFsdWUgZnJvbSBhbiBvYmplY3QuXG4gICAqXG4gICAqIC8vICB7IG9iamVjdCB9IG9iamVjdCAtIE9iamVjdCB0byBnZXQgdmFsdWUgZnJvbVxuICAgKiAvLyAgeyBQb2ludGVyIH0gcG9pbnRlciAtIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KVxuICAgKiAvLyAgeyBudW1iZXIgPSAwIH0gc3RhcnRTbGljZSAtIFplcm8tYmFzZWQgaW5kZXggb2YgZmlyc3QgUG9pbnRlciBrZXkgdG8gdXNlXG4gICAqIC8vICB7IG51bWJlciB9IGVuZFNsaWNlIC0gWmVyby1iYXNlZCBpbmRleCBvZiBsYXN0IFBvaW50ZXIga2V5IHRvIHVzZVxuICAgKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBnZXRCb29sZWFuIC0gUmV0dXJuIG9ubHkgdHJ1ZSBvciBmYWxzZT9cbiAgICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gZXJyb3JzIC0gU2hvdyBlcnJvciBpZiBub3QgZm91bmQ/XG4gICAqIC8vIHsgb2JqZWN0IH0gLSBMb2NhdGVkIHZhbHVlIChvciB0cnVlIG9yIGZhbHNlIGlmIGdldEJvb2xlYW4gPSB0cnVlKVxuICAgKi9cbiAgc3RhdGljIGdldChcbiAgICBvYmplY3QsIHBvaW50ZXIsIHN0YXJ0U2xpY2UgPSAwLCBlbmRTbGljZTogbnVtYmVyID0gbnVsbCxcbiAgICBnZXRCb29sZWFuID0gZmFsc2UsIGVycm9ycyA9IGZhbHNlXG4gICkge1xuICAgIGlmIChvYmplY3QgPT09IG51bGwpIHsgcmV0dXJuIGdldEJvb2xlYW4gPyBmYWxzZSA6IHVuZGVmaW5lZDsgfVxuICAgIGxldCBrZXlBcnJheTogYW55W10gPSB0aGlzLnBhcnNlKHBvaW50ZXIsIGVycm9ycyk7XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIGtleUFycmF5ICE9PSBudWxsKSB7XG4gICAgICBsZXQgc3ViT2JqZWN0ID0gb2JqZWN0O1xuICAgICAgaWYgKHN0YXJ0U2xpY2UgPj0ga2V5QXJyYXkubGVuZ3RoIHx8IGVuZFNsaWNlIDw9IC1rZXlBcnJheS5sZW5ndGgpIHsgcmV0dXJuIG9iamVjdDsgfVxuICAgICAgaWYgKHN0YXJ0U2xpY2UgPD0gLWtleUFycmF5Lmxlbmd0aCkgeyBzdGFydFNsaWNlID0gMDsgfVxuICAgICAgaWYgKCFpc0RlZmluZWQoZW5kU2xpY2UpIHx8IGVuZFNsaWNlID49IGtleUFycmF5Lmxlbmd0aCkgeyBlbmRTbGljZSA9IGtleUFycmF5Lmxlbmd0aDsgfVxuICAgICAga2V5QXJyYXkgPSBrZXlBcnJheS5zbGljZShzdGFydFNsaWNlLCBlbmRTbGljZSk7XG4gICAgICBmb3IgKGxldCBrZXkgb2Yga2V5QXJyYXkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJy0nICYmIGlzQXJyYXkoc3ViT2JqZWN0KSAmJiBzdWJPYmplY3QubGVuZ3RoKSB7XG4gICAgICAgICAga2V5ID0gc3ViT2JqZWN0Lmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzTWFwKHN1Yk9iamVjdCkgJiYgc3ViT2JqZWN0LmhhcyhrZXkpKSB7XG4gICAgICAgICAgc3ViT2JqZWN0ID0gc3ViT2JqZWN0LmdldChrZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdWJPYmplY3QgPT09ICdvYmplY3QnICYmIHN1Yk9iamVjdCAhPT0gbnVsbCAmJlxuICAgICAgICAgIGhhc093bihzdWJPYmplY3QsIGtleSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgc3ViT2JqZWN0ID0gc3ViT2JqZWN0W2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXZhbHVhdGVkRXhwcmVzc2lvbiA9IEpzb25Qb2ludGVyLmV2YWx1YXRlRXhwcmVzc2lvbihzdWJPYmplY3QsIGtleSk7XG4gICAgICAgICAgaWYgKGV2YWx1YXRlZEV4cHJlc3Npb24ucGFzc2VkKSB7XG4gICAgICAgICAgICBzdWJPYmplY3QgPSBldmFsdWF0ZWRFeHByZXNzaW9uLmtleSA/IHN1Yk9iamVjdFtldmFsdWF0ZWRFeHByZXNzaW9uLmtleV0gOiBzdWJPYmplY3Q7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nRXJyb3JzKGVycm9ycywga2V5LCBwb2ludGVyLCBvYmplY3QpO1xuICAgICAgICAgICAgcmV0dXJuIGdldEJvb2xlYW4gPyBmYWxzZSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBnZXRCb29sZWFuID8gdHJ1ZSA6IHN1Yk9iamVjdDtcbiAgICB9XG4gICAgaWYgKGVycm9ycyAmJiBrZXlBcnJheSA9PT0gbnVsbCkge1xuICAgICAgY29uc29sZS5lcnJvcihgZ2V0IGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtwb2ludGVyfWApO1xuICAgIH1cbiAgICBpZiAoZXJyb3JzICYmIHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdnZXQgZXJyb3I6IEludmFsaWQgb2JqZWN0OicpO1xuICAgICAgY29uc29sZS5lcnJvcihvYmplY3QpO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0Qm9vbGVhbiA/IGZhbHNlIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgbG9nRXJyb3JzKGVycm9ycywga2V5LCBwb2ludGVyLCBvYmplY3QpIHtcbiAgICBpZiAoZXJyb3JzKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBnZXQgZXJyb3I6IFwiJHtrZXl9XCIga2V5IG5vdCBmb3VuZCBpbiBvYmplY3QuYCk7XG4gICAgICBjb25zb2xlLmVycm9yKHBvaW50ZXIpO1xuICAgICAgY29uc29sZS5lcnJvcihvYmplY3QpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFdmFsdWF0ZXMgY29uZGl0aW9uYWwgZXhwcmVzc2lvbiBpbiBmb3JtIG9mIGBtb2RlbC48cHJvcGVydHk+PT08dmFsdWU+YCBvclxuICAgKiBgbW9kZWwuPHByb3BlcnR5PiE9PHZhbHVlPmAgd2hlcmUgdGhlIGZpcnN0IG9uZSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBtdXN0IG1hdGNoIHRvIGJlXG4gICAqIHNob3duIGluIGEgZm9ybSwgd2hpbGUgdGhlIGZvcm1lciBzaG93cyB0aGUgcHJvcGVydHkgb25seSB3aGVuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBpcyBub3RcbiAgICogc2V0LCBvciBkb2VzIG5vdCBlcXVhbCB0aGUgZ2l2ZW4gdmFsdWUuXG4gICAqXG4gICAqIC8vIHsgc3ViT2JqZWN0IH0gc3ViT2JqZWN0IC0gIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBkYXRhIHZhbHVlcyBvZiBwcm9wZXJ0aWVzXG4gICAqIC8vIHsga2V5IH0ga2V5IC0gdGhlIGtleSBmcm9tIHRoZSBmb3IgbG9vcCBpbiBhIGZvcm0gb2YgYDxwcm9wZXJ0eT49PTx2YWx1ZT5gXG4gICAqXG4gICAqIFJldHVybnMgdGhlIG9iamVjdCB3aXRoIHR3byBwcm9wZXJ0aWVzLiBUaGUgcHJvcGVydHkgcGFzc2VkIGluZm9ybXMgd2hldGhlclxuICAgKiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0ZWQgc3VjY2Vzc2Z1bGx5IGFuZCB0aGUgcHJvcGVydHkga2V5IHJldHVybnMgZWl0aGVyIHRoZSBzYW1lXG4gICAqIGtleSBpZiBpdCBpcyBub3QgY29udGFpbmVkIGluc2lkZSB0aGUgc3ViT2JqZWN0IG9yIHRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IGlmIGl0IGlzIGNvbnRhaW5lZC5cbiAgICovXG4gIHN0YXRpYyBldmFsdWF0ZUV4cHJlc3Npb24oc3ViT2JqZWN0OiBPYmplY3QsIGtleTogYW55KSB7XG4gICAgY29uc3QgZGVmYXVsdFJlc3VsdCA9IHtwYXNzZWQ6IGZhbHNlLCBrZXk6IGtleX07XG4gICAgY29uc3Qga2V5c0FuZEV4cHJlc3Npb24gPSB0aGlzLnBhcnNlS2V5c0FuZEV4cHJlc3Npb24oa2V5LCBzdWJPYmplY3QpO1xuICAgIGlmICgha2V5c0FuZEV4cHJlc3Npb24pIHtcbiAgICAgIHJldHVybiBkZWZhdWx0UmVzdWx0O1xuICAgIH1cblxuICAgIGNvbnN0IG93bkNoZWNrUmVzdWx0ID0gdGhpcy5kb093bkNoZWNrUmVzdWx0KHN1Yk9iamVjdCwga2V5c0FuZEV4cHJlc3Npb24pO1xuICAgIGlmIChvd25DaGVja1Jlc3VsdCkge1xuICAgICAgcmV0dXJuIG93bkNoZWNrUmVzdWx0O1xuICAgIH1cblxuICAgIGNvbnN0IGNsZWFuZWRWYWx1ZSA9IGNsZWFuVmFsdWVPZlF1b3RlcyhrZXlzQW5kRXhwcmVzc2lvbi5rZXlBbmRWYWx1ZVsxXSk7XG5cbiAgICBjb25zdCBldmFsdWF0ZWRSZXN1bHQgPSB0aGlzLnBlcmZvcm1FeHByZXNzaW9uT25WYWx1ZShrZXlzQW5kRXhwcmVzc2lvbiwgY2xlYW5lZFZhbHVlLCBzdWJPYmplY3QpO1xuICAgIGlmIChldmFsdWF0ZWRSZXN1bHQpIHtcbiAgICAgIHJldHVybiBldmFsdWF0ZWRSZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZmF1bHRSZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGFjdHVhbCBldmFsdWF0aW9uIG9uIHRoZSBnaXZlbiBleHByZXNzaW9uIHdpdGggZ2l2ZW4gdmFsdWVzIGFuZCBrZXlzLlxuICAgKiAvLyB7IGNsZWFuZWRWYWx1ZSB9IGNsZWFuZWRWYWx1ZSAtIHRoZSBnaXZlbiB2YWx1ZWQgY2xlYW5lZCBvZiBxdW90ZXMgaWYgaXQgaGFkIGFueVxuICAgKiAvLyB7IHN1Yk9iamVjdCB9IHN1Yk9iamVjdCAtIHRoZSBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIHZhbHVlc1xuICAgKiAvLyB7IGtleXNBbmRFeHByZXNzaW9uIH0ga2V5c0FuZEV4cHJlc3Npb24gLSBhbiBvYmplY3QgaG9sZGluZyB0aGUgZXhwcmVzc2lvbnMgd2l0aFxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgcGVyZm9ybUV4cHJlc3Npb25PblZhbHVlKGtleXNBbmRFeHByZXNzaW9uOiBhbnksIGNsZWFuZWRWYWx1ZTogU3RyaW5nLCBzdWJPYmplY3Q6IE9iamVjdCkge1xuICAgIGNvbnN0IHByb3BlcnR5QnlLZXkgPSBzdWJPYmplY3Rba2V5c0FuZEV4cHJlc3Npb24ua2V5QW5kVmFsdWVbMF1dO1xuICAgIGlmICh0aGlzLmRvQ29tcGFyaXNvbkJ5RXhwcmVzc2lvblR5cGUoa2V5c0FuZEV4cHJlc3Npb24uZXhwcmVzc2lvblR5cGUsIHByb3BlcnR5QnlLZXksIGNsZWFuZWRWYWx1ZSkpIHtcbiAgICAgIHJldHVybiB7cGFzc2VkOiB0cnVlLCBrZXk6IGtleXNBbmRFeHByZXNzaW9uLmtleUFuZFZhbHVlWzBdfTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIGRvQ29tcGFyaXNvbkJ5RXhwcmVzc2lvblR5cGUoZXhwcmVzc2lvblR5cGU6IEV4cHJlc3Npb25UeXBlLCBwcm9wZXJ0eUJ5S2V5LCBjbGVhbmVkVmFsdWU6IFN0cmluZyk6IEJvb2xlYW4ge1xuICAgIGlmIChpc0VxdWFsKGV4cHJlc3Npb25UeXBlKSkge1xuICAgICAgcmV0dXJuIHByb3BlcnR5QnlLZXkgPT09IGNsZWFuZWRWYWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzTm90RXF1YWwoZXhwcmVzc2lvblR5cGUpKSB7XG4gICAgICByZXR1cm4gcHJvcGVydHlCeUtleSAhPT0gY2xlYW5lZFZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRG9lcyB0aGUgY2hlY2tzIHdoZW4gdGhlIHBhcnNlZCBrZXkgaXMgYWN0dWFsbHkgbm8gYSBwcm9wZXJ0eSBpbnNpZGUgc3ViT2JqZWN0LlxuICAgKiBUaGF0IHdvdWxkIG1lYW4gdGhhdCB0aGUgZXF1YWwgY29tcGFyaXNvbiBtYWtlcyBubyBzZW5zZSBhbmQgdGh1cyB0aGUgbmVnYXRpdmUgcmVzdWx0XG4gICAqIGlzIHJldHVybmVkLCBhbmQgdGhlIG5vdCBlcXVhbCBjb21wYXJpc29uIGlzIG5vdCBuZWNlc3NhcnkgYmVjYXVzZSBpdCBkb2Vzbid0IGVxdWFsXG4gICAqIG9idmlvdXNseS4gUmV0dXJucyBudWxsIHdoZW4gdGhlIGdpdmVuIGtleSBpcyBhIHJlYWwgcHJvcGVydHkgaW5zaWRlIHRoZSBzdWJPYmplY3QuXG4gICAqIC8vIHsgc3ViT2JqZWN0IH0gc3ViT2JqZWN0IC0gdGhlIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgdmFsdWVzXG4gICAqIC8vIHsga2V5c0FuZEV4cHJlc3Npb24gfSBrZXlzQW5kRXhwcmVzc2lvbiAtIGFuIG9iamVjdCBob2xkaW5nIHRoZSBleHByZXNzaW9ucyB3aXRoXG4gICAqIHRoZSBhc3NvY2lhdGVkIGtleXMuXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBkb093bkNoZWNrUmVzdWx0KHN1Yk9iamVjdDogT2JqZWN0LCBrZXlzQW5kRXhwcmVzc2lvbikge1xuICAgIGxldCBvd25DaGVja1Jlc3VsdCA9IG51bGw7XG4gICAgaWYgKCFoYXNPd24oc3ViT2JqZWN0LCBrZXlzQW5kRXhwcmVzc2lvbi5rZXlBbmRWYWx1ZVswXSkpIHtcbiAgICAgIGlmIChpc0VxdWFsKGtleXNBbmRFeHByZXNzaW9uLmV4cHJlc3Npb25UeXBlKSkge1xuICAgICAgICBvd25DaGVja1Jlc3VsdCA9IHtwYXNzZWQ6IGZhbHNlLCBrZXk6IG51bGx9O1xuICAgICAgfVxuICAgICAgaWYgKGlzTm90RXF1YWwoa2V5c0FuZEV4cHJlc3Npb24uZXhwcmVzc2lvblR5cGUpKSB7XG4gICAgICAgIG93bkNoZWNrUmVzdWx0ID0ge3Bhc3NlZDogdHJ1ZSwga2V5OiBudWxsfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG93bkNoZWNrUmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIERvZXMgdGhlIGJhc2ljIGNoZWNrcyBhbmQgdHJpZXMgdG8gcGFyc2UgYW4gZXhwcmVzc2lvbiBhbmQgYSBwYWlyXG4gICAqIG9mIGtleSBhbmQgdmFsdWUuXG4gICAqIC8vIHsga2V5IH0ga2V5IC0gdGhlIG9yaWdpbmFsIGZvciBsb29wIGNyZWF0ZWQgdmFsdWUgY29udGFpbmluZyBrZXkgYW5kIHZhbHVlIGluIG9uZSBzdHJpbmdcbiAgICogLy8geyBzdWJPYmplY3QgfSBzdWJPYmplY3QgLSB0aGUgb2JqZWN0IHdpdGggcHJvcGVydGllcyB2YWx1ZXNcbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHBhcnNlS2V5c0FuZEV4cHJlc3Npb24oa2V5OiBzdHJpbmcsIHN1Yk9iamVjdCkge1xuICAgIGlmICh0aGlzLmtleU9yU3ViT2JqRW1wdHkoa2V5LCBzdWJPYmplY3QpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZXhwcmVzc2lvblR5cGUgPSBnZXRFeHByZXNzaW9uVHlwZShrZXkudG9TdHJpbmcoKSk7XG4gICAgaWYgKGlzTm90RXhwcmVzc2lvbihleHByZXNzaW9uVHlwZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBrZXlBbmRWYWx1ZSA9IGdldEtleUFuZFZhbHVlQnlFeHByZXNzaW9uVHlwZShleHByZXNzaW9uVHlwZSwga2V5KTtcbiAgICBpZiAoIWtleUFuZFZhbHVlIHx8ICFrZXlBbmRWYWx1ZVswXSB8fCAha2V5QW5kVmFsdWVbMV0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4ge2V4cHJlc3Npb25UeXBlOiBleHByZXNzaW9uVHlwZSwga2V5QW5kVmFsdWU6IGtleUFuZFZhbHVlfTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIGtleU9yU3ViT2JqRW1wdHkoa2V5OiBhbnksIHN1Yk9iamVjdDogT2JqZWN0KSB7XG4gICAgcmV0dXJuICFrZXkgfHwgIXN1Yk9iamVjdDtcbiAgfVxuXG4gIC8qKlxuICAgKiAnZ2V0Q29weScgZnVuY3Rpb25cbiAgICpcbiAgICogVXNlcyBhIEpTT04gUG9pbnRlciB0byBkZWVwbHkgY2xvbmUgYSB2YWx1ZSBmcm9tIGFuIG9iamVjdC5cbiAgICpcbiAgICogLy8gIHsgb2JqZWN0IH0gb2JqZWN0IC0gT2JqZWN0IHRvIGdldCB2YWx1ZSBmcm9tXG4gICAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gICAqIC8vICB7IG51bWJlciA9IDAgfSBzdGFydFNsaWNlIC0gWmVyby1iYXNlZCBpbmRleCBvZiBmaXJzdCBQb2ludGVyIGtleSB0byB1c2VcbiAgICogLy8gIHsgbnVtYmVyIH0gZW5kU2xpY2UgLSBaZXJvLWJhc2VkIGluZGV4IG9mIGxhc3QgUG9pbnRlciBrZXkgdG8gdXNlXG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGdldEJvb2xlYW4gLSBSZXR1cm4gb25seSB0cnVlIG9yIGZhbHNlP1xuICAgKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBlcnJvcnMgLSBTaG93IGVycm9yIGlmIG5vdCBmb3VuZD9cbiAgICogLy8geyBvYmplY3QgfSAtIExvY2F0ZWQgdmFsdWUgKG9yIHRydWUgb3IgZmFsc2UgaWYgZ2V0Qm9vbGVhbiA9IHRydWUpXG4gICAqL1xuICBzdGF0aWMgZ2V0Q29weShcbiAgICBvYmplY3QsIHBvaW50ZXIsIHN0YXJ0U2xpY2UgPSAwLCBlbmRTbGljZTogbnVtYmVyID0gbnVsbCxcbiAgICBnZXRCb29sZWFuID0gZmFsc2UsIGVycm9ycyA9IGZhbHNlXG4gICkge1xuICAgIGNvbnN0IG9iamVjdFRvQ29weSA9XG4gICAgICB0aGlzLmdldChvYmplY3QsIHBvaW50ZXIsIHN0YXJ0U2xpY2UsIGVuZFNsaWNlLCBnZXRCb29sZWFuLCBlcnJvcnMpO1xuICAgIHJldHVybiB0aGlzLmZvckVhY2hEZWVwQ29weShvYmplY3RUb0NvcHkpO1xuICB9XG5cbiAgLyoqXG4gICAqICdnZXRGaXJzdCcgZnVuY3Rpb25cbiAgICpcbiAgICogVGFrZXMgYW4gYXJyYXkgb2YgSlNPTiBQb2ludGVycyBhbmQgb2JqZWN0cyxcbiAgICogY2hlY2tzIGVhY2ggb2JqZWN0IGZvciBhIHZhbHVlIHNwZWNpZmllZCBieSB0aGUgcG9pbnRlcixcbiAgICogYW5kIHJldHVybnMgdGhlIGZpcnN0IHZhbHVlIGZvdW5kLlxuICAgKlxuICAgKiAvLyAgeyBbb2JqZWN0LCBwb2ludGVyXVtdIH0gaXRlbXMgLSBBcnJheSBvZiBvYmplY3RzIGFuZCBwb2ludGVycyB0byBjaGVja1xuICAgKiAvLyAgeyBhbnkgPSBudWxsIH0gZGVmYXVsdFZhbHVlIC0gVmFsdWUgdG8gcmV0dXJuIGlmIG5vdGhpbmcgZm91bmRcbiAgICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gZ2V0Q29weSAtIFJldHVybiBhIGNvcHkgaW5zdGVhZD9cbiAgICogLy8gIC0gRmlyc3QgdmFsdWUgZm91bmRcbiAgICovXG4gIHN0YXRpYyBnZXRGaXJzdChpdGVtcywgZGVmYXVsdFZhbHVlOiBhbnkgPSBudWxsLCBnZXRDb3B5ID0gZmFsc2UpIHtcbiAgICBpZiAoaXNFbXB0eShpdGVtcykpIHsgcmV0dXJuOyB9XG4gICAgaWYgKGlzQXJyYXkoaXRlbXMpKSB7XG4gICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICAgICAgaWYgKGlzRW1wdHkoaXRlbSkpIHsgY29udGludWU7IH1cbiAgICAgICAgaWYgKGlzQXJyYXkoaXRlbSkgJiYgaXRlbS5sZW5ndGggPj0gMikge1xuICAgICAgICAgIGlmIChpc0VtcHR5KGl0ZW1bMF0pIHx8IGlzRW1wdHkoaXRlbVsxXSkpIHsgY29udGludWU7IH1cbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IGdldENvcHkgP1xuICAgICAgICAgICAgdGhpcy5nZXRDb3B5KGl0ZW1bMF0sIGl0ZW1bMV0pIDpcbiAgICAgICAgICAgIHRoaXMuZ2V0KGl0ZW1bMF0sIGl0ZW1bMV0pO1xuICAgICAgICAgIGlmICh2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmVycm9yKCdnZXRGaXJzdCBlcnJvcjogSW5wdXQgbm90IGluIGNvcnJlY3QgZm9ybWF0LlxcbicgK1xuICAgICAgICAgICdTaG91bGQgYmU6IFsgWyBvYmplY3QxLCBwb2ludGVyMSBdLCBbIG9iamVjdCAyLCBwb2ludGVyMiBdLCBldGMuLi4gXScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgICBpZiAoaXNNYXAoaXRlbXMpKSB7XG4gICAgICBmb3IgKGNvbnN0IFtvYmplY3QsIHBvaW50ZXJdIG9mIGl0ZW1zKSB7XG4gICAgICAgIGlmIChvYmplY3QgPT09IG51bGwgfHwgIXRoaXMuaXNKc29uUG9pbnRlcihwb2ludGVyKSkgeyBjb250aW51ZTsgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9IGdldENvcHkgP1xuICAgICAgICAgIHRoaXMuZ2V0Q29weShvYmplY3QsIHBvaW50ZXIpIDpcbiAgICAgICAgICB0aGlzLmdldChvYmplY3QsIHBvaW50ZXIpO1xuICAgICAgICBpZiAodmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH1cbiAgICBjb25zb2xlLmVycm9yKCdnZXRGaXJzdCBlcnJvcjogSW5wdXQgbm90IGluIGNvcnJlY3QgZm9ybWF0LlxcbicgK1xuICAgICAgJ1Nob3VsZCBiZTogWyBbIG9iamVjdDEsIHBvaW50ZXIxIF0sIFsgb2JqZWN0IDIsIHBvaW50ZXIyIF0sIGV0Yy4uLiBdJyk7XG4gICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnZ2V0Rmlyc3RDb3B5JyBmdW5jdGlvblxuICAgKlxuICAgKiBTaW1pbGFyIHRvIGdldEZpcnN0LCBidXQgYWx3YXlzIHJldHVybnMgYSBjb3B5LlxuICAgKlxuICAgKiAvLyAgeyBbb2JqZWN0LCBwb2ludGVyXVtdIH0gaXRlbXMgLSBBcnJheSBvZiBvYmplY3RzIGFuZCBwb2ludGVycyB0byBjaGVja1xuICAgKiAvLyAgeyBhbnkgPSBudWxsIH0gZGVmYXVsdFZhbHVlIC0gVmFsdWUgdG8gcmV0dXJuIGlmIG5vdGhpbmcgZm91bmRcbiAgICogLy8gIC0gQ29weSBvZiBmaXJzdCB2YWx1ZSBmb3VuZFxuICAgKi9cbiAgc3RhdGljIGdldEZpcnN0Q29weShpdGVtcywgZGVmYXVsdFZhbHVlOiBhbnkgPSBudWxsKSB7XG4gICAgY29uc3QgZmlyc3RDb3B5ID0gdGhpcy5nZXRGaXJzdChpdGVtcywgZGVmYXVsdFZhbHVlLCB0cnVlKTtcbiAgICByZXR1cm4gZmlyc3RDb3B5O1xuICB9XG5cbiAgLyoqXG4gICAqICdzZXQnIGZ1bmN0aW9uXG4gICAqXG4gICAqIFVzZXMgYSBKU09OIFBvaW50ZXIgdG8gc2V0IGEgdmFsdWUgb24gYW4gb2JqZWN0LlxuICAgKiBBbHNvIGNyZWF0ZXMgYW55IG1pc3Npbmcgc3ViIG9iamVjdHMgb3IgYXJyYXlzIHRvIGNvbnRhaW4gdGhhdCB2YWx1ZS5cbiAgICpcbiAgICogSWYgdGhlIG9wdGlvbmFsIGZvdXJ0aCBwYXJhbWV0ZXIgaXMgVFJVRSBhbmQgdGhlIGlubmVyLW1vc3QgY29udGFpbmVyXG4gICAqIGlzIGFuIGFycmF5LCB0aGUgZnVuY3Rpb24gd2lsbCBpbnNlcnQgdGhlIHZhbHVlIGFzIGEgbmV3IGl0ZW0gYXQgdGhlXG4gICAqIHNwZWNpZmllZCBsb2NhdGlvbiBpbiB0aGUgYXJyYXksIHJhdGhlciB0aGFuIG92ZXJ3cml0aW5nIHRoZSBleGlzdGluZ1xuICAgKiB2YWx1ZSAoaWYgYW55KSBhdCB0aGF0IGxvY2F0aW9uLlxuICAgKlxuICAgKiBTbyBzZXQoWzEsIDIsIDNdLCAnLzEnLCA0KSA9PiBbMSwgNCwgM11cbiAgICogYW5kXG4gICAqIFNvIHNldChbMSwgMiwgM10sICcvMScsIDQsIHRydWUpID0+IFsxLCA0LCAyLCAzXVxuICAgKlxuICAgKiAvLyAgeyBvYmplY3QgfSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIHNldCB2YWx1ZSBpblxuICAgKiAvLyAgeyBQb2ludGVyIH0gcG9pbnRlciAtIFRoZSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAgICogLy8gICB2YWx1ZSAtIFRoZSBuZXcgdmFsdWUgdG8gc2V0XG4gICAqIC8vICB7IGJvb2xlYW4gfSBpbnNlcnQgLSBpbnNlcnQgdmFsdWU/XG4gICAqIC8vIHsgb2JqZWN0IH0gLSBUaGUgb3JpZ2luYWwgb2JqZWN0LCBtb2RpZmllZCB3aXRoIHRoZSBzZXQgdmFsdWVcbiAgICovXG4gIHN0YXRpYyBzZXQob2JqZWN0LCBwb2ludGVyLCB2YWx1ZSwgaW5zZXJ0ID0gZmFsc2UpIHtcbiAgICBjb25zdCBrZXlBcnJheSA9IHRoaXMucGFyc2UocG9pbnRlcik7XG4gICAgaWYgKGtleUFycmF5ICE9PSBudWxsICYmIGtleUFycmF5Lmxlbmd0aCkge1xuICAgICAgbGV0IHN1Yk9iamVjdCA9IG9iamVjdDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5QXJyYXkubGVuZ3RoIC0gMTsgKytpKSB7XG4gICAgICAgIGxldCBrZXkgPSBrZXlBcnJheVtpXTtcbiAgICAgICAgaWYgKGtleSA9PT0gJy0nICYmIGlzQXJyYXkoc3ViT2JqZWN0KSkge1xuICAgICAgICAgIGtleSA9IHN1Yk9iamVjdC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzTWFwKHN1Yk9iamVjdCkgJiYgc3ViT2JqZWN0LmhhcyhrZXkpKSB7XG4gICAgICAgICAgc3ViT2JqZWN0ID0gc3ViT2JqZWN0LmdldChrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghaGFzT3duKHN1Yk9iamVjdCwga2V5KSkge1xuICAgICAgICAgICAgc3ViT2JqZWN0W2tleV0gPSAoa2V5QXJyYXlbaSArIDFdLm1hdGNoKC9eKFxcZCt8LSkkLykpID8gW10gOiB7fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3ViT2JqZWN0ID0gc3ViT2JqZWN0W2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGxhc3RLZXkgPSBrZXlBcnJheVtrZXlBcnJheS5sZW5ndGggLSAxXTtcbiAgICAgIGlmIChpc0FycmF5KHN1Yk9iamVjdCkgJiYgbGFzdEtleSA9PT0gJy0nKSB7XG4gICAgICAgIHN1Yk9iamVjdC5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaW5zZXJ0ICYmIGlzQXJyYXkoc3ViT2JqZWN0KSAmJiAhaXNOYU4oK2xhc3RLZXkpKSB7XG4gICAgICAgIHN1Yk9iamVjdC5zcGxpY2UobGFzdEtleSwgMCwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc01hcChzdWJPYmplY3QpKSB7XG4gICAgICAgIHN1Yk9iamVjdC5zZXQobGFzdEtleSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3ViT2JqZWN0W2xhc3RLZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cbiAgICBjb25zb2xlLmVycm9yKGBzZXQgZXJyb3I6IEludmFsaWQgSlNPTiBQb2ludGVyOiAke3BvaW50ZXJ9YCk7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuXG4gIC8qKlxuICAgKiAnc2V0Q29weScgZnVuY3Rpb25cbiAgICpcbiAgICogQ29waWVzIGFuIG9iamVjdCBhbmQgdXNlcyBhIEpTT04gUG9pbnRlciB0byBzZXQgYSB2YWx1ZSBvbiB0aGUgY29weS5cbiAgICogQWxzbyBjcmVhdGVzIGFueSBtaXNzaW5nIHN1YiBvYmplY3RzIG9yIGFycmF5cyB0byBjb250YWluIHRoYXQgdmFsdWUuXG4gICAqXG4gICAqIElmIHRoZSBvcHRpb25hbCBmb3VydGggcGFyYW1ldGVyIGlzIFRSVUUgYW5kIHRoZSBpbm5lci1tb3N0IGNvbnRhaW5lclxuICAgKiBpcyBhbiBhcnJheSwgdGhlIGZ1bmN0aW9uIHdpbGwgaW5zZXJ0IHRoZSB2YWx1ZSBhcyBhIG5ldyBpdGVtIGF0IHRoZVxuICAgKiBzcGVjaWZpZWQgbG9jYXRpb24gaW4gdGhlIGFycmF5LCByYXRoZXIgdGhhbiBvdmVyd3JpdGluZyB0aGUgZXhpc3RpbmcgdmFsdWUuXG4gICAqXG4gICAqIC8vICB7IG9iamVjdCB9IG9iamVjdCAtIFRoZSBvYmplY3QgdG8gY29weSBhbmQgc2V0IHZhbHVlIGluXG4gICAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyIC0gVGhlIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KVxuICAgKiAvLyAgIHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldFxuICAgKiAvLyAgeyBib29sZWFuIH0gaW5zZXJ0IC0gaW5zZXJ0IHZhbHVlP1xuICAgKiAvLyB7IG9iamVjdCB9IC0gVGhlIG5ldyBvYmplY3Qgd2l0aCB0aGUgc2V0IHZhbHVlXG4gICAqL1xuICBzdGF0aWMgc2V0Q29weShvYmplY3QsIHBvaW50ZXIsIHZhbHVlLCBpbnNlcnQgPSBmYWxzZSkge1xuICAgIGNvbnN0IGtleUFycmF5ID0gdGhpcy5wYXJzZShwb2ludGVyKTtcbiAgICBpZiAoa2V5QXJyYXkgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IG5ld09iamVjdCA9IGNvcHkob2JqZWN0KTtcbiAgICAgIGxldCBzdWJPYmplY3QgPSBuZXdPYmplY3Q7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleUFycmF5Lmxlbmd0aCAtIDE7ICsraSkge1xuICAgICAgICBsZXQga2V5ID0ga2V5QXJyYXlbaV07XG4gICAgICAgIGlmIChrZXkgPT09ICctJyAmJiBpc0FycmF5KHN1Yk9iamVjdCkpIHtcbiAgICAgICAgICBrZXkgPSBzdWJPYmplY3QubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc01hcChzdWJPYmplY3QpICYmIHN1Yk9iamVjdC5oYXMoa2V5KSkge1xuICAgICAgICAgIHN1Yk9iamVjdC5zZXQoa2V5LCBjb3B5KHN1Yk9iamVjdC5nZXQoa2V5KSkpO1xuICAgICAgICAgIHN1Yk9iamVjdCA9IHN1Yk9iamVjdC5nZXQoa2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIWhhc093bihzdWJPYmplY3QsIGtleSkpIHtcbiAgICAgICAgICAgIHN1Yk9iamVjdFtrZXldID0gKGtleUFycmF5W2kgKyAxXS5tYXRjaCgvXihcXGQrfC0pJC8pKSA/IFtdIDoge307XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1Yk9iamVjdFtrZXldID0gY29weShzdWJPYmplY3Rba2V5XSk7XG4gICAgICAgICAgc3ViT2JqZWN0ID0gc3ViT2JqZWN0W2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGxhc3RLZXkgPSBrZXlBcnJheVtrZXlBcnJheS5sZW5ndGggLSAxXTtcbiAgICAgIGlmIChpc0FycmF5KHN1Yk9iamVjdCkgJiYgbGFzdEtleSA9PT0gJy0nKSB7XG4gICAgICAgIHN1Yk9iamVjdC5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaW5zZXJ0ICYmIGlzQXJyYXkoc3ViT2JqZWN0KSAmJiAhaXNOYU4oK2xhc3RLZXkpKSB7XG4gICAgICAgIHN1Yk9iamVjdC5zcGxpY2UobGFzdEtleSwgMCwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc01hcChzdWJPYmplY3QpKSB7XG4gICAgICAgIHN1Yk9iamVjdC5zZXQobGFzdEtleSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3ViT2JqZWN0W2xhc3RLZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3T2JqZWN0O1xuICAgIH1cbiAgICBjb25zb2xlLmVycm9yKGBzZXRDb3B5IGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtwb2ludGVyfWApO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cblxuICAvKipcbiAgICogJ2luc2VydCcgZnVuY3Rpb25cbiAgICpcbiAgICogQ2FsbHMgJ3NldCcgd2l0aCBpbnNlcnQgPSBUUlVFXG4gICAqXG4gICAqIC8vICB7IG9iamVjdCB9IG9iamVjdCAtIG9iamVjdCB0byBpbnNlcnQgdmFsdWUgaW5cbiAgICogLy8gIHsgUG9pbnRlciB9IHBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAgICogLy8gICB2YWx1ZSAtIHZhbHVlIHRvIGluc2VydFxuICAgKiAvLyB7IG9iamVjdCB9XG4gICAqL1xuICBzdGF0aWMgaW5zZXJ0KG9iamVjdCwgcG9pbnRlciwgdmFsdWUpIHtcbiAgICBjb25zdCB1cGRhdGVkT2JqZWN0ID0gdGhpcy5zZXQob2JqZWN0LCBwb2ludGVyLCB2YWx1ZSwgdHJ1ZSk7XG4gICAgcmV0dXJuIHVwZGF0ZWRPYmplY3Q7XG4gIH1cblxuICAvKipcbiAgICogJ2luc2VydENvcHknIGZ1bmN0aW9uXG4gICAqXG4gICAqIENhbGxzICdzZXRDb3B5JyB3aXRoIGluc2VydCA9IFRSVUVcbiAgICpcbiAgICogLy8gIHsgb2JqZWN0IH0gb2JqZWN0IC0gb2JqZWN0IHRvIGluc2VydCB2YWx1ZSBpblxuICAgKiAvLyAgeyBQb2ludGVyIH0gcG9pbnRlciAtIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KVxuICAgKiAvLyAgIHZhbHVlIC0gdmFsdWUgdG8gaW5zZXJ0XG4gICAqIC8vIHsgb2JqZWN0IH1cbiAgICovXG4gIHN0YXRpYyBpbnNlcnRDb3B5KG9iamVjdCwgcG9pbnRlciwgdmFsdWUpIHtcbiAgICBjb25zdCB1cGRhdGVkT2JqZWN0ID0gdGhpcy5zZXRDb3B5KG9iamVjdCwgcG9pbnRlciwgdmFsdWUsIHRydWUpO1xuICAgIHJldHVybiB1cGRhdGVkT2JqZWN0O1xuICB9XG5cbiAgLyoqXG4gICAqICdyZW1vdmUnIGZ1bmN0aW9uXG4gICAqXG4gICAqIFVzZXMgYSBKU09OIFBvaW50ZXIgdG8gcmVtb3ZlIGEga2V5IGFuZCBpdHMgYXR0cmlidXRlIGZyb20gYW4gb2JqZWN0XG4gICAqXG4gICAqIC8vICB7IG9iamVjdCB9IG9iamVjdCAtIG9iamVjdCB0byBkZWxldGUgYXR0cmlidXRlIGZyb21cbiAgICogLy8gIHsgUG9pbnRlciB9IHBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAgICogLy8geyBvYmplY3QgfVxuICAgKi9cbiAgc3RhdGljIHJlbW92ZShvYmplY3QsIHBvaW50ZXIpIHtcbiAgICBjb25zdCBrZXlBcnJheSA9IHRoaXMucGFyc2UocG9pbnRlcik7XG4gICAgaWYgKGtleUFycmF5ICE9PSBudWxsICYmIGtleUFycmF5Lmxlbmd0aCkge1xuICAgICAgbGV0IGxhc3RLZXkgPSBrZXlBcnJheS5wb3AoKTtcbiAgICAgIGNvbnN0IHBhcmVudE9iamVjdCA9IHRoaXMuZ2V0KG9iamVjdCwga2V5QXJyYXkpO1xuICAgICAgaWYgKGlzQXJyYXkocGFyZW50T2JqZWN0KSkge1xuICAgICAgICBpZiAobGFzdEtleSA9PT0gJy0nKSB7IGxhc3RLZXkgPSBwYXJlbnRPYmplY3QubGVuZ3RoIC0gMTsgfVxuICAgICAgICBwYXJlbnRPYmplY3Quc3BsaWNlKGxhc3RLZXksIDEpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdChwYXJlbnRPYmplY3QpKSB7XG4gICAgICAgIGRlbGV0ZSBwYXJlbnRPYmplY3RbbGFzdEtleV07XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cbiAgICBjb25zb2xlLmVycm9yKGByZW1vdmUgZXJyb3I6IEludmFsaWQgSlNPTiBQb2ludGVyOiAke3BvaW50ZXJ9YCk7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuXG4gIC8qKlxuICAgKiAnaGFzJyBmdW5jdGlvblxuICAgKlxuICAgKiBUZXN0cyBpZiBhbiBvYmplY3QgaGFzIGEgdmFsdWUgYXQgdGhlIGxvY2F0aW9uIHNwZWNpZmllZCBieSBhIEpTT04gUG9pbnRlclxuICAgKlxuICAgKiAvLyAgeyBvYmplY3QgfSBvYmplY3QgLSBvYmplY3QgdG8gY2hlayBmb3IgdmFsdWVcbiAgICogLy8gIHsgUG9pbnRlciB9IHBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAgICogLy8geyBib29sZWFuIH1cbiAgICovXG4gIHN0YXRpYyBoYXMob2JqZWN0LCBwb2ludGVyKSB7XG4gICAgY29uc3QgaGFzVmFsdWUgPSB0aGlzLmdldChvYmplY3QsIHBvaW50ZXIsIDAsIG51bGwsIHRydWUpO1xuICAgIHJldHVybiBoYXNWYWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnZGljdCcgZnVuY3Rpb25cbiAgICpcbiAgICogUmV0dXJucyBhIChwb2ludGVyIC0+IHZhbHVlKSBkaWN0aW9uYXJ5IGZvciBhbiBvYmplY3RcbiAgICpcbiAgICogLy8gIHsgb2JqZWN0IH0gb2JqZWN0IC0gVGhlIG9iamVjdCB0byBjcmVhdGUgYSBkaWN0aW9uYXJ5IGZyb21cbiAgICogLy8geyBvYmplY3QgfSAtIFRoZSByZXN1bHRpbmcgZGljdGlvbmFyeSBvYmplY3RcbiAgICovXG4gIHN0YXRpYyBkaWN0KG9iamVjdCkge1xuICAgIGNvbnN0IHJlc3VsdHM6IGFueSA9IHt9O1xuICAgIHRoaXMuZm9yRWFjaERlZXAob2JqZWN0LCAodmFsdWUsIHBvaW50ZXIpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7IHJlc3VsdHNbcG9pbnRlcl0gPSB2YWx1ZTsgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqICdmb3JFYWNoRGVlcCcgZnVuY3Rpb25cbiAgICpcbiAgICogSXRlcmF0ZXMgb3ZlciBvd24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9mIGFuIG9iamVjdCBvciBpdGVtcyBpbiBhbiBhcnJheVxuICAgKiBhbmQgaW52b2tlcyBhbiBpdGVyYXRlZSBmdW5jdGlvbiBmb3IgZWFjaCBrZXkvdmFsdWUgb3IgaW5kZXgvdmFsdWUgcGFpci5cbiAgICogQnkgZGVmYXVsdCwgaXRlcmF0ZXMgb3ZlciBpdGVtcyB3aXRoaW4gb2JqZWN0cyBhbmQgYXJyYXlzIGFmdGVyIGNhbGxpbmdcbiAgICogdGhlIGl0ZXJhdGVlIGZ1bmN0aW9uIG9uIHRoZSBjb250YWluaW5nIG9iamVjdCBvciBhcnJheSBpdHNlbGYuXG4gICAqXG4gICAqIFRoZSBpdGVyYXRlZSBpcyBpbnZva2VkIHdpdGggdGhyZWUgYXJndW1lbnRzOiAodmFsdWUsIHBvaW50ZXIsIHJvb3RPYmplY3QpLFxuICAgKiB3aGVyZSBwb2ludGVyIGlzIGEgSlNPTiBwb2ludGVyIGluZGljYXRpbmcgdGhlIGxvY2F0aW9uIG9mIHRoZSBjdXJyZW50XG4gICAqIHZhbHVlIHdpdGhpbiB0aGUgcm9vdCBvYmplY3QsIGFuZCByb290T2JqZWN0IGlzIHRoZSByb290IG9iamVjdCBpbml0aWFsbHlcbiAgICogc3VibWl0dGVkIHRvIHRoIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBJZiBhIHRoaXJkIG9wdGlvbmFsIHBhcmFtZXRlciAnYm90dG9tVXAnIGlzIHNldCB0byBUUlVFLCB0aGUgaXRlcmF0b3JcbiAgICogZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgb24gc3ViLW9iamVjdHMgYW5kIGFycmF5cyBhZnRlciBiZWluZ1xuICAgKiBjYWxsZWQgb24gdGhlaXIgY29udGVudHMsIHJhdGhlciB0aGFuIGJlZm9yZSwgd2hpY2ggaXMgdGhlIGRlZmF1bHQuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gY2FuIGFsc28gb3B0aW9uYWxseSBiZSBjYWxsZWQgZGlyZWN0bHkgb24gYSBzdWItb2JqZWN0IGJ5XG4gICAqIGluY2x1ZGluZyBvcHRpb25hbCA0dGggYW5kIDV0aCBwYXJhbWV0ZXJzcyB0byBzcGVjaWZ5IHRoZSBpbml0aWFsXG4gICAqIHJvb3Qgb2JqZWN0IGFuZCBwb2ludGVyLlxuICAgKlxuICAgKiAvLyAgeyBvYmplY3QgfSBvYmplY3QgLSB0aGUgaW5pdGlhbCBvYmplY3Qgb3IgYXJyYXlcbiAgICogLy8gIHsgKHY6IGFueSwgcD86IHN0cmluZywgbz86IGFueSkgPT4gYW55IH0gZnVuY3Rpb24gLSBpdGVyYXRlZSBmdW5jdGlvblxuICAgKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBib3R0b21VcCAtIG9wdGlvbmFsLCBzZXQgdG8gVFJVRSB0byByZXZlcnNlIGRpcmVjdGlvblxuICAgKiAvLyAgeyBvYmplY3QgPSBvYmplY3QgfSByb290T2JqZWN0IC0gb3B0aW9uYWwsIHJvb3Qgb2JqZWN0IG9yIGFycmF5XG4gICAqIC8vICB7IHN0cmluZyA9ICcnIH0gcG9pbnRlciAtIG9wdGlvbmFsLCBKU09OIFBvaW50ZXIgdG8gb2JqZWN0IHdpdGhpbiByb290T2JqZWN0XG4gICAqIC8vIHsgb2JqZWN0IH0gLSBUaGUgbW9kaWZpZWQgb2JqZWN0XG4gICAqL1xuICBzdGF0aWMgZm9yRWFjaERlZXAoXG4gICAgb2JqZWN0LCBmbjogKHY6IGFueSwgcD86IHN0cmluZywgbz86IGFueSkgPT4gYW55ID0gKHYpID0+IHYsXG4gICAgYm90dG9tVXAgPSBmYWxzZSwgcG9pbnRlciA9ICcnLCByb290T2JqZWN0ID0gb2JqZWN0XG4gICkge1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYGZvckVhY2hEZWVwIGVycm9yOiBJdGVyYXRvciBpcyBub3QgYSBmdW5jdGlvbjpgLCBmbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghYm90dG9tVXApIHsgZm4ob2JqZWN0LCBwb2ludGVyLCByb290T2JqZWN0KTsgfVxuICAgIGlmIChpc09iamVjdChvYmplY3QpIHx8IGlzQXJyYXkob2JqZWN0KSkge1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqZWN0KSkge1xuICAgICAgICBjb25zdCBuZXdQb2ludGVyID0gcG9pbnRlciArICcvJyArIHRoaXMuZXNjYXBlKGtleSk7XG4gICAgICAgIHRoaXMuZm9yRWFjaERlZXAob2JqZWN0W2tleV0sIGZuLCBib3R0b21VcCwgbmV3UG9pbnRlciwgcm9vdE9iamVjdCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChib3R0b21VcCkgeyBmbihvYmplY3QsIHBvaW50ZXIsIHJvb3RPYmplY3QpOyB9XG4gIH1cblxuICAvKipcbiAgICogJ2ZvckVhY2hEZWVwQ29weScgZnVuY3Rpb25cbiAgICpcbiAgICogU2ltaWxhciB0byBmb3JFYWNoRGVlcCwgYnV0IHJldHVybnMgYSBjb3B5IG9mIHRoZSBvcmlnaW5hbCBvYmplY3QsIHdpdGhcbiAgICogdGhlIHNhbWUga2V5cyBhbmQgaW5kZXhlcywgYnV0IHdpdGggdmFsdWVzIHJlcGxhY2VkIHdpdGggdGhlIHJlc3VsdCBvZlxuICAgKiB0aGUgaXRlcmF0ZWUgZnVuY3Rpb24uXG4gICAqXG4gICAqIC8vICB7IG9iamVjdCB9IG9iamVjdCAtIHRoZSBpbml0aWFsIG9iamVjdCBvciBhcnJheVxuICAgKiAvLyAgeyAodjogYW55LCBrPzogc3RyaW5nLCBvPzogYW55LCBwPzogYW55KSA9PiBhbnkgfSBmdW5jdGlvbiAtIGl0ZXJhdGVlIGZ1bmN0aW9uXG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGJvdHRvbVVwIC0gb3B0aW9uYWwsIHNldCB0byBUUlVFIHRvIHJldmVyc2UgZGlyZWN0aW9uXG4gICAqIC8vICB7IG9iamVjdCA9IG9iamVjdCB9IHJvb3RPYmplY3QgLSBvcHRpb25hbCwgcm9vdCBvYmplY3Qgb3IgYXJyYXlcbiAgICogLy8gIHsgc3RyaW5nID0gJycgfSBwb2ludGVyIC0gb3B0aW9uYWwsIEpTT04gUG9pbnRlciB0byBvYmplY3Qgd2l0aGluIHJvb3RPYmplY3RcbiAgICogLy8geyBvYmplY3QgfSAtIFRoZSBjb3BpZWQgb2JqZWN0XG4gICAqL1xuICBzdGF0aWMgZm9yRWFjaERlZXBDb3B5KFxuICAgIG9iamVjdCwgZm46ICh2OiBhbnksIHA/OiBzdHJpbmcsIG8/OiBhbnkpID0+IGFueSA9ICh2KSA9PiB2LFxuICAgIGJvdHRvbVVwID0gZmFsc2UsIHBvaW50ZXIgPSAnJywgcm9vdE9iamVjdCA9IG9iamVjdFxuICApIHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBmb3JFYWNoRGVlcENvcHkgZXJyb3I6IEl0ZXJhdG9yIGlzIG5vdCBhIGZ1bmN0aW9uOmAsIGZuKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoaXNPYmplY3Qob2JqZWN0KSB8fCBpc0FycmF5KG9iamVjdCkpIHtcbiAgICAgIGxldCBuZXdPYmplY3QgPSBpc0FycmF5KG9iamVjdCkgPyBbIC4uLm9iamVjdCBdIDogeyAuLi5vYmplY3QgfTtcbiAgICAgIGlmICghYm90dG9tVXApIHsgbmV3T2JqZWN0ID0gZm4obmV3T2JqZWN0LCBwb2ludGVyLCByb290T2JqZWN0KTsgfVxuICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMobmV3T2JqZWN0KSkge1xuICAgICAgICBjb25zdCBuZXdQb2ludGVyID0gcG9pbnRlciArICcvJyArIHRoaXMuZXNjYXBlKGtleSk7XG4gICAgICAgIG5ld09iamVjdFtrZXldID0gdGhpcy5mb3JFYWNoRGVlcENvcHkoXG4gICAgICAgICAgbmV3T2JqZWN0W2tleV0sIGZuLCBib3R0b21VcCwgbmV3UG9pbnRlciwgcm9vdE9iamVjdFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKGJvdHRvbVVwKSB7IG5ld09iamVjdCA9IGZuKG5ld09iamVjdCwgcG9pbnRlciwgcm9vdE9iamVjdCk7IH1cbiAgICAgIHJldHVybiBuZXdPYmplY3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmbihvYmplY3QsIHBvaW50ZXIsIHJvb3RPYmplY3QpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAnZXNjYXBlJyBmdW5jdGlvblxuICAgKlxuICAgKiBFc2NhcGVzIGEgc3RyaW5nIHJlZmVyZW5jZSBrZXlcbiAgICpcbiAgICogLy8gIHsgc3RyaW5nIH0ga2V5IC0gc3RyaW5nIGtleSB0byBlc2NhcGVcbiAgICogLy8geyBzdHJpbmcgfSAtIGVzY2FwZWQga2V5XG4gICAqL1xuICBzdGF0aWMgZXNjYXBlKGtleSkge1xuICAgIGNvbnN0IGVzY2FwZWQgPSBrZXkudG9TdHJpbmcoKS5yZXBsYWNlKC9+L2csICd+MCcpLnJlcGxhY2UoL1xcLy9nLCAnfjEnKTtcbiAgICByZXR1cm4gZXNjYXBlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiAndW5lc2NhcGUnIGZ1bmN0aW9uXG4gICAqXG4gICAqIFVuZXNjYXBlcyBhIHN0cmluZyByZWZlcmVuY2Uga2V5XG4gICAqXG4gICAqIC8vICB7IHN0cmluZyB9IGtleSAtIHN0cmluZyBrZXkgdG8gdW5lc2NhcGVcbiAgICogLy8geyBzdHJpbmcgfSAtIHVuZXNjYXBlZCBrZXlcbiAgICovXG4gIHN0YXRpYyB1bmVzY2FwZShrZXkpIHtcbiAgICBjb25zdCB1bmVzY2FwZWQgPSBrZXkudG9TdHJpbmcoKS5yZXBsYWNlKC9+MS9nLCAnLycpLnJlcGxhY2UoL34wL2csICd+Jyk7XG4gICAgcmV0dXJuIHVuZXNjYXBlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiAncGFyc2UnIGZ1bmN0aW9uXG4gICAqXG4gICAqIENvbnZlcnRzIGEgc3RyaW5nIEpTT04gUG9pbnRlciBpbnRvIGEgYXJyYXkgb2Yga2V5c1xuICAgKiAoaWYgaW5wdXQgaXMgYWxyZWFkeSBhbiBhbiBhcnJheSBvZiBrZXlzLCBpdCBpcyByZXR1cm5lZCB1bmNoYW5nZWQpXG4gICAqXG4gICAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGVycm9ycyAtIFNob3cgZXJyb3IgaWYgaW52YWxpZCBwb2ludGVyP1xuICAgKiAvLyB7IHN0cmluZ1tdIH0gLSBKU09OIFBvaW50ZXIgYXJyYXkgb2Yga2V5c1xuICAgKi9cbiAgc3RhdGljIHBhcnNlKHBvaW50ZXIsIGVycm9ycyA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmlzSnNvblBvaW50ZXIocG9pbnRlcikpIHtcbiAgICAgIGlmIChlcnJvcnMpIHsgY29uc29sZS5lcnJvcihgcGFyc2UgZXJyb3I6IEludmFsaWQgSlNPTiBQb2ludGVyOiAke3BvaW50ZXJ9YCk7IH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoaXNBcnJheShwb2ludGVyKSkgeyByZXR1cm4gPHN0cmluZ1tdPnBvaW50ZXI7IH1cbiAgICBpZiAodHlwZW9mIHBvaW50ZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoKDxzdHJpbmc+cG9pbnRlcilbMF0gPT09ICcjJykgeyBwb2ludGVyID0gcG9pbnRlci5zbGljZSgxKTsgfVxuICAgICAgaWYgKDxzdHJpbmc+cG9pbnRlciA9PT0gJycgfHwgPHN0cmluZz5wb2ludGVyID09PSAnLycpIHsgcmV0dXJuIFtdOyB9XG4gICAgICByZXR1cm4gKDxzdHJpbmc+cG9pbnRlcikuc2xpY2UoMSkuc3BsaXQoJy8nKS5tYXAodGhpcy51bmVzY2FwZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICdjb21waWxlJyBmdW5jdGlvblxuICAgKlxuICAgKiBDb252ZXJ0cyBhbiBhcnJheSBvZiBrZXlzIGludG8gYSBKU09OIFBvaW50ZXIgc3RyaW5nXG4gICAqIChpZiBpbnB1dCBpcyBhbHJlYWR5IGEgc3RyaW5nLCBpdCBpcyBub3JtYWxpemVkIGFuZCByZXR1cm5lZClcbiAgICpcbiAgICogVGhlIG9wdGlvbmFsIHNlY29uZCBwYXJhbWV0ZXIgaXMgYSBkZWZhdWx0IHdoaWNoIHdpbGwgcmVwbGFjZSBhbnkgZW1wdHkga2V5cy5cbiAgICpcbiAgICogLy8gIHsgUG9pbnRlciB9IHBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAgICogLy8gIHsgc3RyaW5nIHwgbnVtYmVyID0gJycgfSBkZWZhdWx0VmFsdWUgLSBEZWZhdWx0IHZhbHVlXG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGVycm9ycyAtIFNob3cgZXJyb3IgaWYgaW52YWxpZCBwb2ludGVyP1xuICAgKiAvLyB7IHN0cmluZyB9IC0gSlNPTiBQb2ludGVyIHN0cmluZ1xuICAgKi9cbiAgc3RhdGljIGNvbXBpbGUocG9pbnRlciwgZGVmYXVsdFZhbHVlID0gJycsIGVycm9ycyA9IGZhbHNlKSB7XG4gICAgaWYgKHBvaW50ZXIgPT09ICcjJykgeyByZXR1cm4gJyc7IH1cbiAgICBpZiAoIXRoaXMuaXNKc29uUG9pbnRlcihwb2ludGVyKSkge1xuICAgICAgaWYgKGVycm9ycykgeyBjb25zb2xlLmVycm9yKGBjb21waWxlIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtwb2ludGVyfWApOyB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXkocG9pbnRlcikpIHtcbiAgICAgIGlmICgoPHN0cmluZ1tdPnBvaW50ZXIpLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gJyc7IH1cbiAgICAgIHJldHVybiAnLycgKyAoPHN0cmluZ1tdPnBvaW50ZXIpLm1hcChcbiAgICAgICAga2V5ID0+IGtleSA9PT0gJycgPyBkZWZhdWx0VmFsdWUgOiB0aGlzLmVzY2FwZShrZXkpXG4gICAgICApLmpvaW4oJy8nKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwb2ludGVyID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKHBvaW50ZXJbMF0gPT09ICcjJykgeyBwb2ludGVyID0gcG9pbnRlci5zbGljZSgxKTsgfVxuICAgICAgcmV0dXJuIHBvaW50ZXI7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqICd0b0tleScgZnVuY3Rpb25cbiAgICpcbiAgICogRXh0cmFjdHMgbmFtZSBvZiB0aGUgZmluYWwga2V5IGZyb20gYSBKU09OIFBvaW50ZXIuXG4gICAqXG4gICAqIC8vICB7IFBvaW50ZXIgfSBwb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gICAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IGVycm9ycyAtIFNob3cgZXJyb3IgaWYgaW52YWxpZCBwb2ludGVyP1xuICAgKiAvLyB7IHN0cmluZyB9IC0gdGhlIGV4dHJhY3RlZCBrZXlcbiAgICovXG4gIHN0YXRpYyB0b0tleShwb2ludGVyLCBlcnJvcnMgPSBmYWxzZSkge1xuICAgIGNvbnN0IGtleUFycmF5ID0gdGhpcy5wYXJzZShwb2ludGVyLCBlcnJvcnMpO1xuICAgIGlmIChrZXlBcnJheSA9PT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgfVxuICAgIGlmICgha2V5QXJyYXkubGVuZ3RoKSB7IHJldHVybiAnJzsgfVxuICAgIHJldHVybiBrZXlBcnJheVtrZXlBcnJheS5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnaXNKc29uUG9pbnRlcicgZnVuY3Rpb25cbiAgICpcbiAgICogQ2hlY2tzIGEgc3RyaW5nIG9yIGFycmF5IHZhbHVlIHRvIGRldGVybWluZSBpZiBpdCBpcyBhIHZhbGlkIEpTT04gUG9pbnRlci5cbiAgICogUmV0dXJucyB0cnVlIGlmIGEgc3RyaW5nIGlzIGVtcHR5LCBvciBzdGFydHMgd2l0aCAnLycgb3IgJyMvJy5cbiAgICogUmV0dXJucyB0cnVlIGlmIGFuIGFycmF5IGNvbnRhaW5zIG9ubHkgc3RyaW5nIHZhbHVlcy5cbiAgICpcbiAgICogLy8gICB2YWx1ZSAtIHZhbHVlIHRvIGNoZWNrXG4gICAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiB2YWx1ZSBpcyBhIHZhbGlkIEpTT04gUG9pbnRlciwgb3RoZXJ3aXNlIGZhbHNlXG4gICAqL1xuICBzdGF0aWMgaXNKc29uUG9pbnRlcih2YWx1ZSkge1xuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlLmV2ZXJ5KGtleSA9PiB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyk7XG4gICAgfSBlbHNlIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgIGlmICh2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09ICcjJykgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgaWYgKHZhbHVlWzBdID09PSAnLycgfHwgdmFsdWUuc2xpY2UoMCwgMikgPT09ICcjLycpIHtcbiAgICAgICAgcmV0dXJuICEvKH5bXjAxXXx+JCkvZy50ZXN0KHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqICdpc1N1YlBvaW50ZXInIGZ1bmN0aW9uXG4gICAqXG4gICAqIENoZWNrcyB3aGV0aGVyIG9uZSBKU09OIFBvaW50ZXIgaXMgYSBzdWJzZXQgb2YgYW5vdGhlci5cbiAgICpcbiAgICogLy8gIHsgUG9pbnRlciB9IHNob3J0UG9pbnRlciAtIHBvdGVudGlhbCBzdWJzZXQgSlNPTiBQb2ludGVyXG4gICAqIC8vICB7IFBvaW50ZXIgfSBsb25nUG9pbnRlciAtIHBvdGVudGlhbCBzdXBlcnNldCBKU09OIFBvaW50ZXJcbiAgICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gdHJ1ZUlmTWF0Y2hpbmcgLSByZXR1cm4gdHJ1ZSBpZiBwb2ludGVycyBtYXRjaD9cbiAgICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gZXJyb3JzIC0gU2hvdyBlcnJvciBpZiBpbnZhbGlkIHBvaW50ZXI/XG4gICAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiBzaG9ydFBvaW50ZXIgaXMgYSBzdWJzZXQgb2YgbG9uZ1BvaW50ZXIsIGZhbHNlIGlmIG5vdFxuICAgKi9cbiAgc3RhdGljIGlzU3ViUG9pbnRlcihcbiAgICBzaG9ydFBvaW50ZXIsIGxvbmdQb2ludGVyLCB0cnVlSWZNYXRjaGluZyA9IGZhbHNlLCBlcnJvcnMgPSBmYWxzZVxuICApIHtcbiAgICBpZiAoIXRoaXMuaXNKc29uUG9pbnRlcihzaG9ydFBvaW50ZXIpIHx8ICF0aGlzLmlzSnNvblBvaW50ZXIobG9uZ1BvaW50ZXIpKSB7XG4gICAgICBpZiAoZXJyb3JzKSB7XG4gICAgICAgIGxldCBpbnZhbGlkID0gJyc7XG4gICAgICAgIGlmICghdGhpcy5pc0pzb25Qb2ludGVyKHNob3J0UG9pbnRlcikpIHsgaW52YWxpZCArPSBgIDE6ICR7c2hvcnRQb2ludGVyfWA7IH1cbiAgICAgICAgaWYgKCF0aGlzLmlzSnNvblBvaW50ZXIobG9uZ1BvaW50ZXIpKSB7IGludmFsaWQgKz0gYCAyOiAke2xvbmdQb2ludGVyfWA7IH1cbiAgICAgICAgY29uc29sZS5lcnJvcihgaXNTdWJQb2ludGVyIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlciAke2ludmFsaWR9YCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNob3J0UG9pbnRlciA9IHRoaXMuY29tcGlsZShzaG9ydFBvaW50ZXIsICcnLCBlcnJvcnMpO1xuICAgIGxvbmdQb2ludGVyID0gdGhpcy5jb21waWxlKGxvbmdQb2ludGVyLCAnJywgZXJyb3JzKTtcbiAgICByZXR1cm4gc2hvcnRQb2ludGVyID09PSBsb25nUG9pbnRlciA/IHRydWVJZk1hdGNoaW5nIDpcbiAgICAgIGAke3Nob3J0UG9pbnRlcn0vYCA9PT0gbG9uZ1BvaW50ZXIuc2xpY2UoMCwgc2hvcnRQb2ludGVyLmxlbmd0aCArIDEpO1xuICB9XG5cbiAgLyoqXG4gICAqICd0b0luZGV4ZWRQb2ludGVyJyBmdW5jdGlvblxuICAgKlxuICAgKiBNZXJnZXMgYW4gYXJyYXkgb2YgbnVtZXJpYyBpbmRleGVzIGFuZCBhIGdlbmVyaWMgcG9pbnRlciB0byBjcmVhdGUgYW5cbiAgICogaW5kZXhlZCBwb2ludGVyIGZvciBhIHNwZWNpZmljIGl0ZW0uXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBtZXJnaW5nIHRoZSBnZW5lcmljIHBvaW50ZXIgJy9mb28vLS9iYXIvLS9iYXonIGFuZFxuICAgKiB0aGUgYXJyYXkgWzQsIDJdIHdvdWxkIHJlc3VsdCBpbiB0aGUgaW5kZXhlZCBwb2ludGVyICcvZm9vLzQvYmFyLzIvYmF6J1xuICAgKlxuICAgKlxuICAgKiAvLyAgeyBQb2ludGVyIH0gZ2VuZXJpY1BvaW50ZXIgLSBUaGUgZ2VuZXJpYyBwb2ludGVyXG4gICAqIC8vICB7IG51bWJlcltdIH0gaW5kZXhBcnJheSAtIFRoZSBhcnJheSBvZiBudW1lcmljIGluZGV4ZXNcbiAgICogLy8gIHsgTWFwPHN0cmluZywgbnVtYmVyPiB9IGFycmF5TWFwIC0gQW4gb3B0aW9uYWwgYXJyYXkgbWFwXG4gICAqIC8vIHsgc3RyaW5nIH0gLSBUaGUgbWVyZ2VkIHBvaW50ZXIgd2l0aCBpbmRleGVzXG4gICAqL1xuICBzdGF0aWMgdG9JbmRleGVkUG9pbnRlcihcbiAgICBnZW5lcmljUG9pbnRlciwgaW5kZXhBcnJheSwgYXJyYXlNYXA6IE1hcDxzdHJpbmcsIG51bWJlcj4gPSBudWxsXG4gICkge1xuICAgIGlmICh0aGlzLmlzSnNvblBvaW50ZXIoZ2VuZXJpY1BvaW50ZXIpICYmIGlzQXJyYXkoaW5kZXhBcnJheSkpIHtcbiAgICAgIGxldCBpbmRleGVkUG9pbnRlciA9IHRoaXMuY29tcGlsZShnZW5lcmljUG9pbnRlcik7XG4gICAgICBpZiAoaXNNYXAoYXJyYXlNYXApKSB7XG4gICAgICAgIGxldCBhcnJheUluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIGluZGV4ZWRQb2ludGVyLnJlcGxhY2UoL1xcL1xcLSg/PVxcL3wkKS9nLCAoa2V5LCBzdHJpbmdJbmRleCkgPT5cbiAgICAgICAgICBhcnJheU1hcC5oYXMoKDxzdHJpbmc+aW5kZXhlZFBvaW50ZXIpLnNsaWNlKDAsIHN0cmluZ0luZGV4KSkgP1xuICAgICAgICAgICAgJy8nICsgaW5kZXhBcnJheVthcnJheUluZGV4KytdIDoga2V5XG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGNvbnN0IHBvaW50ZXJJbmRleCBvZiBpbmRleEFycmF5KSB7XG4gICAgICAgICAgaW5kZXhlZFBvaW50ZXIgPSBpbmRleGVkUG9pbnRlci5yZXBsYWNlKCcvLScsICcvJyArIHBvaW50ZXJJbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluZGV4ZWRQb2ludGVyO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNKc29uUG9pbnRlcihnZW5lcmljUG9pbnRlcikpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYHRvSW5kZXhlZFBvaW50ZXIgZXJyb3I6IEludmFsaWQgSlNPTiBQb2ludGVyOiAke2dlbmVyaWNQb2ludGVyfWApO1xuICAgIH1cbiAgICBpZiAoIWlzQXJyYXkoaW5kZXhBcnJheSkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYHRvSW5kZXhlZFBvaW50ZXIgZXJyb3I6IEludmFsaWQgaW5kZXhBcnJheTogJHtpbmRleEFycmF5fWApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiAndG9HZW5lcmljUG9pbnRlcicgZnVuY3Rpb25cbiAgICpcbiAgICogQ29tcGFyZXMgYW4gaW5kZXhlZCBwb2ludGVyIHRvIGFuIGFycmF5IG1hcCBhbmQgcmVtb3ZlcyBsaXN0IGFycmF5XG4gICAqIGluZGV4ZXMgKGJ1dCBsZWF2ZXMgdHVwbGUgYXJycmF5IGluZGV4ZXMgYW5kIGFsbCBvYmplY3Qga2V5cywgaW5jbHVkaW5nXG4gICAqIG51bWVyaWMga2V5cykgdG8gY3JlYXRlIGEgZ2VuZXJpYyBwb2ludGVyLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgdXNpbmcgdGhlIGluZGV4ZWQgcG9pbnRlciAnL2Zvby8xL2Jhci8yL2Jhei8zJyBhbmRcbiAgICogdGhlIGFycmF5TWFwIFtbJy9mb28nLCAwXSwgWycvZm9vLy0vYmFyJywgM10sIFsnL2Zvby8tL2Jhci8tL2JheicsIDBdXVxuICAgKiB3b3VsZCByZXN1bHQgaW4gdGhlIGdlbmVyaWMgcG9pbnRlciAnL2Zvby8tL2Jhci8yL2Jhei8tJ1xuICAgKiBVc2luZyB0aGUgaW5kZXhlZCBwb2ludGVyICcvZm9vLzEvYmFyLzQvYmF6LzMnIGFuZCB0aGUgc2FtZSBhcnJheU1hcFxuICAgKiB3b3VsZCByZXN1bHQgaW4gdGhlIGdlbmVyaWMgcG9pbnRlciAnL2Zvby8tL2Jhci8tL2Jhei8tJ1xuICAgKiAodGhlIGJhciBhcnJheSBoYXMgMyB0dXBsZSBpdGVtcywgc28gaW5kZXggMiBpcyByZXRhaW5lZCwgYnV0IDQgaXMgcmVtb3ZlZClcbiAgICpcbiAgICogVGhlIHN0cnVjdHVyZSBvZiB0aGUgYXJyYXlNYXAgaXM6IFtbJ3BhdGggdG8gYXJyYXknLCBudW1iZXIgb2YgdHVwbGUgaXRlbXNdLi4uXVxuICAgKlxuICAgKlxuICAgKiAvLyAgeyBQb2ludGVyIH0gaW5kZXhlZFBvaW50ZXIgLSBUaGUgaW5kZXhlZCBwb2ludGVyIChhcnJheSBvciBzdHJpbmcpXG4gICAqIC8vICB7IE1hcDxzdHJpbmcsIG51bWJlcj4gfSBhcnJheU1hcCAtIFRoZSBvcHRpb25hbCBhcnJheSBtYXAgKGZvciBwcmVzZXJ2aW5nIHR1cGxlIGluZGV4ZXMpXG4gICAqIC8vIHsgc3RyaW5nIH0gLSBUaGUgZ2VuZXJpYyBwb2ludGVyIHdpdGggaW5kZXhlcyByZW1vdmVkXG4gICAqL1xuICBzdGF0aWMgdG9HZW5lcmljUG9pbnRlcihpbmRleGVkUG9pbnRlciwgYXJyYXlNYXAgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpKSB7XG4gICAgaWYgKHRoaXMuaXNKc29uUG9pbnRlcihpbmRleGVkUG9pbnRlcikgJiYgaXNNYXAoYXJyYXlNYXApKSB7XG4gICAgICBjb25zdCBwb2ludGVyQXJyYXkgPSB0aGlzLnBhcnNlKGluZGV4ZWRQb2ludGVyKTtcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcG9pbnRlckFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHN1YlBvaW50ZXIgPSB0aGlzLmNvbXBpbGUocG9pbnRlckFycmF5LnNsaWNlKDAsIGkpKTtcbiAgICAgICAgaWYgKGFycmF5TWFwLmhhcyhzdWJQb2ludGVyKSAmJlxuICAgICAgICAgIGFycmF5TWFwLmdldChzdWJQb2ludGVyKSA8PSArcG9pbnRlckFycmF5W2ldXG4gICAgICAgICkge1xuICAgICAgICAgIHBvaW50ZXJBcnJheVtpXSA9ICctJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuY29tcGlsZShwb2ludGVyQXJyYXkpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNKc29uUG9pbnRlcihpbmRleGVkUG9pbnRlcikpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYHRvR2VuZXJpY1BvaW50ZXIgZXJyb3I6IGludmFsaWQgSlNPTiBQb2ludGVyOiAke2luZGV4ZWRQb2ludGVyfWApO1xuICAgIH1cbiAgICBpZiAoIWlzTWFwKGFycmF5TWFwKSkge1xuICAgICAgY29uc29sZS5lcnJvcihgdG9HZW5lcmljUG9pbnRlciBlcnJvcjogaW52YWxpZCBhcnJheU1hcDogJHthcnJheU1hcH1gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ3RvQ29udHJvbFBvaW50ZXInIGZ1bmN0aW9uXG4gICAqXG4gICAqIEFjY2VwdHMgYSBKU09OIFBvaW50ZXIgZm9yIGEgZGF0YSBvYmplY3QgYW5kIHJldHVybnMgYSBKU09OIFBvaW50ZXIgZm9yIHRoZVxuICAgKiBtYXRjaGluZyBjb250cm9sIGluIGFuIEFuZ3VsYXIgRm9ybUdyb3VwLlxuICAgKlxuICAgKiAvLyAgeyBQb2ludGVyIH0gZGF0YVBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSkgdG8gYSBkYXRhIG9iamVjdFxuICAgKiAvLyAgeyBGb3JtR3JvdXAgfSBmb3JtR3JvdXAgLSBBbmd1bGFyIEZvcm1Hcm91cCB0byBnZXQgdmFsdWUgZnJvbVxuICAgKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBjb250cm9sTXVzdEV4aXN0IC0gT25seSByZXR1cm4gaWYgY29udHJvbCBleGlzdHM/XG4gICAqIC8vIHsgUG9pbnRlciB9IC0gSlNPTiBQb2ludGVyIChzdHJpbmcpIHRvIHRoZSBmb3JtR3JvdXAgb2JqZWN0XG4gICAqL1xuICBzdGF0aWMgdG9Db250cm9sUG9pbnRlcihkYXRhUG9pbnRlciwgZm9ybUdyb3VwLCBjb250cm9sTXVzdEV4aXN0ID0gZmFsc2UpIHtcbiAgICBjb25zdCBkYXRhUG9pbnRlckFycmF5ID0gdGhpcy5wYXJzZShkYXRhUG9pbnRlcik7XG4gICAgY29uc3QgY29udHJvbFBvaW50ZXJBcnJheTogc3RyaW5nW10gPSBbXTtcbiAgICBsZXQgc3ViR3JvdXAgPSBmb3JtR3JvdXA7XG4gICAgaWYgKGRhdGFQb2ludGVyQXJyYXkgIT09IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGRhdGFQb2ludGVyQXJyYXkpIHtcbiAgICAgICAgaWYgKGhhc093bihzdWJHcm91cCwgJ2NvbnRyb2xzJykpIHtcbiAgICAgICAgICBjb250cm9sUG9pbnRlckFycmF5LnB1c2goJ2NvbnRyb2xzJyk7XG4gICAgICAgICAgc3ViR3JvdXAgPSBzdWJHcm91cC5jb250cm9scztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBcnJheShzdWJHcm91cCkgJiYgKGtleSA9PT0gJy0nKSkge1xuICAgICAgICAgIGNvbnRyb2xQb2ludGVyQXJyYXkucHVzaCgoc3ViR3JvdXAubGVuZ3RoIC0gMSkudG9TdHJpbmcoKSk7XG4gICAgICAgICAgc3ViR3JvdXAgPSBzdWJHcm91cFtzdWJHcm91cC5sZW5ndGggLSAxXTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPd24oc3ViR3JvdXAsIGtleSkpIHtcbiAgICAgICAgICBjb250cm9sUG9pbnRlckFycmF5LnB1c2goa2V5KTtcbiAgICAgICAgICBzdWJHcm91cCA9IHN1Ykdyb3VwW2tleV07XG4gICAgICAgIH0gZWxzZSBpZiAoY29udHJvbE11c3RFeGlzdCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYHRvQ29udHJvbFBvaW50ZXIgZXJyb3I6IFVuYWJsZSB0byBmaW5kIFwiJHtrZXl9XCIgaXRlbSBpbiBGb3JtR3JvdXAuYCk7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihkYXRhUG9pbnRlcik7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihmb3JtR3JvdXApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb250cm9sUG9pbnRlckFycmF5LnB1c2goa2V5KTtcbiAgICAgICAgICBzdWJHcm91cCA9IHsgY29udHJvbHM6IHt9IH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmNvbXBpbGUoY29udHJvbFBvaW50ZXJBcnJheSk7XG4gICAgfVxuICAgIGNvbnNvbGUuZXJyb3IoYHRvQ29udHJvbFBvaW50ZXIgZXJyb3I6IEludmFsaWQgSlNPTiBQb2ludGVyOiAke2RhdGFQb2ludGVyfWApO1xuICB9XG5cbiAgLyoqXG4gICAqICd0b1NjaGVtYVBvaW50ZXInIGZ1bmN0aW9uXG4gICAqXG4gICAqIEFjY2VwdHMgYSBKU09OIFBvaW50ZXIgdG8gYSB2YWx1ZSBpbnNpZGUgYSBkYXRhIG9iamVjdCBhbmQgYSBKU09OIHNjaGVtYVxuICAgKiBmb3IgdGhhdCBvYmplY3QuXG4gICAqXG4gICAqIFJldHVybnMgYSBQb2ludGVyIHRvIHRoZSBzdWItc2NoZW1hIGZvciB0aGUgdmFsdWUgaW5zaWRlIHRoZSBvYmplY3QncyBzY2hlbWEuXG4gICAqXG4gICAqIC8vICB7IFBvaW50ZXIgfSBkYXRhUG9pbnRlciAtIEpTT04gUG9pbnRlciAoc3RyaW5nIG9yIGFycmF5KSB0byBhbiBvYmplY3RcbiAgICogLy8gICBzY2hlbWEgLSBKU09OIHNjaGVtYSBmb3IgdGhlIG9iamVjdFxuICAgKiAvLyB7IFBvaW50ZXIgfSAtIEpTT04gUG9pbnRlciAoc3RyaW5nKSB0byB0aGUgb2JqZWN0J3Mgc2NoZW1hXG4gICAqL1xuICBzdGF0aWMgdG9TY2hlbWFQb2ludGVyKGRhdGFQb2ludGVyLCBzY2hlbWEpIHtcbiAgICBpZiAodGhpcy5pc0pzb25Qb2ludGVyKGRhdGFQb2ludGVyKSAmJiB0eXBlb2Ygc2NoZW1hID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgcG9pbnRlckFycmF5ID0gdGhpcy5wYXJzZShkYXRhUG9pbnRlcik7XG4gICAgICBpZiAoIXBvaW50ZXJBcnJheS5sZW5ndGgpIHsgcmV0dXJuICcnOyB9XG4gICAgICBjb25zdCBmaXJzdEtleSA9IHBvaW50ZXJBcnJheS5zaGlmdCgpO1xuICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnb2JqZWN0JyB8fCBzY2hlbWEucHJvcGVydGllcyB8fCBzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMpIHtcbiAgICAgICAgaWYgKChzY2hlbWEucHJvcGVydGllcyB8fCB7fSlbZmlyc3RLZXldKSB7XG4gICAgICAgICAgcmV0dXJuIGAvcHJvcGVydGllcy8ke3RoaXMuZXNjYXBlKGZpcnN0S2V5KX1gICtcbiAgICAgICAgICAgIHRoaXMudG9TY2hlbWFQb2ludGVyKHBvaW50ZXJBcnJheSwgc2NoZW1hLnByb3BlcnRpZXNbZmlyc3RLZXldKTtcbiAgICAgICAgfSBlbHNlICBpZiAoc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgcmV0dXJuICcvYWRkaXRpb25hbFByb3BlcnRpZXMnICtcbiAgICAgICAgICAgIHRoaXMudG9TY2hlbWFQb2ludGVyKHBvaW50ZXJBcnJheSwgc2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKChzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyB8fCBzY2hlbWEuaXRlbXMpICYmXG4gICAgICAgIChpc051bWJlcihmaXJzdEtleSkgfHwgZmlyc3RLZXkgPT09ICctJyB8fCBmaXJzdEtleSA9PT0gJycpXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgYXJyYXlJdGVtID0gZmlyc3RLZXkgPT09ICctJyB8fCBmaXJzdEtleSA9PT0gJycgPyAwIDogK2ZpcnN0S2V5O1xuICAgICAgICBpZiAoaXNBcnJheShzY2hlbWEuaXRlbXMpKSB7XG4gICAgICAgICAgaWYgKGFycmF5SXRlbSA8IHNjaGVtYS5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiAnL2l0ZW1zLycgKyBhcnJheUl0ZW0gK1xuICAgICAgICAgICAgICB0aGlzLnRvU2NoZW1hUG9pbnRlcihwb2ludGVyQXJyYXksIHNjaGVtYS5pdGVtc1thcnJheUl0ZW1dKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpIHtcbiAgICAgICAgICAgIHJldHVybiAnL2FkZGl0aW9uYWxJdGVtcycgK1xuICAgICAgICAgICAgICB0aGlzLnRvU2NoZW1hUG9pbnRlcihwb2ludGVyQXJyYXksIHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChzY2hlbWEuaXRlbXMpKSB7XG4gICAgICAgICAgcmV0dXJuICcvaXRlbXMnICsgdGhpcy50b1NjaGVtYVBvaW50ZXIocG9pbnRlckFycmF5LCBzY2hlbWEuaXRlbXMpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpKSB7XG4gICAgICAgICAgcmV0dXJuICcvYWRkaXRpb25hbEl0ZW1zJyArXG4gICAgICAgICAgICB0aGlzLnRvU2NoZW1hUG9pbnRlcihwb2ludGVyQXJyYXksIHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zb2xlLmVycm9yKGB0b1NjaGVtYVBvaW50ZXIgZXJyb3I6IERhdGEgcG9pbnRlciAke2RhdGFQb2ludGVyfSBgICtcbiAgICAgICAgYG5vdCBjb21wYXRpYmxlIHdpdGggc2NoZW1hICR7c2NoZW1hfWApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICghdGhpcy5pc0pzb25Qb2ludGVyKGRhdGFQb2ludGVyKSkge1xuICAgICAgY29uc29sZS5lcnJvcihgdG9TY2hlbWFQb2ludGVyIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtkYXRhUG9pbnRlcn1gKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzY2hlbWEgIT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGB0b1NjaGVtYVBvaW50ZXIgZXJyb3I6IEludmFsaWQgSlNPTiBTY2hlbWE6ICR7c2NoZW1hfWApO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiAndG9EYXRhUG9pbnRlcicgZnVuY3Rpb25cbiAgICpcbiAgICogQWNjZXB0cyBhIEpTT04gUG9pbnRlciB0byBhIHN1Yi1zY2hlbWEgaW5zaWRlIGEgSlNPTiBzY2hlbWEgYW5kIHRoZSBzY2hlbWEuXG4gICAqXG4gICAqIElmIHBvc3NpYmxlLCByZXR1cm5zIGEgZ2VuZXJpYyBQb2ludGVyIHRvIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlIGluc2lkZVxuICAgKiB0aGUgZGF0YSBvYmplY3QgZGVzY3JpYmVkIGJ5IHRoZSBKU09OIHNjaGVtYS5cbiAgICpcbiAgICogUmV0dXJucyBudWxsIGlmIHRoZSBzdWItc2NoZW1hIGlzIGluIGFuIGFtYmlndW91cyBsb2NhdGlvbiAoc3VjaCBhc1xuICAgKiBkZWZpbml0aW9ucyBvciBhZGRpdGlvbmFsUHJvcGVydGllcykgd2hlcmUgdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVcbiAgICogbG9jYXRpb24gY2Fubm90IGJlIGRldGVybWluZWQuXG4gICAqXG4gICAqIC8vICB7IFBvaW50ZXIgfSBzY2hlbWFQb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpIHRvIGEgSlNPTiBzY2hlbWFcbiAgICogLy8gICBzY2hlbWEgLSB0aGUgSlNPTiBzY2hlbWFcbiAgICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gZXJyb3JzIC0gU2hvdyBlcnJvcnM/XG4gICAqIC8vIHsgUG9pbnRlciB9IC0gSlNPTiBQb2ludGVyIChzdHJpbmcpIHRvIHRoZSB2YWx1ZSBpbiB0aGUgZGF0YSBvYmplY3RcbiAgICovXG4gIHN0YXRpYyB0b0RhdGFQb2ludGVyKHNjaGVtYVBvaW50ZXIsIHNjaGVtYSwgZXJyb3JzID0gZmFsc2UpIHtcbiAgICBpZiAodGhpcy5pc0pzb25Qb2ludGVyKHNjaGVtYVBvaW50ZXIpICYmIHR5cGVvZiBzY2hlbWEgPT09ICdvYmplY3QnICYmXG4gICAgICB0aGlzLmhhcyhzY2hlbWEsIHNjaGVtYVBvaW50ZXIpXG4gICAgKSB7XG4gICAgICBjb25zdCBwb2ludGVyQXJyYXkgPSB0aGlzLnBhcnNlKHNjaGVtYVBvaW50ZXIpO1xuICAgICAgaWYgKCFwb2ludGVyQXJyYXkubGVuZ3RoKSB7IHJldHVybiAnJzsgfVxuICAgICAgY29uc3QgZmlyc3RLZXkgPSBwb2ludGVyQXJyYXkuc2hpZnQoKTtcbiAgICAgIGlmIChmaXJzdEtleSA9PT0gJ3Byb3BlcnRpZXMnIHx8XG4gICAgICAgIChmaXJzdEtleSA9PT0gJ2l0ZW1zJyAmJiBpc0FycmF5KHNjaGVtYS5pdGVtcykpXG4gICAgICApIHtcbiAgICAgICAgY29uc3Qgc2Vjb25kS2V5ID0gcG9pbnRlckFycmF5LnNoaWZ0KCk7XG4gICAgICAgIGNvbnN0IHBvaW50ZXJTdWZmaXggPSB0aGlzLnRvRGF0YVBvaW50ZXIocG9pbnRlckFycmF5LCBzY2hlbWFbZmlyc3RLZXldW3NlY29uZEtleV0pO1xuICAgICAgICByZXR1cm4gcG9pbnRlclN1ZmZpeCA9PT0gbnVsbCA/IG51bGwgOiAnLycgKyBzZWNvbmRLZXkgKyBwb2ludGVyU3VmZml4O1xuICAgICAgfSBlbHNlIGlmIChmaXJzdEtleSA9PT0gJ2FkZGl0aW9uYWxJdGVtcycgfHxcbiAgICAgICAgKGZpcnN0S2V5ID09PSAnaXRlbXMnICYmIGlzT2JqZWN0KHNjaGVtYS5pdGVtcykpXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgcG9pbnRlclN1ZmZpeCA9IHRoaXMudG9EYXRhUG9pbnRlcihwb2ludGVyQXJyYXksIHNjaGVtYVtmaXJzdEtleV0pO1xuICAgICAgICByZXR1cm4gcG9pbnRlclN1ZmZpeCA9PT0gbnVsbCA/IG51bGwgOiAnLy0nICsgcG9pbnRlclN1ZmZpeDtcbiAgICAgIH0gZWxzZSBpZiAoWydhbGxPZicsICdhbnlPZicsICdvbmVPZiddLmluY2x1ZGVzKGZpcnN0S2V5KSkge1xuICAgICAgICBjb25zdCBzZWNvbmRLZXkgPSBwb2ludGVyQXJyYXkuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9EYXRhUG9pbnRlcihwb2ludGVyQXJyYXksIHNjaGVtYVtmaXJzdEtleV1bc2Vjb25kS2V5XSk7XG4gICAgICB9IGVsc2UgaWYgKGZpcnN0S2V5ID09PSAnbm90Jykge1xuICAgICAgICByZXR1cm4gdGhpcy50b0RhdGFQb2ludGVyKHBvaW50ZXJBcnJheSwgc2NoZW1hW2ZpcnN0S2V5XSk7XG4gICAgICB9IGVsc2UgaWYgKFsnY29udGFpbnMnLCAnZGVmaW5pdGlvbnMnLCAnZGVwZW5kZW5jaWVzJywgJ2FkZGl0aW9uYWxJdGVtcycsXG4gICAgICAgICdhZGRpdGlvbmFsUHJvcGVydGllcycsICdwYXR0ZXJuUHJvcGVydGllcycsICdwcm9wZXJ0eU5hbWVzJ10uaW5jbHVkZXMoZmlyc3RLZXkpXG4gICAgICApIHtcbiAgICAgICAgaWYgKGVycm9ycykgeyBjb25zb2xlLmVycm9yKGB0b0RhdGFQb2ludGVyIGVycm9yOiBBbWJpZ3VvdXMgbG9jYXRpb25gKTsgfVxuICAgICAgfVxuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBpZiAoZXJyb3JzKSB7XG4gICAgICBpZiAoIXRoaXMuaXNKc29uUG9pbnRlcihzY2hlbWFQb2ludGVyKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGB0b0RhdGFQb2ludGVyIGVycm9yOiBJbnZhbGlkIEpTT04gUG9pbnRlcjogJHtzY2hlbWFQb2ludGVyfWApO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBzY2hlbWEgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHRvRGF0YVBvaW50ZXIgZXJyb3I6IEludmFsaWQgSlNPTiBTY2hlbWE6ICR7c2NoZW1hfWApO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBzY2hlbWEgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYHRvRGF0YVBvaW50ZXIgZXJyb3I6IFBvaW50ZXIgJHtzY2hlbWFQb2ludGVyfSBpbnZhbGlkIGZvciBTY2hlbWE6ICR7c2NoZW1hfWApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiAncGFyc2VPYmplY3RQYXRoJyBmdW5jdGlvblxuICAgKlxuICAgKiBQYXJzZXMgYSBKYXZhU2NyaXB0IG9iamVjdCBwYXRoIGludG8gYW4gYXJyYXkgb2Yga2V5cywgd2hpY2hcbiAgICogY2FuIHRoZW4gYmUgcGFzc2VkIHRvIGNvbXBpbGUoKSB0byBjb252ZXJ0IGludG8gYSBzdHJpbmcgSlNPTiBQb2ludGVyLlxuICAgKlxuICAgKiBCYXNlZCBvbiBtaWtlLW1hcmNhY2NpJ3MgZXhjZWxsZW50IG9iamVjdHBhdGggcGFyc2UgZnVuY3Rpb246XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9taWtlLW1hcmNhY2NpL29iamVjdHBhdGhcbiAgICpcbiAgICogLy8gIHsgUG9pbnRlciB9IHBhdGggLSBUaGUgb2JqZWN0IHBhdGggdG8gcGFyc2VcbiAgICogLy8geyBzdHJpbmdbXSB9IC0gVGhlIHJlc3VsdGluZyBhcnJheSBvZiBrZXlzXG4gICAqL1xuICBzdGF0aWMgcGFyc2VPYmplY3RQYXRoKHBhdGgpIHtcbiAgICBpZiAoaXNBcnJheShwYXRoKSkgeyByZXR1cm4gPHN0cmluZ1tdPnBhdGg7IH1cbiAgICBpZiAodGhpcy5pc0pzb25Qb2ludGVyKHBhdGgpKSB7IHJldHVybiB0aGlzLnBhcnNlKHBhdGgpOyB9XG4gICAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgbGV0IGluZGV4ID0gMDtcbiAgICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgd2hpbGUgKGluZGV4IDwgcGF0aC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgbmV4dERvdCA9IHBhdGguaW5kZXhPZignLicsIGluZGV4KTtcbiAgICAgICAgY29uc3QgbmV4dE9CID0gcGF0aC5pbmRleE9mKCdbJywgaW5kZXgpOyAvLyBuZXh0IG9wZW4gYnJhY2tldFxuICAgICAgICBpZiAobmV4dERvdCA9PT0gLTEgJiYgbmV4dE9CID09PSAtMSkgeyAvLyBsYXN0IGl0ZW1cbiAgICAgICAgICBwYXJ0cy5wdXNoKHBhdGguc2xpY2UoaW5kZXgpKTtcbiAgICAgICAgICBpbmRleCA9IHBhdGgubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKG5leHREb3QgIT09IC0xICYmIChuZXh0RG90IDwgbmV4dE9CIHx8IG5leHRPQiA9PT0gLTEpKSB7IC8vIGRvdCBub3RhdGlvblxuICAgICAgICAgIHBhcnRzLnB1c2gocGF0aC5zbGljZShpbmRleCwgbmV4dERvdCkpO1xuICAgICAgICAgIGluZGV4ID0gbmV4dERvdCArIDE7XG4gICAgICAgIH0gZWxzZSB7IC8vIGJyYWNrZXQgbm90YXRpb25cbiAgICAgICAgICBpZiAobmV4dE9CID4gaW5kZXgpIHtcbiAgICAgICAgICAgIHBhcnRzLnB1c2gocGF0aC5zbGljZShpbmRleCwgbmV4dE9CKSk7XG4gICAgICAgICAgICBpbmRleCA9IG5leHRPQjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgcXVvdGUgPSBwYXRoLmNoYXJBdChuZXh0T0IgKyAxKTtcbiAgICAgICAgICBpZiAocXVvdGUgPT09ICdcIicgfHwgcXVvdGUgPT09ICdcXCcnKSB7IC8vIGVuY2xvc2luZyBxdW90ZXNcbiAgICAgICAgICAgIGxldCBuZXh0Q0IgPSBwYXRoLmluZGV4T2YocXVvdGUgKyAnXScsIG5leHRPQik7IC8vIG5leHQgY2xvc2UgYnJhY2tldFxuICAgICAgICAgICAgd2hpbGUgKG5leHRDQiAhPT0gLTEgJiYgcGF0aC5jaGFyQXQobmV4dENCIC0gMSkgPT09ICdcXFxcJykge1xuICAgICAgICAgICAgICBuZXh0Q0IgPSBwYXRoLmluZGV4T2YocXVvdGUgKyAnXScsIG5leHRDQiArIDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5leHRDQiA9PT0gLTEpIHsgbmV4dENCID0gcGF0aC5sZW5ndGg7IH1cbiAgICAgICAgICAgIHBhcnRzLnB1c2gocGF0aC5zbGljZShpbmRleCArIDIsIG5leHRDQilcbiAgICAgICAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgnXFxcXCcgKyBxdW90ZSwgJ2cnKSwgcXVvdGUpKTtcbiAgICAgICAgICAgIGluZGV4ID0gbmV4dENCICsgMjtcbiAgICAgICAgICB9IGVsc2UgeyAvLyBubyBlbmNsb3NpbmcgcXVvdGVzXG4gICAgICAgICAgICBsZXQgbmV4dENCID0gcGF0aC5pbmRleE9mKCddJywgbmV4dE9CKTsgLy8gbmV4dCBjbG9zZSBicmFja2V0XG4gICAgICAgICAgICBpZiAobmV4dENCID09PSAtMSkgeyBuZXh0Q0IgPSBwYXRoLmxlbmd0aDsgfVxuICAgICAgICAgICAgcGFydHMucHVzaChwYXRoLnNsaWNlKGluZGV4ICsgMSwgbmV4dENCKSk7XG4gICAgICAgICAgICBpbmRleCA9IG5leHRDQiArIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwYXRoLmNoYXJBdChpbmRleCkgPT09ICcuJykgeyBpbmRleCsrOyB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJ0cztcbiAgICB9XG4gICAgY29uc29sZS5lcnJvcigncGFyc2VPYmplY3RQYXRoIGVycm9yOiBJbnB1dCBvYmplY3QgcGF0aCBtdXN0IGJlIGEgc3RyaW5nLicpO1xuICB9XG59XG4iXX0=
