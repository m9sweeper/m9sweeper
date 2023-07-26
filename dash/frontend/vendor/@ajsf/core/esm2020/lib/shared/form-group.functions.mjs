import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import map from 'lodash/map';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { forEach, hasOwn } from './utility.functions.mjs';
import { getControlValidators, removeRecursiveReferences } from './json-schema.functions.mjs';
import { hasValue, inArray, isArray, isDate, isDefined, isEmpty, isObject, isPrimitive, toJavaScriptType, toSchemaType } from './validator.functions.mjs';
import { JsonPointer } from './jsonpointer.functions.mjs';
import { JsonValidators } from './json.validators.mjs';
/**
 * FormGroup function library:
 *
 * buildFormGroupTemplate:  Builds a FormGroupTemplate from schema
 *
 * buildFormGroup:          Builds an Angular FormGroup from a FormGroupTemplate
 *
 * mergeValues:
 *
 * setRequiredFields:
 *
 * formatFormData:
 *
 * getControl:
 *
 * ---- TODO: ----
 * TODO: add buildFormGroupTemplateFromLayout function
 * buildFormGroupTemplateFromLayout: Builds a FormGroupTemplate from a form layout
 */
/**
 * 'buildFormGroupTemplate' function
 *
 * Builds a template for an Angular FormGroup from a JSON Schema.
 *
 * TODO: add support for pattern properties
 * https://spacetelescope.github.io/understanding-json-schema/reference/object.html
 *
 * //  {any} jsf -
 * //  {any = null} nodeValue -
 * //  {boolean = true} mapArrays -
 * //  {string = ''} schemaPointer -
 * //  {string = ''} dataPointer -
 * //  {any = ''} templatePointer -
 * // {any} -
 */
