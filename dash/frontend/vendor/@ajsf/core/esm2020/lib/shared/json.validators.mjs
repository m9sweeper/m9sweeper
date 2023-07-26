import isEqual from 'lodash/isEqual';
import { _executeAsyncValidators, _executeValidators, _mergeErrors, _mergeObjects, getType, hasValue, isArray, isBoolean, isDefined, isEmpty, isNumber, isString, isType, toJavaScriptType, toObservable, xor } from './validator.functions.mjs';
import { forEachCopy } from './utility.functions.mjs';
import { forkJoin } from 'rxjs';
import { jsonSchemaFormatTests } from './format-regex.constants.mjs';
import { map } from 'rxjs/operators';
/**
 * 'JsonValidators' class
 *
 * Provides an extended set of validators to be used by form controls,
 * compatible with standard JSON Schema validation options.
 * http://json-schema.org/latest/json-schema-validation.html
 *
 * Note: This library is designed as a drop-in replacement for the Angular
 * Validators library, and except for one small breaking change to the 'pattern'
 * validator (described below) it can even be imported as a substitute, like so:
 *
 *   import { JsonValidators as Validators } from 'json-validators';
 *
 * and it should work with existing code as a complete replacement.
 *
 * The one exception is the 'pattern' validator, which has been changed to
 * matche partial values by default (the standard 'pattern' validator wrapped
 * all patterns in '^' and '$', forcing them to always match an entire value).
 * However, the old behavior can be restored by simply adding '^' and '$'
 * around your patterns, or by passing an optional second parameter of TRUE.
 * This change is to make the 'pattern' validator match the behavior of a
 * JSON Schema pattern, which allows partial matches, rather than the behavior
 * of an HTML input control pattern, which does not.
 *
 * This library replaces Angular's validators and combination functions
 * with the following validators and transformation functions:
 *
 * Validators:
 *   For all formControls:     required (*), type, enum, const
 *   For text formControls:    minLength (*), maxLength (*), pattern (*), format
 *   For numeric formControls: maximum, exclusiveMaximum,
 *                             minimum, exclusiveMinimum, multipleOf
 *   For formGroup objects:    minProperties, maxProperties, dependencies
 *   For formArray arrays:     minItems, maxItems, uniqueItems, contains
 *   Not used by JSON Schema:  min (*), max (*), requiredTrue (*), email (*)
 * (Validators originally included with Angular are maked with (*).)
 *
 * NOTE / TODO: The dependencies validator is not complete.
 * NOTE / TODO: The contains validator is not complete.
 *
 * Validators not used by JSON Schema (but included for compatibility)
 * and their JSON Schema equivalents:
 *
 *   Angular validator | JSON Schema equivalent
 *   ------------------|-----------------------
 *     min(number)     |   minimum(number)
 *     max(number)     |   maximum(number)
 *     requiredTrue()  |   const(true)
 *     email()         |   format('email')
 *
 * Validator transformation functions:
 *   composeAnyOf, composeOneOf, composeAllOf, composeNot
 * (Angular's original combination funciton, 'compose', is also included for
 * backward compatibility, though it is functionally equivalent to composeAllOf,
 * asside from its more generic error message.)
 *
 * All validators have also been extended to accept an optional second argument
 * which, if passed a TRUE value, causes the validator to perform the opposite
 * of its original finction. (This is used internally to enable 'not' and
 * 'composeOneOf' to function and return useful error messages.)
 *
 * The 'required' validator has also been overloaded so that if called with
 * a boolean parameter (or no parameters) it returns the original validator
 * function (rather than executing it). However, if it is called with an
 * AbstractControl parameter (as was previously required), it behaves
 * exactly as before.
 *
 * This enables all validators (including 'required') to be constructed in
 * exactly the same way, so they can be automatically applied using the
 * equivalent key names and values taken directly from a JSON Schema.
 *
 * This source code is partially derived from Angular,
 * which is Copyright (c) 2014-2017 Google, Inc.
 * Use of this source code is therefore governed by the same MIT-style license
 * that can be found in the LICENSE file at https://angular.io/license
 *
 * Original Angular Validators:
 * https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts
 */