export function buildFormGroupTemplate(jsf, nodeValue = null, setValues = true, schemaPointer = '', dataPointer = '', templatePointer = '') {
    const schema = JsonPointer.get(jsf.schema, schemaPointer);
    if (setValues) {
        if (!isDefined(nodeValue) && (jsf.formOptions.setSchemaDefaults === true ||
            (jsf.formOptions.setSchemaDefaults === 'auto' && isEmpty(jsf.formValues)))) {
            nodeValue = JsonPointer.get(jsf.schema, schemaPointer + '/default');
        }
    }
    else {
        nodeValue = null;
    }
    // TODO: If nodeValue still not set, check layout for default value
    const schemaType = JsonPointer.get(schema, '/type');
    const controlType = (hasOwn(schema, 'properties') || hasOwn(schema, 'additionalProperties')) &&
        schemaType === 'object' ? 'FormGroup' :
        (hasOwn(schema, 'items') || hasOwn(schema, 'additionalItems')) &&
            schemaType === 'array' ? 'FormArray' :
            !schemaType && hasOwn(schema, '$ref') ? '$ref' : 'FormControl';
    const shortDataPointer = removeRecursiveReferences(dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
    if (!jsf.dataMap.has(shortDataPointer)) {
        jsf.dataMap.set(shortDataPointer, new Map());
    }
    const nodeOptions = jsf.dataMap.get(shortDataPointer);
    if (!nodeOptions.has('schemaType')) {
        nodeOptions.set('schemaPointer', schemaPointer);
        nodeOptions.set('schemaType', schema.type);
        if (schema.format) {
            nodeOptions.set('schemaFormat', schema.format);
            if (!schema.type) {
                nodeOptions.set('schemaType', 'string');
            }
        }
        if (controlType) {
            nodeOptions.set('templatePointer', templatePointer);
            nodeOptions.set('templateType', controlType);
        }
    }
    let controls;
    const validators = getControlValidators(schema);
    switch (controlType) {
        case 'FormGroup':
            controls = {};
            if (hasOwn(schema, 'ui:order') || hasOwn(schema, 'properties')) {
                const propertyKeys = schema['ui:order'] || Object.keys(schema.properties);
                if (propertyKeys.includes('*') && !hasOwn(schema.properties, '*')) {
                    const unnamedKeys = Object.keys(schema.properties)
                        .filter(key => !propertyKeys.includes(key));
                    for (let i = propertyKeys.length - 1; i >= 0; i--) {
                        if (propertyKeys[i] === '*') {
                            propertyKeys.splice(i, 1, ...unnamedKeys);
                        }
                    }
                }
                propertyKeys
                    .filter(key => hasOwn(schema.properties, key) ||
                    hasOwn(schema, 'additionalProperties'))
                    .forEach(key => controls[key] = buildFormGroupTemplate(jsf, JsonPointer.get(nodeValue, [key]), setValues, schemaPointer + (hasOwn(schema.properties, key) ?
                    '/properties/' + key : '/additionalProperties'), dataPointer + '/' + key, templatePointer + '/controls/' + key));
                jsf.formOptions.fieldsRequired = setRequiredFields(schema, controls);
            }
            return { controlType, controls, validators };
        case 'FormArray':
            controls = [];
            const minItems = Math.max(schema.minItems || 0, nodeOptions.get('minItems') || 0);
            const maxItems = Math.min(schema.maxItems || 1000, nodeOptions.get('maxItems') || 1000);
            let additionalItemsPointer = null;
            if (isArray(schema.items)) { // 'items' is an array = tuple items
                const tupleItems = nodeOptions.get('tupleItems') ||
                    (isArray(schema.items) ? Math.min(schema.items.length, maxItems) : 0);
                for (let i = 0; i < tupleItems; i++) {
                    if (i < minItems) {
                        controls.push(buildFormGroupTemplate(jsf, isArray(nodeValue) ? nodeValue[i] : nodeValue, setValues, schemaPointer + '/items/' + i, dataPointer + '/' + i, templatePointer + '/controls/' + i));
                    }
                    else {
                        const schemaRefPointer = removeRecursiveReferences(schemaPointer + '/items/' + i, jsf.schemaRecursiveRefMap);
                        const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/' + i, jsf.dataRecursiveRefMap, jsf.arrayMap);
                        const itemRecursive = itemRefPointer !== shortDataPointer + '/' + i;
                        if (!hasOwn(jsf.templateRefLibrary, itemRefPointer)) {
                            jsf.templateRefLibrary[itemRefPointer] = null;
                            jsf.templateRefLibrary[itemRefPointer] = buildFormGroupTemplate(jsf, null, setValues, schemaRefPointer, itemRefPointer, templatePointer + '/controls/' + i);
                        }
                        controls.push(isArray(nodeValue) ?
                            buildFormGroupTemplate(jsf, nodeValue[i], setValues, schemaPointer + '/items/' + i, dataPointer + '/' + i, templatePointer + '/controls/' + i) :
                            itemRecursive ?
                                null : cloneDeep(jsf.templateRefLibrary[itemRefPointer]));
                    }
                }
                // If 'additionalItems' is an object = additional list items (after tuple items)
                if (schema.items.length < maxItems && isObject(schema.additionalItems)) {
                    additionalItemsPointer = schemaPointer + '/additionalItems';
                }
                // If 'items' is an object = list items only (no tuple items)
            }
            else {
                additionalItemsPointer = schemaPointer + '/items';
            }
            if (additionalItemsPointer) {
                const schemaRefPointer = removeRecursiveReferences(additionalItemsPointer, jsf.schemaRecursiveRefMap);
                const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
                const itemRecursive = itemRefPointer !== shortDataPointer + '/-';
                if (!hasOwn(jsf.templateRefLibrary, itemRefPointer)) {
                    jsf.templateRefLibrary[itemRefPointer] = null;
                    jsf.templateRefLibrary[itemRefPointer] = buildFormGroupTemplate(jsf, null, setValues, schemaRefPointer, itemRefPointer, templatePointer + '/controls/-');
                }
                // const itemOptions = jsf.dataMap.get(itemRefPointer) || new Map();
                const itemOptions = nodeOptions;
                if (!itemRecursive || hasOwn(validators, 'required')) {
                    const arrayLength = Math.min(Math.max(itemRecursive ? 0 :
                        (itemOptions.get('tupleItems') + itemOptions.get('listItems')) || 0, isArray(nodeValue) ? nodeValue.length : 0), maxItems);
                    for (let i = controls.length; i < arrayLength; i++) {
                        controls.push(isArray(nodeValue) ?
                            buildFormGroupTemplate(jsf, nodeValue[i], setValues, schemaRefPointer, dataPointer + '/-', templatePointer + '/controls/-') :
                            itemRecursive ?
                                null : cloneDeep(jsf.templateRefLibrary[itemRefPointer]));
                    }
                }
            }
            return { controlType, controls, validators };
        case '$ref':
            const schemaRef = JsonPointer.compile(schema.$ref);
            const dataRef = JsonPointer.toDataPointer(schemaRef, schema);
            const refPointer = removeRecursiveReferences(dataRef, jsf.dataRecursiveRefMap, jsf.arrayMap);
            if (refPointer && !hasOwn(jsf.templateRefLibrary, refPointer)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.templateRefLibrary[refPointer] = null;
                const newTemplate = buildFormGroupTemplate(jsf, setValues, setValues, schemaRef);
                if (newTemplate) {
                    jsf.templateRefLibrary[refPointer] = newTemplate;
                }
                else {
                    delete jsf.templateRefLibrary[refPointer];
                }
            }
            return null;
        case 'FormControl':
            const value = {
                value: setValues && isPrimitive(nodeValue) ? nodeValue : null,
                disabled: nodeOptions.get('disabled') || false
            };
            return { controlType, value, validators };
        default:
            return null;
    }
}
/**
 * 'buildFormGroup' function
 *
 * // {any} template -
 * // {AbstractControl}
*/
export function buildFormGroup(template) {
    const validatorFns = [];
    let validatorFn = null;
    if (hasOwn(template, 'validators')) {
        forEach(template.validators, (parameters, validator) => {
            if (typeof JsonValidators[validator] === 'function') {
                validatorFns.push(JsonValidators[validator].apply(null, parameters));
            }
        });
        if (validatorFns.length &&
            inArray(template.controlType, ['FormGroup', 'FormArray'])) {
            validatorFn = validatorFns.length > 1 ?
                JsonValidators.compose(validatorFns) : validatorFns[0];
        }
    }
    if (hasOwn(template, 'controlType')) {
        switch (template.controlType) {
            case 'FormGroup':
                const groupControls = {};
                forEach(template.controls, (controls, key) => {
                    const newControl = buildFormGroup(controls);
                    if (newControl) {
                        groupControls[key] = newControl;
                    }
                });
                return new UntypedFormGroup(groupControls, validatorFn);
            case 'FormArray':
                return new UntypedFormArray(filter(map(template.controls, controls => buildFormGroup(controls))), validatorFn);
            case 'FormControl':
                return new UntypedFormControl(template.value, validatorFns);
        }
    }
    return null;
}
/**
 * 'mergeValues' function
 *
 * //  {any[]} ...valuesToMerge - Multiple values to merge
 * // {any} - Merged values
 */
export function mergeValues(...valuesToMerge) {
    let mergedValues = null;
    for (const currentValue of valuesToMerge) {
        if (!isEmpty(currentValue)) {
            if (typeof currentValue === 'object' &&
                (isEmpty(mergedValues) || typeof mergedValues !== 'object')) {
                if (isArray(currentValue)) {
                    mergedValues = [...currentValue];
                }
                else if (isObject(currentValue)) {
                    mergedValues = { ...currentValue };
                }
            }
            else if (typeof currentValue !== 'object') {
                mergedValues = currentValue;
            }
            else if (isObject(mergedValues) && isObject(currentValue)) {
                Object.assign(mergedValues, currentValue);
            }
            else if (isObject(mergedValues) && isArray(currentValue)) {
                const newValues = [];
                for (const value of currentValue) {
                    newValues.push(mergeValues(mergedValues, value));
                }
                mergedValues = newValues;
            }
            else if (isArray(mergedValues) && isObject(currentValue)) {
                const newValues = [];
                for (const value of mergedValues) {
                    newValues.push(mergeValues(value, currentValue));
                }
                mergedValues = newValues;
            }
            else if (isArray(mergedValues) && isArray(currentValue)) {
                const newValues = [];
                for (let i = 0; i < Math.max(mergedValues.length, currentValue.length); i++) {
                    if (i < mergedValues.length && i < currentValue.length) {
                        newValues.push(mergeValues(mergedValues[i], currentValue[i]));
                    }
                    else if (i < mergedValues.length) {
                        newValues.push(mergedValues[i]);
                    }
                    else if (i < currentValue.length) {
                        newValues.push(currentValue[i]);
                    }
                }
                mergedValues = newValues;
            }
        }
    }
    return mergedValues;
}
/**
 * 'setRequiredFields' function
 *
 * // {schema} schema - JSON Schema
 * // {object} formControlTemplate - Form Control Template object
 * // {boolean} - true if any fields have been set to required, false if not
 */
export function setRequiredFields(schema, formControlTemplate) {
    let fieldsRequired = false;
    if (hasOwn(schema, 'required') && !isEmpty(schema.required)) {
        fieldsRequired = true;
        let requiredArray = isArray(schema.required) ? schema.required : [schema.required];
        requiredArray = forEach(requiredArray, key => JsonPointer.set(formControlTemplate, '/' + key + '/validators/required', []));
    }
    return fieldsRequired;
    // TODO: Add support for patternProperties
    // https://spacetelescope.github.io/understanding-json-schema/reference/object.html#pattern-properties
}
/**
 * 'formatFormData' function
 *
 * // {any} formData - Angular FormGroup eventLog object
 * // {Map<string, any>} dataMap -
 * // {Map<string, string>} recursiveRefMap -
 * // {Map<string, number>} arrayMap -
 * // {boolean = false} fixErrors - if TRUE, tries to fix eventLog
 * // {any} - formatted eventLog object
 */
export function formatFormData(formData, dataMap, recursiveRefMap, arrayMap, returnEmptyFields = false, fixErrors = false) {
    if (formData === null || typeof formData !== 'object') {
        return formData;
    }
    const formattedData = isArray(formData) ? [] : {};
    JsonPointer.forEachDeep(formData, (value, dataPointer) => {
        // If returnEmptyFields === true,
        // add empty arrays and objects to all allowed keys
        if (returnEmptyFields && isArray(value)) {
            JsonPointer.set(formattedData, dataPointer, []);
        }
        else if (returnEmptyFields && isObject(value) && !isDate(value)) {
            JsonPointer.set(formattedData, dataPointer, {});
        }
        else {
            const genericPointer = JsonPointer.has(dataMap, [dataPointer, 'schemaType']) ? dataPointer :
                removeRecursiveReferences(dataPointer, recursiveRefMap, arrayMap);
            if (JsonPointer.has(dataMap, [genericPointer, 'schemaType'])) {
                const schemaType = dataMap.get(genericPointer).get('schemaType');
                if (schemaType === 'null') {
                    JsonPointer.set(formattedData, dataPointer, null);
                }
                else if ((hasValue(value) || returnEmptyFields) &&
                    inArray(schemaType, ['string', 'integer', 'number', 'boolean'])) {
                    const newValue = (fixErrors || (value === null && returnEmptyFields)) ?
                        toSchemaType(value, schemaType) : toJavaScriptType(value, schemaType);
                    if (isDefined(newValue) || returnEmptyFields) {
                        JsonPointer.set(formattedData, dataPointer, newValue);
                    }
                }
                // Finish incomplete 'date-time' entries
                if (dataMap.get(genericPointer).get('schemaFormat') === 'date-time') {
                    // "2000-03-14T01:59:26.535" -> "2000-03-14T01:59:26.535Z" (add "Z")
                    if (/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, `${value}Z`);
                        // "2000-03-14T01:59" -> "2000-03-14T01:59:00Z" (add ":00Z")
                    }
                    else if (/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, `${value}:00Z`);
                        // "2000-03-14" -> "2000-03-14T00:00:00Z" (add "T00:00:00Z")
                    }
                    else if (fixErrors && /^\d\d\d\d-[0-1]\d-[0-3]\d$/i.test(value)) {
                        JsonPointer.set(formattedData, dataPointer, `${value}:00:00:00Z`);
                    }
                }
            }
            else if (typeof value !== 'object' || isDate(value) ||
                (value === null && returnEmptyFields)) {
                console.error('formatFormData error: ' +
                    `Schema type not found for form value at ${genericPointer}`);
                console.error('dataMap', dataMap);
                console.error('recursiveRefMap', recursiveRefMap);
                console.error('genericPointer', genericPointer);
            }
        }
    });
    return formattedData;
}
/**
 * 'getControl' function
 *
 * Uses a JSON Pointer for a eventLog object to retrieve a control from
 * an Angular formGroup or formGroup template. (Note: though a formGroup
 * template is much simpler, its basic structure is idential to a formGroup).
 *
 * If the optional third parameter 'returnGroup' is set to TRUE, the group
 * containing the control is returned, rather than the control itself.
 *
 * // {FormGroup} formGroup - Angular FormGroup to get value from
 * // {Pointer} dataPointer - JSON Pointer (string or array)
 * // {boolean = false} returnGroup - If true, return group containing control
 * // {group} - Located value (or null, if no control found)
 */