export class JsonValidators {
    static required(input) {
        if (input === undefined) {
            input = true;
        }
        switch (input) {
            case true: // Return required function (do not execute it yet)
                return (control, invert = false) => {
                    if (invert) {
                        return null;
                    } // if not required, always return valid
                    return hasValue(control.value) ? null : { 'required': true };
                };
            case false: // Do nothing (if field is not required, it is always valid)
                return JsonValidators.nullValidator;
            default: // Execute required function
                return hasValue(input.value) ? null : { 'required': true };
        }
    }
    /**
     * 'type' validator
     *
     * Requires a control to only accept values of a specified type,
     * or one of an array of types.
     *
     * Note: SchemaPrimitiveType = 'string'|'number'|'integer'|'boolean'|'null'
     *
     * // {SchemaPrimitiveType|SchemaPrimitiveType[]} type - type(s) to accept
     * // {IValidatorFn}
     */
    static type(requiredType) {
        if (!hasValue(requiredType)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentValue = control.value;
            const isValid = isArray(requiredType) ?
                requiredType.some(type => isType(currentValue, type)) :
                isType(currentValue, requiredType);
            return xor(isValid, invert) ?
                null : { 'type': { requiredType, currentValue } };
        };
    }
    /**
     * 'enum' validator
     *
     * Requires a control to have a value from an enumerated list of values.
     *
     * Converts types as needed to allow string inputs to still correctly
     * match number, boolean, and null enum values.
     *
     * // {any[]} allowedValues - array of acceptable values
     * // {IValidatorFn}
     */
    static enum(allowedValues) {
        if (!isArray(allowedValues)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentValue = control.value;
            const isEqualVal = (enumValue, inputValue) => enumValue === inputValue ||
                (isNumber(enumValue) && +inputValue === +enumValue) ||
                (isBoolean(enumValue, 'strict') &&
                    toJavaScriptType(inputValue, 'boolean') === enumValue) ||
                (enumValue === null && !hasValue(inputValue)) ||
                isEqual(enumValue, inputValue);
            const isValid = isArray(currentValue) ?
                currentValue.every(inputValue => allowedValues.some(enumValue => isEqualVal(enumValue, inputValue))) :
                allowedValues.some(enumValue => isEqualVal(enumValue, currentValue));
            return xor(isValid, invert) ?
                null : { 'enum': { allowedValues, currentValue } };
        };
    }
    /**
     * 'const' validator
     *
     * Requires a control to have a specific value.
     *
     * Converts types as needed to allow string inputs to still correctly
     * match number, boolean, and null values.
     *
     * TODO: modify to work with objects
     *
     * // {any[]} requiredValue - required value
     * // {IValidatorFn}
     */
    static const(requiredValue) {
        if (!hasValue(requiredValue)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentValue = control.value;
            const isEqualVal = (constValue, inputValue) => constValue === inputValue ||
                isNumber(constValue) && +inputValue === +constValue ||
                isBoolean(constValue, 'strict') &&
                    toJavaScriptType(inputValue, 'boolean') === constValue ||
                constValue === null && !hasValue(inputValue);
            const isValid = isEqualVal(requiredValue, currentValue);
            return xor(isValid, invert) ?
                null : { 'const': { requiredValue, currentValue } };
        };
    }
    /**
     * 'minLength' validator
     *
     * Requires a control's text value to be greater than a specified length.
     *
     * // {number} minimumLength - minimum allowed string length
     * // {boolean = false} invert - instead return error object only if valid
     * // {IValidatorFn}
     */
    static minLength(minimumLength) {
        if (!hasValue(minimumLength)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentLength = isString(control.value) ? control.value.length : 0;
            const isValid = currentLength >= minimumLength;
            return xor(isValid, invert) ?
                null : { 'minLength': { minimumLength, currentLength } };
        };
    }
    /**
     * 'maxLength' validator
     *
     * Requires a control's text value to be less than a specified length.
     *
     * // {number} maximumLength - maximum allowed string length
     * // {boolean = false} invert - instead return error object only if valid
     * // {IValidatorFn}
     */
    static maxLength(maximumLength) {
        if (!hasValue(maximumLength)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            const currentLength = isString(control.value) ? control.value.length : 0;
            const isValid = currentLength <= maximumLength;
            return xor(isValid, invert) ?
                null : { 'maxLength': { maximumLength, currentLength } };
        };
    }
    /**
     * 'pattern' validator
     *
     * Note: NOT the same as Angular's default pattern validator.
     *
     * Requires a control's value to match a specified regular expression pattern.
     *
     * This validator changes the behavior of default pattern validator
     * by replacing RegExp(`^${pattern}$`) with RegExp(`${pattern}`),
     * which allows for partial matches.
     *
     * To return to the default funcitonality, and match the entire string,
     * pass TRUE as the optional second parameter.
     *
     * // {string} pattern - regular expression pattern
     * // {boolean = false} wholeString - match whole value string?
     * // {IValidatorFn}
     */
    static pattern(pattern, wholeString = false) {
        if (!hasValue(pattern)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            let regex;
            let requiredPattern;
            if (typeof pattern === 'string') {
                requiredPattern = (wholeString) ? `^${pattern}$` : pattern;
                regex = new RegExp(requiredPattern);
            }
            else {
                requiredPattern = pattern.toString();
                regex = pattern;
            }
            const currentValue = control.value;
            const isValid = isString(currentValue) ? regex.test(currentValue) : false;
            return xor(isValid, invert) ?
                null : { 'pattern': { requiredPattern, currentValue } };
        };
    }
    /**
     * 'format' validator
     *
     * Requires a control to have a value of a certain format.
     *
     * This validator currently checks the following formsts:
     *   date, time, date-time, email, hostname, ipv4, ipv6,
     *   uri, uri-reference, uri-template, url, uuid, color,
     *   json-pointer, relative-json-pointer, regex
     *
     * Fast format regular expressions copied from AJV:
     * https://github.com/epoberezkin/ajv/blob/master/lib/compile/formats.js
     *
     * // {JsonSchemaFormatNames} requiredFormat - format to check
     * // {IValidatorFn}
     */
    static format(requiredFormat) {
        if (!hasValue(requiredFormat)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            let isValid;
            const currentValue = control.value;
            if (isString(currentValue)) {
                const formatTest = jsonSchemaFormatTests[requiredFormat];
                if (typeof formatTest === 'object') {
                    isValid = formatTest.test(currentValue);
                }
                else if (typeof formatTest === 'function') {
                    isValid = formatTest(currentValue);
                }
                else {
                    console.error(`format validator error: "${requiredFormat}" is not a recognized format.`);
                    isValid = true;
                }
            }
            else {
                // Allow JavaScript Date objects
                isValid = ['date', 'time', 'date-time'].includes(requiredFormat) &&
                    Object.prototype.toString.call(currentValue) === '[object Date]';
            }
            return xor(isValid, invert) ?
                null : { 'format': { requiredFormat, currentValue } };
        };
    }
    /**
     * 'minimum' validator
     *
     * Requires a control's numeric value to be greater than or equal to
     * a minimum amount.
     *
     * Any non-numeric value is also valid (according to the HTML forms spec,
     * a non-numeric value doesn't have a minimum).
     * https://www.w3.org/TR/html5/forms.html#attr-input-max
     *
     * // {number} minimum - minimum allowed value
     * // {IValidatorFn}
     */
    static minimum(minimumValue) {
        if (!hasValue(minimumValue)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentValue = control.value;
            const isValid = !isNumber(currentValue) || currentValue >= minimumValue;
            return xor(isValid, invert) ?
                null : { 'minimum': { minimumValue, currentValue } };
        };
    }
    /**
     * 'exclusiveMinimum' validator
     *
     * Requires a control's numeric value to be less than a maximum amount.
     *
     * Any non-numeric value is also valid (according to the HTML forms spec,
     * a non-numeric value doesn't have a maximum).
     * https://www.w3.org/TR/html5/forms.html#attr-input-max
     *
     * // {number} exclusiveMinimumValue - maximum allowed value
     * // {IValidatorFn}
     */
    static exclusiveMinimum(exclusiveMinimumValue) {
        if (!hasValue(exclusiveMinimumValue)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentValue = control.value;
            const isValid = !isNumber(currentValue) || +currentValue < exclusiveMinimumValue;
            return xor(isValid, invert) ?
                null : { 'exclusiveMinimum': { exclusiveMinimumValue, currentValue } };
        };
    }
    /**
     * 'maximum' validator
     *
     * Requires a control's numeric value to be less than or equal to
     * a maximum amount.
     *
     * Any non-numeric value is also valid (according to the HTML forms spec,
     * a non-numeric value doesn't have a maximum).
     * https://www.w3.org/TR/html5/forms.html#attr-input-max
     *
     * // {number} maximumValue - maximum allowed value
     * // {IValidatorFn}
     */
    static maximum(maximumValue) {
        if (!hasValue(maximumValue)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentValue = control.value;
            const isValid = !isNumber(currentValue) || +currentValue <= maximumValue;
            return xor(isValid, invert) ?
                null : { 'maximum': { maximumValue, currentValue } };
        };
    }
    /**
     * 'exclusiveMaximum' validator
     *
     * Requires a control's numeric value to be less than a maximum amount.
     *
     * Any non-numeric value is also valid (according to the HTML forms spec,
     * a non-numeric value doesn't have a maximum).
     * https://www.w3.org/TR/html5/forms.html#attr-input-max
     *
     * // {number} exclusiveMaximumValue - maximum allowed value
     * // {IValidatorFn}
     */
    static exclusiveMaximum(exclusiveMaximumValue) {
        if (!hasValue(exclusiveMaximumValue)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentValue = control.value;
            const isValid = !isNumber(currentValue) || +currentValue < exclusiveMaximumValue;
            return xor(isValid, invert) ?
                null : { 'exclusiveMaximum': { exclusiveMaximumValue, currentValue } };
        };
    }
    /**
     * 'multipleOf' validator
     *
     * Requires a control to have a numeric value that is a multiple
     * of a specified number.
     *
     * // {number} multipleOfValue - number value must be a multiple of
     * // {IValidatorFn}
     */
    static multipleOf(multipleOfValue) {
        if (!hasValue(multipleOfValue)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentValue = control.value;
            const isValid = isNumber(currentValue) &&
                currentValue % multipleOfValue === 0;
            return xor(isValid, invert) ?
                null : { 'multipleOf': { multipleOfValue, currentValue } };
        };
    }
    /**
     * 'minProperties' validator
     *
     * Requires a form group to have a minimum number of properties (i.e. have
     * values entered in a minimum number of controls within the group).
     *
     * // {number} minimumProperties - minimum number of properties allowed
     * // {IValidatorFn}
     */
    static minProperties(minimumProperties) {
        if (!hasValue(minimumProperties)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentProperties = Object.keys(control.value).length || 0;
            const isValid = currentProperties >= minimumProperties;
            return xor(isValid, invert) ?
                null : { 'minProperties': { minimumProperties, currentProperties } };
        };
    }
    /**
     * 'maxProperties' validator
     *
     * Requires a form group to have a maximum number of properties (i.e. have
     * values entered in a maximum number of controls within the group).
     *
     * Note: Has no effect if the form group does not contain more than the
     * maximum number of controls.
     *
     * // {number} maximumProperties - maximum number of properties allowed
     * // {IValidatorFn}
     */
    static maxProperties(maximumProperties) {
        if (!hasValue(maximumProperties)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            const currentProperties = Object.keys(control.value).length || 0;
            const isValid = currentProperties <= maximumProperties;
            return xor(isValid, invert) ?
                null : { 'maxProperties': { maximumProperties, currentProperties } };
        };
    }
    /**
     * 'dependencies' validator
     *
     * Requires the controls in a form group to meet additional validation
     * criteria, depending on the values of other controls in the group.
     *
     * Examples:
     * https://spacetelescope.github.io/understanding-json-schema/reference/object.html#dependencies
     *
     * // {any} dependencies - required dependencies
     * // {IValidatorFn}
     */
    static dependencies(dependencies) {
        if (getType(dependencies) !== 'object' || isEmpty(dependencies)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const allErrors = _mergeObjects(forEachCopy(dependencies, (value, requiringField) => {
                if (!hasValue(control.value[requiringField])) {
                    return null;
                }
                let requiringFieldErrors = {};
                let requiredFields;
                let properties = {};
                if (getType(dependencies[requiringField]) === 'array') {
                    requiredFields = dependencies[requiringField];
                }
                else if (getType(dependencies[requiringField]) === 'object') {
                    requiredFields = dependencies[requiringField]['required'] || [];
                    properties = dependencies[requiringField]['properties'] || {};
                }
                // Validate property dependencies
                for (const requiredField of requiredFields) {
                    if (xor(!hasValue(control.value[requiredField]), invert)) {
                        requiringFieldErrors[requiredField] = { 'required': true };
                    }
                }
                // Validate schema dependencies
                requiringFieldErrors = _mergeObjects(requiringFieldErrors, forEachCopy(properties, (requirements, requiredField) => {
                    const requiredFieldErrors = _mergeObjects(forEachCopy(requirements, (requirement, parameter) => {
                        let validator = null;
                        if (requirement === 'maximum' || requirement === 'minimum') {
                            const exclusive = !!requirements['exclusiveM' + requirement.slice(1)];
                            validator = JsonValidators[requirement](parameter, exclusive);
                        }
                        else if (typeof JsonValidators[requirement] === 'function') {
                            validator = JsonValidators[requirement](parameter);
                        }
                        return !isDefined(validator) ?
                            null : validator(control.value[requiredField]);
                    }));
                    return isEmpty(requiredFieldErrors) ?
                        null : { [requiredField]: requiredFieldErrors };
                }));
                return isEmpty(requiringFieldErrors) ?
                    null : { [requiringField]: requiringFieldErrors };
            }));
            return isEmpty(allErrors) ? null : allErrors;
        };
    }
    /**
     * 'minItems' validator
     *
     * Requires a form array to have a minimum number of values.
     *
     * // {number} minimumItems - minimum number of items allowed
     * // {IValidatorFn}
     */
    static minItems(minimumItems) {
        if (!hasValue(minimumItems)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const currentItems = isArray(control.value) ? control.value.length : 0;
            const isValid = currentItems >= minimumItems;
            return xor(isValid, invert) ?
                null : { 'minItems': { minimumItems, currentItems } };
        };
    }
    /**
     * 'maxItems' validator
     *
     * Requires a form array to have a maximum number of values.
     *
     * // {number} maximumItems - maximum number of items allowed
     * // {IValidatorFn}
     */
    static maxItems(maximumItems) {
        if (!hasValue(maximumItems)) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            const currentItems = isArray(control.value) ? control.value.length : 0;
            const isValid = currentItems <= maximumItems;
            return xor(isValid, invert) ?
                null : { 'maxItems': { maximumItems, currentItems } };
        };
    }
    /**
     * 'uniqueItems' validator
     *
     * Requires values in a form array to be unique.
     *
     * // {boolean = true} unique? - true to validate, false to disable
     * // {IValidatorFn}
     */
    static uniqueItems(unique = true) {
        if (!unique) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const sorted = control.value.slice().sort();
            const duplicateItems = [];
            for (let i = 1; i < sorted.length; i++) {
                if (sorted[i - 1] === sorted[i] && duplicateItems.includes(sorted[i])) {
                    duplicateItems.push(sorted[i]);
                }
            }
            const isValid = !duplicateItems.length;
            return xor(isValid, invert) ?
                null : { 'uniqueItems': { duplicateItems } };
        };
    }
    /**
     * 'contains' validator
     *
     * TODO: Complete this validator
     *
     * Requires values in a form array to be unique.
     *
     * // {boolean = true} unique? - true to validate, false to disable
     * // {IValidatorFn}
     */
    static contains(requiredItem = true) {
        if (!requiredItem) {
            return JsonValidators.nullValidator;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value) || !isArray(control.value)) {
                return null;
            }
            const currentItems = control.value;
            // const isValid = currentItems.some(item =>
            //
            // );
            const isValid = true;
            return xor(isValid, invert) ?
                null : { 'contains': { requiredItem, currentItems } };
        };
    }
    /**
     * No-op validator. Included for backward compatibility.
     */
    static nullValidator(control) {
        return null;
    }
    /**
     * Validator transformation functions:
     * composeAnyOf, composeOneOf, composeAllOf, composeNot,
     * compose, composeAsync
     *
     * TODO: Add composeAnyOfAsync, composeOneOfAsync,
     *           composeAllOfAsync, composeNotAsync
     */
    /**
     * 'composeAnyOf' validator combination function
     *
     * Accepts an array of validators and returns a single validator that
     * evaluates to valid if any one or more of the submitted validators are
     * valid. If every validator is invalid, it returns combined errors from
     * all validators.
     *
     * // {IValidatorFn[]} validators - array of validators to combine
     * // {IValidatorFn} - single combined validator function
     */
    static composeAnyOf(validators) {
        if (!validators) {
            return null;
        }
        const presentValidators = validators.filter(isDefined);
        if (presentValidators.length === 0) {
            return null;
        }
        return (control, invert = false) => {
            const arrayOfErrors = _executeValidators(control, presentValidators, invert).filter(isDefined);
            const isValid = validators.length > arrayOfErrors.length;
            return xor(isValid, invert) ?
                null : _mergeObjects(...arrayOfErrors, { 'anyOf': !invert });
        };
    }
    /**
     * 'composeOneOf' validator combination function
     *
     * Accepts an array of validators and returns a single validator that
     * evaluates to valid only if exactly one of the submitted validators
     * is valid. Otherwise returns combined information from all validators,
     * both valid and invalid.
     *
     * // {IValidatorFn[]} validators - array of validators to combine
     * // {IValidatorFn} - single combined validator function
     */
    static composeOneOf(validators) {
        if (!validators) {
            return null;
        }
        const presentValidators = validators.filter(isDefined);
        if (presentValidators.length === 0) {
            return null;
        }
        return (control, invert = false) => {
            const arrayOfErrors = _executeValidators(control, presentValidators);
            const validControls = validators.length - arrayOfErrors.filter(isDefined).length;
            const isValid = validControls === 1;
            if (xor(isValid, invert)) {
                return null;
            }
            const arrayOfValids = _executeValidators(control, presentValidators, invert);
            return _mergeObjects(...arrayOfErrors, ...arrayOfValids, { 'oneOf': !invert });
        };
    }
    /**
     * 'composeAllOf' validator combination function
     *
     * Accepts an array of validators and returns a single validator that
     * evaluates to valid only if all the submitted validators are individually
     * valid. Otherwise it returns combined errors from all invalid validators.
     *
     * // {IValidatorFn[]} validators - array of validators to combine
     * // {IValidatorFn} - single combined validator function
     */
    static composeAllOf(validators) {
        if (!validators) {
            return null;
        }
        const presentValidators = validators.filter(isDefined);
        if (presentValidators.length === 0) {
            return null;
        }
        return (control, invert = false) => {
            const combinedErrors = _mergeErrors(_executeValidators(control, presentValidators, invert));
            const isValid = combinedErrors === null;
            return (xor(isValid, invert)) ?
                null : _mergeObjects(combinedErrors, { 'allOf': !invert });
        };
    }
    /**
     * 'composeNot' validator inversion function
     *
     * Accepts a single validator function and inverts its result.
     * Returns valid if the submitted validator is invalid, and
     * returns invalid if the submitted validator is valid.
     * (Note: this function can itself be inverted
     *   - e.g. composeNot(composeNot(validator)) -
     *   but this can be confusing and is therefore not recommended.)
     *
     * // {IValidatorFn[]} validators - validator(s) to invert
     * // {IValidatorFn} - new validator function that returns opposite result
     */
    static composeNot(validator) {
        if (!validator) {
            return null;
        }
        return (control, invert = false) => {
            if (isEmpty(control.value)) {
                return null;
            }
            const error = validator(control, !invert);
            const isValid = error === null;
            return (xor(isValid, invert)) ?
                null : _mergeObjects(error, { 'not': !invert });
        };
    }
    /**
     * 'compose' validator combination function
     *
     * // {IValidatorFn[]} validators - array of validators to combine
     * // {IValidatorFn} - single combined validator function
     */
    static compose(validators) {
        if (!validators) {
            return null;
        }
        const presentValidators = validators.filter(isDefined);
        if (presentValidators.length === 0) {
            return null;
        }
        return (control, invert = false) => _mergeErrors(_executeValidators(control, presentValidators, invert));
    }
    /**
     * 'composeAsync' async validator combination function
     *
     * // {AsyncIValidatorFn[]} async validators - array of async validators
     * // {AsyncIValidatorFn} - single combined async validator function
     */
    static composeAsync(validators) {
        if (!validators) {
            return null;
        }
        const presentValidators = validators.filter(isDefined);
        if (presentValidators.length === 0) {
            return null;
        }
        return (control) => {
            const observables = _executeAsyncValidators(control, presentValidators).map(toObservable);
            return map.call(forkJoin(observables), _mergeErrors);
        };
    }
    // Additional angular validators (not used by Angualr JSON Schema Form)
    // From https://github.com/angular/angular/blob/master/packages/forms/src/validators.ts
    /**
     * Validator that requires controls to have a value greater than a number.
     */
    static min(min) {
        if (!hasValue(min)) {
            return JsonValidators.nullValidator;
        }
        return (control) => {
            // don't validate empty values to allow optional controls
            if (isEmpty(control.value) || isEmpty(min)) {
                return null;
            }
            const value = parseFloat(control.value);
            const actual = control.value;
            // Controls with NaN values after parsing should be treated as not having a
            // minimum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-min
            return isNaN(value) || value >= min ? null : { 'min': { min, actual } };
        };
    }
    /**
     * Validator that requires controls to have a value less than a number.
     */
    static max(max) {
        if (!hasValue(max)) {
            return JsonValidators.nullValidator;
        }
        return (control) => {
            // don't validate empty values to allow optional controls
            if (isEmpty(control.value) || isEmpty(max)) {
                return null;
            }
            const value = parseFloat(control.value);
            const actual = control.value;
            // Controls with NaN values after parsing should be treated as not having a
            // maximum, per the HTML forms spec: https://www.w3.org/TR/html5/forms.html#attr-input-max
            return isNaN(value) || value <= max ? null : { 'max': { max, actual } };
        };
    }
    /**
     * Validator that requires control value to be true.
     */
    static requiredTrue(control) {
        if (!control) {
            return JsonValidators.nullValidator;
        }
        return control.value === true ? null : { 'required': true };
    }
    /**
     * Validator that performs email validation.
     */
    static email(control) {
        if (!control) {
            return JsonValidators.nullValidator;
        }
        const EMAIL_REGEXP =
        // tslint:disable-next-line:max-line-length
        /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
        return EMAIL_REGEXP.test(control.value) ? null : { 'email': true };
    }
}
//# sourceMappingURL=eventLog:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi52YWxpZGF0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYWpzZi1jb3JlL3NyYy9saWIvc2hhcmVkL2pzb24udmFsaWRhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLGtCQUFrQixFQUNsQixZQUFZLEVBQ1osYUFBYSxFQUViLE9BQU8sRUFDUCxRQUFRLEVBQ1IsT0FBTyxFQUNQLFNBQVMsRUFDVCxTQUFTLEVBQ1QsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsTUFBTSxFQUdOLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osR0FBRyxFQUNGLE1BQU0sdUJBQXVCLENBQUM7QUFFakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDaEMsT0FBTyxFQUF5QixxQkFBcUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hGLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUlyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEVHO0FBQ0gsTUFBTSxPQUFPLGNBQWM7SUFzQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBK0I7UUFDN0MsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQUUsS0FBSyxHQUFHLElBQUksQ0FBQztTQUFFO1FBQzFDLFFBQVEsS0FBSyxFQUFFO1lBQ2IsS0FBSyxJQUFJLEVBQUUsbURBQW1EO2dCQUM1RCxPQUFPLENBQUMsT0FBd0IsRUFBRSxNQUFNLEdBQUcsS0FBSyxFQUF5QixFQUFFO29CQUN6RSxJQUFJLE1BQU0sRUFBRTt3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InNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpc0VxdWFsIGZyb20gJ2xvZGFzaC9pc0VxdWFsJztcbmltcG9ydCB7XG4gIF9leGVjdXRlQXN5bmNWYWxpZGF0b3JzLFxuICBfZXhlY3V0ZVZhbGlkYXRvcnMsXG4gIF9tZXJnZUVycm9ycyxcbiAgX21lcmdlT2JqZWN0cyxcbiAgQXN5bmNJVmFsaWRhdG9yRm4sXG4gIGdldFR5cGUsXG4gIGhhc1ZhbHVlLFxuICBpc0FycmF5LFxuICBpc0Jvb2xlYW4sXG4gIGlzRGVmaW5lZCxcbiAgaXNFbXB0eSxcbiAgaXNOdW1iZXIsXG4gIGlzU3RyaW5nLFxuICBpc1R5cGUsXG4gIElWYWxpZGF0b3JGbixcbiAgU2NoZW1hUHJpbWl0aXZlVHlwZSxcbiAgdG9KYXZhU2NyaXB0VHlwZSxcbiAgdG9PYnNlcnZhYmxlLFxuICB4b3JcbiAgfSBmcm9tICcuL3ZhbGlkYXRvci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgQWJzdHJhY3RDb250cm9sLCBWYWxpZGF0aW9uRXJyb3JzLCBWYWxpZGF0b3JGbiB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IGZvckVhY2hDb3B5IH0gZnJvbSAnLi91dGlsaXR5LmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBmb3JrSm9pbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgSnNvblNjaGVtYUZvcm1hdE5hbWVzLCBqc29uU2NoZW1hRm9ybWF0VGVzdHMgfSBmcm9tICcuL2Zvcm1hdC1yZWdleC5jb25zdGFudHMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5cblxuLyoqXG4gKiAnSnNvblZhbGlkYXRvcnMnIGNsYXNzXG4gKlxuICogUHJvdmlkZXMgYW4gZXh0ZW5kZWQgc2V0IG9mIHZhbGlkYXRvcnMgdG8gYmUgdXNlZCBieSBmb3JtIGNvbnRyb2xzLFxuICogY29tcGF0aWJsZSB3aXRoIHN0YW5kYXJkIEpTT04gU2NoZW1hIHZhbGlkYXRpb24gb3B0aW9ucy5cbiAqIGh0dHA6Ly9qc29uLXNjaGVtYS5vcmcvbGF0ZXN0L2pzb24tc2NoZW1hLXZhbGlkYXRpb24uaHRtbFxuICpcbiAqIE5vdGU6IFRoaXMgbGlicmFyeSBpcyBkZXNpZ25lZCBhcyBhIGRyb3AtaW4gcmVwbGFjZW1lbnQgZm9yIHRoZSBBbmd1bGFyXG4gKiBWYWxpZGF0b3JzIGxpYnJhcnksIGFuZCBleGNlcHQgZm9yIG9uZSBzbWFsbCBicmVha2luZyBjaGFuZ2UgdG8gdGhlICdwYXR0ZXJuJ1xuICogdmFsaWRhdG9yIChkZXNjcmliZWQgYmVsb3cpIGl0IGNhbiBldmVuIGJlIGltcG9ydGVkIGFzIGEgc3Vic3RpdHV0ZSwgbGlrZSBzbzpcbiAqXG4gKiAgIGltcG9ydCB7IEpzb25WYWxpZGF0b3JzIGFzIFZhbGlkYXRvcnMgfSBmcm9tICdqc29uLXZhbGlkYXRvcnMnO1xuICpcbiAqIGFuZCBpdCBzaG91bGQgd29yayB3aXRoIGV4aXN0aW5nIGNvZGUgYXMgYSBjb21wbGV0ZSByZXBsYWNlbWVudC5cbiAqXG4gKiBUaGUgb25lIGV4Y2VwdGlvbiBpcyB0aGUgJ3BhdHRlcm4nIHZhbGlkYXRvciwgd2hpY2ggaGFzIGJlZW4gY2hhbmdlZCB0b1xuICogbWF0Y2hlIHBhcnRpYWwgdmFsdWVzIGJ5IGRlZmF1bHQgKHRoZSBzdGFuZGFyZCAncGF0dGVybicgdmFsaWRhdG9yIHdyYXBwZWRcbiAqIGFsbCBwYXR0ZXJucyBpbiAnXicgYW5kICckJywgZm9yY2luZyB0aGVtIHRvIGFsd2F5cyBtYXRjaCBhbiBlbnRpcmUgdmFsdWUpLlxuICogSG93ZXZlciwgdGhlIG9sZCBiZWhhdmlvciBjYW4gYmUgcmVzdG9yZWQgYnkgc2ltcGx5IGFkZGluZyAnXicgYW5kICckJ1xuICogYXJvdW5kIHlvdXIgcGF0dGVybnMsIG9yIGJ5IHBhc3NpbmcgYW4gb3B0aW9uYWwgc2Vjb25kIHBhcmFtZXRlciBvZiBUUlVFLlxuICogVGhpcyBjaGFuZ2UgaXMgdG8gbWFrZSB0aGUgJ3BhdHRlcm4nIHZhbGlkYXRvciBtYXRjaCB0aGUgYmVoYXZpb3Igb2YgYVxuICogSlNPTiBTY2hlbWEgcGF0dGVybiwgd2hpY2ggYWxsb3dzIHBhcnRpYWwgbWF0Y2hlcywgcmF0aGVyIHRoYW4gdGhlIGJlaGF2aW9yXG4gKiBvZiBhbiBIVE1MIGlucHV0IGNvbnRyb2wgcGF0dGVybiwgd2hpY2ggZG9lcyBub3QuXG4gKlxuICogVGhpcyBsaWJyYXJ5IHJlcGxhY2VzIEFuZ3VsYXIncyB2YWxpZGF0b3JzIGFuZCBjb21iaW5hdGlvbiBmdW5jdGlvbnNcbiAqIHdpdGggdGhlIGZvbGxvd2luZyB2YWxpZGF0b3JzIGFuZCB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbnM6XG4gKlxuICogVmFsaWRhdG9yczpcbiAqICAgRm9yIGFsbCBmb3JtQ29udHJvbHM6ICAgICByZXF1aXJlZCAoKiksIHR5cGUsIGVudW0sIGNvbnN0XG4gKiAgIEZvciB0ZXh0IGZvcm1Db250cm9sczogICAgbWluTGVuZ3RoICgqKSwgbWF4TGVuZ3RoICgqKSwgcGF0dGVybiAoKiksIGZvcm1hdFxuICogICBGb3IgbnVtZXJpYyBmb3JtQ29udHJvbHM6IG1heGltdW0sIGV4Y2x1c2l2ZU1heGltdW0sXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bSwgZXhjbHVzaXZlTWluaW11bSwgbXVsdGlwbGVPZlxuICogICBGb3IgZm9ybUdyb3VwIG9iamVjdHM6ICAgIG1pblByb3BlcnRpZXMsIG1heFByb3BlcnRpZXMsIGRlcGVuZGVuY2llc1xuICogICBGb3IgZm9ybUFycmF5IGFycmF5czogICAgIG1pbkl0ZW1zLCBtYXhJdGVtcywgdW5pcXVlSXRlbXMsIGNvbnRhaW5zXG4gKiAgIE5vdCB1c2VkIGJ5IEpTT04gU2NoZW1hOiAgbWluICgqKSwgbWF4ICgqKSwgcmVxdWlyZWRUcnVlICgqKSwgZW1haWwgKCopXG4gKiAoVmFsaWRhdG9ycyBvcmlnaW5hbGx5IGluY2x1ZGVkIHdpdGggQW5ndWxhciBhcmUgbWFrZWQgd2l0aCAoKikuKVxuICpcbiAqIE5PVEUgLyBUT0RPOiBUaGUgZGVwZW5kZW5jaWVzIHZhbGlkYXRvciBpcyBub3QgY29tcGxldGUuXG4gKiBOT1RFIC8gVE9ETzogVGhlIGNvbnRhaW5zIHZhbGlkYXRvciBpcyBub3QgY29tcGxldGUuXG4gKlxuICogVmFsaWRhdG9ycyBub3QgdXNlZCBieSBKU09OIFNjaGVtYSAoYnV0IGluY2x1ZGVkIGZvciBjb21wYXRpYmlsaXR5KVxuICogYW5kIHRoZWlyIEpTT04gU2NoZW1hIGVxdWl2YWxlbnRzOlxuICpcbiAqICAgQW5ndWxhciB2YWxpZGF0b3IgfCBKU09OIFNjaGVtYSBlcXVpdmFsZW50XG4gKiAgIC0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICAgIG1pbihudW1iZXIpICAgICB8ICAgbWluaW11bShudW1iZXIpXG4gKiAgICAgbWF4KG51bWJlcikgICAgIHwgICBtYXhpbXVtKG51bWJlcilcbiAqICAgICByZXF1aXJlZFRydWUoKSAgfCAgIGNvbnN0KHRydWUpXG4gKiAgICAgZW1haWwoKSAgICAgICAgIHwgICBmb3JtYXQoJ2VtYWlsJylcbiAqXG4gKiBWYWxpZGF0b3IgdHJhbnNmb3JtYXRpb24gZnVuY3Rpb25zOlxuICogICBjb21wb3NlQW55T2YsIGNvbXBvc2VPbmVPZiwgY29tcG9zZUFsbE9mLCBjb21wb3NlTm90XG4gKiAoQW5ndWxhcidzIG9yaWdpbmFsIGNvbWJpbmF0aW9uIGZ1bmNpdG9uLCAnY29tcG9zZScsIGlzIGFsc28gaW5jbHVkZWQgZm9yXG4gKiBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCB0aG91Z2ggaXQgaXMgZnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdG8gY29tcG9zZUFsbE9mLFxuICogYXNzaWRlIGZyb20gaXRzIG1vcmUgZ2VuZXJpYyBlcnJvciBtZXNzYWdlLilcbiAqXG4gKiBBbGwgdmFsaWRhdG9ycyBoYXZlIGFsc28gYmVlbiBleHRlbmRlZCB0byBhY2NlcHQgYW4gb3B0aW9uYWwgc2Vjb25kIGFyZ3VtZW50XG4gKiB3aGljaCwgaWYgcGFzc2VkIGEgVFJVRSB2YWx1ZSwgY2F1c2VzIHRoZSB2YWxpZGF0b3IgdG8gcGVyZm9ybSB0aGUgb3Bwb3NpdGVcbiAqIG9mIGl0cyBvcmlnaW5hbCBmaW5jdGlvbi4gKFRoaXMgaXMgdXNlZCBpbnRlcm5hbGx5IHRvIGVuYWJsZSAnbm90JyBhbmRcbiAqICdjb21wb3NlT25lT2YnIHRvIGZ1bmN0aW9uIGFuZCByZXR1cm4gdXNlZnVsIGVycm9yIG1lc3NhZ2VzLilcbiAqXG4gKiBUaGUgJ3JlcXVpcmVkJyB2YWxpZGF0b3IgaGFzIGFsc28gYmVlbiBvdmVybG9hZGVkIHNvIHRoYXQgaWYgY2FsbGVkIHdpdGhcbiAqIGEgYm9vbGVhbiBwYXJhbWV0ZXIgKG9yIG5vIHBhcmFtZXRlcnMpIGl0IHJldHVybnMgdGhlIG9yaWdpbmFsIHZhbGlkYXRvclxuICogZnVuY3Rpb24gKHJhdGhlciB0aGFuIGV4ZWN1dGluZyBpdCkuIEhvd2V2ZXIsIGlmIGl0IGlzIGNhbGxlZCB3aXRoIGFuXG4gKiBBYnN0cmFjdENvbnRyb2wgcGFyYW1ldGVyIChhcyB3YXMgcHJldmlvdXNseSByZXF1aXJlZCksIGl0IGJlaGF2ZXNcbiAqIGV4YWN0bHkgYXMgYmVmb3JlLlxuICpcbiAqIFRoaXMgZW5hYmxlcyBhbGwgdmFsaWRhdG9ycyAoaW5jbHVkaW5nICdyZXF1aXJlZCcpIHRvIGJlIGNvbnN0cnVjdGVkIGluXG4gKiBleGFjdGx5IHRoZSBzYW1lIHdheSwgc28gdGhleSBjYW4gYmUgYXV0b21hdGljYWxseSBhcHBsaWVkIHVzaW5nIHRoZVxuICogZXF1aXZhbGVudCBrZXkgbmFtZXMgYW5kIHZhbHVlcyB0YWtlbiBkaXJlY3RseSBmcm9tIGEgSlNPTiBTY2hlbWEuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBwYXJ0aWFsbHkgZGVyaXZlZCBmcm9tIEFuZ3VsYXIsXG4gKiB3aGljaCBpcyBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNyBHb29nbGUsIEluYy5cbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIHRoZXJlZm9yZSBnb3Zlcm5lZCBieSB0aGUgc2FtZSBNSVQtc3R5bGUgbGljZW5zZVxuICogdGhhdCBjYW4gYmUgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICpcbiAqIE9yaWdpbmFsIEFuZ3VsYXIgVmFsaWRhdG9yczpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvYmxvYi9tYXN0ZXIvcGFja2FnZXMvZm9ybXMvc3JjL3ZhbGlkYXRvcnMudHNcbiAqL1xuZXhwb3J0IGNsYXNzIEpzb25WYWxpZGF0b3JzIHtcblxuICAvKipcbiAgICogVmFsaWRhdG9yIGZ1bmN0aW9uczpcbiAgICpcbiAgICogRm9yIGFsbCBmb3JtQ29udHJvbHM6ICAgICByZXF1aXJlZCwgdHlwZSwgZW51bSwgY29uc3RcbiAgICogRm9yIHRleHQgZm9ybUNvbnRyb2xzOiAgICBtaW5MZW5ndGgsIG1heExlbmd0aCwgcGF0dGVybiwgZm9ybWF0XG4gICAqIEZvciBudW1lcmljIGZvcm1Db250cm9sczogbWF4aW11bSwgZXhjbHVzaXZlTWF4aW11bSxcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5pbXVtLCBleGNsdXNpdmVNaW5pbXVtLCBtdWx0aXBsZU9mXG4gICAqIEZvciBmb3JtR3JvdXAgb2JqZWN0czogICAgbWluUHJvcGVydGllcywgbWF4UHJvcGVydGllcywgZGVwZW5kZW5jaWVzXG4gICAqIEZvciBmb3JtQXJyYXkgYXJyYXlzOiAgICAgbWluSXRlbXMsIG1heEl0ZW1zLCB1bmlxdWVJdGVtcywgY29udGFpbnNcbiAgICpcbiAgICogVE9ETzogZmluaXNoIGRlcGVuZGVuY2llcyB2YWxpZGF0b3JcbiAgICovXG5cbiAgLyoqXG4gICAqICdyZXF1aXJlZCcgdmFsaWRhdG9yXG4gICAqXG4gICAqIFRoaXMgdmFsaWRhdG9yIGlzIG92ZXJsb2FkZWQsIGNvbXBhcmVkIHRvIHRoZSBkZWZhdWx0IHJlcXVpcmVkIHZhbGlkYXRvci5cbiAgICogSWYgY2FsbGVkIHdpdGggbm8gcGFyYW1ldGVycywgb3IgVFJVRSwgdGhpcyB2YWxpZGF0b3IgcmV0dXJucyB0aGVcbiAgICogJ3JlcXVpcmVkJyB2YWxpZGF0b3IgZnVuY3Rpb24gKHJhdGhlciB0aGFuIGV4ZWN1dGluZyBpdCkuIFRoaXMgbWF0Y2hlc1xuICAgKiB0aGUgYmVoYXZpb3Igb2YgYWxsIG90aGVyIHZhbGlkYXRvcnMgaW4gdGhpcyBsaWJyYXJ5LlxuICAgKlxuICAgKiBJZiB0aGlzIHZhbGlkYXRvciBpcyBjYWxsZWQgd2l0aCBhbiBBYnN0cmFjdENvbnRyb2wgcGFyYW1ldGVyXG4gICAqIChhcyB3YXMgcHJldmlvdXNseSByZXF1aXJlZCkgaXQgYmVoYXZlcyB0aGUgc2FtZSBhcyBBbmd1bGFyJ3MgZGVmYXVsdFxuICAgKiByZXF1aXJlZCB2YWxpZGF0b3IsIGFuZCByZXR1cm5zIGFuIGVycm9yIGlmIHRoZSBjb250cm9sIGlzIGVtcHR5LlxuICAgKlxuICAgKiBPbGQgYmVoYXZpb3I6IChpZiBpbnB1dCB0eXBlID0gQWJzdHJhY3RDb250cm9sKVxuICAgKiAvLyB7QWJzdHJhY3RDb250cm9sfSBjb250cm9sIC0gcmVxdWlyZWQgY29udHJvbFxuICAgKiAvLyB7e1trZXk6IHN0cmluZ106IGJvb2xlYW59fSAtIHJldHVybnMgZXJyb3IgbWVzc2FnZSBpZiBubyBpbnB1dFxuICAgKlxuICAgKiBOZXcgYmVoYXZpb3I6IChpZiBubyBpbnB1dCwgb3IgaW5wdXQgdHlwZSA9IGJvb2xlYW4pXG4gICAqIC8vIHtib29sZWFuID0gdHJ1ZX0gcmVxdWlyZWQ/IC0gdHJ1ZSB0byB2YWxpZGF0ZSwgZmFsc2UgdG8gZGlzYWJsZVxuICAgKiAvLyB7SVZhbGlkYXRvckZufSAtIHJldHVybnMgdGhlICdyZXF1aXJlZCcgdmFsaWRhdG9yIGZ1bmN0aW9uIGl0c2VsZlxuICAgKi9cbiAgc3RhdGljIHJlcXVpcmVkKGlucHV0OiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGw7XG4gIHN0YXRpYyByZXF1aXJlZChpbnB1dD86IGJvb2xlYW4pOiBJVmFsaWRhdG9yRm47XG5cbiAgc3RhdGljIHJlcXVpcmVkKGlucHV0PzogQWJzdHJhY3RDb250cm9sfGJvb2xlYW4pOiBWYWxpZGF0aW9uRXJyb3JzfG51bGx8SVZhbGlkYXRvckZuIHtcbiAgICBpZiAoaW5wdXQgPT09IHVuZGVmaW5lZCkgeyBpbnB1dCA9IHRydWU7IH1cbiAgICBzd2l0Y2ggKGlucHV0KSB7XG4gICAgICBjYXNlIHRydWU6IC8vIFJldHVybiByZXF1aXJlZCBmdW5jdGlvbiAoZG8gbm90IGV4ZWN1dGUgaXQgeWV0KVxuICAgICAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgaW52ZXJ0ID0gZmFsc2UpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgICAgIGlmIChpbnZlcnQpIHsgcmV0dXJuIG51bGw7IH0gLy8gaWYgbm90IHJlcXVpcmVkLCBhbHdheXMgcmV0dXJuIHZhbGlkXG4gICAgICAgICAgcmV0dXJuIGhhc1ZhbHVlKGNvbnRyb2wudmFsdWUpID8gbnVsbCA6IHsgJ3JlcXVpcmVkJzogdHJ1ZSB9O1xuICAgICAgICB9O1xuICAgICAgY2FzZSBmYWxzZTogLy8gRG8gbm90aGluZyAoaWYgZmllbGQgaXMgbm90IHJlcXVpcmVkLCBpdCBpcyBhbHdheXMgdmFsaWQpXG4gICAgICAgIHJldHVybiBKc29uVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yO1xuICAgICAgZGVmYXVsdDogLy8gRXhlY3V0ZSByZXF1aXJlZCBmdW5jdGlvblxuICAgICAgICByZXR1cm4gaGFzVmFsdWUoKDxBYnN0cmFjdENvbnRyb2w+aW5wdXQpLnZhbHVlKSA/IG51bGwgOiB7ICdyZXF1aXJlZCc6IHRydWUgfTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogJ3R5cGUnIHZhbGlkYXRvclxuICAgKlxuICAgKiBSZXF1aXJlcyBhIGNvbnRyb2wgdG8gb25seSBhY2NlcHQgdmFsdWVzIG9mIGEgc3BlY2lmaWVkIHR5cGUsXG4gICAqIG9yIG9uZSBvZiBhbiBhcnJheSBvZiB0eXBlcy5cbiAgICpcbiAgICogTm90ZTogU2NoZW1hUHJpbWl0aXZlVHlwZSA9ICdzdHJpbmcnfCdudW1iZXInfCdpbnRlZ2VyJ3wnYm9vbGVhbid8J251bGwnXG4gICAqXG4gICAqIC8vIHtTY2hlbWFQcmltaXRpdmVUeXBlfFNjaGVtYVByaW1pdGl2ZVR5cGVbXX0gdHlwZSAtIHR5cGUocykgdG8gYWNjZXB0XG4gICAqIC8vIHtJVmFsaWRhdG9yRm59XG4gICAqL1xuICBzdGF0aWMgdHlwZShyZXF1aXJlZFR5cGU6IFNjaGVtYVByaW1pdGl2ZVR5cGV8U2NoZW1hUHJpbWl0aXZlVHlwZVtdKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIWhhc1ZhbHVlKHJlcXVpcmVkVHlwZSkpIHsgcmV0dXJuIEpzb25WYWxpZGF0b3JzLm51bGxWYWxpZGF0b3I7IH1cbiAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgaW52ZXJ0ID0gZmFsc2UpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgaWYgKGlzRW1wdHkoY29udHJvbC52YWx1ZSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZTogYW55ID0gY29udHJvbC52YWx1ZTtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBpc0FycmF5KHJlcXVpcmVkVHlwZSkgP1xuICAgICAgICAoPFNjaGVtYVByaW1pdGl2ZVR5cGVbXT5yZXF1aXJlZFR5cGUpLnNvbWUodHlwZSA9PiBpc1R5cGUoY3VycmVudFZhbHVlLCB0eXBlKSkgOlxuICAgICAgICBpc1R5cGUoY3VycmVudFZhbHVlLCA8U2NoZW1hUHJpbWl0aXZlVHlwZT5yZXF1aXJlZFR5cGUpO1xuICAgICAgcmV0dXJuIHhvcihpc1ZhbGlkLCBpbnZlcnQpID9cbiAgICAgICAgbnVsbCA6IHsgJ3R5cGUnOiB7IHJlcXVpcmVkVHlwZSwgY3VycmVudFZhbHVlIH0gfTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqICdlbnVtJyB2YWxpZGF0b3JcbiAgICpcbiAgICogUmVxdWlyZXMgYSBjb250cm9sIHRvIGhhdmUgYSB2YWx1ZSBmcm9tIGFuIGVudW1lcmF0ZWQgbGlzdCBvZiB2YWx1ZXMuXG4gICAqXG4gICAqIENvbnZlcnRzIHR5cGVzIGFzIG5lZWRlZCB0byBhbGxvdyBzdHJpbmcgaW5wdXRzIHRvIHN0aWxsIGNvcnJlY3RseVxuICAgKiBtYXRjaCBudW1iZXIsIGJvb2xlYW4sIGFuZCBudWxsIGVudW0gdmFsdWVzLlxuICAgKlxuICAgKiAvLyB7YW55W119IGFsbG93ZWRWYWx1ZXMgLSBhcnJheSBvZiBhY2NlcHRhYmxlIHZhbHVlc1xuICAgKiAvLyB7SVZhbGlkYXRvckZufVxuICAgKi9cbiAgc3RhdGljIGVudW0oYWxsb3dlZFZhbHVlczogYW55W10pOiBJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghaXNBcnJheShhbGxvd2VkVmFsdWVzKSkgeyByZXR1cm4gSnNvblZhbGlkYXRvcnMubnVsbFZhbGlkYXRvcjsgfVxuICAgIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBpbnZlcnQgPSBmYWxzZSk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCA9PiB7XG4gICAgICBpZiAoaXNFbXB0eShjb250cm9sLnZhbHVlKSkgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgY29uc3QgY3VycmVudFZhbHVlOiBhbnkgPSBjb250cm9sLnZhbHVlO1xuICAgICAgY29uc3QgaXNFcXVhbFZhbCA9IChlbnVtVmFsdWUsIGlucHV0VmFsdWUpID0+XG4gICAgICAgIGVudW1WYWx1ZSA9PT0gaW5wdXRWYWx1ZSB8fFxuICAgICAgICAoaXNOdW1iZXIoZW51bVZhbHVlKSAmJiAraW5wdXRWYWx1ZSA9PT0gK2VudW1WYWx1ZSkgfHxcbiAgICAgICAgKGlzQm9vbGVhbihlbnVtVmFsdWUsICdzdHJpY3QnKSAmJlxuICAgICAgICAgIHRvSmF2YVNjcmlwdFR5cGUoaW5wdXRWYWx1ZSwgJ2Jvb2xlYW4nKSA9PT0gZW51bVZhbHVlKSB8fFxuICAgICAgICAoZW51bVZhbHVlID09PSBudWxsICYmICFoYXNWYWx1ZShpbnB1dFZhbHVlKSkgfHxcbiAgICAgICAgaXNFcXVhbChlbnVtVmFsdWUsIGlucHV0VmFsdWUpO1xuICAgICAgY29uc3QgaXNWYWxpZCA9IGlzQXJyYXkoY3VycmVudFZhbHVlKSA/XG4gICAgICAgIGN1cnJlbnRWYWx1ZS5ldmVyeShpbnB1dFZhbHVlID0+IGFsbG93ZWRWYWx1ZXMuc29tZShlbnVtVmFsdWUgPT5cbiAgICAgICAgICBpc0VxdWFsVmFsKGVudW1WYWx1ZSwgaW5wdXRWYWx1ZSlcbiAgICAgICAgKSkgOlxuICAgICAgICBhbGxvd2VkVmFsdWVzLnNvbWUoZW51bVZhbHVlID0+IGlzRXF1YWxWYWwoZW51bVZhbHVlLCBjdXJyZW50VmFsdWUpKTtcbiAgICAgIHJldHVybiB4b3IoaXNWYWxpZCwgaW52ZXJ0KSA/XG4gICAgICAgIG51bGwgOiB7ICdlbnVtJzogeyBhbGxvd2VkVmFsdWVzLCBjdXJyZW50VmFsdWUgfSB9O1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogJ2NvbnN0JyB2YWxpZGF0b3JcbiAgICpcbiAgICogUmVxdWlyZXMgYSBjb250cm9sIHRvIGhhdmUgYSBzcGVjaWZpYyB2YWx1ZS5cbiAgICpcbiAgICogQ29udmVydHMgdHlwZXMgYXMgbmVlZGVkIHRvIGFsbG93IHN0cmluZyBpbnB1dHMgdG8gc3RpbGwgY29ycmVjdGx5XG4gICAqIG1hdGNoIG51bWJlciwgYm9vbGVhbiwgYW5kIG51bGwgdmFsdWVzLlxuICAgKlxuICAgKiBUT0RPOiBtb2RpZnkgdG8gd29yayB3aXRoIG9iamVjdHNcbiAgICpcbiAgICogLy8ge2FueVtdfSByZXF1aXJlZFZhbHVlIC0gcmVxdWlyZWQgdmFsdWVcbiAgICogLy8ge0lWYWxpZGF0b3JGbn1cbiAgICovXG4gIHN0YXRpYyBjb25zdChyZXF1aXJlZFZhbHVlOiBhbnkpOiBJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghaGFzVmFsdWUocmVxdWlyZWRWYWx1ZSkpIHsgcmV0dXJuIEpzb25WYWxpZGF0b3JzLm51bGxWYWxpZGF0b3I7IH1cbiAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgaW52ZXJ0ID0gZmFsc2UpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgaWYgKGlzRW1wdHkoY29udHJvbC52YWx1ZSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZTogYW55ID0gY29udHJvbC52YWx1ZTtcbiAgICAgIGNvbnN0IGlzRXF1YWxWYWwgPSAoY29uc3RWYWx1ZSwgaW5wdXRWYWx1ZSkgPT5cbiAgICAgICAgY29uc3RWYWx1ZSA9PT0gaW5wdXRWYWx1ZSB8fFxuICAgICAgICBpc051bWJlcihjb25zdFZhbHVlKSAmJiAraW5wdXRWYWx1ZSA9PT0gK2NvbnN0VmFsdWUgfHxcbiAgICAgICAgaXNCb29sZWFuKGNvbnN0VmFsdWUsICdzdHJpY3QnKSAmJlxuICAgICAgICAgIHRvSmF2YVNjcmlwdFR5cGUoaW5wdXRWYWx1ZSwgJ2Jvb2xlYW4nKSA9PT0gY29uc3RWYWx1ZSB8fFxuICAgICAgICBjb25zdFZhbHVlID09PSBudWxsICYmICFoYXNWYWx1ZShpbnB1dFZhbHVlKTtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBpc0VxdWFsVmFsKHJlcXVpcmVkVmFsdWUsIGN1cnJlbnRWYWx1ZSk7XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogeyAnY29uc3QnOiB7IHJlcXVpcmVkVmFsdWUsIGN1cnJlbnRWYWx1ZSB9IH07XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnbWluTGVuZ3RoJyB2YWxpZGF0b3JcbiAgICpcbiAgICogUmVxdWlyZXMgYSBjb250cm9sJ3MgdGV4dCB2YWx1ZSB0byBiZSBncmVhdGVyIHRoYW4gYSBzcGVjaWZpZWQgbGVuZ3RoLlxuICAgKlxuICAgKiAvLyB7bnVtYmVyfSBtaW5pbXVtTGVuZ3RoIC0gbWluaW11bSBhbGxvd2VkIHN0cmluZyBsZW5ndGhcbiAgICogLy8ge2Jvb2xlYW4gPSBmYWxzZX0gaW52ZXJ0IC0gaW5zdGVhZCByZXR1cm4gZXJyb3Igb2JqZWN0IG9ubHkgaWYgdmFsaWRcbiAgICogLy8ge0lWYWxpZGF0b3JGbn1cbiAgICovXG4gIHN0YXRpYyBtaW5MZW5ndGgobWluaW11bUxlbmd0aDogbnVtYmVyKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIWhhc1ZhbHVlKG1pbmltdW1MZW5ndGgpKSB7IHJldHVybiBKc29uVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGludmVydCA9IGZhbHNlKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIGlmIChpc0VtcHR5KGNvbnRyb2wudmFsdWUpKSB7IHJldHVybiBudWxsOyB9XG4gICAgICBjb25zdCBjdXJyZW50TGVuZ3RoID0gaXNTdHJpbmcoY29udHJvbC52YWx1ZSkgPyBjb250cm9sLnZhbHVlLmxlbmd0aCA6IDA7XG4gICAgICBjb25zdCBpc1ZhbGlkID0gY3VycmVudExlbmd0aCA+PSBtaW5pbXVtTGVuZ3RoO1xuICAgICAgcmV0dXJuIHhvcihpc1ZhbGlkLCBpbnZlcnQpID9cbiAgICAgICAgbnVsbCA6IHsgJ21pbkxlbmd0aCc6IHsgbWluaW11bUxlbmd0aCwgY3VycmVudExlbmd0aCB9IH07XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnbWF4TGVuZ3RoJyB2YWxpZGF0b3JcbiAgICpcbiAgICogUmVxdWlyZXMgYSBjb250cm9sJ3MgdGV4dCB2YWx1ZSB0byBiZSBsZXNzIHRoYW4gYSBzcGVjaWZpZWQgbGVuZ3RoLlxuICAgKlxuICAgKiAvLyB7bnVtYmVyfSBtYXhpbXVtTGVuZ3RoIC0gbWF4aW11bSBhbGxvd2VkIHN0cmluZyBsZW5ndGhcbiAgICogLy8ge2Jvb2xlYW4gPSBmYWxzZX0gaW52ZXJ0IC0gaW5zdGVhZCByZXR1cm4gZXJyb3Igb2JqZWN0IG9ubHkgaWYgdmFsaWRcbiAgICogLy8ge0lWYWxpZGF0b3JGbn1cbiAgICovXG4gIHN0YXRpYyBtYXhMZW5ndGgobWF4aW11bUxlbmd0aDogbnVtYmVyKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIWhhc1ZhbHVlKG1heGltdW1MZW5ndGgpKSB7IHJldHVybiBKc29uVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGludmVydCA9IGZhbHNlKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnRMZW5ndGggPSBpc1N0cmluZyhjb250cm9sLnZhbHVlKSA/IGNvbnRyb2wudmFsdWUubGVuZ3RoIDogMDtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBjdXJyZW50TGVuZ3RoIDw9IG1heGltdW1MZW5ndGg7XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogeyAnbWF4TGVuZ3RoJzogeyBtYXhpbXVtTGVuZ3RoLCBjdXJyZW50TGVuZ3RoIH0gfTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqICdwYXR0ZXJuJyB2YWxpZGF0b3JcbiAgICpcbiAgICogTm90ZTogTk9UIHRoZSBzYW1lIGFzIEFuZ3VsYXIncyBkZWZhdWx0IHBhdHRlcm4gdmFsaWRhdG9yLlxuICAgKlxuICAgKiBSZXF1aXJlcyBhIGNvbnRyb2wncyB2YWx1ZSB0byBtYXRjaCBhIHNwZWNpZmllZCByZWd1bGFyIGV4cHJlc3Npb24gcGF0dGVybi5cbiAgICpcbiAgICogVGhpcyB2YWxpZGF0b3IgY2hhbmdlcyB0aGUgYmVoYXZpb3Igb2YgZGVmYXVsdCBwYXR0ZXJuIHZhbGlkYXRvclxuICAgKiBieSByZXBsYWNpbmcgUmVnRXhwKGBeJHtwYXR0ZXJufSRgKSB3aXRoIFJlZ0V4cChgJHtwYXR0ZXJufWApLFxuICAgKiB3aGljaCBhbGxvd3MgZm9yIHBhcnRpYWwgbWF0Y2hlcy5cbiAgICpcbiAgICogVG8gcmV0dXJuIHRvIHRoZSBkZWZhdWx0IGZ1bmNpdG9uYWxpdHksIGFuZCBtYXRjaCB0aGUgZW50aXJlIHN0cmluZyxcbiAgICogcGFzcyBUUlVFIGFzIHRoZSBvcHRpb25hbCBzZWNvbmQgcGFyYW1ldGVyLlxuICAgKlxuICAgKiAvLyB7c3RyaW5nfSBwYXR0ZXJuIC0gcmVndWxhciBleHByZXNzaW9uIHBhdHRlcm5cbiAgICogLy8ge2Jvb2xlYW4gPSBmYWxzZX0gd2hvbGVTdHJpbmcgLSBtYXRjaCB3aG9sZSB2YWx1ZSBzdHJpbmc/XG4gICAqIC8vIHtJVmFsaWRhdG9yRm59XG4gICAqL1xuICBzdGF0aWMgcGF0dGVybihwYXR0ZXJuOiBzdHJpbmd8UmVnRXhwLCB3aG9sZVN0cmluZyA9IGZhbHNlKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIWhhc1ZhbHVlKHBhdHRlcm4pKSB7IHJldHVybiBKc29uVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGludmVydCA9IGZhbHNlKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIGlmIChpc0VtcHR5KGNvbnRyb2wudmFsdWUpKSB7IHJldHVybiBudWxsOyB9XG4gICAgICBsZXQgcmVnZXg6IFJlZ0V4cDtcbiAgICAgIGxldCByZXF1aXJlZFBhdHRlcm46IHN0cmluZztcbiAgICAgIGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmVxdWlyZWRQYXR0ZXJuID0gKHdob2xlU3RyaW5nKSA/IGBeJHtwYXR0ZXJufSRgIDogcGF0dGVybjtcbiAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKHJlcXVpcmVkUGF0dGVybik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1aXJlZFBhdHRlcm4gPSBwYXR0ZXJuLnRvU3RyaW5nKCk7XG4gICAgICAgIHJlZ2V4ID0gcGF0dGVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZTogc3RyaW5nID0gY29udHJvbC52YWx1ZTtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBpc1N0cmluZyhjdXJyZW50VmFsdWUpID8gcmVnZXgudGVzdChjdXJyZW50VmFsdWUpIDogZmFsc2U7XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogeyAncGF0dGVybic6IHsgcmVxdWlyZWRQYXR0ZXJuLCBjdXJyZW50VmFsdWUgfSB9O1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogJ2Zvcm1hdCcgdmFsaWRhdG9yXG4gICAqXG4gICAqIFJlcXVpcmVzIGEgY29udHJvbCB0byBoYXZlIGEgdmFsdWUgb2YgYSBjZXJ0YWluIGZvcm1hdC5cbiAgICpcbiAgICogVGhpcyB2YWxpZGF0b3IgY3VycmVudGx5IGNoZWNrcyB0aGUgZm9sbG93aW5nIGZvcm1zdHM6XG4gICAqICAgZGF0ZSwgdGltZSwgZGF0ZS10aW1lLCBlbWFpbCwgaG9zdG5hbWUsIGlwdjQsIGlwdjYsXG4gICAqICAgdXJpLCB1cmktcmVmZXJlbmNlLCB1cmktdGVtcGxhdGUsIHVybCwgdXVpZCwgY29sb3IsXG4gICAqICAganNvbi1wb2ludGVyLCByZWxhdGl2ZS1qc29uLXBvaW50ZXIsIHJlZ2V4XG4gICAqXG4gICAqIEZhc3QgZm9ybWF0IHJlZ3VsYXIgZXhwcmVzc2lvbnMgY29waWVkIGZyb20gQUpWOlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vZXBvYmVyZXpraW4vYWp2L2Jsb2IvbWFzdGVyL2xpYi9jb21waWxlL2Zvcm1hdHMuanNcbiAgICpcbiAgICogLy8ge0pzb25TY2hlbWFGb3JtYXROYW1lc30gcmVxdWlyZWRGb3JtYXQgLSBmb3JtYXQgdG8gY2hlY2tcbiAgICogLy8ge0lWYWxpZGF0b3JGbn1cbiAgICovXG4gIHN0YXRpYyBmb3JtYXQocmVxdWlyZWRGb3JtYXQ6IEpzb25TY2hlbWFGb3JtYXROYW1lcyk6IElWYWxpZGF0b3JGbiB7XG4gICAgaWYgKCFoYXNWYWx1ZShyZXF1aXJlZEZvcm1hdCkpIHsgcmV0dXJuIEpzb25WYWxpZGF0b3JzLm51bGxWYWxpZGF0b3I7IH1cbiAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgaW52ZXJ0ID0gZmFsc2UpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgaWYgKGlzRW1wdHkoY29udHJvbC52YWx1ZSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgIGxldCBpc1ZhbGlkOiBib29sZWFuO1xuICAgICAgY29uc3QgY3VycmVudFZhbHVlOiBzdHJpbmd8RGF0ZSA9IGNvbnRyb2wudmFsdWU7XG4gICAgICBpZiAoaXNTdHJpbmcoY3VycmVudFZhbHVlKSkge1xuICAgICAgICBjb25zdCBmb3JtYXRUZXN0OiBGdW5jdGlvbnxSZWdFeHAgPSBqc29uU2NoZW1hRm9ybWF0VGVzdHNbcmVxdWlyZWRGb3JtYXRdO1xuICAgICAgICBpZiAodHlwZW9mIGZvcm1hdFRlc3QgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgaXNWYWxpZCA9ICg8UmVnRXhwPmZvcm1hdFRlc3QpLnRlc3QoPHN0cmluZz5jdXJyZW50VmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmb3JtYXRUZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgaXNWYWxpZCA9ICg8RnVuY3Rpb24+Zm9ybWF0VGVzdCkoPHN0cmluZz5jdXJyZW50VmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGZvcm1hdCB2YWxpZGF0b3IgZXJyb3I6IFwiJHtyZXF1aXJlZEZvcm1hdH1cIiBpcyBub3QgYSByZWNvZ25pemVkIGZvcm1hdC5gKTtcbiAgICAgICAgICBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQWxsb3cgSmF2YVNjcmlwdCBEYXRlIG9iamVjdHNcbiAgICAgICAgaXNWYWxpZCA9IFsnZGF0ZScsICd0aW1lJywgJ2RhdGUtdGltZSddLmluY2x1ZGVzKHJlcXVpcmVkRm9ybWF0KSAmJlxuICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChjdXJyZW50VmFsdWUpID09PSAnW29iamVjdCBEYXRlXSc7XG4gICAgICB9XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogeyAnZm9ybWF0JzogeyByZXF1aXJlZEZvcm1hdCwgY3VycmVudFZhbHVlIH0gfTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqICdtaW5pbXVtJyB2YWxpZGF0b3JcbiAgICpcbiAgICogUmVxdWlyZXMgYSBjb250cm9sJ3MgbnVtZXJpYyB2YWx1ZSB0byBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG9cbiAgICogYSBtaW5pbXVtIGFtb3VudC5cbiAgICpcbiAgICogQW55IG5vbi1udW1lcmljIHZhbHVlIGlzIGFsc28gdmFsaWQgKGFjY29yZGluZyB0byB0aGUgSFRNTCBmb3JtcyBzcGVjLFxuICAgKiBhIG5vbi1udW1lcmljIHZhbHVlIGRvZXNuJ3QgaGF2ZSBhIG1pbmltdW0pLlxuICAgKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCNhdHRyLWlucHV0LW1heFxuICAgKlxuICAgKiAvLyB7bnVtYmVyfSBtaW5pbXVtIC0gbWluaW11bSBhbGxvd2VkIHZhbHVlXG4gICAqIC8vIHtJVmFsaWRhdG9yRm59XG4gICAqL1xuICBzdGF0aWMgbWluaW11bShtaW5pbXVtVmFsdWU6IG51bWJlcik6IElWYWxpZGF0b3JGbiB7XG4gICAgaWYgKCFoYXNWYWx1ZShtaW5pbXVtVmFsdWUpKSB7IHJldHVybiBKc29uVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGludmVydCA9IGZhbHNlKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIGlmIChpc0VtcHR5KGNvbnRyb2wudmFsdWUpKSB7IHJldHVybiBudWxsOyB9XG4gICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBjb250cm9sLnZhbHVlO1xuICAgICAgY29uc3QgaXNWYWxpZCA9ICFpc051bWJlcihjdXJyZW50VmFsdWUpIHx8IGN1cnJlbnRWYWx1ZSA+PSBtaW5pbXVtVmFsdWU7XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogeyAnbWluaW11bSc6IHsgbWluaW11bVZhbHVlLCBjdXJyZW50VmFsdWUgfSB9O1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogJ2V4Y2x1c2l2ZU1pbmltdW0nIHZhbGlkYXRvclxuICAgKlxuICAgKiBSZXF1aXJlcyBhIGNvbnRyb2wncyBudW1lcmljIHZhbHVlIHRvIGJlIGxlc3MgdGhhbiBhIG1heGltdW0gYW1vdW50LlxuICAgKlxuICAgKiBBbnkgbm9uLW51bWVyaWMgdmFsdWUgaXMgYWxzbyB2YWxpZCAoYWNjb3JkaW5nIHRvIHRoZSBIVE1MIGZvcm1zIHNwZWMsXG4gICAqIGEgbm9uLW51bWVyaWMgdmFsdWUgZG9lc24ndCBoYXZlIGEgbWF4aW11bSkuXG4gICAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI2F0dHItaW5wdXQtbWF4XG4gICAqXG4gICAqIC8vIHtudW1iZXJ9IGV4Y2x1c2l2ZU1pbmltdW1WYWx1ZSAtIG1heGltdW0gYWxsb3dlZCB2YWx1ZVxuICAgKiAvLyB7SVZhbGlkYXRvckZufVxuICAgKi9cbiAgc3RhdGljIGV4Y2x1c2l2ZU1pbmltdW0oZXhjbHVzaXZlTWluaW11bVZhbHVlOiBudW1iZXIpOiBJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghaGFzVmFsdWUoZXhjbHVzaXZlTWluaW11bVZhbHVlKSkgeyByZXR1cm4gSnNvblZhbGlkYXRvcnMubnVsbFZhbGlkYXRvcjsgfVxuICAgIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBpbnZlcnQgPSBmYWxzZSk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCA9PiB7XG4gICAgICBpZiAoaXNFbXB0eShjb250cm9sLnZhbHVlKSkgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gY29udHJvbC52YWx1ZTtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSAhaXNOdW1iZXIoY3VycmVudFZhbHVlKSB8fCArY3VycmVudFZhbHVlIDwgZXhjbHVzaXZlTWluaW11bVZhbHVlO1xuICAgICAgcmV0dXJuIHhvcihpc1ZhbGlkLCBpbnZlcnQpID9cbiAgICAgICAgbnVsbCA6IHsgJ2V4Y2x1c2l2ZU1pbmltdW0nOiB7IGV4Y2x1c2l2ZU1pbmltdW1WYWx1ZSwgY3VycmVudFZhbHVlIH0gfTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqICdtYXhpbXVtJyB2YWxpZGF0b3JcbiAgICpcbiAgICogUmVxdWlyZXMgYSBjb250cm9sJ3MgbnVtZXJpYyB2YWx1ZSB0byBiZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG9cbiAgICogYSBtYXhpbXVtIGFtb3VudC5cbiAgICpcbiAgICogQW55IG5vbi1udW1lcmljIHZhbHVlIGlzIGFsc28gdmFsaWQgKGFjY29yZGluZyB0byB0aGUgSFRNTCBmb3JtcyBzcGVjLFxuICAgKiBhIG5vbi1udW1lcmljIHZhbHVlIGRvZXNuJ3QgaGF2ZSBhIG1heGltdW0pLlxuICAgKiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCNhdHRyLWlucHV0LW1heFxuICAgKlxuICAgKiAvLyB7bnVtYmVyfSBtYXhpbXVtVmFsdWUgLSBtYXhpbXVtIGFsbG93ZWQgdmFsdWVcbiAgICogLy8ge0lWYWxpZGF0b3JGbn1cbiAgICovXG4gIHN0YXRpYyBtYXhpbXVtKG1heGltdW1WYWx1ZTogbnVtYmVyKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIWhhc1ZhbHVlKG1heGltdW1WYWx1ZSkpIHsgcmV0dXJuIEpzb25WYWxpZGF0b3JzLm51bGxWYWxpZGF0b3I7IH1cbiAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgaW52ZXJ0ID0gZmFsc2UpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgaWYgKGlzRW1wdHkoY29udHJvbC52YWx1ZSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGNvbnRyb2wudmFsdWU7XG4gICAgICBjb25zdCBpc1ZhbGlkID0gIWlzTnVtYmVyKGN1cnJlbnRWYWx1ZSkgfHwgK2N1cnJlbnRWYWx1ZSA8PSBtYXhpbXVtVmFsdWU7XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogeyAnbWF4aW11bSc6IHsgbWF4aW11bVZhbHVlLCBjdXJyZW50VmFsdWUgfSB9O1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogJ2V4Y2x1c2l2ZU1heGltdW0nIHZhbGlkYXRvclxuICAgKlxuICAgKiBSZXF1aXJlcyBhIGNvbnRyb2wncyBudW1lcmljIHZhbHVlIHRvIGJlIGxlc3MgdGhhbiBhIG1heGltdW0gYW1vdW50LlxuICAgKlxuICAgKiBBbnkgbm9uLW51bWVyaWMgdmFsdWUgaXMgYWxzbyB2YWxpZCAoYWNjb3JkaW5nIHRvIHRoZSBIVE1MIGZvcm1zIHNwZWMsXG4gICAqIGEgbm9uLW51bWVyaWMgdmFsdWUgZG9lc24ndCBoYXZlIGEgbWF4aW11bSkuXG4gICAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI2F0dHItaW5wdXQtbWF4XG4gICAqXG4gICAqIC8vIHtudW1iZXJ9IGV4Y2x1c2l2ZU1heGltdW1WYWx1ZSAtIG1heGltdW0gYWxsb3dlZCB2YWx1ZVxuICAgKiAvLyB7SVZhbGlkYXRvckZufVxuICAgKi9cbiAgc3RhdGljIGV4Y2x1c2l2ZU1heGltdW0oZXhjbHVzaXZlTWF4aW11bVZhbHVlOiBudW1iZXIpOiBJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghaGFzVmFsdWUoZXhjbHVzaXZlTWF4aW11bVZhbHVlKSkgeyByZXR1cm4gSnNvblZhbGlkYXRvcnMubnVsbFZhbGlkYXRvcjsgfVxuICAgIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBpbnZlcnQgPSBmYWxzZSk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCA9PiB7XG4gICAgICBpZiAoaXNFbXB0eShjb250cm9sLnZhbHVlKSkgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gY29udHJvbC52YWx1ZTtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSAhaXNOdW1iZXIoY3VycmVudFZhbHVlKSB8fCArY3VycmVudFZhbHVlIDwgZXhjbHVzaXZlTWF4aW11bVZhbHVlO1xuICAgICAgcmV0dXJuIHhvcihpc1ZhbGlkLCBpbnZlcnQpID9cbiAgICAgICAgbnVsbCA6IHsgJ2V4Y2x1c2l2ZU1heGltdW0nOiB7IGV4Y2x1c2l2ZU1heGltdW1WYWx1ZSwgY3VycmVudFZhbHVlIH0gfTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqICdtdWx0aXBsZU9mJyB2YWxpZGF0b3JcbiAgICpcbiAgICogUmVxdWlyZXMgYSBjb250cm9sIHRvIGhhdmUgYSBudW1lcmljIHZhbHVlIHRoYXQgaXMgYSBtdWx0aXBsZVxuICAgKiBvZiBhIHNwZWNpZmllZCBudW1iZXIuXG4gICAqXG4gICAqIC8vIHtudW1iZXJ9IG11bHRpcGxlT2ZWYWx1ZSAtIG51bWJlciB2YWx1ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2ZcbiAgICogLy8ge0lWYWxpZGF0b3JGbn1cbiAgICovXG4gIHN0YXRpYyBtdWx0aXBsZU9mKG11bHRpcGxlT2ZWYWx1ZTogbnVtYmVyKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIWhhc1ZhbHVlKG11bHRpcGxlT2ZWYWx1ZSkpIHsgcmV0dXJuIEpzb25WYWxpZGF0b3JzLm51bGxWYWxpZGF0b3I7IH1cbiAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgaW52ZXJ0ID0gZmFsc2UpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgaWYgKGlzRW1wdHkoY29udHJvbC52YWx1ZSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGNvbnRyb2wudmFsdWU7XG4gICAgICBjb25zdCBpc1ZhbGlkID0gaXNOdW1iZXIoY3VycmVudFZhbHVlKSAmJlxuICAgICAgICBjdXJyZW50VmFsdWUgJSBtdWx0aXBsZU9mVmFsdWUgPT09IDA7XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogeyAnbXVsdGlwbGVPZic6IHsgbXVsdGlwbGVPZlZhbHVlLCBjdXJyZW50VmFsdWUgfSB9O1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogJ21pblByb3BlcnRpZXMnIHZhbGlkYXRvclxuICAgKlxuICAgKiBSZXF1aXJlcyBhIGZvcm0gZ3JvdXAgdG8gaGF2ZSBhIG1pbmltdW0gbnVtYmVyIG9mIHByb3BlcnRpZXMgKGkuZS4gaGF2ZVxuICAgKiB2YWx1ZXMgZW50ZXJlZCBpbiBhIG1pbmltdW0gbnVtYmVyIG9mIGNvbnRyb2xzIHdpdGhpbiB0aGUgZ3JvdXApLlxuICAgKlxuICAgKiAvLyB7bnVtYmVyfSBtaW5pbXVtUHJvcGVydGllcyAtIG1pbmltdW0gbnVtYmVyIG9mIHByb3BlcnRpZXMgYWxsb3dlZFxuICAgKiAvLyB7SVZhbGlkYXRvckZufVxuICAgKi9cbiAgc3RhdGljIG1pblByb3BlcnRpZXMobWluaW11bVByb3BlcnRpZXM6IG51bWJlcik6IElWYWxpZGF0b3JGbiB7XG4gICAgaWYgKCFoYXNWYWx1ZShtaW5pbXVtUHJvcGVydGllcykpIHsgcmV0dXJuIEpzb25WYWxpZGF0b3JzLm51bGxWYWxpZGF0b3I7IH1cbiAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgaW52ZXJ0ID0gZmFsc2UpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgaWYgKGlzRW1wdHkoY29udHJvbC52YWx1ZSkpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgIGNvbnN0IGN1cnJlbnRQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoY29udHJvbC52YWx1ZSkubGVuZ3RoIHx8IDA7XG4gICAgICBjb25zdCBpc1ZhbGlkID0gY3VycmVudFByb3BlcnRpZXMgPj0gbWluaW11bVByb3BlcnRpZXM7XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogeyAnbWluUHJvcGVydGllcyc6IHsgbWluaW11bVByb3BlcnRpZXMsIGN1cnJlbnRQcm9wZXJ0aWVzIH0gfTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqICdtYXhQcm9wZXJ0aWVzJyB2YWxpZGF0b3JcbiAgICpcbiAgICogUmVxdWlyZXMgYSBmb3JtIGdyb3VwIHRvIGhhdmUgYSBtYXhpbXVtIG51bWJlciBvZiBwcm9wZXJ0aWVzIChpLmUuIGhhdmVcbiAgICogdmFsdWVzIGVudGVyZWQgaW4gYSBtYXhpbXVtIG51bWJlciBvZiBjb250cm9scyB3aXRoaW4gdGhlIGdyb3VwKS5cbiAgICpcbiAgICogTm90ZTogSGFzIG5vIGVmZmVjdCBpZiB0aGUgZm9ybSBncm91cCBkb2VzIG5vdCBjb250YWluIG1vcmUgdGhhbiB0aGVcbiAgICogbWF4aW11bSBudW1iZXIgb2YgY29udHJvbHMuXG4gICAqXG4gICAqIC8vIHtudW1iZXJ9IG1heGltdW1Qcm9wZXJ0aWVzIC0gbWF4aW11bSBudW1iZXIgb2YgcHJvcGVydGllcyBhbGxvd2VkXG4gICAqIC8vIHtJVmFsaWRhdG9yRm59XG4gICAqL1xuICBzdGF0aWMgbWF4UHJvcGVydGllcyhtYXhpbXVtUHJvcGVydGllczogbnVtYmVyKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIWhhc1ZhbHVlKG1heGltdW1Qcm9wZXJ0aWVzKSkgeyByZXR1cm4gSnNvblZhbGlkYXRvcnMubnVsbFZhbGlkYXRvcjsgfVxuICAgIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBpbnZlcnQgPSBmYWxzZSk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50UHJvcGVydGllcyA9IE9iamVjdC5rZXlzKGNvbnRyb2wudmFsdWUpLmxlbmd0aCB8fCAwO1xuICAgICAgY29uc3QgaXNWYWxpZCA9IGN1cnJlbnRQcm9wZXJ0aWVzIDw9IG1heGltdW1Qcm9wZXJ0aWVzO1xuICAgICAgcmV0dXJuIHhvcihpc1ZhbGlkLCBpbnZlcnQpID9cbiAgICAgICAgbnVsbCA6IHsgJ21heFByb3BlcnRpZXMnOiB7IG1heGltdW1Qcm9wZXJ0aWVzLCBjdXJyZW50UHJvcGVydGllcyB9IH07XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnZGVwZW5kZW5jaWVzJyB2YWxpZGF0b3JcbiAgICpcbiAgICogUmVxdWlyZXMgdGhlIGNvbnRyb2xzIGluIGEgZm9ybSBncm91cCB0byBtZWV0IGFkZGl0aW9uYWwgdmFsaWRhdGlvblxuICAgKiBjcml0ZXJpYSwgZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZXMgb2Ygb3RoZXIgY29udHJvbHMgaW4gdGhlIGdyb3VwLlxuICAgKlxuICAgKiBFeGFtcGxlczpcbiAgICogaHR0cHM6Ly9zcGFjZXRlbGVzY29wZS5naXRodWIuaW8vdW5kZXJzdGFuZGluZy1qc29uLXNjaGVtYS9yZWZlcmVuY2Uvb2JqZWN0Lmh0bWwjZGVwZW5kZW5jaWVzXG4gICAqXG4gICAqIC8vIHthbnl9IGRlcGVuZGVuY2llcyAtIHJlcXVpcmVkIGRlcGVuZGVuY2llc1xuICAgKiAvLyB7SVZhbGlkYXRvckZufVxuICAgKi9cbiAgc3RhdGljIGRlcGVuZGVuY2llcyhkZXBlbmRlbmNpZXM6IGFueSk6IElWYWxpZGF0b3JGbiB7XG4gICAgaWYgKGdldFR5cGUoZGVwZW5kZW5jaWVzKSAhPT0gJ29iamVjdCcgfHwgaXNFbXB0eShkZXBlbmRlbmNpZXMpKSB7XG4gICAgICByZXR1cm4gSnNvblZhbGlkYXRvcnMubnVsbFZhbGlkYXRvcjtcbiAgICB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGludmVydCA9IGZhbHNlKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIGlmIChpc0VtcHR5KGNvbnRyb2wudmFsdWUpKSB7IHJldHVybiBudWxsOyB9XG4gICAgICBjb25zdCBhbGxFcnJvcnMgPSBfbWVyZ2VPYmplY3RzKFxuICAgICAgICBmb3JFYWNoQ29weShkZXBlbmRlbmNpZXMsICh2YWx1ZSwgcmVxdWlyaW5nRmllbGQpID0+IHtcbiAgICAgICAgICBpZiAoIWhhc1ZhbHVlKGNvbnRyb2wudmFsdWVbcmVxdWlyaW5nRmllbGRdKSkgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgICAgIGxldCByZXF1aXJpbmdGaWVsZEVycm9yczogVmFsaWRhdGlvbkVycm9ycyA9IHsgfTtcbiAgICAgICAgICBsZXQgcmVxdWlyZWRGaWVsZHM6IHN0cmluZ1tdO1xuICAgICAgICAgIGxldCBwcm9wZXJ0aWVzOiBWYWxpZGF0aW9uRXJyb3JzID0geyB9O1xuICAgICAgICAgIGlmIChnZXRUeXBlKGRlcGVuZGVuY2llc1tyZXF1aXJpbmdGaWVsZF0pID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgICByZXF1aXJlZEZpZWxkcyA9IGRlcGVuZGVuY2llc1tyZXF1aXJpbmdGaWVsZF07XG4gICAgICAgICAgfSBlbHNlIGlmIChnZXRUeXBlKGRlcGVuZGVuY2llc1tyZXF1aXJpbmdGaWVsZF0pID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmVxdWlyZWRGaWVsZHMgPSBkZXBlbmRlbmNpZXNbcmVxdWlyaW5nRmllbGRdWydyZXF1aXJlZCddIHx8IFtdO1xuICAgICAgICAgICAgcHJvcGVydGllcyA9IGRlcGVuZGVuY2llc1tyZXF1aXJpbmdGaWVsZF1bJ3Byb3BlcnRpZXMnXSB8fCB7IH07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVmFsaWRhdGUgcHJvcGVydHkgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgZm9yIChjb25zdCByZXF1aXJlZEZpZWxkIG9mIHJlcXVpcmVkRmllbGRzKSB7XG4gICAgICAgICAgICBpZiAoeG9yKCFoYXNWYWx1ZShjb250cm9sLnZhbHVlW3JlcXVpcmVkRmllbGRdKSwgaW52ZXJ0KSkge1xuICAgICAgICAgICAgICByZXF1aXJpbmdGaWVsZEVycm9yc1tyZXF1aXJlZEZpZWxkXSA9IHsgJ3JlcXVpcmVkJzogdHJ1ZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFZhbGlkYXRlIHNjaGVtYSBkZXBlbmRlbmNpZXNcbiAgICAgICAgICByZXF1aXJpbmdGaWVsZEVycm9ycyA9IF9tZXJnZU9iamVjdHMocmVxdWlyaW5nRmllbGRFcnJvcnMsXG4gICAgICAgICAgICBmb3JFYWNoQ29weShwcm9wZXJ0aWVzLCAocmVxdWlyZW1lbnRzLCByZXF1aXJlZEZpZWxkKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlcXVpcmVkRmllbGRFcnJvcnMgPSBfbWVyZ2VPYmplY3RzKFxuICAgICAgICAgICAgICAgIGZvckVhY2hDb3B5KHJlcXVpcmVtZW50cywgKHJlcXVpcmVtZW50LCBwYXJhbWV0ZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgIGxldCB2YWxpZGF0b3I6IElWYWxpZGF0b3JGbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICBpZiAocmVxdWlyZW1lbnQgPT09ICdtYXhpbXVtJyB8fCByZXF1aXJlbWVudCA9PT0gJ21pbmltdW0nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4Y2x1c2l2ZSA9ICEhcmVxdWlyZW1lbnRzWydleGNsdXNpdmVNJyArIHJlcXVpcmVtZW50LnNsaWNlKDEpXTtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yID0gSnNvblZhbGlkYXRvcnNbcmVxdWlyZW1lbnRdKHBhcmFtZXRlciwgZXhjbHVzaXZlKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIEpzb25WYWxpZGF0b3JzW3JlcXVpcmVtZW50XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3IgPSBKc29uVmFsaWRhdG9yc1tyZXF1aXJlbWVudF0ocGFyYW1ldGVyKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiAhaXNEZWZpbmVkKHZhbGlkYXRvcikgP1xuICAgICAgICAgICAgICAgICAgICBudWxsIDogdmFsaWRhdG9yKGNvbnRyb2wudmFsdWVbcmVxdWlyZWRGaWVsZF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHJldHVybiBpc0VtcHR5KHJlcXVpcmVkRmllbGRFcnJvcnMpID9cbiAgICAgICAgICAgICAgICBudWxsIDogeyBbcmVxdWlyZWRGaWVsZF06IHJlcXVpcmVkRmllbGRFcnJvcnMgfTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gaXNFbXB0eShyZXF1aXJpbmdGaWVsZEVycm9ycykgP1xuICAgICAgICAgICAgbnVsbCA6IHsgW3JlcXVpcmluZ0ZpZWxkXTogcmVxdWlyaW5nRmllbGRFcnJvcnMgfTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgICByZXR1cm4gaXNFbXB0eShhbGxFcnJvcnMpID8gbnVsbCA6IGFsbEVycm9ycztcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqICdtaW5JdGVtcycgdmFsaWRhdG9yXG4gICAqXG4gICAqIFJlcXVpcmVzIGEgZm9ybSBhcnJheSB0byBoYXZlIGEgbWluaW11bSBudW1iZXIgb2YgdmFsdWVzLlxuICAgKlxuICAgKiAvLyB7bnVtYmVyfSBtaW5pbXVtSXRlbXMgLSBtaW5pbXVtIG51bWJlciBvZiBpdGVtcyBhbGxvd2VkXG4gICAqIC8vIHtJVmFsaWRhdG9yRm59XG4gICAqL1xuICBzdGF0aWMgbWluSXRlbXMobWluaW11bUl0ZW1zOiBudW1iZXIpOiBJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghaGFzVmFsdWUobWluaW11bUl0ZW1zKSkgeyByZXR1cm4gSnNvblZhbGlkYXRvcnMubnVsbFZhbGlkYXRvcjsgfVxuICAgIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBpbnZlcnQgPSBmYWxzZSk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCA9PiB7XG4gICAgICBpZiAoaXNFbXB0eShjb250cm9sLnZhbHVlKSkgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgY29uc3QgY3VycmVudEl0ZW1zID0gaXNBcnJheShjb250cm9sLnZhbHVlKSA/IGNvbnRyb2wudmFsdWUubGVuZ3RoIDogMDtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBjdXJyZW50SXRlbXMgPj0gbWluaW11bUl0ZW1zO1xuICAgICAgcmV0dXJuIHhvcihpc1ZhbGlkLCBpbnZlcnQpID9cbiAgICAgICAgbnVsbCA6IHsgJ21pbkl0ZW1zJzogeyBtaW5pbXVtSXRlbXMsIGN1cnJlbnRJdGVtcyB9IH07XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnbWF4SXRlbXMnIHZhbGlkYXRvclxuICAgKlxuICAgKiBSZXF1aXJlcyBhIGZvcm0gYXJyYXkgdG8gaGF2ZSBhIG1heGltdW0gbnVtYmVyIG9mIHZhbHVlcy5cbiAgICpcbiAgICogLy8ge251bWJlcn0gbWF4aW11bUl0ZW1zIC0gbWF4aW11bSBudW1iZXIgb2YgaXRlbXMgYWxsb3dlZFxuICAgKiAvLyB7SVZhbGlkYXRvckZufVxuICAgKi9cbiAgc3RhdGljIG1heEl0ZW1zKG1heGltdW1JdGVtczogbnVtYmVyKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIWhhc1ZhbHVlKG1heGltdW1JdGVtcykpIHsgcmV0dXJuIEpzb25WYWxpZGF0b3JzLm51bGxWYWxpZGF0b3I7IH1cbiAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgaW52ZXJ0ID0gZmFsc2UpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgY29uc3QgY3VycmVudEl0ZW1zID0gaXNBcnJheShjb250cm9sLnZhbHVlKSA/IGNvbnRyb2wudmFsdWUubGVuZ3RoIDogMDtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBjdXJyZW50SXRlbXMgPD0gbWF4aW11bUl0ZW1zO1xuICAgICAgcmV0dXJuIHhvcihpc1ZhbGlkLCBpbnZlcnQpID9cbiAgICAgICAgbnVsbCA6IHsgJ21heEl0ZW1zJzogeyBtYXhpbXVtSXRlbXMsIGN1cnJlbnRJdGVtcyB9IH07XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiAndW5pcXVlSXRlbXMnIHZhbGlkYXRvclxuICAgKlxuICAgKiBSZXF1aXJlcyB2YWx1ZXMgaW4gYSBmb3JtIGFycmF5IHRvIGJlIHVuaXF1ZS5cbiAgICpcbiAgICogLy8ge2Jvb2xlYW4gPSB0cnVlfSB1bmlxdWU/IC0gdHJ1ZSB0byB2YWxpZGF0ZSwgZmFsc2UgdG8gZGlzYWJsZVxuICAgKiAvLyB7SVZhbGlkYXRvckZufVxuICAgKi9cbiAgc3RhdGljIHVuaXF1ZUl0ZW1zKHVuaXF1ZSA9IHRydWUpOiBJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghdW5pcXVlKSB7IHJldHVybiBKc29uVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGludmVydCA9IGZhbHNlKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIGlmIChpc0VtcHR5KGNvbnRyb2wudmFsdWUpKSB7IHJldHVybiBudWxsOyB9XG4gICAgICBjb25zdCBzb3J0ZWQ6IGFueVtdID0gY29udHJvbC52YWx1ZS5zbGljZSgpLnNvcnQoKTtcbiAgICAgIGNvbnN0IGR1cGxpY2F0ZUl0ZW1zID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHNvcnRlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc29ydGVkW2kgLSAxXSA9PT0gc29ydGVkW2ldICYmIGR1cGxpY2F0ZUl0ZW1zLmluY2x1ZGVzKHNvcnRlZFtpXSkpIHtcbiAgICAgICAgICBkdXBsaWNhdGVJdGVtcy5wdXNoKHNvcnRlZFtpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGlzVmFsaWQgPSAhZHVwbGljYXRlSXRlbXMubGVuZ3RoO1xuICAgICAgcmV0dXJuIHhvcihpc1ZhbGlkLCBpbnZlcnQpID9cbiAgICAgICAgbnVsbCA6IHsgJ3VuaXF1ZUl0ZW1zJzogeyBkdXBsaWNhdGVJdGVtcyB9IH07XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnY29udGFpbnMnIHZhbGlkYXRvclxuICAgKlxuICAgKiBUT0RPOiBDb21wbGV0ZSB0aGlzIHZhbGlkYXRvclxuICAgKlxuICAgKiBSZXF1aXJlcyB2YWx1ZXMgaW4gYSBmb3JtIGFycmF5IHRvIGJlIHVuaXF1ZS5cbiAgICpcbiAgICogLy8ge2Jvb2xlYW4gPSB0cnVlfSB1bmlxdWU/IC0gdHJ1ZSB0byB2YWxpZGF0ZSwgZmFsc2UgdG8gZGlzYWJsZVxuICAgKiAvLyB7SVZhbGlkYXRvckZufVxuICAgKi9cbiAgc3RhdGljIGNvbnRhaW5zKHJlcXVpcmVkSXRlbSA9IHRydWUpOiBJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghcmVxdWlyZWRJdGVtKSB7IHJldHVybiBKc29uVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGludmVydCA9IGZhbHNlKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIGlmIChpc0VtcHR5KGNvbnRyb2wudmFsdWUpIHx8ICFpc0FycmF5KGNvbnRyb2wudmFsdWUpKSB7IHJldHVybiBudWxsOyB9XG4gICAgICBjb25zdCBjdXJyZW50SXRlbXMgPSBjb250cm9sLnZhbHVlO1xuICAgICAgLy8gY29uc3QgaXNWYWxpZCA9IGN1cnJlbnRJdGVtcy5zb21lKGl0ZW0gPT5cbiAgICAgIC8vXG4gICAgICAvLyApO1xuICAgICAgY29uc3QgaXNWYWxpZCA9IHRydWU7XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogeyAnY29udGFpbnMnOiB7IHJlcXVpcmVkSXRlbSwgY3VycmVudEl0ZW1zIH0gfTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIE5vLW9wIHZhbGlkYXRvci4gSW5jbHVkZWQgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkuXG4gICAqL1xuICBzdGF0aWMgbnVsbFZhbGlkYXRvcihjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRvciB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbnM6XG4gICAqIGNvbXBvc2VBbnlPZiwgY29tcG9zZU9uZU9mLCBjb21wb3NlQWxsT2YsIGNvbXBvc2VOb3QsXG4gICAqIGNvbXBvc2UsIGNvbXBvc2VBc3luY1xuICAgKlxuICAgKiBUT0RPOiBBZGQgY29tcG9zZUFueU9mQXN5bmMsIGNvbXBvc2VPbmVPZkFzeW5jLFxuICAgKiAgICAgICAgICAgY29tcG9zZUFsbE9mQXN5bmMsIGNvbXBvc2VOb3RBc3luY1xuICAgKi9cblxuICAvKipcbiAgICogJ2NvbXBvc2VBbnlPZicgdmFsaWRhdG9yIGNvbWJpbmF0aW9uIGZ1bmN0aW9uXG4gICAqXG4gICAqIEFjY2VwdHMgYW4gYXJyYXkgb2YgdmFsaWRhdG9ycyBhbmQgcmV0dXJucyBhIHNpbmdsZSB2YWxpZGF0b3IgdGhhdFxuICAgKiBldmFsdWF0ZXMgdG8gdmFsaWQgaWYgYW55IG9uZSBvciBtb3JlIG9mIHRoZSBzdWJtaXR0ZWQgdmFsaWRhdG9ycyBhcmVcbiAgICogdmFsaWQuIElmIGV2ZXJ5IHZhbGlkYXRvciBpcyBpbnZhbGlkLCBpdCByZXR1cm5zIGNvbWJpbmVkIGVycm9ycyBmcm9tXG4gICAqIGFsbCB2YWxpZGF0b3JzLlxuICAgKlxuICAgKiAvLyB7SVZhbGlkYXRvckZuW119IHZhbGlkYXRvcnMgLSBhcnJheSBvZiB2YWxpZGF0b3JzIHRvIGNvbWJpbmVcbiAgICogLy8ge0lWYWxpZGF0b3JGbn0gLSBzaW5nbGUgY29tYmluZWQgdmFsaWRhdG9yIGZ1bmN0aW9uXG4gICAqL1xuICBzdGF0aWMgY29tcG9zZUFueU9mKHZhbGlkYXRvcnM6IElWYWxpZGF0b3JGbltdKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIXZhbGlkYXRvcnMpIHsgcmV0dXJuIG51bGw7IH1cbiAgICBjb25zdCBwcmVzZW50VmFsaWRhdG9ycyA9IHZhbGlkYXRvcnMuZmlsdGVyKGlzRGVmaW5lZCk7XG4gICAgaWYgKHByZXNlbnRWYWxpZGF0b3JzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuICAgIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBpbnZlcnQgPSBmYWxzZSk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCA9PiB7XG4gICAgICBjb25zdCBhcnJheU9mRXJyb3JzID1cbiAgICAgICAgX2V4ZWN1dGVWYWxpZGF0b3JzKGNvbnRyb2wsIHByZXNlbnRWYWxpZGF0b3JzLCBpbnZlcnQpLmZpbHRlcihpc0RlZmluZWQpO1xuICAgICAgY29uc3QgaXNWYWxpZCA9IHZhbGlkYXRvcnMubGVuZ3RoID4gYXJyYXlPZkVycm9ycy5sZW5ndGg7XG4gICAgICByZXR1cm4geG9yKGlzVmFsaWQsIGludmVydCkgP1xuICAgICAgICBudWxsIDogX21lcmdlT2JqZWN0cyguLi5hcnJheU9mRXJyb3JzLCB7ICdhbnlPZic6ICFpbnZlcnQgfSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnY29tcG9zZU9uZU9mJyB2YWxpZGF0b3IgY29tYmluYXRpb24gZnVuY3Rpb25cbiAgICpcbiAgICogQWNjZXB0cyBhbiBhcnJheSBvZiB2YWxpZGF0b3JzIGFuZCByZXR1cm5zIGEgc2luZ2xlIHZhbGlkYXRvciB0aGF0XG4gICAqIGV2YWx1YXRlcyB0byB2YWxpZCBvbmx5IGlmIGV4YWN0bHkgb25lIG9mIHRoZSBzdWJtaXR0ZWQgdmFsaWRhdG9yc1xuICAgKiBpcyB2YWxpZC4gT3RoZXJ3aXNlIHJldHVybnMgY29tYmluZWQgaW5mb3JtYXRpb24gZnJvbSBhbGwgdmFsaWRhdG9ycyxcbiAgICogYm90aCB2YWxpZCBhbmQgaW52YWxpZC5cbiAgICpcbiAgICogLy8ge0lWYWxpZGF0b3JGbltdfSB2YWxpZGF0b3JzIC0gYXJyYXkgb2YgdmFsaWRhdG9ycyB0byBjb21iaW5lXG4gICAqIC8vIHtJVmFsaWRhdG9yRm59IC0gc2luZ2xlIGNvbWJpbmVkIHZhbGlkYXRvciBmdW5jdGlvblxuICAgKi9cbiAgc3RhdGljIGNvbXBvc2VPbmVPZih2YWxpZGF0b3JzOiBJVmFsaWRhdG9yRm5bXSk6IElWYWxpZGF0b3JGbiB7XG4gICAgaWYgKCF2YWxpZGF0b3JzKSB7IHJldHVybiBudWxsOyB9XG4gICAgY29uc3QgcHJlc2VudFZhbGlkYXRvcnMgPSB2YWxpZGF0b3JzLmZpbHRlcihpc0RlZmluZWQpO1xuICAgIGlmIChwcmVzZW50VmFsaWRhdG9ycy5sZW5ndGggPT09IDApIHsgcmV0dXJuIG51bGw7IH1cbiAgICByZXR1cm4gKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCwgaW52ZXJ0ID0gZmFsc2UpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgY29uc3QgYXJyYXlPZkVycm9ycyA9XG4gICAgICAgIF9leGVjdXRlVmFsaWRhdG9ycyhjb250cm9sLCBwcmVzZW50VmFsaWRhdG9ycyk7XG4gICAgICBjb25zdCB2YWxpZENvbnRyb2xzID1cbiAgICAgICAgdmFsaWRhdG9ycy5sZW5ndGggLSBhcnJheU9mRXJyb3JzLmZpbHRlcihpc0RlZmluZWQpLmxlbmd0aDtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSB2YWxpZENvbnRyb2xzID09PSAxO1xuICAgICAgaWYgKHhvcihpc1ZhbGlkLCBpbnZlcnQpKSB7IHJldHVybiBudWxsOyB9XG4gICAgICBjb25zdCBhcnJheU9mVmFsaWRzID1cbiAgICAgICAgX2V4ZWN1dGVWYWxpZGF0b3JzKGNvbnRyb2wsIHByZXNlbnRWYWxpZGF0b3JzLCBpbnZlcnQpO1xuICAgICAgcmV0dXJuIF9tZXJnZU9iamVjdHMoLi4uYXJyYXlPZkVycm9ycywgLi4uYXJyYXlPZlZhbGlkcywgeyAnb25lT2YnOiAhaW52ZXJ0IH0pO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogJ2NvbXBvc2VBbGxPZicgdmFsaWRhdG9yIGNvbWJpbmF0aW9uIGZ1bmN0aW9uXG4gICAqXG4gICAqIEFjY2VwdHMgYW4gYXJyYXkgb2YgdmFsaWRhdG9ycyBhbmQgcmV0dXJucyBhIHNpbmdsZSB2YWxpZGF0b3IgdGhhdFxuICAgKiBldmFsdWF0ZXMgdG8gdmFsaWQgb25seSBpZiBhbGwgdGhlIHN1Ym1pdHRlZCB2YWxpZGF0b3JzIGFyZSBpbmRpdmlkdWFsbHlcbiAgICogdmFsaWQuIE90aGVyd2lzZSBpdCByZXR1cm5zIGNvbWJpbmVkIGVycm9ycyBmcm9tIGFsbCBpbnZhbGlkIHZhbGlkYXRvcnMuXG4gICAqXG4gICAqIC8vIHtJVmFsaWRhdG9yRm5bXX0gdmFsaWRhdG9ycyAtIGFycmF5IG9mIHZhbGlkYXRvcnMgdG8gY29tYmluZVxuICAgKiAvLyB7SVZhbGlkYXRvckZufSAtIHNpbmdsZSBjb21iaW5lZCB2YWxpZGF0b3IgZnVuY3Rpb25cbiAgICovXG4gIHN0YXRpYyBjb21wb3NlQWxsT2YodmFsaWRhdG9yczogSVZhbGlkYXRvckZuW10pOiBJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghdmFsaWRhdG9ycykgeyByZXR1cm4gbnVsbDsgfVxuICAgIGNvbnN0IHByZXNlbnRWYWxpZGF0b3JzID0gdmFsaWRhdG9ycy5maWx0ZXIoaXNEZWZpbmVkKTtcbiAgICBpZiAocHJlc2VudFZhbGlkYXRvcnMubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGludmVydCA9IGZhbHNlKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIGNvbnN0IGNvbWJpbmVkRXJyb3JzID0gX21lcmdlRXJyb3JzKFxuICAgICAgICBfZXhlY3V0ZVZhbGlkYXRvcnMoY29udHJvbCwgcHJlc2VudFZhbGlkYXRvcnMsIGludmVydClcbiAgICAgICk7XG4gICAgICBjb25zdCBpc1ZhbGlkID0gY29tYmluZWRFcnJvcnMgPT09IG51bGw7XG4gICAgICByZXR1cm4gKHhvcihpc1ZhbGlkLCBpbnZlcnQpKSA/XG4gICAgICAgIG51bGwgOiBfbWVyZ2VPYmplY3RzKGNvbWJpbmVkRXJyb3JzLCB7ICdhbGxPZic6ICFpbnZlcnQgfSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnY29tcG9zZU5vdCcgdmFsaWRhdG9yIGludmVyc2lvbiBmdW5jdGlvblxuICAgKlxuICAgKiBBY2NlcHRzIGEgc2luZ2xlIHZhbGlkYXRvciBmdW5jdGlvbiBhbmQgaW52ZXJ0cyBpdHMgcmVzdWx0LlxuICAgKiBSZXR1cm5zIHZhbGlkIGlmIHRoZSBzdWJtaXR0ZWQgdmFsaWRhdG9yIGlzIGludmFsaWQsIGFuZFxuICAgKiByZXR1cm5zIGludmFsaWQgaWYgdGhlIHN1Ym1pdHRlZCB2YWxpZGF0b3IgaXMgdmFsaWQuXG4gICAqIChOb3RlOiB0aGlzIGZ1bmN0aW9uIGNhbiBpdHNlbGYgYmUgaW52ZXJ0ZWRcbiAgICogICAtIGUuZy4gY29tcG9zZU5vdChjb21wb3NlTm90KHZhbGlkYXRvcikpIC1cbiAgICogICBidXQgdGhpcyBjYW4gYmUgY29uZnVzaW5nIGFuZCBpcyB0aGVyZWZvcmUgbm90IHJlY29tbWVuZGVkLilcbiAgICpcbiAgICogLy8ge0lWYWxpZGF0b3JGbltdfSB2YWxpZGF0b3JzIC0gdmFsaWRhdG9yKHMpIHRvIGludmVydFxuICAgKiAvLyB7SVZhbGlkYXRvckZufSAtIG5ldyB2YWxpZGF0b3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIG9wcG9zaXRlIHJlc3VsdFxuICAgKi9cbiAgc3RhdGljIGNvbXBvc2VOb3QodmFsaWRhdG9yOiBJVmFsaWRhdG9yRm4pOiBJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghdmFsaWRhdG9yKSB7IHJldHVybiBudWxsOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wsIGludmVydCA9IGZhbHNlKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIGlmIChpc0VtcHR5KGNvbnRyb2wudmFsdWUpKSB7IHJldHVybiBudWxsOyB9XG4gICAgICBjb25zdCBlcnJvciA9IHZhbGlkYXRvcihjb250cm9sLCAhaW52ZXJ0KTtcbiAgICAgIGNvbnN0IGlzVmFsaWQgPSBlcnJvciA9PT0gbnVsbDtcbiAgICAgIHJldHVybiAoeG9yKGlzVmFsaWQsIGludmVydCkpID9cbiAgICAgICAgbnVsbCA6IF9tZXJnZU9iamVjdHMoZXJyb3IsIHsgJ25vdCc6ICFpbnZlcnQgfSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnY29tcG9zZScgdmFsaWRhdG9yIGNvbWJpbmF0aW9uIGZ1bmN0aW9uXG4gICAqXG4gICAqIC8vIHtJVmFsaWRhdG9yRm5bXX0gdmFsaWRhdG9ycyAtIGFycmF5IG9mIHZhbGlkYXRvcnMgdG8gY29tYmluZVxuICAgKiAvLyB7SVZhbGlkYXRvckZufSAtIHNpbmdsZSBjb21iaW5lZCB2YWxpZGF0b3IgZnVuY3Rpb25cbiAgICovXG4gIHN0YXRpYyBjb21wb3NlKHZhbGlkYXRvcnM6IElWYWxpZGF0b3JGbltdKTogSVZhbGlkYXRvckZuIHtcbiAgICBpZiAoIXZhbGlkYXRvcnMpIHsgcmV0dXJuIG51bGw7IH1cbiAgICBjb25zdCBwcmVzZW50VmFsaWRhdG9ycyA9IHZhbGlkYXRvcnMuZmlsdGVyKGlzRGVmaW5lZCk7XG4gICAgaWYgKHByZXNlbnRWYWxpZGF0b3JzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gbnVsbDsgfVxuICAgIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sLCBpbnZlcnQgPSBmYWxzZSk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCA9PlxuICAgICAgX21lcmdlRXJyb3JzKF9leGVjdXRlVmFsaWRhdG9ycyhjb250cm9sLCBwcmVzZW50VmFsaWRhdG9ycywgaW52ZXJ0KSk7XG4gIH1cblxuICAvKipcbiAgICogJ2NvbXBvc2VBc3luYycgYXN5bmMgdmFsaWRhdG9yIGNvbWJpbmF0aW9uIGZ1bmN0aW9uXG4gICAqXG4gICAqIC8vIHtBc3luY0lWYWxpZGF0b3JGbltdfSBhc3luYyB2YWxpZGF0b3JzIC0gYXJyYXkgb2YgYXN5bmMgdmFsaWRhdG9yc1xuICAgKiAvLyB7QXN5bmNJVmFsaWRhdG9yRm59IC0gc2luZ2xlIGNvbWJpbmVkIGFzeW5jIHZhbGlkYXRvciBmdW5jdGlvblxuICAgKi9cbiAgc3RhdGljIGNvbXBvc2VBc3luYyh2YWxpZGF0b3JzOiBBc3luY0lWYWxpZGF0b3JGbltdKTogQXN5bmNJVmFsaWRhdG9yRm4ge1xuICAgIGlmICghdmFsaWRhdG9ycykgeyByZXR1cm4gbnVsbDsgfVxuICAgIGNvbnN0IHByZXNlbnRWYWxpZGF0b3JzID0gdmFsaWRhdG9ycy5maWx0ZXIoaXNEZWZpbmVkKTtcbiAgICBpZiAocHJlc2VudFZhbGlkYXRvcnMubGVuZ3RoID09PSAwKSB7IHJldHVybiBudWxsOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpID0+IHtcbiAgICAgIGNvbnN0IG9ic2VydmFibGVzID1cbiAgICAgICAgX2V4ZWN1dGVBc3luY1ZhbGlkYXRvcnMoY29udHJvbCwgcHJlc2VudFZhbGlkYXRvcnMpLm1hcCh0b09ic2VydmFibGUpO1xuICAgICAgcmV0dXJuIG1hcC5jYWxsKGZvcmtKb2luKG9ic2VydmFibGVzKSwgX21lcmdlRXJyb3JzKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gQWRkaXRpb25hbCBhbmd1bGFyIHZhbGlkYXRvcnMgKG5vdCB1c2VkIGJ5IEFuZ3VhbHIgSlNPTiBTY2hlbWEgRm9ybSlcbiAgLy8gRnJvbSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2Jsb2IvbWFzdGVyL3BhY2thZ2VzL2Zvcm1zL3NyYy92YWxpZGF0b3JzLnRzXG5cbiAgLyoqXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIGNvbnRyb2xzIHRvIGhhdmUgYSB2YWx1ZSBncmVhdGVyIHRoYW4gYSBudW1iZXIuXG4gICAqL1xuICBzdGF0aWMgbWluKG1pbjogbnVtYmVyKTogVmFsaWRhdG9yRm4ge1xuICAgIGlmICghaGFzVmFsdWUobWluKSkgeyByZXR1cm4gSnNvblZhbGlkYXRvcnMubnVsbFZhbGlkYXRvcjsgfVxuICAgIHJldHVybiAoY29udHJvbDogQWJzdHJhY3RDb250cm9sKTogVmFsaWRhdGlvbkVycm9yc3xudWxsID0+IHtcbiAgICAgIC8vIGRvbid0IHZhbGlkYXRlIGVtcHR5IHZhbHVlcyB0byBhbGxvdyBvcHRpb25hbCBjb250cm9sc1xuICAgICAgaWYgKGlzRW1wdHkoY29udHJvbC52YWx1ZSkgfHwgaXNFbXB0eShtaW4pKSB7IHJldHVybiBudWxsOyB9XG4gICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQoY29udHJvbC52YWx1ZSk7XG4gICAgICBjb25zdCBhY3R1YWwgPSBjb250cm9sLnZhbHVlO1xuICAgICAgLy8gQ29udHJvbHMgd2l0aCBOYU4gdmFsdWVzIGFmdGVyIHBhcnNpbmcgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgbm90IGhhdmluZyBhXG4gICAgICAvLyBtaW5pbXVtLCBwZXIgdGhlIEhUTUwgZm9ybXMgc3BlYzogaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L2Zvcm1zLmh0bWwjYXR0ci1pbnB1dC1taW5cbiAgICAgIHJldHVybiBpc05hTih2YWx1ZSkgfHwgdmFsdWUgPj0gbWluID8gbnVsbCA6IHsgJ21pbic6IHsgbWluLCBhY3R1YWwgfSB9O1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgY29udHJvbHMgdG8gaGF2ZSBhIHZhbHVlIGxlc3MgdGhhbiBhIG51bWJlci5cbiAgICovXG4gIHN0YXRpYyBtYXgobWF4OiBudW1iZXIpOiBWYWxpZGF0b3JGbiB7XG4gICAgaWYgKCFoYXNWYWx1ZShtYXgpKSB7IHJldHVybiBKc29uVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yOyB9XG4gICAgcmV0dXJuIChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwgPT4ge1xuICAgICAgLy8gZG9uJ3QgdmFsaWRhdGUgZW1wdHkgdmFsdWVzIHRvIGFsbG93IG9wdGlvbmFsIGNvbnRyb2xzXG4gICAgICBpZiAoaXNFbXB0eShjb250cm9sLnZhbHVlKSB8fCBpc0VtcHR5KG1heCkpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VGbG9hdChjb250cm9sLnZhbHVlKTtcbiAgICAgIGNvbnN0IGFjdHVhbCA9IGNvbnRyb2wudmFsdWU7XG4gICAgICAvLyBDb250cm9scyB3aXRoIE5hTiB2YWx1ZXMgYWZ0ZXIgcGFyc2luZyBzaG91bGQgYmUgdHJlYXRlZCBhcyBub3QgaGF2aW5nIGFcbiAgICAgIC8vIG1heGltdW0sIHBlciB0aGUgSFRNTCBmb3JtcyBzcGVjOiBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCNhdHRyLWlucHV0LW1heFxuICAgICAgcmV0dXJuIGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8PSBtYXggPyBudWxsIDogeyAnbWF4JzogeyBtYXgsIGFjdHVhbCB9IH07XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyBjb250cm9sIHZhbHVlIHRvIGJlIHRydWUuXG4gICAqL1xuICBzdGF0aWMgcmVxdWlyZWRUcnVlKGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCk6IFZhbGlkYXRpb25FcnJvcnN8bnVsbCB7XG4gICAgaWYgKCFjb250cm9sKSB7IHJldHVybiBKc29uVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yOyB9XG4gICAgcmV0dXJuIGNvbnRyb2wudmFsdWUgPT09IHRydWUgPyBudWxsIDogeyAncmVxdWlyZWQnOiB0cnVlIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdG9yIHRoYXQgcGVyZm9ybXMgZW1haWwgdmFsaWRhdGlvbi5cbiAgICovXG4gIHN0YXRpYyBlbWFpbChjb250cm9sOiBBYnN0cmFjdENvbnRyb2wpOiBWYWxpZGF0aW9uRXJyb3JzfG51bGwge1xuICAgIGlmICghY29udHJvbCkgeyByZXR1cm4gSnNvblZhbGlkYXRvcnMubnVsbFZhbGlkYXRvcjsgfVxuICAgIGNvbnN0IEVNQUlMX1JFR0VYUCA9XG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bWF4LWxpbmUtbGVuZ3RoXG4gICAgICAvXig/PS57MSwyNTR9JCkoPz0uezEsNjR9QClbLSEjJCUmJyorLzAtOT0/QS1aXl9gYS16e3x9fl0rKFxcLlstISMkJSYnKisvMC05PT9BLVpeX2BhLXp7fH1+XSspKkBbQS1aYS16MC05XShbQS1aYS16MC05LV17MCw2MX1bQS1aYS16MC05XSk/KFxcLltBLVphLXowLTldKFtBLVphLXowLTktXXswLDYxfVtBLVphLXowLTldKT8pKiQvO1xuICAgIHJldHVybiBFTUFJTF9SRUdFWFAudGVzdChjb250cm9sLnZhbHVlKSA/IG51bGwgOiB7ICdlbWFpbCc6IHRydWUgfTtcbiAgfVxufVxuIl19