export function getControl(formGroup, dataPointer, returnGroup = false) {
    if (!isObject(formGroup) || !JsonPointer.isJsonPointer(dataPointer)) {
        if (!JsonPointer.isJsonPointer(dataPointer)) {
            // If dataPointer input is not a valid JSON pointer, check to
            // see if it is instead a valid object path, using dot notaion
            if (typeof dataPointer === 'string') {
                const formControl = formGroup.get(dataPointer);
                if (formControl) {
                    return formControl;
                }
            }
            console.error(`getControl error: Invalid JSON Pointer: ${dataPointer}`);
        }
        if (!isObject(formGroup)) {
            console.error(`getControl error: Invalid formGroup: ${formGroup}`);
        }
        return null;
    }
    let dataPointerArray = JsonPointer.parse(dataPointer);
    if (returnGroup) {
        dataPointerArray = dataPointerArray.slice(0, -1);
    }
    // If formGroup input is a real formGroup (not a formGroup template)
    // try using formGroup.get() to return the control
    if (typeof formGroup.get === 'function' &&
        dataPointerArray.every(key => key.indexOf('.') === -1)) {
        const formControl = formGroup.get(dataPointerArray.join('.'));
        if (formControl) {
            return formControl;
        }
    }
    // If formGroup input is a formGroup template,
    // or formGroup.get() failed to return the control,
    // search the formGroup object for dataPointer's control
    let subGroup = formGroup;
    for (const key of dataPointerArray) {
        if (hasOwn(subGroup, 'controls')) {
            subGroup = subGroup.controls;
        }
        if (isArray(subGroup) && (key === '-')) {
            subGroup = subGroup[subGroup.length - 1];
        }
        else if (hasOwn(subGroup, key)) {
            subGroup = subGroup[key];
        }
        else {
            console.error(`getControl error: Unable to find "${key}" item in FormGroup.`);
            console.error(dataPointer);
            console.error(formGroup);
            return;
        }
    }
    return subGroup;
}
//# sourceMappingURL=eventLog:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1ncm91cC5mdW5jdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLWNvcmUvc3JjL2xpYi9zaGFyZWQvZm9ybS1ncm91cC5mdW5jdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0sa0JBQWtCLENBQUM7QUFDekMsT0FBTyxNQUFNLE1BQU0sZUFBZSxDQUFDO0FBQ25DLE9BQU8sR0FBRyxNQUFNLFlBQVksQ0FBQztBQUM3QixPQUFPLEVBRUwsZ0JBQWdCLEVBQ2hCLGtCQUFrQixFQUNsQixnQkFBZ0IsRUFFakIsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzFGLE9BQU8sRUFDTCxRQUFRLEVBQ1IsT0FBTyxFQUNQLE9BQU8sRUFDUCxNQUFNLEVBQ04sU0FBUyxFQUNULE9BQU8sRUFDUCxRQUFRLEVBQ1IsV0FBVyxFQUVYLGdCQUFnQixFQUNoQixZQUFZLEVBQ2IsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQUUsV0FBVyxFQUFXLE1BQU0seUJBQXlCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSW5EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkc7QUFFSDs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFDSCxNQUFNLFVBQVUsc0JBQXNCLENBQ3BDLEdBQVEsRUFBRSxZQUFpQixJQUFJLEVBQUUsU0FBUyxHQUFHLElBQUksRUFDakQsYUFBYSxHQUFHLEVBQUUsRUFBRSxXQUFXLEdBQUcsRUFBRSxFQUFFLGVBQWUsR0FBRyxFQUFFO0lBRTFELE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FB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QUcsU0FBUyxDQUFDO0lBQ3pCLEtBQUssTUFBTSxHQUFHLElBQUksZ0JBQWdCLEVBQUU7UUFDbEMsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQUUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7U0FBRTtRQUNuRSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUN0QyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDMUM7YUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDaEMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMxQjthQUFNO1lBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzlFLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6QixPQUFPO1NBQ1I7S0FDRjtJQUNELE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC9jbG9uZURlZXAnO1xuaW1wb3J0IGZpbHRlciBmcm9tICdsb2Rhc2gvZmlsdGVyJztcbmltcG9ydCBtYXAgZnJvbSAnbG9kYXNoL21hcCc7XG5pbXBvcnQge1xuICBBYnN0cmFjdENvbnRyb2wsXG4gIFVudHlwZWRGb3JtQXJyYXksXG4gIFVudHlwZWRGb3JtQ29udHJvbCxcbiAgVW50eXBlZEZvcm1Hcm91cCxcbiAgVmFsaWRhdG9yRm5cbn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgZm9yRWFjaCwgaGFzT3duIH0gZnJvbSAnLi91dGlsaXR5LmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBnZXRDb250cm9sVmFsaWRhdG9ycywgcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyB9IGZyb20gJy4vanNvbi1zY2hlbWEuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGhhc1ZhbHVlLFxuICBpbkFycmF5LFxuICBpc0FycmF5LFxuICBpc0RhdGUsXG4gIGlzRGVmaW5lZCxcbiAgaXNFbXB0eSxcbiAgaXNPYmplY3QsXG4gIGlzUHJpbWl0aXZlLFxuICBTY2hlbWFQcmltaXRpdmVUeXBlLFxuICB0b0phdmFTY3JpcHRUeXBlLFxuICB0b1NjaGVtYVR5cGVcbn0gZnJvbSAnLi92YWxpZGF0b3IuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25Qb2ludGVyLCBQb2ludGVyIH0gZnJvbSAnLi9qc29ucG9pbnRlci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgSnNvblZhbGlkYXRvcnMgfSBmcm9tICcuL2pzb24udmFsaWRhdG9ycyc7XG5cblxuXG4vKipcbiAqIEZvcm1Hcm91cCBmdW5jdGlvbiBsaWJyYXJ5OlxuICpcbiAqIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGU6ICBCdWlsZHMgYSBGb3JtR3JvdXBUZW1wbGF0ZSBmcm9tIHNjaGVtYVxuICpcbiAqIGJ1aWxkRm9ybUdyb3VwOiAgICAgICAgICBCdWlsZHMgYW4gQW5ndWxhciBGb3JtR3JvdXAgZnJvbSBhIEZvcm1Hcm91cFRlbXBsYXRlXG4gKlxuICogbWVyZ2VWYWx1ZXM6XG4gKlxuICogc2V0UmVxdWlyZWRGaWVsZHM6XG4gKlxuICogZm9ybWF0Rm9ybURhdGE6XG4gKlxuICogZ2V0Q29udHJvbDpcbiAqXG4gKiAtLS0tIFRPRE86IC0tLS1cbiAqIFRPRE86IGFkZCBidWlsZEZvcm1Hcm91cFRlbXBsYXRlRnJvbUxheW91dCBmdW5jdGlvblxuICogYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZUZyb21MYXlvdXQ6IEJ1aWxkcyBhIEZvcm1Hcm91cFRlbXBsYXRlIGZyb20gYSBmb3JtIGxheW91dFxuICovXG5cbi8qKlxuICogJ2J1aWxkRm9ybUdyb3VwVGVtcGxhdGUnIGZ1bmN0aW9uXG4gKlxuICogQnVpbGRzIGEgdGVtcGxhdGUgZm9yIGFuIEFuZ3VsYXIgRm9ybUdyb3VwIGZyb20gYSBKU09OIFNjaGVtYS5cbiAqXG4gKiBUT0RPOiBhZGQgc3VwcG9ydCBmb3IgcGF0dGVybiBwcm9wZXJ0aWVzXG4gKiBodHRwczovL3NwYWNldGVsZXNjb3BlLmdpdGh1Yi5pby91bmRlcnN0YW5kaW5nLWpzb24tc2NoZW1hL3JlZmVyZW5jZS9vYmplY3QuaHRtbFxuICpcbiAqIC8vICB7YW55fSBqc2YgLVxuICogLy8gIHthbnkgPSBudWxsfSBub2RlVmFsdWUgLVxuICogLy8gIHtib29sZWFuID0gdHJ1ZX0gbWFwQXJyYXlzIC1cbiAqIC8vICB7c3RyaW5nID0gJyd9IHNjaGVtYVBvaW50ZXIgLVxuICogLy8gIHtzdHJpbmcgPSAnJ30gZGF0YVBvaW50ZXIgLVxuICogLy8gIHthbnkgPSAnJ30gdGVtcGxhdGVQb2ludGVyIC1cbiAqIC8vIHthbnl9IC1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gIGpzZjogYW55LCBub2RlVmFsdWU6IGFueSA9IG51bGwsIHNldFZhbHVlcyA9IHRydWUsXG4gIHNjaGVtYVBvaW50ZXIgPSAnJywgZGF0YVBvaW50ZXIgPSAnJywgdGVtcGxhdGVQb2ludGVyID0gJydcbikge1xuICBjb25zdCBzY2hlbWEgPSBKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlcik7XG4gIGlmIChzZXRWYWx1ZXMpIHtcbiAgICBpZiAoIWlzRGVmaW5lZChub2RlVmFsdWUpICYmIChcbiAgICAgIGpzZi5mb3JtT3B0aW9ucy5zZXRTY2hlbWFEZWZhdWx0cyA9PT0gdHJ1ZSB8fFxuICAgICAgKGpzZi5mb3JtT3B0aW9ucy5zZXRTY2hlbWFEZWZhdWx0cyA9PT0gJ2F1dG8nICYmIGlzRW1wdHkoanNmLmZvcm1WYWx1ZXMpKVxuICAgICkpIHtcbiAgICAgIG5vZGVWYWx1ZSA9IEpzb25Qb2ludGVyLmdldChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyICsgJy9kZWZhdWx0Jyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG5vZGVWYWx1ZSA9IG51bGw7XG4gIH1cbiAgLy8gVE9ETzogSWYgbm9kZVZhbHVlIHN0aWxsIG5vdCBzZXQsIGNoZWNrIGxheW91dCBmb3IgZGVmYXVsdCB2YWx1ZVxuICBjb25zdCBzY2hlbWFUeXBlOiBzdHJpbmcgfCBzdHJpbmdbXSA9IEpzb25Qb2ludGVyLmdldChzY2hlbWEsICcvdHlwZScpO1xuICBjb25zdCBjb250cm9sVHlwZSA9XG4gICAgKGhhc093bihzY2hlbWEsICdwcm9wZXJ0aWVzJykgfHwgaGFzT3duKHNjaGVtYSwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJykpICYmXG4gICAgICBzY2hlbWFUeXBlID09PSAnb2JqZWN0JyA/ICdGb3JtR3JvdXAnIDpcbiAgICAgIChoYXNPd24oc2NoZW1hLCAnaXRlbXMnKSB8fCBoYXNPd24oc2NoZW1hLCAnYWRkaXRpb25hbEl0ZW1zJykpICYmXG4gICAgICAgIHNjaGVtYVR5cGUgPT09ICdhcnJheScgPyAnRm9ybUFycmF5JyA6XG4gICAgICAgICFzY2hlbWFUeXBlICYmIGhhc093bihzY2hlbWEsICckcmVmJykgPyAnJHJlZicgOiAnRm9ybUNvbnRyb2wnO1xuICBjb25zdCBzaG9ydERhdGFQb2ludGVyID1cbiAgICByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKGRhdGFQb2ludGVyLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwKTtcbiAgaWYgKCFqc2YuZGF0YU1hcC5oYXMoc2hvcnREYXRhUG9pbnRlcikpIHtcbiAgICBqc2YuZGF0YU1hcC5zZXQoc2hvcnREYXRhUG9pbnRlciwgbmV3IE1hcCgpKTtcbiAgfVxuICBjb25zdCBub2RlT3B0aW9ucyA9IGpzZi5kYXRhTWFwLmdldChzaG9ydERhdGFQb2ludGVyKTtcbiAgaWYgKCFub2RlT3B0aW9ucy5oYXMoJ3NjaGVtYVR5cGUnKSkge1xuICAgIG5vZGVPcHRpb25zLnNldCgnc2NoZW1hUG9pbnRlcicsIHNjaGVtYVBvaW50ZXIpO1xuICAgIG5vZGVPcHRpb25zLnNldCgnc2NoZW1hVHlwZScsIHNjaGVtYS50eXBlKTtcbiAgICBpZiAoc2NoZW1hLmZvcm1hdCkge1xuICAgICAgbm9kZU9wdGlvbnMuc2V0KCdzY2hlbWFGb3JtYXQnLCBzY2hlbWEuZm9ybWF0KTtcbiAgICAgIGlmICghc2NoZW1hLnR5cGUpIHsgbm9kZU9wdGlvbnMuc2V0KCdzY2hlbWFUeXBlJywgJ3N0cmluZycpOyB9XG4gICAgfVxuICAgIGlmIChjb250cm9sVHlwZSkge1xuICAgICAgbm9kZU9wdGlvbnMuc2V0KCd0ZW1wbGF0ZVBvaW50ZXInLCB0ZW1wbGF0ZVBvaW50ZXIpO1xuICAgICAgbm9kZU9wdGlvbnMuc2V0KCd0ZW1wbGF0ZVR5cGUnLCBjb250cm9sVHlwZSk7XG4gICAgfVxuICB9XG4gIGxldCBjb250cm9sczogYW55O1xuICBjb25zdCB2YWxpZGF0b3JzID0gZ2V0Q29udHJvbFZhbGlkYXRvcnMoc2NoZW1hKTtcbiAgc3dpdGNoIChjb250cm9sVHlwZSkge1xuXG4gICAgY2FzZSAnRm9ybUdyb3VwJzpcbiAgICAgIGNvbnRyb2xzID0ge307XG4gICAgICBpZiAoaGFzT3duKHNjaGVtYSwgJ3VpOm9yZGVyJykgfHwgaGFzT3duKHNjaGVtYSwgJ3Byb3BlcnRpZXMnKSkge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eUtleXMgPSBzY2hlbWFbJ3VpOm9yZGVyJ10gfHwgT2JqZWN0LmtleXMoc2NoZW1hLnByb3BlcnRpZXMpO1xuICAgICAgICBpZiAocHJvcGVydHlLZXlzLmluY2x1ZGVzKCcqJykgJiYgIWhhc093bihzY2hlbWEucHJvcGVydGllcywgJyonKSkge1xuICAgICAgICAgIGNvbnN0IHVubmFtZWRLZXlzID0gT2JqZWN0LmtleXMoc2NoZW1hLnByb3BlcnRpZXMpXG4gICAgICAgICAgICAuZmlsdGVyKGtleSA9PiAhcHJvcGVydHlLZXlzLmluY2x1ZGVzKGtleSkpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSBwcm9wZXJ0eUtleXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eUtleXNbaV0gPT09ICcqJykge1xuICAgICAgICAgICAgICBwcm9wZXJ0eUtleXMuc3BsaWNlKGksIDEsIC4uLnVubmFtZWRLZXlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvcGVydHlLZXlzXG4gICAgICAgICAgLmZpbHRlcihrZXkgPT4gaGFzT3duKHNjaGVtYS5wcm9wZXJ0aWVzLCBrZXkpIHx8XG4gICAgICAgICAgICBoYXNPd24oc2NoZW1hLCAnYWRkaXRpb25hbFByb3BlcnRpZXMnKVxuICAgICAgICAgIClcbiAgICAgICAgICAuZm9yRWFjaChrZXkgPT4gY29udHJvbHNba2V5XSA9IGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICBqc2YsIEpzb25Qb2ludGVyLmdldChub2RlVmFsdWUsIFs8c3RyaW5nPmtleV0pLCBzZXRWYWx1ZXMsXG4gICAgICAgICAgICBzY2hlbWFQb2ludGVyICsgKGhhc093bihzY2hlbWEucHJvcGVydGllcywga2V5KSA/XG4gICAgICAgICAgICAgICcvcHJvcGVydGllcy8nICsga2V5IDogJy9hZGRpdGlvbmFsUHJvcGVydGllcydcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBkYXRhUG9pbnRlciArICcvJyArIGtleSxcbiAgICAgICAgICAgIHRlbXBsYXRlUG9pbnRlciArICcvY29udHJvbHMvJyArIGtleVxuICAgICAgICAgICkpO1xuICAgICAgICBqc2YuZm9ybU9wdGlvbnMuZmllbGRzUmVxdWlyZWQgPSBzZXRSZXF1aXJlZEZpZWxkcyhzY2hlbWEsIGNvbnRyb2xzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGNvbnRyb2xUeXBlLCBjb250cm9scywgdmFsaWRhdG9ycyB9O1xuXG4gICAgY2FzZSAnRm9ybUFycmF5JzpcbiAgICAgIGNvbnRyb2xzID0gW107XG4gICAgICBjb25zdCBtaW5JdGVtcyA9XG4gICAgICAgIE1hdGgubWF4KHNjaGVtYS5taW5JdGVtcyB8fCAwLCBub2RlT3B0aW9ucy5nZXQoJ21pbkl0ZW1zJykgfHwgMCk7XG4gICAgICBjb25zdCBtYXhJdGVtcyA9XG4gICAgICAgIE1hdGgubWluKHNjaGVtYS5tYXhJdGVtcyB8fCAxMDAwLCBub2RlT3B0aW9ucy5nZXQoJ21heEl0ZW1zJykgfHwgMTAwMCk7XG4gICAgICBsZXQgYWRkaXRpb25hbEl0ZW1zUG9pbnRlcjogc3RyaW5nID0gbnVsbDtcbiAgICAgIGlmIChpc0FycmF5KHNjaGVtYS5pdGVtcykpIHsgLy8gJ2l0ZW1zJyBpcyBhbiBhcnJheSA9IHR1cGxlIGl0ZW1zXG4gICAgICAgIGNvbnN0IHR1cGxlSXRlbXMgPSBub2RlT3B0aW9ucy5nZXQoJ3R1cGxlSXRlbXMnKSB8fFxuICAgICAgICAgIChpc0FycmF5KHNjaGVtYS5pdGVtcykgPyBNYXRoLm1pbihzY2hlbWEuaXRlbXMubGVuZ3RoLCBtYXhJdGVtcykgOiAwKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0dXBsZUl0ZW1zOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSA8IG1pbkl0ZW1zKSB7XG4gICAgICAgICAgICBjb250cm9scy5wdXNoKGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICAgIGpzZiwgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlW2ldIDogbm9kZVZhbHVlLCBzZXRWYWx1ZXMsXG4gICAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIgKyAnL2l0ZW1zLycgKyBpLFxuICAgICAgICAgICAgICBkYXRhUG9pbnRlciArICcvJyArIGksXG4gICAgICAgICAgICAgIHRlbXBsYXRlUG9pbnRlciArICcvY29udHJvbHMvJyArIGlcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzY2hlbWFSZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgICAgICAgc2NoZW1hUG9pbnRlciArICcvaXRlbXMvJyArIGksIGpzZi5zY2hlbWFSZWN1cnNpdmVSZWZNYXBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBpdGVtUmVmUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgICAgICAgICAgIHNob3J0RGF0YVBvaW50ZXIgKyAnLycgKyBpLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgaXRlbVJlY3Vyc2l2ZSA9IGl0ZW1SZWZQb2ludGVyICE9PSBzaG9ydERhdGFQb2ludGVyICsgJy8nICsgaTtcbiAgICAgICAgICAgIGlmICghaGFzT3duKGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnksIGl0ZW1SZWZQb2ludGVyKSkge1xuICAgICAgICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IG51bGw7XG4gICAgICAgICAgICAgIGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdID0gYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICBqc2YsIG51bGwsIHNldFZhbHVlcyxcbiAgICAgICAgICAgICAgICBzY2hlbWFSZWZQb2ludGVyLFxuICAgICAgICAgICAgICAgIGl0ZW1SZWZQb2ludGVyLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlUG9pbnRlciArICcvY29udHJvbHMvJyArIGlcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goXG4gICAgICAgICAgICAgIGlzQXJyYXkobm9kZVZhbHVlKSA/XG4gICAgICAgICAgICAgICAgYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgIGpzZiwgbm9kZVZhbHVlW2ldLCBzZXRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgICBzY2hlbWFQb2ludGVyICsgJy9pdGVtcy8nICsgaSxcbiAgICAgICAgICAgICAgICAgIGRhdGFQb2ludGVyICsgJy8nICsgaSxcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlUG9pbnRlciArICcvY29udHJvbHMvJyArIGlcbiAgICAgICAgICAgICAgICApIDpcbiAgICAgICAgICAgICAgICBpdGVtUmVjdXJzaXZlID9cbiAgICAgICAgICAgICAgICAgIG51bGwgOiBjbG9uZURlZXAoanNmLnRlbXBsYXRlUmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmICdhZGRpdGlvbmFsSXRlbXMnIGlzIGFuIG9iamVjdCA9IGFkZGl0aW9uYWwgbGlzdCBpdGVtcyAoYWZ0ZXIgdHVwbGUgaXRlbXMpXG4gICAgICAgIGlmIChzY2hlbWEuaXRlbXMubGVuZ3RoIDwgbWF4SXRlbXMgJiYgaXNPYmplY3Qoc2NoZW1hLmFkZGl0aW9uYWxJdGVtcykpIHtcbiAgICAgICAgICBhZGRpdGlvbmFsSXRlbXNQb2ludGVyID0gc2NoZW1hUG9pbnRlciArICcvYWRkaXRpb25hbEl0ZW1zJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmICdpdGVtcycgaXMgYW4gb2JqZWN0ID0gbGlzdCBpdGVtcyBvbmx5IChubyB0dXBsZSBpdGVtcylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZGl0aW9uYWxJdGVtc1BvaW50ZXIgPSBzY2hlbWFQb2ludGVyICsgJy9pdGVtcyc7XG4gICAgICB9XG5cbiAgICAgIGlmIChhZGRpdGlvbmFsSXRlbXNQb2ludGVyKSB7XG4gICAgICAgIGNvbnN0IHNjaGVtYVJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtc1BvaW50ZXIsIGpzZi5zY2hlbWFSZWN1cnNpdmVSZWZNYXBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaXRlbVJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICAgIHNob3J0RGF0YVBvaW50ZXIgKyAnLy0nLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGl0ZW1SZWN1cnNpdmUgPSBpdGVtUmVmUG9pbnRlciAhPT0gc2hvcnREYXRhUG9pbnRlciArICcvLSc7XG4gICAgICAgIGlmICghaGFzT3duKGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnksIGl0ZW1SZWZQb2ludGVyKSkge1xuICAgICAgICAgIGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdID0gbnVsbDtcbiAgICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IGJ1aWxkRm9ybUdyb3VwVGVtcGxhdGUoXG4gICAgICAgICAgICBqc2YsIG51bGwsIHNldFZhbHVlcyxcbiAgICAgICAgICAgIHNjaGVtYVJlZlBvaW50ZXIsXG4gICAgICAgICAgICBpdGVtUmVmUG9pbnRlcixcbiAgICAgICAgICAgIHRlbXBsYXRlUG9pbnRlciArICcvY29udHJvbHMvLSdcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnN0IGl0ZW1PcHRpb25zID0ganNmLmRhdGFNYXAuZ2V0KGl0ZW1SZWZQb2ludGVyKSB8fCBuZXcgTWFwKCk7XG4gICAgICAgIGNvbnN0IGl0ZW1PcHRpb25zID0gbm9kZU9wdGlvbnM7XG4gICAgICAgIGlmICghaXRlbVJlY3Vyc2l2ZSB8fCBoYXNPd24odmFsaWRhdG9ycywgJ3JlcXVpcmVkJykpIHtcbiAgICAgICAgICBjb25zdCBhcnJheUxlbmd0aCA9IE1hdGgubWluKE1hdGgubWF4KFxuICAgICAgICAgICAgaXRlbVJlY3Vyc2l2ZSA/IDAgOlxuICAgICAgICAgICAgICAoaXRlbU9wdGlvbnMuZ2V0KCd0dXBsZUl0ZW1zJykgKyBpdGVtT3B0aW9ucy5nZXQoJ2xpc3RJdGVtcycpKSB8fCAwLFxuICAgICAgICAgICAgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlLmxlbmd0aCA6IDBcbiAgICAgICAgICApLCBtYXhJdGVtcyk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IGNvbnRyb2xzLmxlbmd0aDsgaSA8IGFycmF5TGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goXG4gICAgICAgICAgICAgIGlzQXJyYXkobm9kZVZhbHVlKSA/XG4gICAgICAgICAgICAgICAgYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShcbiAgICAgICAgICAgICAgICAgIGpzZiwgbm9kZVZhbHVlW2ldLCBzZXRWYWx1ZXMsXG4gICAgICAgICAgICAgICAgICBzY2hlbWFSZWZQb2ludGVyLFxuICAgICAgICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLy0nLFxuICAgICAgICAgICAgICAgICAgdGVtcGxhdGVQb2ludGVyICsgJy9jb250cm9scy8tJ1xuICAgICAgICAgICAgICAgICkgOlxuICAgICAgICAgICAgICAgIGl0ZW1SZWN1cnNpdmUgP1xuICAgICAgICAgICAgICAgICAgbnVsbCA6IGNsb25lRGVlcChqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBjb250cm9sVHlwZSwgY29udHJvbHMsIHZhbGlkYXRvcnMgfTtcblxuICAgIGNhc2UgJyRyZWYnOlxuICAgICAgY29uc3Qgc2NoZW1hUmVmID0gSnNvblBvaW50ZXIuY29tcGlsZShzY2hlbWEuJHJlZik7XG4gICAgICBjb25zdCBkYXRhUmVmID0gSnNvblBvaW50ZXIudG9EYXRhUG9pbnRlcihzY2hlbWFSZWYsIHNjaGVtYSk7XG4gICAgICBjb25zdCByZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgZGF0YVJlZiwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgKTtcbiAgICAgIGlmIChyZWZQb2ludGVyICYmICFoYXNPd24oanNmLnRlbXBsYXRlUmVmTGlicmFyeSwgcmVmUG9pbnRlcikpIHtcbiAgICAgICAgLy8gU2V0IHRvIG51bGwgZmlyc3QgdG8gcHJldmVudCByZWN1cnNpdmUgcmVmZXJlbmNlIGZyb20gY2F1c2luZyBlbmRsZXNzIGxvb3BcbiAgICAgICAganNmLnRlbXBsYXRlUmVmTGlicmFyeVtyZWZQb2ludGVyXSA9IG51bGw7XG4gICAgICAgIGNvbnN0IG5ld1RlbXBsYXRlID0gYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShqc2YsIHNldFZhbHVlcywgc2V0VmFsdWVzLCBzY2hlbWFSZWYpO1xuICAgICAgICBpZiAobmV3VGVtcGxhdGUpIHtcbiAgICAgICAgICBqc2YudGVtcGxhdGVSZWZMaWJyYXJ5W3JlZlBvaW50ZXJdID0gbmV3VGVtcGxhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGpzZi50ZW1wbGF0ZVJlZkxpYnJhcnlbcmVmUG9pbnRlcl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgY2FzZSAnRm9ybUNvbnRyb2wnOlxuICAgICAgY29uc3QgdmFsdWUgPSB7XG4gICAgICAgIHZhbHVlOiBzZXRWYWx1ZXMgJiYgaXNQcmltaXRpdmUobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZSA6IG51bGwsXG4gICAgICAgIGRpc2FibGVkOiBub2RlT3B0aW9ucy5nZXQoJ2Rpc2FibGVkJykgfHwgZmFsc2VcbiAgICAgIH07XG4gICAgICByZXR1cm4geyBjb250cm9sVHlwZSwgdmFsdWUsIHZhbGlkYXRvcnMgfTtcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqICdidWlsZEZvcm1Hcm91cCcgZnVuY3Rpb25cbiAqXG4gKiAvLyB7YW55fSB0ZW1wbGF0ZSAtXG4gKiAvLyB7QWJzdHJhY3RDb250cm9sfVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEZvcm1Hcm91cCh0ZW1wbGF0ZTogYW55KTogQWJzdHJhY3RDb250cm9sIHtcbiAgY29uc3QgdmFsaWRhdG9yRm5zOiBWYWxpZGF0b3JGbltdID0gW107XG4gIGxldCB2YWxpZGF0b3JGbjogVmFsaWRhdG9yRm4gPSBudWxsO1xuICBpZiAoaGFzT3duKHRlbXBsYXRlLCAndmFsaWRhdG9ycycpKSB7XG4gICAgZm9yRWFjaCh0ZW1wbGF0ZS52YWxpZGF0b3JzLCAocGFyYW1ldGVycywgdmFsaWRhdG9yKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIEpzb25WYWxpZGF0b3JzW3ZhbGlkYXRvcl0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsaWRhdG9yRm5zLnB1c2goSnNvblZhbGlkYXRvcnNbdmFsaWRhdG9yXS5hcHBseShudWxsLCBwYXJhbWV0ZXJzKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHZhbGlkYXRvckZucy5sZW5ndGggJiZcbiAgICAgIGluQXJyYXkodGVtcGxhdGUuY29udHJvbFR5cGUsIFsnRm9ybUdyb3VwJywgJ0Zvcm1BcnJheSddKVxuICAgICkge1xuICAgICAgdmFsaWRhdG9yRm4gPSB2YWxpZGF0b3JGbnMubGVuZ3RoID4gMSA/XG4gICAgICAgIEpzb25WYWxpZGF0b3JzLmNvbXBvc2UodmFsaWRhdG9yRm5zKSA6IHZhbGlkYXRvckZuc1swXTtcbiAgICB9XG4gIH1cbiAgaWYgKGhhc093bih0ZW1wbGF0ZSwgJ2NvbnRyb2xUeXBlJykpIHtcbiAgICBzd2l0Y2ggKHRlbXBsYXRlLmNvbnRyb2xUeXBlKSB7XG4gICAgICBjYXNlICdGb3JtR3JvdXAnOlxuICAgICAgICBjb25zdCBncm91cENvbnRyb2xzOiB7IFtrZXk6IHN0cmluZ106IEFic3RyYWN0Q29udHJvbCB9ID0ge307XG4gICAgICAgIGZvckVhY2godGVtcGxhdGUuY29udHJvbHMsIChjb250cm9scywga2V5KSA9PiB7XG4gICAgICAgICAgY29uc3QgbmV3Q29udHJvbDogQWJzdHJhY3RDb250cm9sID0gYnVpbGRGb3JtR3JvdXAoY29udHJvbHMpO1xuICAgICAgICAgIGlmIChuZXdDb250cm9sKSB7IGdyb3VwQ29udHJvbHNba2V5XSA9IG5ld0NvbnRyb2w7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXcgVW50eXBlZEZvcm1Hcm91cChncm91cENvbnRyb2xzLCB2YWxpZGF0b3JGbik7XG4gICAgICBjYXNlICdGb3JtQXJyYXknOlxuICAgICAgICByZXR1cm4gbmV3IFVudHlwZWRGb3JtQXJyYXkoZmlsdGVyKG1hcCh0ZW1wbGF0ZS5jb250cm9scyxcbiAgICAgICAgICBjb250cm9scyA9PiBidWlsZEZvcm1Hcm91cChjb250cm9scylcbiAgICAgICAgKSksIHZhbGlkYXRvckZuKTtcbiAgICAgIGNhc2UgJ0Zvcm1Db250cm9sJzpcbiAgICAgICAgcmV0dXJuIG5ldyBVbnR5cGVkRm9ybUNvbnRyb2wodGVtcGxhdGUudmFsdWUsIHZhbGlkYXRvckZucyk7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqICdtZXJnZVZhbHVlcycgZnVuY3Rpb25cbiAqXG4gKiAvLyAge2FueVtdfSAuLi52YWx1ZXNUb01lcmdlIC0gTXVsdGlwbGUgdmFsdWVzIHRvIG1lcmdlXG4gKiAvLyB7YW55fSAtIE1lcmdlZCB2YWx1ZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVmFsdWVzKC4uLnZhbHVlc1RvTWVyZ2UpIHtcbiAgbGV0IG1lcmdlZFZhbHVlczogYW55ID0gbnVsbDtcbiAgZm9yIChjb25zdCBjdXJyZW50VmFsdWUgb2YgdmFsdWVzVG9NZXJnZSkge1xuICAgIGlmICghaXNFbXB0eShjdXJyZW50VmFsdWUpKSB7XG4gICAgICBpZiAodHlwZW9mIGN1cnJlbnRWYWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgKGlzRW1wdHkobWVyZ2VkVmFsdWVzKSB8fCB0eXBlb2YgbWVyZ2VkVmFsdWVzICE9PSAnb2JqZWN0JylcbiAgICAgICkge1xuICAgICAgICBpZiAoaXNBcnJheShjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgbWVyZ2VkVmFsdWVzID0gWy4uLmN1cnJlbnRWYWx1ZV07XG4gICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoY3VycmVudFZhbHVlKSkge1xuICAgICAgICAgIG1lcmdlZFZhbHVlcyA9IHsgLi4uY3VycmVudFZhbHVlIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGN1cnJlbnRWYWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgbWVyZ2VkVmFsdWVzID0gY3VycmVudFZhbHVlO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdChtZXJnZWRWYWx1ZXMpICYmIGlzT2JqZWN0KGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihtZXJnZWRWYWx1ZXMsIGN1cnJlbnRWYWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KG1lcmdlZFZhbHVlcykgJiYgaXNBcnJheShjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAgIG5ld1ZhbHVlcy5wdXNoKG1lcmdlVmFsdWVzKG1lcmdlZFZhbHVlcywgdmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBtZXJnZWRWYWx1ZXMgPSBuZXdWYWx1ZXM7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkobWVyZ2VkVmFsdWVzKSAmJiBpc09iamVjdChjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIG1lcmdlZFZhbHVlcykge1xuICAgICAgICAgIG5ld1ZhbHVlcy5wdXNoKG1lcmdlVmFsdWVzKHZhbHVlLCBjdXJyZW50VmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBtZXJnZWRWYWx1ZXMgPSBuZXdWYWx1ZXM7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkobWVyZ2VkVmFsdWVzKSAmJiBpc0FycmF5KGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3QgbmV3VmFsdWVzID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5tYXgobWVyZ2VkVmFsdWVzLmxlbmd0aCwgY3VycmVudFZhbHVlLmxlbmd0aCk7IGkrKykge1xuICAgICAgICAgIGlmIChpIDwgbWVyZ2VkVmFsdWVzLmxlbmd0aCAmJiBpIDwgY3VycmVudFZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgbmV3VmFsdWVzLnB1c2gobWVyZ2VWYWx1ZXMobWVyZ2VkVmFsdWVzW2ldLCBjdXJyZW50VmFsdWVbaV0pKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGkgPCBtZXJnZWRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZXMucHVzaChtZXJnZWRWYWx1ZXNbaV0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaSA8IGN1cnJlbnRWYWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5ld1ZhbHVlcy5wdXNoKGN1cnJlbnRWYWx1ZVtpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1lcmdlZFZhbHVlcyA9IG5ld1ZhbHVlcztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1lcmdlZFZhbHVlcztcbn1cblxuLyoqXG4gKiAnc2V0UmVxdWlyZWRGaWVsZHMnIGZ1bmN0aW9uXG4gKlxuICogLy8ge3NjaGVtYX0gc2NoZW1hIC0gSlNPTiBTY2hlbWFcbiAqIC8vIHtvYmplY3R9IGZvcm1Db250cm9sVGVtcGxhdGUgLSBGb3JtIENvbnRyb2wgVGVtcGxhdGUgb2JqZWN0XG4gKiAvLyB7Ym9vbGVhbn0gLSB0cnVlIGlmIGFueSBmaWVsZHMgaGF2ZSBiZWVuIHNldCB0byByZXF1aXJlZCwgZmFsc2UgaWYgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRSZXF1aXJlZEZpZWxkcyhzY2hlbWE6IGFueSwgZm9ybUNvbnRyb2xUZW1wbGF0ZTogYW55KTogYm9vbGVhbiB7XG4gIGxldCBmaWVsZHNSZXF1aXJlZCA9IGZhbHNlO1xuICBpZiAoaGFzT3duKHNjaGVtYSwgJ3JlcXVpcmVkJykgJiYgIWlzRW1wdHkoc2NoZW1hLnJlcXVpcmVkKSkge1xuICAgIGZpZWxkc1JlcXVpcmVkID0gdHJ1ZTtcbiAgICBsZXQgcmVxdWlyZWRBcnJheSA9IGlzQXJyYXkoc2NoZW1hLnJlcXVpcmVkKSA/IHNjaGVtYS5yZXF1aXJlZCA6IFtzY2hlbWEucmVxdWlyZWRdO1xuICAgIHJlcXVpcmVkQXJyYXkgPSBmb3JFYWNoKHJlcXVpcmVkQXJyYXksXG4gICAgICBrZXkgPT4gSnNvblBvaW50ZXIuc2V0KGZvcm1Db250cm9sVGVtcGxhdGUsICcvJyArIGtleSArICcvdmFsaWRhdG9ycy9yZXF1aXJlZCcsIFtdKVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIGZpZWxkc1JlcXVpcmVkO1xuXG4gIC8vIFRPRE86IEFkZCBzdXBwb3J0IGZvciBwYXR0ZXJuUHJvcGVydGllc1xuICAvLyBodHRwczovL3NwYWNldGVsZXNjb3BlLmdpdGh1Yi5pby91bmRlcnN0YW5kaW5nLWpzb24tc2NoZW1hL3JlZmVyZW5jZS9vYmplY3QuaHRtbCNwYXR0ZXJuLXByb3BlcnRpZXNcbn1cblxuLyoqXG4gKiAnZm9ybWF0Rm9ybURhdGEnIGZ1bmN0aW9uXG4gKlxuICogLy8ge2FueX0gZm9ybURhdGEgLSBBbmd1bGFyIEZvcm1Hcm91cCBkYXRhIG9iamVjdFxuICogLy8ge01hcDxzdHJpbmcsIGFueT59IGRhdGFNYXAgLVxuICogLy8ge01hcDxzdHJpbmcsIHN0cmluZz59IHJlY3Vyc2l2ZVJlZk1hcCAtXG4gKiAvLyB7TWFwPHN0cmluZywgbnVtYmVyPn0gYXJyYXlNYXAgLVxuICogLy8ge2Jvb2xlYW4gPSBmYWxzZX0gZml4RXJyb3JzIC0gaWYgVFJVRSwgdHJpZXMgdG8gZml4IGRhdGFcbiAqIC8vIHthbnl9IC0gZm9ybWF0dGVkIGRhdGEgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRGb3JtRGF0YShcbiAgZm9ybURhdGE6IGFueSwgZGF0YU1hcDogTWFwPHN0cmluZywgYW55PixcbiAgcmVjdXJzaXZlUmVmTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+LCBhcnJheU1hcDogTWFwPHN0cmluZywgbnVtYmVyPixcbiAgcmV0dXJuRW1wdHlGaWVsZHMgPSBmYWxzZSwgZml4RXJyb3JzID0gZmFsc2Vcbik6IGFueSB7XG4gIGlmIChmb3JtRGF0YSA9PT0gbnVsbCB8fCB0eXBlb2YgZm9ybURhdGEgIT09ICdvYmplY3QnKSB7IHJldHVybiBmb3JtRGF0YTsgfVxuICBjb25zdCBmb3JtYXR0ZWREYXRhID0gaXNBcnJheShmb3JtRGF0YSkgPyBbXSA6IHt9O1xuICBKc29uUG9pbnRlci5mb3JFYWNoRGVlcChmb3JtRGF0YSwgKHZhbHVlLCBkYXRhUG9pbnRlcikgPT4ge1xuXG4gICAgLy8gSWYgcmV0dXJuRW1wdHlGaWVsZHMgPT09IHRydWUsXG4gICAgLy8gYWRkIGVtcHR5IGFycmF5cyBhbmQgb2JqZWN0cyB0byBhbGwgYWxsb3dlZCBrZXlzXG4gICAgaWYgKHJldHVybkVtcHR5RmllbGRzICYmIGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIFtdKTtcbiAgICB9IGVsc2UgaWYgKHJldHVybkVtcHR5RmllbGRzICYmIGlzT2JqZWN0KHZhbHVlKSAmJiAhaXNEYXRlKHZhbHVlKSkge1xuICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCB7fSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGdlbmVyaWNQb2ludGVyID1cbiAgICAgICAgSnNvblBvaW50ZXIuaGFzKGRhdGFNYXAsIFtkYXRhUG9pbnRlciwgJ3NjaGVtYVR5cGUnXSkgPyBkYXRhUG9pbnRlciA6XG4gICAgICAgICAgcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhkYXRhUG9pbnRlciwgcmVjdXJzaXZlUmVmTWFwLCBhcnJheU1hcCk7XG4gICAgICBpZiAoSnNvblBvaW50ZXIuaGFzKGRhdGFNYXAsIFtnZW5lcmljUG9pbnRlciwgJ3NjaGVtYVR5cGUnXSkpIHtcbiAgICAgICAgY29uc3Qgc2NoZW1hVHlwZTogU2NoZW1hUHJpbWl0aXZlVHlwZSB8IFNjaGVtYVByaW1pdGl2ZVR5cGVbXSA9XG4gICAgICAgICAgZGF0YU1hcC5nZXQoZ2VuZXJpY1BvaW50ZXIpLmdldCgnc2NoZW1hVHlwZScpO1xuICAgICAgICBpZiAoc2NoZW1hVHlwZSA9PT0gJ251bGwnKSB7XG4gICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCBudWxsKTtcbiAgICAgICAgfSBlbHNlIGlmICgoaGFzVmFsdWUodmFsdWUpIHx8IHJldHVybkVtcHR5RmllbGRzKSAmJlxuICAgICAgICAgIGluQXJyYXkoc2NoZW1hVHlwZSwgWydzdHJpbmcnLCAnaW50ZWdlcicsICdudW1iZXInLCAnYm9vbGVhbiddKVxuICAgICAgICApIHtcbiAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IChmaXhFcnJvcnMgfHwgKHZhbHVlID09PSBudWxsICYmIHJldHVybkVtcHR5RmllbGRzKSkgP1xuICAgICAgICAgICAgdG9TY2hlbWFUeXBlKHZhbHVlLCBzY2hlbWFUeXBlKSA6IHRvSmF2YVNjcmlwdFR5cGUodmFsdWUsIHNjaGVtYVR5cGUpO1xuICAgICAgICAgIGlmIChpc0RlZmluZWQobmV3VmFsdWUpIHx8IHJldHVybkVtcHR5RmllbGRzKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIG5ld1ZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5pc2ggaW5jb21wbGV0ZSAnZGF0ZS10aW1lJyBlbnRyaWVzXG4gICAgICAgIGlmIChkYXRhTWFwLmdldChnZW5lcmljUG9pbnRlcikuZ2V0KCdzY2hlbWFGb3JtYXQnKSA9PT0gJ2RhdGUtdGltZScpIHtcbiAgICAgICAgICAvLyBcIjIwMDAtMDMtMTRUMDE6NTk6MjYuNTM1XCIgLT4gXCIyMDAwLTAzLTE0VDAxOjU5OjI2LjUzNVpcIiAoYWRkIFwiWlwiKVxuICAgICAgICAgIGlmICgvXlxcZFxcZFxcZFxcZC1bMC0xXVxcZC1bMC0zXVxcZFt0XFxzXVswLTJdXFxkOlswLTVdXFxkOlswLTVdXFxkKD86XFwuXFxkKyk/JC9pLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICBKc29uUG9pbnRlci5zZXQoZm9ybWF0dGVkRGF0YSwgZGF0YVBvaW50ZXIsIGAke3ZhbHVlfVpgKTtcbiAgICAgICAgICAgIC8vIFwiMjAwMC0wMy0xNFQwMTo1OVwiIC0+IFwiMjAwMC0wMy0xNFQwMTo1OTowMFpcIiAoYWRkIFwiOjAwWlwiKVxuICAgICAgICAgIH0gZWxzZSBpZiAoL15cXGRcXGRcXGRcXGQtWzAtMV1cXGQtWzAtM11cXGRbdFxcc11bMC0yXVxcZDpbMC01XVxcZCQvaS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCBgJHt2YWx1ZX06MDBaYCk7XG4gICAgICAgICAgICAvLyBcIjIwMDAtMDMtMTRcIiAtPiBcIjIwMDAtMDMtMTRUMDA6MDA6MDBaXCIgKGFkZCBcIlQwMDowMDowMFpcIilcbiAgICAgICAgICB9IGVsc2UgaWYgKGZpeEVycm9ycyAmJiAvXlxcZFxcZFxcZFxcZC1bMC0xXVxcZC1bMC0zXVxcZCQvaS50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgSnNvblBvaW50ZXIuc2V0KGZvcm1hdHRlZERhdGEsIGRhdGFQb2ludGVyLCBgJHt2YWx1ZX06MDA6MDA6MDBaYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgaXNEYXRlKHZhbHVlKSB8fFxuICAgICAgICAodmFsdWUgPT09IG51bGwgJiYgcmV0dXJuRW1wdHlGaWVsZHMpXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignZm9ybWF0Rm9ybURhdGEgZXJyb3I6ICcgK1xuICAgICAgICAgIGBTY2hlbWEgdHlwZSBub3QgZm91bmQgZm9yIGZvcm0gdmFsdWUgYXQgJHtnZW5lcmljUG9pbnRlcn1gKTtcbiAgICAgICAgY29uc29sZS5lcnJvcignZGF0YU1hcCcsIGRhdGFNYXApO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdyZWN1cnNpdmVSZWZNYXAnLCByZWN1cnNpdmVSZWZNYXApO1xuICAgICAgICBjb25zb2xlLmVycm9yKCdnZW5lcmljUG9pbnRlcicsIGdlbmVyaWNQb2ludGVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZm9ybWF0dGVkRGF0YTtcbn1cblxuLyoqXG4gKiAnZ2V0Q29udHJvbCcgZnVuY3Rpb25cbiAqXG4gKiBVc2VzIGEgSlNPTiBQb2ludGVyIGZvciBhIGRhdGEgb2JqZWN0IHRvIHJldHJpZXZlIGEgY29udHJvbCBmcm9tXG4gKiBhbiBBbmd1bGFyIGZvcm1Hcm91cCBvciBmb3JtR3JvdXAgdGVtcGxhdGUuIChOb3RlOiB0aG91Z2ggYSBmb3JtR3JvdXBcbiAqIHRlbXBsYXRlIGlzIG11Y2ggc2ltcGxlciwgaXRzIGJhc2ljIHN0cnVjdHVyZSBpcyBpZGVudGlhbCB0byBhIGZvcm1Hcm91cCkuXG4gKlxuICogSWYgdGhlIG9wdGlvbmFsIHRoaXJkIHBhcmFtZXRlciAncmV0dXJuR3JvdXAnIGlzIHNldCB0byBUUlVFLCB0aGUgZ3JvdXBcbiAqIGNvbnRhaW5pbmcgdGhlIGNvbnRyb2wgaXMgcmV0dXJuZWQsIHJhdGhlciB0aGFuIHRoZSBjb250cm9sIGl0c2VsZi5cbiAqXG4gKiAvLyB7Rm9ybUdyb3VwfSBmb3JtR3JvdXAgLSBBbmd1bGFyIEZvcm1Hcm91cCB0byBnZXQgdmFsdWUgZnJvbVxuICogLy8ge1BvaW50ZXJ9IGRhdGFQb2ludGVyIC0gSlNPTiBQb2ludGVyIChzdHJpbmcgb3IgYXJyYXkpXG4gKiAvLyB7Ym9vbGVhbiA9IGZhbHNlfSByZXR1cm5Hcm91cCAtIElmIHRydWUsIHJldHVybiBncm91cCBjb250YWluaW5nIGNvbnRyb2xcbiAqIC8vIHtncm91cH0gLSBMb2NhdGVkIHZhbHVlIChvciBudWxsLCBpZiBubyBjb250cm9sIGZvdW5kKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udHJvbChcbiAgZm9ybUdyb3VwOiBhbnksIGRhdGFQb2ludGVyOiBQb2ludGVyLCByZXR1cm5Hcm91cCA9IGZhbHNlXG4pOiBhbnkge1xuICBpZiAoIWlzT2JqZWN0KGZvcm1Hcm91cCkgfHwgIUpzb25Qb2ludGVyLmlzSnNvblBvaW50ZXIoZGF0YVBvaW50ZXIpKSB7XG4gICAgaWYgKCFKc29uUG9pbnRlci5pc0pzb25Qb2ludGVyKGRhdGFQb2ludGVyKSkge1xuICAgICAgLy8gSWYgZGF0YVBvaW50ZXIgaW5wdXQgaXMgbm90IGEgdmFsaWQgSlNPTiBwb2ludGVyLCBjaGVjayB0b1xuICAgICAgLy8gc2VlIGlmIGl0IGlzIGluc3RlYWQgYSB2YWxpZCBvYmplY3QgcGF0aCwgdXNpbmcgZG90IG5vdGFpb25cbiAgICAgIGlmICh0eXBlb2YgZGF0YVBvaW50ZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IGZvcm1Db250cm9sID0gZm9ybUdyb3VwLmdldChkYXRhUG9pbnRlcik7XG4gICAgICAgIGlmIChmb3JtQ29udHJvbCkgeyByZXR1cm4gZm9ybUNvbnRyb2w7IH1cbiAgICAgIH1cbiAgICAgIGNvbnNvbGUuZXJyb3IoYGdldENvbnRyb2wgZXJyb3I6IEludmFsaWQgSlNPTiBQb2ludGVyOiAke2RhdGFQb2ludGVyfWApO1xuICAgIH1cbiAgICBpZiAoIWlzT2JqZWN0KGZvcm1Hcm91cCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYGdldENvbnRyb2wgZXJyb3I6IEludmFsaWQgZm9ybUdyb3VwOiAke2Zvcm1Hcm91cH1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgbGV0IGRhdGFQb2ludGVyQXJyYXkgPSBKc29uUG9pbnRlci5wYXJzZShkYXRhUG9pbnRlcik7XG4gIGlmIChyZXR1cm5Hcm91cCkgeyBkYXRhUG9pbnRlckFycmF5ID0gZGF0YVBvaW50ZXJBcnJheS5zbGljZSgwLCAtMSk7IH1cblxuICAvLyBJZiBmb3JtR3JvdXAgaW5wdXQgaXMgYSByZWFsIGZvcm1Hcm91cCAobm90IGEgZm9ybUdyb3VwIHRlbXBsYXRlKVxuICAvLyB0cnkgdXNpbmcgZm9ybUdyb3VwLmdldCgpIHRvIHJldHVybiB0aGUgY29udHJvbFxuICBpZiAodHlwZW9mIGZvcm1Hcm91cC5nZXQgPT09ICdmdW5jdGlvbicgJiZcbiAgICBkYXRhUG9pbnRlckFycmF5LmV2ZXJ5KGtleSA9PiBrZXkuaW5kZXhPZignLicpID09PSAtMSlcbiAgKSB7XG4gICAgY29uc3QgZm9ybUNvbnRyb2wgPSBmb3JtR3JvdXAuZ2V0KGRhdGFQb2ludGVyQXJyYXkuam9pbignLicpKTtcbiAgICBpZiAoZm9ybUNvbnRyb2wpIHsgcmV0dXJuIGZvcm1Db250cm9sOyB9XG4gIH1cblxuICAvLyBJZiBmb3JtR3JvdXAgaW5wdXQgaXMgYSBmb3JtR3JvdXAgdGVtcGxhdGUsXG4gIC8vIG9yIGZvcm1Hcm91cC5nZXQoKSBmYWlsZWQgdG8gcmV0dXJuIHRoZSBjb250cm9sLFxuICAvLyBzZWFyY2ggdGhlIGZvcm1Hcm91cCBvYmplY3QgZm9yIGRhdGFQb2ludGVyJ3MgY29udHJvbFxuICBsZXQgc3ViR3JvdXAgPSBmb3JtR3JvdXA7XG4gIGZvciAoY29uc3Qga2V5IG9mIGRhdGFQb2ludGVyQXJyYXkpIHtcbiAgICBpZiAoaGFzT3duKHN1Ykdyb3VwLCAnY29udHJvbHMnKSkgeyBzdWJHcm91cCA9IHN1Ykdyb3VwLmNvbnRyb2xzOyB9XG4gICAgaWYgKGlzQXJyYXkoc3ViR3JvdXApICYmIChrZXkgPT09ICctJykpIHtcbiAgICAgIHN1Ykdyb3VwID0gc3ViR3JvdXBbc3ViR3JvdXAubGVuZ3RoIC0gMV07XG4gICAgfSBlbHNlIGlmIChoYXNPd24oc3ViR3JvdXAsIGtleSkpIHtcbiAgICAgIHN1Ykdyb3VwID0gc3ViR3JvdXBba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihgZ2V0Q29udHJvbCBlcnJvcjogVW5hYmxlIHRvIGZpbmQgXCIke2tleX1cIiBpdGVtIGluIEZvcm1Hcm91cC5gKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZGF0YVBvaW50ZXIpO1xuICAgICAgY29uc29sZS5lcnJvcihmb3JtR3JvdXApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3ViR3JvdXA7XG59XG4iXX0=
