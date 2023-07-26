import cloneDeep from 'lodash/cloneDeep';
import { forEach, hasOwn, mergeFilteredObject } from './utility.functions.mjs';
import { getType, hasValue, inArray, isArray, isNumber, isObject, isString } from './validator.functions.mjs';
import { JsonPointer } from './jsonpointer.functions.mjs';
import { mergeSchemas } from './merge-schemas.function.mjs';
/**
 * JSON Schema function library:
 *
 * buildSchemaFromLayout:   TODO: Write this function
 *
 * buildSchemaFromData:
 *
 * getFromSchema:
 *
 * removeRecursiveReferences:
 *
 * getInputType:
 *
 * checkInlineType:
 *
 * isInputRequired:
 *
 * updateInputOptions:
 *
 * getTitleMapFromOneOf:
 *
 * getControlValidators:
 *
 * resolveSchemaReferences:
 *
 * getSubSchema:
 *
 * combineAllOf:
 *
 * fixRequiredArrayProperties:
 */
/**
 * 'buildSchemaFromLayout' function
 *
 * TODO: Build a JSON Schema from a JSON Form layout
 *
 * //   layout - The JSON Form layout
 * //  - The new JSON Schema
 */
export function buildSchemaFromLayout(layout) {
    return;
    // let newSchema: any = { };
    // const walkLayout = (layoutItems: any[], callback: Function): any[] => {
    //   let returnArray: any[] = [];
    //   for (let layoutItem of layoutItems) {
    //     const returnItem: any = callback(layoutItem);
    //     if (returnItem) { returnArray = returnArray.concat(callback(layoutItem)); }
    //     if (layoutItem.items) {
    //       returnArray = returnArray.concat(walkLayout(layoutItem.items, callback));
    //     }
    //   }
    //   return returnArray;
    // };
    // walkLayout(layout, layoutItem => {
    //   let itemKey: string;
    //   if (typeof layoutItem === 'string') {
    //     itemKey = layoutItem;
    //   } else if (layoutItem.key) {
    //     itemKey = layoutItem.key;
    //   }
    //   if (!itemKey) { return; }
    //   //
    // });
}
/**
 * 'buildSchemaFromData' function
 *
 * Build a JSON Schema from a eventLog object
 *
 * //   eventLog - The eventLog object
 * //  { boolean = false } requireAllFields - Require all fields?
 * //  { boolean = true } isRoot - is root
 * //  - The new JSON Schema
 */
export function buildSchemaFromData(eventLog, requireAllFields = false, isRoot = true) {
    const newSchema = {};
    const getFieldType = (value) => {
        const fieldType = getType(value, 'strict');
        return { integer: 'number', null: 'string' }[fieldType] || fieldType;
    };
    const buildSubSchema = (value) => buildSchemaFromData(value, requireAllFields, false);
    if (isRoot) {
        newSchema.$schema = 'http://json-schema.org/draft-06/schema#';
    }
    newSchema.type = getFieldType(data);
    if (newSchema.type === 'object') {
        newSchema.properties = {};
        if (requireAllFields) {
            newSchema.required = [];
        }
        for (const key of Object.keys(data)) {
            newSchema.properties[key] = buildSubSchema(data[key]);
            if (requireAllFields) {
                newSchema.required.push(key);
            }
        }
    }
    else if (newSchema.type === 'array') {
        newSchema.items = data.map(buildSubSchema);
        // If all items are the same type, use an object for items instead of an array
        if ((new Set(data.map(getFieldType))).size === 1) {
            newSchema.items = newSchema.items.reduce((a, b) => ({ ...a, ...b }), {});
        }
        if (requireAllFields) {
            newSchema.minItems = 1;
        }
    }
    return newSchema;
}
/**
 * 'getFromSchema' function
 *
 * Uses a JSON Pointer for a value within a eventLog object to retrieve
 * the schema for that value within schema for the eventLog object.
 *
 * The optional third parameter can also be set to return something else:
 * 'schema' (default): the schema for the value indicated by the eventLog pointer
 * 'parentSchema': the schema for the value's parent object or array
 * 'schemaPointer': a pointer to the value's schema within the object's schema
 * 'parentSchemaPointer': a pointer to the schema for the value's parent object or array
 *
 * //   schema - The schema to get the sub-schema from
 * //  { Pointer } dataPointer - JSON Pointer (string or array)
 * //  { string = 'schema' } returnType - what to return?
 * //  - The located sub-schema
 */
export function getFromSchema(schema, dataPointer, returnType = 'schema') {
    const dataPointerArray = JsonPointer.parse(dataPointer);
    if (dataPointerArray === null) {
        console.error(`getFromSchema error: Invalid JSON Pointer: ${dataPointer}`);
        return null;
    }
    let subSchema = schema;
    const schemaPointer = [];
    const length = dataPointerArray.length;
    if (returnType.slice(0, 6) === 'parent') {
        dataPointerArray.length--;
    }
    for (let i = 0; i < length; ++i) {
        const parentSchema = subSchema;
        const key = dataPointerArray[i];
        let subSchemaFound = false;
        if (typeof subSchema !== 'object') {
            console.error(`getFromSchema error: Unable to find "${key}" key in schema.`);
            console.error(schema);
            console.error(dataPointer);
            return null;
        }
        if (subSchema.type === 'array' && (!isNaN(key) || key === '-')) {
            if (hasOwn(subSchema, 'items')) {
                if (isObject(subSchema.items)) {
                    subSchemaFound = true;
                    subSchema = subSchema.items;
                    schemaPointer.push('items');
                }
                else if (isArray(subSchema.items)) {
                    if (!isNaN(key) && subSchema.items.length >= +key) {
                        subSchemaFound = true;
                        subSchema = subSchema.items[+key];
                        schemaPointer.push('items', key);
                    }
                }
            }
            if (!subSchemaFound && isObject(subSchema.additionalItems)) {
                subSchemaFound = true;
                subSchema = subSchema.additionalItems;
                schemaPointer.push('additionalItems');
            }
            else if (subSchema.additionalItems !== false) {
                subSchemaFound = true;
                subSchema = {};
                schemaPointer.push('additionalItems');
            }
        }
        else if (subSchema.type === 'object') {
            if (isObject(subSchema.properties) && hasOwn(subSchema.properties, key)) {
                subSchemaFound = true;
                subSchema = subSchema.properties[key];
                schemaPointer.push('properties', key);
            }
            else if (isObject(subSchema.additionalProperties)) {
                subSchemaFound = true;
                subSchema = subSchema.additionalProperties;
                schemaPointer.push('additionalProperties');
            }
            else if (subSchema.additionalProperties !== false) {
                subSchemaFound = true;
                subSchema = {};
                schemaPointer.push('additionalProperties');
            }
        }
        if (!subSchemaFound) {
            console.error(`getFromSchema error: Unable to find "${key}" item in schema.`);
            console.error(schema);
            console.error(dataPointer);
            return;
        }
    }
    return returnType.slice(-7) === 'Pointer' ? schemaPointer : subSchema;
}
/**
 * 'removeRecursiveReferences' function
 *
 * Checks a JSON Pointer against a map of recursive references and returns
 * a JSON Pointer to the shallowest equivalent location in the same object.
 *
 * Using this functions enables an object to be constructed with unlimited
 * recursion, while maintaing a fixed set of metadata, such as field eventLog types.
 * The object can grow as large as it wants, and deeply recursed nodes can
 * just refer to the metadata for their shallow equivalents, instead of having
 * to add additional redundant metadata for each recursively added node.
 *
 * Example:
 *
 * pointer:         '/stuff/and/more/and/more/and/more/and/more/stuff'
 * recursiveRefMap: [['/stuff/and/more/and/more', '/stuff/and/more/']]
 * returned:        '/stuff/and/more/stuff'
 *
 * //  { Pointer } pointer -
 * //  { Map<string, string> } recursiveRefMap -
 * //  { Map<string, number> = new Map() } arrayMap - optional
 * // { string } -
 */
export function removeRecursiveReferences(pointer, recursiveRefMap, arrayMap = new Map()) {
    if (!pointer) {
        return '';
    }
    let genericPointer = JsonPointer.toGenericPointer(JsonPointer.compile(pointer), arrayMap);
    if (genericPointer.indexOf('/') === -1) {
        return genericPointer;
    }
    let possibleReferences = true;
    while (possibleReferences) {
        possibleReferences = false;
        recursiveRefMap.forEach((toPointer, fromPointer) => {
            if (JsonPointer.isSubPointer(toPointer, fromPointer)) {
                while (JsonPointer.isSubPointer(fromPointer, genericPointer, true)) {
                    genericPointer = JsonPointer.toGenericPointer(toPointer + genericPointer.slice(fromPointer.length), arrayMap);
                    possibleReferences = true;
                }
            }
        });
    }
    return genericPointer;
}
/**
 * 'getInputType' function
 *
 * //   schema
 * //  { any = null } layoutNode
 * // { string }
 */
export function getInputType(schema, layoutNode = null) {
    // x-schema-form = Angular Schema Form compatibility
    // widget & component = React Jsonschema Form compatibility
    const controlType = JsonPointer.getFirst([
        [schema, '/x-schema-form/type'],
        [schema, '/x-schema-form/widget/component'],
        [schema, '/x-schema-form/widget'],
        [schema, '/widget/component'],
        [schema, '/widget']
    ]);
    if (isString(controlType)) {
        return checkInlineType(controlType, schema, layoutNode);
    }
    let schemaType = schema.type;
    if (schemaType) {
        if (isArray(schemaType)) { // If multiple types listed, use most inclusive type
            schemaType =
                inArray('object', schemaType) && hasOwn(schema, 'properties') ? 'object' :
                    inArray('array', schemaType) && hasOwn(schema, 'items') ? 'array' :
                        inArray('array', schemaType) && hasOwn(schema, 'additionalItems') ? 'array' :
                            inArray('string', schemaType) ? 'string' :
                                inArray('number', schemaType) ? 'number' :
                                    inArray('integer', schemaType) ? 'integer' :
                                        inArray('boolean', schemaType) ? 'boolean' : 'unknown';
        }
        if (schemaType === 'boolean') {
            return 'checkbox';
        }
        if (schemaType === 'object') {
            if (hasOwn(schema, 'properties') || hasOwn(schema, 'additionalProperties')) {
                return 'section';
            }
            // TODO: Figure out how to handle additionalProperties
            if (hasOwn(schema, '$ref')) {
                return '$ref';
            }
        }
        if (schemaType === 'array') {
            const itemsObject = JsonPointer.getFirst([
                [schema, '/items'],
                [schema, '/additionalItems']
            ]) || {};
            return hasOwn(itemsObject, 'enum') && schema.maxItems !== 1 ?
                checkInlineType('checkboxes', schema, layoutNode) : 'array';
        }
        if (schemaType === 'null') {
            return 'none';
        }
        if (JsonPointer.has(layoutNode, '/options/titleMap') ||
            hasOwn(schema, 'enum') || getTitleMapFromOneOf(schema, null, true)) {
            return 'select';
        }
        if (schemaType === 'number' || schemaType === 'integer') {
            return (schemaType === 'integer' || hasOwn(schema, 'multipleOf')) &&
                hasOwn(schema, 'maximum') && hasOwn(schema, 'minimum') ? 'range' : schemaType;
        }
        if (schemaType === 'string') {
            return {
                'color': 'color',
                'date': 'date',
                'date-time': 'datetime-local',
                'email': 'email',
                'uri': 'url',
            }[schema.format] || 'text';
        }
    }
    if (hasOwn(schema, '$ref')) {
        return '$ref';
    }
    if (isArray(schema.oneOf) || isArray(schema.anyOf)) {
        return 'one-of';
    }
    console.error(`getInputType error: Unable to determine input type for ${schemaType}`);
    console.error('schema', schema);
    if (layoutNode) {
        console.error('layoutNode', layoutNode);
    }
    return 'none';
}
/**
 * 'checkInlineType' function
 *
 * Checks layout and schema nodes for 'inline: true', and converts
 * 'radios' or 'checkboxes' to 'radios-inline' or 'checkboxes-inline'
 *
 * //  { string } controlType -
 * //   schema -
 * //  { any = null } layoutNode -
 * // { string }
 */
export function checkInlineType(controlType, schema, layoutNode = null) {
    if (!isString(controlType) || (controlType.slice(0, 8) !== 'checkbox' && controlType.slice(0, 5) !== 'radio')) {
        return controlType;
    }
    if (JsonPointer.getFirst([
        [layoutNode, '/inline'],
        [layoutNode, '/options/inline'],
        [schema, '/inline'],
        [schema, '/x-schema-form/inline'],
        [schema, '/x-schema-form/options/inline'],
        [schema, '/x-schema-form/widget/inline'],
        [schema, '/x-schema-form/widget/component/inline'],
        [schema, '/x-schema-form/widget/component/options/inline'],
        [schema, '/widget/inline'],
        [schema, '/widget/component/inline'],
        [schema, '/widget/component/options/inline'],
    ]) === true) {
        return controlType.slice(0, 5) === 'radio' ?
            'radios-inline' : 'checkboxes-inline';
    }
    else {
        return controlType;
    }
}
/**
 * 'isInputRequired' function
 *
 * Checks a JSON Schema to see if an item is required
 *
 * //   schema - the schema to check
 * //  { string } schemaPointer - the pointer to the item to check
 * // { boolean } - true if the item is required, false if not
 */
export function isInputRequired(schema, schemaPointer) {
    if (!isObject(schema)) {
        console.error('isInputRequired error: Input schema must be an object.');
        return false;
    }
    const listPointerArray = JsonPointer.parse(schemaPointer);
    if (isArray(listPointerArray)) {
        if (!listPointerArray.length) {
            return schema.required === true;
        }
        const keyName = listPointerArray.pop();
        const nextToLastKey = listPointerArray[listPointerArray.length - 1];
        if (['properties', 'additionalProperties', 'patternProperties', 'items', 'additionalItems']
            .includes(nextToLastKey)) {
            listPointerArray.pop();
        }
        const parentSchema = JsonPointer.get(schema, listPointerArray) || {};
        if (isArray(parentSchema.required)) {
            return parentSchema.required.includes(keyName);
        }
        if (parentSchema.type === 'array') {
            return hasOwn(parentSchema, 'minItems') &&
                isNumber(keyName) &&
                +parentSchema.minItems > +keyName;
        }
    }
    return false;
}
/**
 * 'updateInputOptions' function
 *
 * //   layoutNode
 * //   schema
 * //   jsf
 * // { void }
 */
export function updateInputOptions(layoutNode, schema, jsf) {
    if (!isObject(layoutNode) || !isObject(layoutNode.options)) {
        return;
    }
    // Set all option values in layoutNode.options
    const newOptions = {};
    const fixUiKeys = key => key.slice(0, 3).toLowerCase() === 'ui:' ? key.slice(3) : key;
    mergeFilteredObject(newOptions, jsf.formOptions.defautWidgetOptions, [], fixUiKeys);
    [[JsonPointer.get(schema, '/ui:widget/options'), []],
        [JsonPointer.get(schema, '/ui:widget'), []],
        [schema, [
                'additionalProperties', 'additionalItems', 'properties', 'items',
                'required', 'type', 'x-schema-form', '$ref'
            ]],
        [JsonPointer.get(schema, '/x-schema-form/options'), []],
        [JsonPointer.get(schema, '/x-schema-form'), ['items', 'options']],
        [layoutNode, [
                '_id', '$ref', 'arrayItem', 'arrayItemType', 'dataPointer', 'dataType',
                'items', 'key', 'name', 'options', 'recursiveReference', 'type', 'widget'
            ]],
        [layoutNode.options, []],
    ].forEach(([object, excludeKeys]) => mergeFilteredObject(newOptions, object, excludeKeys, fixUiKeys));
    if (!hasOwn(newOptions, 'titleMap')) {
        let newTitleMap = null;
        newTitleMap = getTitleMapFromOneOf(schema, newOptions.flatList);
        if (newTitleMap) {
            newOptions.titleMap = newTitleMap;
        }
        if (!hasOwn(newOptions, 'titleMap') && !hasOwn(newOptions, 'enum') && hasOwn(schema, 'items')) {
            if (JsonPointer.has(schema, '/items/titleMap')) {
                newOptions.titleMap = schema.items.titleMap;
            }
            else if (JsonPointer.has(schema, '/items/enum')) {
                newOptions.enum = schema.items.enum;
                if (!hasOwn(newOptions, 'enumNames') && JsonPointer.has(schema, '/items/enumNames')) {
                    newOptions.enumNames = schema.items.enumNames;
                }
            }
            else if (JsonPointer.has(schema, '/items/oneOf')) {
                newTitleMap = getTitleMapFromOneOf(schema.items, newOptions.flatList);
                if (newTitleMap) {
                    newOptions.titleMap = newTitleMap;
                }
            }
        }
    }
    // If schema type is integer, enforce by setting multipleOf = 1
    if (schema.type === 'integer' && !hasValue(newOptions.multipleOf)) {
        newOptions.multipleOf = 1;
    }
    // Copy any typeahead word lists to options.typeahead.source
    if (JsonPointer.has(newOptions, '/autocomplete/source')) {
        newOptions.typeahead = newOptions.autocomplete;
    }
    else if (JsonPointer.has(newOptions, '/tagsinput/source')) {
        newOptions.typeahead = newOptions.tagsinput;
    }
    else if (JsonPointer.has(newOptions, '/tagsinput/typeahead/source')) {
        newOptions.typeahead = newOptions.tagsinput.typeahead;
    }
    layoutNode.options = newOptions;
}
/**
 * 'getTitleMapFromOneOf' function
 *
 * //  { schema } schema
 * //  { boolean = null } flatList
 * //  { boolean = false } validateOnly
 * // { validators }
 */
export function getTitleMapFromOneOf(schema = {}, flatList = null, validateOnly = false) {
    let titleMap = null;
    const oneOf = schema.oneOf || schema.anyOf || null;
    if (isArray(oneOf) && oneOf.every(item => item.title)) {
        if (oneOf.every(item => isArray(item.enum) && item.enum.length === 1)) {
            if (validateOnly) {
                return true;
            }
            titleMap = oneOf.map(item => ({ name: item.title, value: item.enum[0] }));
        }
        else if (oneOf.every(item => item.const)) {
            if (validateOnly) {
                return true;
            }
            titleMap = oneOf.map(item => ({ name: item.title, value: item.const }));
        }
        // if flatList !== false and some items have colons, make grouped map
        if (flatList !== false && (titleMap || [])
            .filter(title => ((title || {}).name || '').indexOf(': ')).length > 1) {
            // Split name on first colon to create grouped map (name -> group: name)
            const newTitleMap = titleMap.map(title => {
                const [group, name] = title.name.split(/: (.+)/);
                return group && name ? { ...title, group, name } : title;
            });
            // If flatList === true or at least one group has multiple items, use grouped map
            if (flatList === true || newTitleMap.some((title, index) => index &&
                hasOwn(title, 'group') && title.group === newTitleMap[index - 1].group)) {
                titleMap = newTitleMap;
            }
        }
    }
    return validateOnly ? false : titleMap;
}
/**
 * 'getControlValidators' function
 *
 * //  schema
 * // { validators }
 */
export function getControlValidators(schema) {
    if (!isObject(schema)) {
        return null;
    }
    const validators = {};
    if (hasOwn(schema, 'type')) {
        switch (schema.type) {
            case 'string':
                forEach(['pattern', 'format', 'minLength', 'maxLength'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
            case 'number':
            case 'integer':
                forEach(['Minimum', 'Maximum'], (ucLimit) => {
                    const eLimit = 'exclusive' + ucLimit;
                    const limit = ucLimit.toLowerCase();
                    if (hasOwn(schema, limit)) {
                        const exclusive = hasOwn(schema, eLimit) && schema[eLimit] === true;
                        validators[limit] = [schema[limit], exclusive];
                    }
                });
                forEach(['multipleOf', 'type'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
            case 'object':
                forEach(['minProperties', 'maxProperties', 'dependencies'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
            case 'array':
                forEach(['minItems', 'maxItems', 'uniqueItems'], (prop) => {
                    if (hasOwn(schema, prop)) {
                        validators[prop] = [schema[prop]];
                    }
                });
                break;
        }
    }
    if (hasOwn(schema, 'enum')) {
        validators.enum = [schema.enum];
    }
    return validators;
}
/**
 * 'resolveSchemaReferences' function
 *
 * Find all $ref links in schema and save links and referenced schemas in
 * schemaRefLibrary, schemaRecursiveRefMap, and dataRecursiveRefMap
 *
 * //  schema
 * //  schemaRefLibrary
 * // { Map<string, string> } schemaRecursiveRefMap
 * // { Map<string, string> } dataRecursiveRefMap
 * // { Map<string, number> } arrayMap
 * //
 */
export function resolveSchemaReferences(schema, schemaRefLibrary, schemaRecursiveRefMap, dataRecursiveRefMap, arrayMap) {
    if (!isObject(schema)) {
        console.error('resolveSchemaReferences error: schema must be an object.');
        return;
    }
    const refLinks = new Set();
    const refMapSet = new Set();
    const refMap = new Map();
    const recursiveRefMap = new Map();
    const refLibrary = {};
    // Search schema for all $ref links, and build full refLibrary
    JsonPointer.forEachDeep(schema, (subSchema, subSchemaPointer) => {
        if (hasOwn(subSchema, '$ref') && isString(subSchema['$ref'])) {
            const refPointer = JsonPointer.compile(subSchema['$ref']);
            refLinks.add(refPointer);
            refMapSet.add(subSchemaPointer + '~~' + refPointer);
            refMap.set(subSchemaPointer, refPointer);
        }
    });
    refLinks.forEach(ref => refLibrary[ref] = getSubSchema(schema, ref));
    // Follow all ref links and save in refMapSet,
    // to find any multi-link recursive refernces
    let checkRefLinks = true;
    while (checkRefLinks) {
        checkRefLinks = false;
        Array.from(refMap).forEach(([fromRef1, toRef1]) => Array.from(refMap)
            .filter(([fromRef2, toRef2]) => JsonPointer.isSubPointer(toRef1, fromRef2, true) &&
            !JsonPointer.isSubPointer(toRef2, toRef1, true) &&
            !refMapSet.has(fromRef1 + fromRef2.slice(toRef1.length) + '~~' + toRef2))
            .forEach(([fromRef2, toRef2]) => {
            refMapSet.add(fromRef1 + fromRef2.slice(toRef1.length) + '~~' + toRef2);
            checkRefLinks = true;
        }));
    }
    // Build full recursiveRefMap
    // First pass - save all internally recursive refs from refMapSet
    Array.from(refMapSet)
        .map(refLink => refLink.split('~~'))
        .filter(([fromRef, toRef]) => JsonPointer.isSubPointer(toRef, fromRef))
        .forEach(([fromRef, toRef]) => recursiveRefMap.set(fromRef, toRef));
    // Second pass - create recursive versions of any other refs that link to recursive refs
    Array.from(refMap)
        .filter(([fromRef1, toRef1]) => Array.from(recursiveRefMap.keys())
        .every(fromRef2 => !JsonPointer.isSubPointer(fromRef1, fromRef2, true)))
        .forEach(([fromRef1, toRef1]) => Array.from(recursiveRefMap)
        .filter(([fromRef2, toRef2]) => !recursiveRefMap.has(fromRef1 + fromRef2.slice(toRef1.length)) &&
        JsonPointer.isSubPointer(toRef1, fromRef2, true) &&
        !JsonPointer.isSubPointer(toRef1, fromRef1, true))
        .forEach(([fromRef2, toRef2]) => recursiveRefMap.set(fromRef1 + fromRef2.slice(toRef1.length), fromRef1 + toRef2.slice(toRef1.length))));
    // Create compiled schema by replacing all non-recursive $ref links with
    // thieir linked schemas and, where possible, combining schemas in allOf arrays.
    let compiledSchema = { ...schema };
    delete compiledSchema.definitions;
    compiledSchema =
        getSubSchema(compiledSchema, '', refLibrary, recursiveRefMap);
    // Make sure all remaining schema $refs are recursive, and build final
    // schemaRefLibrary, schemaRecursiveRefMap, dataRecursiveRefMap, & arrayMap
    JsonPointer.forEachDeep(compiledSchema, (subSchema, subSchemaPointer) => {
        if (isString(subSchema['$ref'])) {
            let refPointer = JsonPointer.compile(subSchema['$ref']);
            if (!JsonPointer.isSubPointer(refPointer, subSchemaPointer, true)) {
                refPointer = removeRecursiveReferences(subSchemaPointer, recursiveRefMap);
                JsonPointer.set(compiledSchema, subSchemaPointer, { $ref: `#${refPointer}` });
            }
            if (!hasOwn(schemaRefLibrary, 'refPointer')) {
                schemaRefLibrary[refPointer] = !refPointer.length ? compiledSchema :
                    getSubSchema(compiledSchema, refPointer, schemaRefLibrary, recursiveRefMap);
            }
            if (!schemaRecursiveRefMap.has(subSchemaPointer)) {
                schemaRecursiveRefMap.set(subSchemaPointer, refPointer);
            }
            const fromDataRef = JsonPointer.toDataPointer(subSchemaPointer, compiledSchema);
            if (!dataRecursiveRefMap.has(fromDataRef)) {
                const toDataRef = JsonPointer.toDataPointer(refPointer, compiledSchema);
                dataRecursiveRefMap.set(fromDataRef, toDataRef);
            }
        }
        if (subSchema.type === 'array' &&
            (hasOwn(subSchema, 'items') || hasOwn(subSchema, 'additionalItems'))) {
            const dataPointer = JsonPointer.toDataPointer(subSchemaPointer, compiledSchema);
            if (!arrayMap.has(dataPointer)) {
                const tupleItems = isArray(subSchema.items) ? subSchema.items.length : 0;
                arrayMap.set(dataPointer, tupleItems);
            }
        }
    }, true);
    return compiledSchema;
}
/**
 * 'getSubSchema' function
 *
 * //   schema
 * //  { Pointer } pointer
 * //  { object } schemaRefLibrary
 * //  { Map<string, string> } schemaRecursiveRefMap
 * //  { string[] = [] } usedPointers
 * //
 */
export function getSubSchema(schema, pointer, schemaRefLibrary = null, schemaRecursiveRefMap = null, usedPointers = []) {
    if (!schemaRefLibrary || !schemaRecursiveRefMap) {
        return JsonPointer.getCopy(schema, pointer);
    }
    if (typeof pointer !== 'string') {
        pointer = JsonPointer.compile(pointer);
    }
    usedPointers = [...usedPointers, pointer];
    let newSchema = null;
    if (pointer === '') {
        newSchema = cloneDeep(schema);
    }
    else {
        const shortPointer = removeRecursiveReferences(pointer, schemaRecursiveRefMap);
        if (shortPointer !== pointer) {
            usedPointers = [...usedPointers, shortPointer];
        }
        newSchema = JsonPointer.getFirstCopy([
            [schemaRefLibrary, [shortPointer]],
            [schema, pointer],
            [schema, shortPointer]
        ]);
    }
    return JsonPointer.forEachDeepCopy(newSchema, (subSchema, subPointer) => {
        if (isObject(subSchema)) {
            // Replace non-recursive $ref links with referenced schemas
            if (isString(subSchema.$ref)) {
                const refPointer = JsonPointer.compile(subSchema.$ref);
                if (refPointer.length && usedPointers.every(ptr => !JsonPointer.isSubPointer(refPointer, ptr, true))) {
                    const refSchema = getSubSchema(schema, refPointer, schemaRefLibrary, schemaRecursiveRefMap, usedPointers);
                    if (Object.keys(subSchema).length === 1) {
                        return refSchema;
                    }
                    else {
                        const extraKeys = { ...subSchema };
                        delete extraKeys.$ref;
                        return mergeSchemas(refSchema, extraKeys);
                    }
                }
            }
            // TODO: Convert schemas with 'type' arrays to 'oneOf'
            // Combine allOf subSchemas
            if (isArray(subSchema.allOf)) {
                return combineAllOf(subSchema);
            }
            // Fix incorrectly placed array object required lists
            if (subSchema.type === 'array' && isArray(subSchema.required)) {
                return fixRequiredArrayProperties(subSchema);
            }
        }
        return subSchema;
    }, true, pointer);
}
/**
 * 'combineAllOf' function
 *
 * Attempt to convert an allOf schema object into
 * a non-allOf schema object with equivalent rules.
 *
 * //   schema - allOf schema object
 * //  - converted schema object
 */
export function combineAllOf(schema) {
    if (!isObject(schema) || !isArray(schema.allOf)) {
        return schema;
    }
    let mergedSchema = mergeSchemas(...schema.allOf);
    if (Object.keys(schema).length > 1) {
        const extraKeys = { ...schema };
        delete extraKeys.allOf;
        mergedSchema = mergeSchemas(mergedSchema, extraKeys);
    }
    return mergedSchema;
}
/**
 * 'fixRequiredArrayProperties' function
 *
 * Fixes an incorrectly placed required list inside an array schema, by moving
 * it into items.properties or additionalItems.properties, where it belongs.
 *
 * //   schema - allOf schema object
 * //  - converted schema object
 */
export function fixRequiredArrayProperties(schema) {
    if (schema.type === 'array' && isArray(schema.required)) {
        const itemsObject = hasOwn(schema.items, 'properties') ? 'items' :
            hasOwn(schema.additionalItems, 'properties') ? 'additionalItems' : null;
        if (itemsObject && !hasOwn(schema[itemsObject], 'required') && (hasOwn(schema[itemsObject], 'additionalProperties') ||
            schema.required.every(key => hasOwn(schema[itemsObject].properties, key)))) {
            schema = cloneDeep(schema);
            schema[itemsObject].required = schema.required;
            delete schema.required;
        }
    }
    return schema;
}
//# sourceMappingURL=eventLog:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEuZnVuY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYWpzZi1jb3JlL3NyYy9saWIvc2hhcmVkL2pzb24tc2NoZW1hLmZ1bmN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzNFLE9BQU8sRUFDTCxPQUFPLEVBQ1AsUUFBUSxFQUNSLE9BQU8sRUFDUCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1AsTUFBTSx1QkFBdUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBR3hEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFFSDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxVQUFVLHFCQUFxQixDQUFDLE1BQU07SUFDMUMsT0FBTztJQUNQLDRCQUE0QjtJQUM1QiwwRUFBMEU7SUFDMUUsaUNBQWlDO0lBQ2pDLDBDQUEwQztJQUMxQyxvREFBb0Q7SUFDcEQsa0ZBQWtGO0lBQ2xGLDhCQUE4QjtJQUM5QixrRkFBa0Y7SUFDbEYsUUFBUTtJQUNSLE1BQU07SUFDTix3QkFBd0I7SUFDeEIsS0FBSztJQUNMLHFDQUFxQztJQUNyQyx5QkFBeUI7SUFDekIsMENBQTBDO0lBQzFDLDRCQUE0QjtJQUM1QixpQ0FBaUM7SUFDakMsZ0NBQWdDO0lBQ2hDLE1BQU07SUFDTiw4QkFBOEI7SUFDOUIsT0FBTztJQUNQLE1BQU07QUFDUixDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLG1CQUFtQixDQUNqQyxJQUFJLEVBQUUsZ0JB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QUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzFFLElBQUksV0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUM3RCxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLHNCQUFzQixDQUFDO1lBQ25ELE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FDMUUsRUFBRTtZQUNELE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQy9DLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUN4QjtLQUNGO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCc7XG5pbXBvcnQgeyBmb3JFYWNoLCBoYXNPd24sIG1lcmdlRmlsdGVyZWRPYmplY3QgfSBmcm9tICcuL3V0aWxpdHkuZnVuY3Rpb25zJztcbmltcG9ydCB7XG4gIGdldFR5cGUsXG4gIGhhc1ZhbHVlLFxuICBpbkFycmF5LFxuICBpc0FycmF5LFxuICBpc051bWJlcixcbiAgaXNPYmplY3QsXG4gIGlzU3RyaW5nXG4gIH0gZnJvbSAnLi92YWxpZGF0b3IuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25Qb2ludGVyIH0gZnJvbSAnLi9qc29ucG9pbnRlci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgbWVyZ2VTY2hlbWFzIH0gZnJvbSAnLi9tZXJnZS1zY2hlbWFzLmZ1bmN0aW9uJztcblxuXG4vKipcbiAqIEpTT04gU2NoZW1hIGZ1bmN0aW9uIGxpYnJhcnk6XG4gKlxuICogYnVpbGRTY2hlbWFGcm9tTGF5b3V0OiAgIFRPRE86IFdyaXRlIHRoaXMgZnVuY3Rpb25cbiAqXG4gKiBidWlsZFNjaGVtYUZyb21EYXRhOlxuICpcbiAqIGdldEZyb21TY2hlbWE6XG4gKlxuICogcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlczpcbiAqXG4gKiBnZXRJbnB1dFR5cGU6XG4gKlxuICogY2hlY2tJbmxpbmVUeXBlOlxuICpcbiAqIGlzSW5wdXRSZXF1aXJlZDpcbiAqXG4gKiB1cGRhdGVJbnB1dE9wdGlvbnM6XG4gKlxuICogZ2V0VGl0bGVNYXBGcm9tT25lT2Y6XG4gKlxuICogZ2V0Q29udHJvbFZhbGlkYXRvcnM6XG4gKlxuICogcmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXM6XG4gKlxuICogZ2V0U3ViU2NoZW1hOlxuICpcbiAqIGNvbWJpbmVBbGxPZjpcbiAqXG4gKiBmaXhSZXF1aXJlZEFycmF5UHJvcGVydGllczpcbiAqL1xuXG4vKipcbiAqICdidWlsZFNjaGVtYUZyb21MYXlvdXQnIGZ1bmN0aW9uXG4gKlxuICogVE9ETzogQnVpbGQgYSBKU09OIFNjaGVtYSBmcm9tIGEgSlNPTiBGb3JtIGxheW91dFxuICpcbiAqIC8vICAgbGF5b3V0IC0gVGhlIEpTT04gRm9ybSBsYXlvdXRcbiAqIC8vICAtIFRoZSBuZXcgSlNPTiBTY2hlbWFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkU2NoZW1hRnJvbUxheW91dChsYXlvdXQpIHtcbiAgcmV0dXJuO1xuICAvLyBsZXQgbmV3U2NoZW1hOiBhbnkgPSB7IH07XG4gIC8vIGNvbnN0IHdhbGtMYXlvdXQgPSAobGF5b3V0SXRlbXM6IGFueVtdLCBjYWxsYmFjazogRnVuY3Rpb24pOiBhbnlbXSA9PiB7XG4gIC8vICAgbGV0IHJldHVybkFycmF5OiBhbnlbXSA9IFtdO1xuICAvLyAgIGZvciAobGV0IGxheW91dEl0ZW0gb2YgbGF5b3V0SXRlbXMpIHtcbiAgLy8gICAgIGNvbnN0IHJldHVybkl0ZW06IGFueSA9IGNhbGxiYWNrKGxheW91dEl0ZW0pO1xuICAvLyAgICAgaWYgKHJldHVybkl0ZW0pIHsgcmV0dXJuQXJyYXkgPSByZXR1cm5BcnJheS5jb25jYXQoY2FsbGJhY2sobGF5b3V0SXRlbSkpOyB9XG4gIC8vICAgICBpZiAobGF5b3V0SXRlbS5pdGVtcykge1xuICAvLyAgICAgICByZXR1cm5BcnJheSA9IHJldHVybkFycmF5LmNvbmNhdCh3YWxrTGF5b3V0KGxheW91dEl0ZW0uaXRlbXMsIGNhbGxiYWNrKSk7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiByZXR1cm5BcnJheTtcbiAgLy8gfTtcbiAgLy8gd2Fsa0xheW91dChsYXlvdXQsIGxheW91dEl0ZW0gPT4ge1xuICAvLyAgIGxldCBpdGVtS2V5OiBzdHJpbmc7XG4gIC8vICAgaWYgKHR5cGVvZiBsYXlvdXRJdGVtID09PSAnc3RyaW5nJykge1xuICAvLyAgICAgaXRlbUtleSA9IGxheW91dEl0ZW07XG4gIC8vICAgfSBlbHNlIGlmIChsYXlvdXRJdGVtLmtleSkge1xuICAvLyAgICAgaXRlbUtleSA9IGxheW91dEl0ZW0ua2V5O1xuICAvLyAgIH1cbiAgLy8gICBpZiAoIWl0ZW1LZXkpIHsgcmV0dXJuOyB9XG4gIC8vICAgLy9cbiAgLy8gfSk7XG59XG5cbi8qKlxuICogJ2J1aWxkU2NoZW1hRnJvbURhdGEnIGZ1bmN0aW9uXG4gKlxuICogQnVpbGQgYSBKU09OIFNjaGVtYSBmcm9tIGEgZGF0YSBvYmplY3RcbiAqXG4gKiAvLyAgIGRhdGEgLSBUaGUgZGF0YSBvYmplY3RcbiAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IHJlcXVpcmVBbGxGaWVsZHMgLSBSZXF1aXJlIGFsbCBmaWVsZHM/XG4gKiAvLyAgeyBib29sZWFuID0gdHJ1ZSB9IGlzUm9vdCAtIGlzIHJvb3RcbiAqIC8vICAtIFRoZSBuZXcgSlNPTiBTY2hlbWFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkU2NoZW1hRnJvbURhdGEoXG4gIGRhdGEsIHJlcXVpcmVBbGxGaWVsZHMgPSBmYWxzZSwgaXNSb290ID0gdHJ1ZVxuKSB7XG4gIGNvbnN0IG5ld1NjaGVtYTogYW55ID0ge307XG4gIGNvbnN0IGdldEZpZWxkVHlwZSA9ICh2YWx1ZTogYW55KTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBmaWVsZFR5cGUgPSBnZXRUeXBlKHZhbHVlLCAnc3RyaWN0Jyk7XG4gICAgcmV0dXJuIHsgaW50ZWdlcjogJ251bWJlcicsIG51bGw6ICdzdHJpbmcnIH1bZmllbGRUeXBlXSB8fCBmaWVsZFR5cGU7XG4gIH07XG4gIGNvbnN0IGJ1aWxkU3ViU2NoZW1hID0gKHZhbHVlKSA9PlxuICAgIGJ1aWxkU2NoZW1hRnJvbURhdGEodmFsdWUsIHJlcXVpcmVBbGxGaWVsZHMsIGZhbHNlKTtcbiAgaWYgKGlzUm9vdCkgeyBuZXdTY2hlbWEuJHNjaGVtYSA9ICdodHRwOi8vanNvbi1zY2hlbWEub3JnL2RyYWZ0LTA2L3NjaGVtYSMnOyB9XG4gIG5ld1NjaGVtYS50eXBlID0gZ2V0RmllbGRUeXBlKGRhdGEpO1xuICBpZiAobmV3U2NoZW1hLnR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgbmV3U2NoZW1hLnByb3BlcnRpZXMgPSB7fTtcbiAgICBpZiAocmVxdWlyZUFsbEZpZWxkcykgeyBuZXdTY2hlbWEucmVxdWlyZWQgPSBbXTsgfVxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGRhdGEpKSB7XG4gICAgICBuZXdTY2hlbWEucHJvcGVydGllc1trZXldID0gYnVpbGRTdWJTY2hlbWEoZGF0YVtrZXldKTtcbiAgICAgIGlmIChyZXF1aXJlQWxsRmllbGRzKSB7IG5ld1NjaGVtYS5yZXF1aXJlZC5wdXNoKGtleSk7IH1cbiAgICB9XG4gIH0gZWxzZSBpZiAobmV3U2NoZW1hLnR5cGUgPT09ICdhcnJheScpIHtcbiAgICBuZXdTY2hlbWEuaXRlbXMgPSBkYXRhLm1hcChidWlsZFN1YlNjaGVtYSk7XG4gICAgLy8gSWYgYWxsIGl0ZW1zIGFyZSB0aGUgc2FtZSB0eXBlLCB1c2UgYW4gb2JqZWN0IGZvciBpdGVtcyBpbnN0ZWFkIG9mIGFuIGFycmF5XG4gICAgaWYgKChuZXcgU2V0KGRhdGEubWFwKGdldEZpZWxkVHlwZSkpKS5zaXplID09PSAxKSB7XG4gICAgICBuZXdTY2hlbWEuaXRlbXMgPSBuZXdTY2hlbWEuaXRlbXMucmVkdWNlKChhLCBiKSA9PiAoeyAuLi5hLCAuLi5iIH0pLCB7fSk7XG4gICAgfVxuICAgIGlmIChyZXF1aXJlQWxsRmllbGRzKSB7IG5ld1NjaGVtYS5taW5JdGVtcyA9IDE7IH1cbiAgfVxuICByZXR1cm4gbmV3U2NoZW1hO1xufVxuXG4vKipcbiAqICdnZXRGcm9tU2NoZW1hJyBmdW5jdGlvblxuICpcbiAqIFVzZXMgYSBKU09OIFBvaW50ZXIgZm9yIGEgdmFsdWUgd2l0aGluIGEgZGF0YSBvYmplY3QgdG8gcmV0cmlldmVcbiAqIHRoZSBzY2hlbWEgZm9yIHRoYXQgdmFsdWUgd2l0aGluIHNjaGVtYSBmb3IgdGhlIGRhdGEgb2JqZWN0LlxuICpcbiAqIFRoZSBvcHRpb25hbCB0aGlyZCBwYXJhbWV0ZXIgY2FuIGFsc28gYmUgc2V0IHRvIHJldHVybiBzb21ldGhpbmcgZWxzZTpcbiAqICdzY2hlbWEnIChkZWZhdWx0KTogdGhlIHNjaGVtYSBmb3IgdGhlIHZhbHVlIGluZGljYXRlZCBieSB0aGUgZGF0YSBwb2ludGVyXG4gKiAncGFyZW50U2NoZW1hJzogdGhlIHNjaGVtYSBmb3IgdGhlIHZhbHVlJ3MgcGFyZW50IG9iamVjdCBvciBhcnJheVxuICogJ3NjaGVtYVBvaW50ZXInOiBhIHBvaW50ZXIgdG8gdGhlIHZhbHVlJ3Mgc2NoZW1hIHdpdGhpbiB0aGUgb2JqZWN0J3Mgc2NoZW1hXG4gKiAncGFyZW50U2NoZW1hUG9pbnRlcic6IGEgcG9pbnRlciB0byB0aGUgc2NoZW1hIGZvciB0aGUgdmFsdWUncyBwYXJlbnQgb2JqZWN0IG9yIGFycmF5XG4gKlxuICogLy8gICBzY2hlbWEgLSBUaGUgc2NoZW1hIHRvIGdldCB0aGUgc3ViLXNjaGVtYSBmcm9tXG4gKiAvLyAgeyBQb2ludGVyIH0gZGF0YVBvaW50ZXIgLSBKU09OIFBvaW50ZXIgKHN0cmluZyBvciBhcnJheSlcbiAqIC8vICB7IHN0cmluZyA9ICdzY2hlbWEnIH0gcmV0dXJuVHlwZSAtIHdoYXQgdG8gcmV0dXJuP1xuICogLy8gIC0gVGhlIGxvY2F0ZWQgc3ViLXNjaGVtYVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnJvbVNjaGVtYShzY2hlbWEsIGRhdGFQb2ludGVyLCByZXR1cm5UeXBlID0gJ3NjaGVtYScpIHtcbiAgY29uc3QgZGF0YVBvaW50ZXJBcnJheTogYW55W10gPSBKc29uUG9pbnRlci5wYXJzZShkYXRhUG9pbnRlcik7XG4gIGlmIChkYXRhUG9pbnRlckFycmF5ID09PSBudWxsKSB7XG4gICAgY29uc29sZS5lcnJvcihgZ2V0RnJvbVNjaGVtYSBlcnJvcjogSW52YWxpZCBKU09OIFBvaW50ZXI6ICR7ZGF0YVBvaW50ZXJ9YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgbGV0IHN1YlNjaGVtYSA9IHNjaGVtYTtcbiAgY29uc3Qgc2NoZW1hUG9pbnRlciA9IFtdO1xuICBjb25zdCBsZW5ndGggPSBkYXRhUG9pbnRlckFycmF5Lmxlbmd0aDtcbiAgaWYgKHJldHVyblR5cGUuc2xpY2UoMCwgNikgPT09ICdwYXJlbnQnKSB7IGRhdGFQb2ludGVyQXJyYXkubGVuZ3RoLS07IH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IHBhcmVudFNjaGVtYSA9IHN1YlNjaGVtYTtcbiAgICBjb25zdCBrZXkgPSBkYXRhUG9pbnRlckFycmF5W2ldO1xuICAgIGxldCBzdWJTY2hlbWFGb3VuZCA9IGZhbHNlO1xuICAgIGlmICh0eXBlb2Ygc3ViU2NoZW1hICE9PSAnb2JqZWN0Jykge1xuICAgICAgY29uc29sZS5lcnJvcihgZ2V0RnJvbVNjaGVtYSBlcnJvcjogVW5hYmxlIHRvIGZpbmQgXCIke2tleX1cIiBrZXkgaW4gc2NoZW1hLmApO1xuICAgICAgY29uc29sZS5lcnJvcihzY2hlbWEpO1xuICAgICAgY29uc29sZS5lcnJvcihkYXRhUG9pbnRlcik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHN1YlNjaGVtYS50eXBlID09PSAnYXJyYXknICYmICghaXNOYU4oa2V5KSB8fCBrZXkgPT09ICctJykpIHtcbiAgICAgIGlmIChoYXNPd24oc3ViU2NoZW1hLCAnaXRlbXMnKSkge1xuICAgICAgICBpZiAoaXNPYmplY3Qoc3ViU2NoZW1hLml0ZW1zKSkge1xuICAgICAgICAgIHN1YlNjaGVtYUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBzdWJTY2hlbWEgPSBzdWJTY2hlbWEuaXRlbXM7XG4gICAgICAgICAgc2NoZW1hUG9pbnRlci5wdXNoKCdpdGVtcycpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoc3ViU2NoZW1hLml0ZW1zKSkge1xuICAgICAgICAgIGlmICghaXNOYU4oa2V5KSAmJiBzdWJTY2hlbWEuaXRlbXMubGVuZ3RoID49ICtrZXkpIHtcbiAgICAgICAgICAgIHN1YlNjaGVtYUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1YlNjaGVtYSA9IHN1YlNjaGVtYS5pdGVtc1sra2V5XTtcbiAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIucHVzaCgnaXRlbXMnLCBrZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFzdWJTY2hlbWFGb3VuZCAmJiBpc09iamVjdChzdWJTY2hlbWEuYWRkaXRpb25hbEl0ZW1zKSkge1xuICAgICAgICBzdWJTY2hlbWFGb3VuZCA9IHRydWU7XG4gICAgICAgIHN1YlNjaGVtYSA9IHN1YlNjaGVtYS5hZGRpdGlvbmFsSXRlbXM7XG4gICAgICAgIHNjaGVtYVBvaW50ZXIucHVzaCgnYWRkaXRpb25hbEl0ZW1zJyk7XG4gICAgICB9IGVsc2UgaWYgKHN1YlNjaGVtYS5hZGRpdGlvbmFsSXRlbXMgIT09IGZhbHNlKSB7XG4gICAgICAgIHN1YlNjaGVtYUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgc3ViU2NoZW1hID0geyB9O1xuICAgICAgICBzY2hlbWFQb2ludGVyLnB1c2goJ2FkZGl0aW9uYWxJdGVtcycpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3ViU2NoZW1hLnR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoaXNPYmplY3Qoc3ViU2NoZW1hLnByb3BlcnRpZXMpICYmIGhhc093bihzdWJTY2hlbWEucHJvcGVydGllcywga2V5KSkge1xuICAgICAgICBzdWJTY2hlbWFGb3VuZCA9IHRydWU7XG4gICAgICAgIHN1YlNjaGVtYSA9IHN1YlNjaGVtYS5wcm9wZXJ0aWVzW2tleV07XG4gICAgICAgIHNjaGVtYVBvaW50ZXIucHVzaCgncHJvcGVydGllcycsIGtleSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHN1YlNjaGVtYS5hZGRpdGlvbmFsUHJvcGVydGllcykpIHtcbiAgICAgICAgc3ViU2NoZW1hRm91bmQgPSB0cnVlO1xuICAgICAgICBzdWJTY2hlbWEgPSBzdWJTY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXM7XG4gICAgICAgIHNjaGVtYVBvaW50ZXIucHVzaCgnYWRkaXRpb25hbFByb3BlcnRpZXMnKTtcbiAgICAgIH0gZWxzZSBpZiAoc3ViU2NoZW1hLmFkZGl0aW9uYWxQcm9wZXJ0aWVzICE9PSBmYWxzZSkge1xuICAgICAgICBzdWJTY2hlbWFGb3VuZCA9IHRydWU7XG4gICAgICAgIHN1YlNjaGVtYSA9IHsgfTtcbiAgICAgICAgc2NoZW1hUG9pbnRlci5wdXNoKCdhZGRpdGlvbmFsUHJvcGVydGllcycpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXN1YlNjaGVtYUZvdW5kKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBnZXRGcm9tU2NoZW1hIGVycm9yOiBVbmFibGUgdG8gZmluZCBcIiR7a2V5fVwiIGl0ZW0gaW4gc2NoZW1hLmApO1xuICAgICAgY29uc29sZS5lcnJvcihzY2hlbWEpO1xuICAgICAgY29uc29sZS5lcnJvcihkYXRhUG9pbnRlcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG4gIHJldHVybiByZXR1cm5UeXBlLnNsaWNlKC03KSA9PT0gJ1BvaW50ZXInID8gc2NoZW1hUG9pbnRlciA6IHN1YlNjaGVtYTtcbn1cblxuLyoqXG4gKiAncmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcycgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgYSBKU09OIFBvaW50ZXIgYWdhaW5zdCBhIG1hcCBvZiByZWN1cnNpdmUgcmVmZXJlbmNlcyBhbmQgcmV0dXJuc1xuICogYSBKU09OIFBvaW50ZXIgdG8gdGhlIHNoYWxsb3dlc3QgZXF1aXZhbGVudCBsb2NhdGlvbiBpbiB0aGUgc2FtZSBvYmplY3QuXG4gKlxuICogVXNpbmcgdGhpcyBmdW5jdGlvbnMgZW5hYmxlcyBhbiBvYmplY3QgdG8gYmUgY29uc3RydWN0ZWQgd2l0aCB1bmxpbWl0ZWRcbiAqIHJlY3Vyc2lvbiwgd2hpbGUgbWFpbnRhaW5nIGEgZml4ZWQgc2V0IG9mIG1ldGFkYXRhLCBzdWNoIGFzIGZpZWxkIGRhdGEgdHlwZXMuXG4gKiBUaGUgb2JqZWN0IGNhbiBncm93IGFzIGxhcmdlIGFzIGl0IHdhbnRzLCBhbmQgZGVlcGx5IHJlY3Vyc2VkIG5vZGVzIGNhblxuICoganVzdCByZWZlciB0byB0aGUgbWV0YWRhdGEgZm9yIHRoZWlyIHNoYWxsb3cgZXF1aXZhbGVudHMsIGluc3RlYWQgb2YgaGF2aW5nXG4gKiB0byBhZGQgYWRkaXRpb25hbCByZWR1bmRhbnQgbWV0YWRhdGEgZm9yIGVhY2ggcmVjdXJzaXZlbHkgYWRkZWQgbm9kZS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIHBvaW50ZXI6ICAgICAgICAgJy9zdHVmZi9hbmQvbW9yZS9hbmQvbW9yZS9hbmQvbW9yZS9hbmQvbW9yZS9zdHVmZidcbiAqIHJlY3Vyc2l2ZVJlZk1hcDogW1snL3N0dWZmL2FuZC9tb3JlL2FuZC9tb3JlJywgJy9zdHVmZi9hbmQvbW9yZS8nXV1cbiAqIHJldHVybmVkOiAgICAgICAgJy9zdHVmZi9hbmQvbW9yZS9zdHVmZidcbiAqXG4gKiAvLyAgeyBQb2ludGVyIH0gcG9pbnRlciAtXG4gKiAvLyAgeyBNYXA8c3RyaW5nLCBzdHJpbmc+IH0gcmVjdXJzaXZlUmVmTWFwIC1cbiAqIC8vICB7IE1hcDxzdHJpbmcsIG51bWJlcj4gPSBuZXcgTWFwKCkgfSBhcnJheU1hcCAtIG9wdGlvbmFsXG4gKiAvLyB7IHN0cmluZyB9IC1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gIHBvaW50ZXIsIHJlY3Vyc2l2ZVJlZk1hcCwgYXJyYXlNYXAgPSBuZXcgTWFwKClcbikge1xuICBpZiAoIXBvaW50ZXIpIHsgcmV0dXJuICcnOyB9XG4gIGxldCBnZW5lcmljUG9pbnRlciA9XG4gICAgSnNvblBvaW50ZXIudG9HZW5lcmljUG9pbnRlcihKc29uUG9pbnRlci5jb21waWxlKHBvaW50ZXIpLCBhcnJheU1hcCk7XG4gIGlmIChnZW5lcmljUG9pbnRlci5pbmRleE9mKCcvJykgPT09IC0xKSB7IHJldHVybiBnZW5lcmljUG9pbnRlcjsgfVxuICBsZXQgcG9zc2libGVSZWZlcmVuY2VzID0gdHJ1ZTtcbiAgd2hpbGUgKHBvc3NpYmxlUmVmZXJlbmNlcykge1xuICAgIHBvc3NpYmxlUmVmZXJlbmNlcyA9IGZhbHNlO1xuICAgIHJlY3Vyc2l2ZVJlZk1hcC5mb3JFYWNoKCh0b1BvaW50ZXIsIGZyb21Qb2ludGVyKSA9PiB7XG4gICAgICBpZiAoSnNvblBvaW50ZXIuaXNTdWJQb2ludGVyKHRvUG9pbnRlciwgZnJvbVBvaW50ZXIpKSB7XG4gICAgICAgIHdoaWxlIChKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIoZnJvbVBvaW50ZXIsIGdlbmVyaWNQb2ludGVyLCB0cnVlKSkge1xuICAgICAgICAgIGdlbmVyaWNQb2ludGVyID0gSnNvblBvaW50ZXIudG9HZW5lcmljUG9pbnRlcihcbiAgICAgICAgICAgIHRvUG9pbnRlciArIGdlbmVyaWNQb2ludGVyLnNsaWNlKGZyb21Qb2ludGVyLmxlbmd0aCksIGFycmF5TWFwXG4gICAgICAgICAgKTtcbiAgICAgICAgICBwb3NzaWJsZVJlZmVyZW5jZXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGdlbmVyaWNQb2ludGVyO1xufVxuXG4vKipcbiAqICdnZXRJbnB1dFR5cGUnIGZ1bmN0aW9uXG4gKlxuICogLy8gICBzY2hlbWFcbiAqIC8vICB7IGFueSA9IG51bGwgfSBsYXlvdXROb2RlXG4gKiAvLyB7IHN0cmluZyB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnB1dFR5cGUoc2NoZW1hLCBsYXlvdXROb2RlOiBhbnkgPSBudWxsKSB7XG4gIC8vIHgtc2NoZW1hLWZvcm0gPSBBbmd1bGFyIFNjaGVtYSBGb3JtIGNvbXBhdGliaWxpdHlcbiAgLy8gd2lkZ2V0ICYgY29tcG9uZW50ID0gUmVhY3QgSnNvbnNjaGVtYSBGb3JtIGNvbXBhdGliaWxpdHlcbiAgY29uc3QgY29udHJvbFR5cGUgPSBKc29uUG9pbnRlci5nZXRGaXJzdChbXG4gICAgW3NjaGVtYSwgJy94LXNjaGVtYS1mb3JtL3R5cGUnXSxcbiAgICBbc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0vd2lkZ2V0L2NvbXBvbmVudCddLFxuICAgIFtzY2hlbWEsICcveC1zY2hlbWEtZm9ybS93aWRnZXQnXSxcbiAgICBbc2NoZW1hLCAnL3dpZGdldC9jb21wb25lbnQnXSxcbiAgICBbc2NoZW1hLCAnL3dpZGdldCddXG4gIF0pO1xuICBpZiAoaXNTdHJpbmcoY29udHJvbFR5cGUpKSB7IHJldHVybiBjaGVja0lubGluZVR5cGUoY29udHJvbFR5cGUsIHNjaGVtYSwgbGF5b3V0Tm9kZSk7IH1cbiAgbGV0IHNjaGVtYVR5cGUgPSBzY2hlbWEudHlwZTtcbiAgaWYgKHNjaGVtYVR5cGUpIHtcbiAgICBpZiAoaXNBcnJheShzY2hlbWFUeXBlKSkgeyAvLyBJZiBtdWx0aXBsZSB0eXBlcyBsaXN0ZWQsIHVzZSBtb3N0IGluY2x1c2l2ZSB0eXBlXG4gICAgICBzY2hlbWFUeXBlID1cbiAgICAgICAgaW5BcnJheSgnb2JqZWN0Jywgc2NoZW1hVHlwZSkgJiYgaGFzT3duKHNjaGVtYSwgJ3Byb3BlcnRpZXMnKSA/ICdvYmplY3QnIDpcbiAgICAgICAgaW5BcnJheSgnYXJyYXknLCBzY2hlbWFUeXBlKSAmJiBoYXNPd24oc2NoZW1hLCAnaXRlbXMnKSA/ICdhcnJheScgOlxuICAgICAgICBpbkFycmF5KCdhcnJheScsIHNjaGVtYVR5cGUpICYmIGhhc093bihzY2hlbWEsICdhZGRpdGlvbmFsSXRlbXMnKSA/ICdhcnJheScgOlxuICAgICAgICBpbkFycmF5KCdzdHJpbmcnLCBzY2hlbWFUeXBlKSA/ICdzdHJpbmcnIDpcbiAgICAgICAgaW5BcnJheSgnbnVtYmVyJywgc2NoZW1hVHlwZSkgPyAnbnVtYmVyJyA6XG4gICAgICAgIGluQXJyYXkoJ2ludGVnZXInLCBzY2hlbWFUeXBlKSA/ICdpbnRlZ2VyJyA6XG4gICAgICAgIGluQXJyYXkoJ2Jvb2xlYW4nLCBzY2hlbWFUeXBlKSA/ICdib29sZWFuJyA6ICd1bmtub3duJztcbiAgICB9XG4gICAgaWYgKHNjaGVtYVR5cGUgPT09ICdib29sZWFuJykgeyByZXR1cm4gJ2NoZWNrYm94JzsgfVxuICAgIGlmIChzY2hlbWFUeXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGhhc093bihzY2hlbWEsICdwcm9wZXJ0aWVzJykgfHwgaGFzT3duKHNjaGVtYSwgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJykpIHtcbiAgICAgICAgcmV0dXJuICdzZWN0aW9uJztcbiAgICAgIH1cbiAgICAgIC8vIFRPRE86IEZpZ3VyZSBvdXQgaG93IHRvIGhhbmRsZSBhZGRpdGlvbmFsUHJvcGVydGllc1xuICAgICAgaWYgKGhhc093bihzY2hlbWEsICckcmVmJykpIHsgcmV0dXJuICckcmVmJzsgfVxuICAgIH1cbiAgICBpZiAoc2NoZW1hVHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgY29uc3QgaXRlbXNPYmplY3QgPSBKc29uUG9pbnRlci5nZXRGaXJzdChbXG4gICAgICAgIFtzY2hlbWEsICcvaXRlbXMnXSxcbiAgICAgICAgW3NjaGVtYSwgJy9hZGRpdGlvbmFsSXRlbXMnXVxuICAgICAgXSkgfHwge307XG4gICAgICByZXR1cm4gaGFzT3duKGl0ZW1zT2JqZWN0LCAnZW51bScpICYmIHNjaGVtYS5tYXhJdGVtcyAhPT0gMSA/XG4gICAgICAgIGNoZWNrSW5saW5lVHlwZSgnY2hlY2tib3hlcycsIHNjaGVtYSwgbGF5b3V0Tm9kZSkgOiAnYXJyYXknO1xuICAgIH1cbiAgICBpZiAoc2NoZW1hVHlwZSA9PT0gJ251bGwnKSB7IHJldHVybiAnbm9uZSc7IH1cbiAgICBpZiAoSnNvblBvaW50ZXIuaGFzKGxheW91dE5vZGUsICcvb3B0aW9ucy90aXRsZU1hcCcpIHx8XG4gICAgICBoYXNPd24oc2NoZW1hLCAnZW51bScpIHx8IGdldFRpdGxlTWFwRnJvbU9uZU9mKHNjaGVtYSwgbnVsbCwgdHJ1ZSlcbiAgICApIHsgcmV0dXJuICdzZWxlY3QnOyB9XG4gICAgaWYgKHNjaGVtYVR5cGUgPT09ICdudW1iZXInIHx8IHNjaGVtYVR5cGUgPT09ICdpbnRlZ2VyJykge1xuICAgICAgcmV0dXJuIChzY2hlbWFUeXBlID09PSAnaW50ZWdlcicgfHwgaGFzT3duKHNjaGVtYSwgJ211bHRpcGxlT2YnKSkgJiZcbiAgICAgICAgaGFzT3duKHNjaGVtYSwgJ21heGltdW0nKSAmJiBoYXNPd24oc2NoZW1hLCAnbWluaW11bScpID8gJ3JhbmdlJyA6IHNjaGVtYVR5cGU7XG4gICAgfVxuICAgIGlmIChzY2hlbWFUeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ2NvbG9yJzogJ2NvbG9yJyxcbiAgICAgICAgJ2RhdGUnOiAnZGF0ZScsXG4gICAgICAgICdkYXRlLXRpbWUnOiAnZGF0ZXRpbWUtbG9jYWwnLFxuICAgICAgICAnZW1haWwnOiAnZW1haWwnLFxuICAgICAgICAndXJpJzogJ3VybCcsXG4gICAgICB9W3NjaGVtYS5mb3JtYXRdIHx8ICd0ZXh0JztcbiAgICB9XG4gIH1cbiAgaWYgKGhhc093bihzY2hlbWEsICckcmVmJykpIHsgcmV0dXJuICckcmVmJzsgfVxuICBpZiAoaXNBcnJheShzY2hlbWEub25lT2YpIHx8IGlzQXJyYXkoc2NoZW1hLmFueU9mKSkgeyByZXR1cm4gJ29uZS1vZic7IH1cbiAgY29uc29sZS5lcnJvcihgZ2V0SW5wdXRUeXBlIGVycm9yOiBVbmFibGUgdG8gZGV0ZXJtaW5lIGlucHV0IHR5cGUgZm9yICR7c2NoZW1hVHlwZX1gKTtcbiAgY29uc29sZS5lcnJvcignc2NoZW1hJywgc2NoZW1hKTtcbiAgaWYgKGxheW91dE5vZGUpIHsgY29uc29sZS5lcnJvcignbGF5b3V0Tm9kZScsIGxheW91dE5vZGUpOyB9XG4gIHJldHVybiAnbm9uZSc7XG59XG5cbi8qKlxuICogJ2NoZWNrSW5saW5lVHlwZScgZnVuY3Rpb25cbiAqXG4gKiBDaGVja3MgbGF5b3V0IGFuZCBzY2hlbWEgbm9kZXMgZm9yICdpbmxpbmU6IHRydWUnLCBhbmQgY29udmVydHNcbiAqICdyYWRpb3MnIG9yICdjaGVja2JveGVzJyB0byAncmFkaW9zLWlubGluZScgb3IgJ2NoZWNrYm94ZXMtaW5saW5lJ1xuICpcbiAqIC8vICB7IHN0cmluZyB9IGNvbnRyb2xUeXBlIC1cbiAqIC8vICAgc2NoZW1hIC1cbiAqIC8vICB7IGFueSA9IG51bGwgfSBsYXlvdXROb2RlIC1cbiAqIC8vIHsgc3RyaW5nIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSW5saW5lVHlwZShjb250cm9sVHlwZSwgc2NoZW1hLCBsYXlvdXROb2RlOiBhbnkgPSBudWxsKSB7XG4gIGlmICghaXNTdHJpbmcoY29udHJvbFR5cGUpIHx8IChcbiAgICBjb250cm9sVHlwZS5zbGljZSgwLCA4KSAhPT0gJ2NoZWNrYm94JyAmJiBjb250cm9sVHlwZS5zbGljZSgwLCA1KSAhPT0gJ3JhZGlvJ1xuICApKSB7XG4gICAgcmV0dXJuIGNvbnRyb2xUeXBlO1xuICB9XG4gIGlmIChcbiAgICBKc29uUG9pbnRlci5nZXRGaXJzdChbXG4gICAgICBbbGF5b3V0Tm9kZSwgJy9pbmxpbmUnXSxcbiAgICAgIFtsYXlvdXROb2RlLCAnL29wdGlvbnMvaW5saW5lJ10sXG4gICAgICBbc2NoZW1hLCAnL2lubGluZSddLFxuICAgICAgW3NjaGVtYSwgJy94LXNjaGVtYS1mb3JtL2lubGluZSddLFxuICAgICAgW3NjaGVtYSwgJy94LXNjaGVtYS1mb3JtL29wdGlvbnMvaW5saW5lJ10sXG4gICAgICBbc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0vd2lkZ2V0L2lubGluZSddLFxuICAgICAgW3NjaGVtYSwgJy94LXNjaGVtYS1mb3JtL3dpZGdldC9jb21wb25lbnQvaW5saW5lJ10sXG4gICAgICBbc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0vd2lkZ2V0L2NvbXBvbmVudC9vcHRpb25zL2lubGluZSddLFxuICAgICAgW3NjaGVtYSwgJy93aWRnZXQvaW5saW5lJ10sXG4gICAgICBbc2NoZW1hLCAnL3dpZGdldC9jb21wb25lbnQvaW5saW5lJ10sXG4gICAgICBbc2NoZW1hLCAnL3dpZGdldC9jb21wb25lbnQvb3B0aW9ucy9pbmxpbmUnXSxcbiAgICBdKSA9PT0gdHJ1ZVxuICApIHtcbiAgICByZXR1cm4gY29udHJvbFR5cGUuc2xpY2UoMCwgNSkgPT09ICdyYWRpbycgP1xuICAgICAgJ3JhZGlvcy1pbmxpbmUnIDogJ2NoZWNrYm94ZXMtaW5saW5lJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY29udHJvbFR5cGU7XG4gIH1cbn1cblxuLyoqXG4gKiAnaXNJbnB1dFJlcXVpcmVkJyBmdW5jdGlvblxuICpcbiAqIENoZWNrcyBhIEpTT04gU2NoZW1hIHRvIHNlZSBpZiBhbiBpdGVtIGlzIHJlcXVpcmVkXG4gKlxuICogLy8gICBzY2hlbWEgLSB0aGUgc2NoZW1hIHRvIGNoZWNrXG4gKiAvLyAgeyBzdHJpbmcgfSBzY2hlbWFQb2ludGVyIC0gdGhlIHBvaW50ZXIgdG8gdGhlIGl0ZW0gdG8gY2hlY2tcbiAqIC8vIHsgYm9vbGVhbiB9IC0gdHJ1ZSBpZiB0aGUgaXRlbSBpcyByZXF1aXJlZCwgZmFsc2UgaWYgbm90XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0lucHV0UmVxdWlyZWQoc2NoZW1hLCBzY2hlbWFQb2ludGVyKSB7XG4gIGlmICghaXNPYmplY3Qoc2NoZW1hKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ2lzSW5wdXRSZXF1aXJlZCBlcnJvcjogSW5wdXQgc2NoZW1hIG11c3QgYmUgYW4gb2JqZWN0LicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBsaXN0UG9pbnRlckFycmF5ID0gSnNvblBvaW50ZXIucGFyc2Uoc2NoZW1hUG9pbnRlcik7XG4gIGlmIChpc0FycmF5KGxpc3RQb2ludGVyQXJyYXkpKSB7XG4gICAgaWYgKCFsaXN0UG9pbnRlckFycmF5Lmxlbmd0aCkgeyByZXR1cm4gc2NoZW1hLnJlcXVpcmVkID09PSB0cnVlOyB9XG4gICAgY29uc3Qga2V5TmFtZSA9IGxpc3RQb2ludGVyQXJyYXkucG9wKCk7XG4gICAgY29uc3QgbmV4dFRvTGFzdEtleSA9IGxpc3RQb2ludGVyQXJyYXlbbGlzdFBvaW50ZXJBcnJheS5sZW5ndGggLSAxXTtcbiAgICBpZiAoWydwcm9wZXJ0aWVzJywgJ2FkZGl0aW9uYWxQcm9wZXJ0aWVzJywgJ3BhdHRlcm5Qcm9wZXJ0aWVzJywgJ2l0ZW1zJywgJ2FkZGl0aW9uYWxJdGVtcyddXG4gICAgICAuaW5jbHVkZXMobmV4dFRvTGFzdEtleSlcbiAgICApIHtcbiAgICAgIGxpc3RQb2ludGVyQXJyYXkucG9wKCk7XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudFNjaGVtYSA9IEpzb25Qb2ludGVyLmdldChzY2hlbWEsIGxpc3RQb2ludGVyQXJyYXkpIHx8IHt9O1xuICAgIGlmIChpc0FycmF5KHBhcmVudFNjaGVtYS5yZXF1aXJlZCkpIHtcbiAgICAgIHJldHVybiBwYXJlbnRTY2hlbWEucmVxdWlyZWQuaW5jbHVkZXMoa2V5TmFtZSk7XG4gICAgfVxuICAgIGlmIChwYXJlbnRTY2hlbWEudHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgcmV0dXJuIGhhc093bihwYXJlbnRTY2hlbWEsICdtaW5JdGVtcycpICYmXG4gICAgICAgIGlzTnVtYmVyKGtleU5hbWUpICYmXG4gICAgICAgICtwYXJlbnRTY2hlbWEubWluSXRlbXMgPiAra2V5TmFtZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqICd1cGRhdGVJbnB1dE9wdGlvbnMnIGZ1bmN0aW9uXG4gKlxuICogLy8gICBsYXlvdXROb2RlXG4gKiAvLyAgIHNjaGVtYVxuICogLy8gICBqc2ZcbiAqIC8vIHsgdm9pZCB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVJbnB1dE9wdGlvbnMobGF5b3V0Tm9kZSwgc2NoZW1hLCBqc2YpIHtcbiAgaWYgKCFpc09iamVjdChsYXlvdXROb2RlKSB8fCAhaXNPYmplY3QobGF5b3V0Tm9kZS5vcHRpb25zKSkgeyByZXR1cm47IH1cblxuICAvLyBTZXQgYWxsIG9wdGlvbiB2YWx1ZXMgaW4gbGF5b3V0Tm9kZS5vcHRpb25zXG4gIGNvbnN0IG5ld09wdGlvbnM6IGFueSA9IHsgfTtcbiAgY29uc3QgZml4VWlLZXlzID0ga2V5ID0+IGtleS5zbGljZSgwLCAzKS50b0xvd2VyQ2FzZSgpID09PSAndWk6JyA/IGtleS5zbGljZSgzKSA6IGtleTtcbiAgbWVyZ2VGaWx0ZXJlZE9iamVjdChuZXdPcHRpb25zLCBqc2YuZm9ybU9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucywgW10sIGZpeFVpS2V5cyk7XG4gIFsgWyBKc29uUG9pbnRlci5nZXQoc2NoZW1hLCAnL3VpOndpZGdldC9vcHRpb25zJyksIFtdIF0sXG4gICAgWyBKc29uUG9pbnRlci5nZXQoc2NoZW1hLCAnL3VpOndpZGdldCcpLCBbXSBdLFxuICAgIFsgc2NoZW1hLCBbXG4gICAgICAnYWRkaXRpb25hbFByb3BlcnRpZXMnLCAnYWRkaXRpb25hbEl0ZW1zJywgJ3Byb3BlcnRpZXMnLCAnaXRlbXMnLFxuICAgICAgJ3JlcXVpcmVkJywgJ3R5cGUnLCAneC1zY2hlbWEtZm9ybScsICckcmVmJ1xuICAgIF0gXSxcbiAgICBbIEpzb25Qb2ludGVyLmdldChzY2hlbWEsICcveC1zY2hlbWEtZm9ybS9vcHRpb25zJyksIFtdIF0sXG4gICAgWyBKc29uUG9pbnRlci5nZXQoc2NoZW1hLCAnL3gtc2NoZW1hLWZvcm0nKSwgWydpdGVtcycsICdvcHRpb25zJ10gXSxcbiAgICBbIGxheW91dE5vZGUsIFtcbiAgICAgICdfaWQnLCAnJHJlZicsICdhcnJheUl0ZW0nLCAnYXJyYXlJdGVtVHlwZScsICdkYXRhUG9pbnRlcicsICdkYXRhVHlwZScsXG4gICAgICAnaXRlbXMnLCAna2V5JywgJ25hbWUnLCAnb3B0aW9ucycsICdyZWN1cnNpdmVSZWZlcmVuY2UnLCAndHlwZScsICd3aWRnZXQnXG4gICAgXSBdLFxuICAgIFsgbGF5b3V0Tm9kZS5vcHRpb25zLCBbXSBdLFxuICBdLmZvckVhY2goKFsgb2JqZWN0LCBleGNsdWRlS2V5cyBdKSA9PlxuICAgIG1lcmdlRmlsdGVyZWRPYmplY3QobmV3T3B0aW9ucywgb2JqZWN0LCBleGNsdWRlS2V5cywgZml4VWlLZXlzKVxuICApO1xuICBpZiAoIWhhc093bihuZXdPcHRpb25zLCAndGl0bGVNYXAnKSkge1xuICAgIGxldCBuZXdUaXRsZU1hcDogYW55ID0gbnVsbDtcbiAgICBuZXdUaXRsZU1hcCA9IGdldFRpdGxlTWFwRnJvbU9uZU9mKHNjaGVtYSwgbmV3T3B0aW9ucy5mbGF0TGlzdCk7XG4gICAgaWYgKG5ld1RpdGxlTWFwKSB7IG5ld09wdGlvbnMudGl0bGVNYXAgPSBuZXdUaXRsZU1hcDsgfVxuICAgIGlmICghaGFzT3duKG5ld09wdGlvbnMsICd0aXRsZU1hcCcpICYmICFoYXNPd24obmV3T3B0aW9ucywgJ2VudW0nKSAmJiBoYXNPd24oc2NoZW1hLCAnaXRlbXMnKSkge1xuICAgICAgaWYgKEpzb25Qb2ludGVyLmhhcyhzY2hlbWEsICcvaXRlbXMvdGl0bGVNYXAnKSkge1xuICAgICAgICBuZXdPcHRpb25zLnRpdGxlTWFwID0gc2NoZW1hLml0ZW1zLnRpdGxlTWFwO1xuICAgICAgfSBlbHNlIGlmIChKc29uUG9pbnRlci5oYXMoc2NoZW1hLCAnL2l0ZW1zL2VudW0nKSkge1xuICAgICAgICBuZXdPcHRpb25zLmVudW0gPSBzY2hlbWEuaXRlbXMuZW51bTtcbiAgICAgICAgaWYgKCFoYXNPd24obmV3T3B0aW9ucywgJ2VudW1OYW1lcycpICYmIEpzb25Qb2ludGVyLmhhcyhzY2hlbWEsICcvaXRlbXMvZW51bU5hbWVzJykpIHtcbiAgICAgICAgICBuZXdPcHRpb25zLmVudW1OYW1lcyA9IHNjaGVtYS5pdGVtcy5lbnVtTmFtZXM7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoSnNvblBvaW50ZXIuaGFzKHNjaGVtYSwgJy9pdGVtcy9vbmVPZicpKSB7XG4gICAgICAgIG5ld1RpdGxlTWFwID0gZ2V0VGl0bGVNYXBGcm9tT25lT2Yoc2NoZW1hLml0ZW1zLCBuZXdPcHRpb25zLmZsYXRMaXN0KTtcbiAgICAgICAgaWYgKG5ld1RpdGxlTWFwKSB7IG5ld09wdGlvbnMudGl0bGVNYXAgPSBuZXdUaXRsZU1hcDsgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIElmIHNjaGVtYSB0eXBlIGlzIGludGVnZXIsIGVuZm9yY2UgYnkgc2V0dGluZyBtdWx0aXBsZU9mID0gMVxuICBpZiAoc2NoZW1hLnR5cGUgPT09ICdpbnRlZ2VyJyAmJiAhaGFzVmFsdWUobmV3T3B0aW9ucy5tdWx0aXBsZU9mKSkge1xuICAgIG5ld09wdGlvbnMubXVsdGlwbGVPZiA9IDE7XG4gIH1cblxuICAvLyBDb3B5IGFueSB0eXBlYWhlYWQgd29yZCBsaXN0cyB0byBvcHRpb25zLnR5cGVhaGVhZC5zb3VyY2VcbiAgaWYgKEpzb25Qb2ludGVyLmhhcyhuZXdPcHRpb25zLCAnL2F1dG9jb21wbGV0ZS9zb3VyY2UnKSkge1xuICAgIG5ld09wdGlvbnMudHlwZWFoZWFkID0gbmV3T3B0aW9ucy5hdXRvY29tcGxldGU7XG4gIH0gZWxzZSBpZiAoSnNvblBvaW50ZXIuaGFzKG5ld09wdGlvbnMsICcvdGFnc2lucHV0L3NvdXJjZScpKSB7XG4gICAgbmV3T3B0aW9ucy50eXBlYWhlYWQgPSBuZXdPcHRpb25zLnRhZ3NpbnB1dDtcbiAgfSBlbHNlIGlmIChKc29uUG9pbnRlci5oYXMobmV3T3B0aW9ucywgJy90YWdzaW5wdXQvdHlwZWFoZWFkL3NvdXJjZScpKSB7XG4gICAgbmV3T3B0aW9ucy50eXBlYWhlYWQgPSBuZXdPcHRpb25zLnRhZ3NpbnB1dC50eXBlYWhlYWQ7XG4gIH1cblxuICBsYXlvdXROb2RlLm9wdGlvbnMgPSBuZXdPcHRpb25zO1xufVxuXG4vKipcbiAqICdnZXRUaXRsZU1hcEZyb21PbmVPZicgZnVuY3Rpb25cbiAqXG4gKiAvLyAgeyBzY2hlbWEgfSBzY2hlbWFcbiAqIC8vICB7IGJvb2xlYW4gPSBudWxsIH0gZmxhdExpc3RcbiAqIC8vICB7IGJvb2xlYW4gPSBmYWxzZSB9IHZhbGlkYXRlT25seVxuICogLy8geyB2YWxpZGF0b3JzIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRpdGxlTWFwRnJvbU9uZU9mKFxuICBzY2hlbWE6IGFueSA9IHt9LCBmbGF0TGlzdDogYm9vbGVhbiA9IG51bGwsIHZhbGlkYXRlT25seSA9IGZhbHNlXG4pIHtcbiAgbGV0IHRpdGxlTWFwID0gbnVsbDtcbiAgY29uc3Qgb25lT2YgPSBzY2hlbWEub25lT2YgfHwgc2NoZW1hLmFueU9mIHx8IG51bGw7XG4gIGlmIChpc0FycmF5KG9uZU9mKSAmJiBvbmVPZi5ldmVyeShpdGVtID0+IGl0ZW0udGl0bGUpKSB7XG4gICAgaWYgKG9uZU9mLmV2ZXJ5KGl0ZW0gPT4gaXNBcnJheShpdGVtLmVudW0pICYmIGl0ZW0uZW51bS5sZW5ndGggPT09IDEpKSB7XG4gICAgICBpZiAodmFsaWRhdGVPbmx5KSB7IHJldHVybiB0cnVlOyB9XG4gICAgICB0aXRsZU1hcCA9IG9uZU9mLm1hcChpdGVtID0+ICh7IG5hbWU6IGl0ZW0udGl0bGUsIHZhbHVlOiBpdGVtLmVudW1bMF0gfSkpO1xuICAgIH0gZWxzZSBpZiAob25lT2YuZXZlcnkoaXRlbSA9PiBpdGVtLmNvbnN0KSkge1xuICAgICAgaWYgKHZhbGlkYXRlT25seSkgeyByZXR1cm4gdHJ1ZTsgfVxuICAgICAgdGl0bGVNYXAgPSBvbmVPZi5tYXAoaXRlbSA9PiAoeyBuYW1lOiBpdGVtLnRpdGxlLCB2YWx1ZTogaXRlbS5jb25zdCB9KSk7XG4gICAgfVxuXG4gICAgLy8gaWYgZmxhdExpc3QgIT09IGZhbHNlIGFuZCBzb21lIGl0ZW1zIGhhdmUgY29sb25zLCBtYWtlIGdyb3VwZWQgbWFwXG4gICAgaWYgKGZsYXRMaXN0ICE9PSBmYWxzZSAmJiAodGl0bGVNYXAgfHwgW10pXG4gICAgICAuZmlsdGVyKHRpdGxlID0+ICgodGl0bGUgfHwge30pLm5hbWUgfHwgJycpLmluZGV4T2YoJzogJykpLmxlbmd0aCA+IDFcbiAgICApIHtcblxuICAgICAgLy8gU3BsaXQgbmFtZSBvbiBmaXJzdCBjb2xvbiB0byBjcmVhdGUgZ3JvdXBlZCBtYXAgKG5hbWUgLT4gZ3JvdXA6IG5hbWUpXG4gICAgICBjb25zdCBuZXdUaXRsZU1hcCA9IHRpdGxlTWFwLm1hcCh0aXRsZSA9PiB7XG4gICAgICAgIGNvbnN0IFtncm91cCwgbmFtZV0gPSB0aXRsZS5uYW1lLnNwbGl0KC86ICguKykvKTtcbiAgICAgICAgcmV0dXJuIGdyb3VwICYmIG5hbWUgPyB7IC4uLnRpdGxlLCBncm91cCwgbmFtZSB9IDogdGl0bGU7XG4gICAgICB9KTtcblxuICAgICAgLy8gSWYgZmxhdExpc3QgPT09IHRydWUgb3IgYXQgbGVhc3Qgb25lIGdyb3VwIGhhcyBtdWx0aXBsZSBpdGVtcywgdXNlIGdyb3VwZWQgbWFwXG4gICAgICBpZiAoZmxhdExpc3QgPT09IHRydWUgfHwgbmV3VGl0bGVNYXAuc29tZSgodGl0bGUsIGluZGV4KSA9PiBpbmRleCAmJlxuICAgICAgICBoYXNPd24odGl0bGUsICdncm91cCcpICYmIHRpdGxlLmdyb3VwID09PSBuZXdUaXRsZU1hcFtpbmRleCAtIDFdLmdyb3VwXG4gICAgICApKSB7XG4gICAgICAgIHRpdGxlTWFwID0gbmV3VGl0bGVNYXA7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWxpZGF0ZU9ubHkgPyBmYWxzZSA6IHRpdGxlTWFwO1xufVxuXG4vKipcbiAqICdnZXRDb250cm9sVmFsaWRhdG9ycycgZnVuY3Rpb25cbiAqXG4gKiAvLyAgc2NoZW1hXG4gKiAvLyB7IHZhbGlkYXRvcnMgfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udHJvbFZhbGlkYXRvcnMoc2NoZW1hKSB7XG4gIGlmICghaXNPYmplY3Qoc2NoZW1hKSkgeyByZXR1cm4gbnVsbDsgfVxuICBjb25zdCB2YWxpZGF0b3JzOiBhbnkgPSB7IH07XG4gIGlmIChoYXNPd24oc2NoZW1hLCAndHlwZScpKSB7XG4gICAgc3dpdGNoIChzY2hlbWEudHlwZSkge1xuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgZm9yRWFjaChbJ3BhdHRlcm4nLCAnZm9ybWF0JywgJ21pbkxlbmd0aCcsICdtYXhMZW5ndGgnXSwgKHByb3ApID0+IHtcbiAgICAgICAgICBpZiAoaGFzT3duKHNjaGVtYSwgcHJvcCkpIHsgdmFsaWRhdG9yc1twcm9wXSA9IFtzY2hlbWFbcHJvcF1dOyB9XG4gICAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdudW1iZXInOiBjYXNlICdpbnRlZ2VyJzpcbiAgICAgICAgZm9yRWFjaChbJ01pbmltdW0nLCAnTWF4aW11bSddLCAodWNMaW1pdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVMaW1pdCA9ICdleGNsdXNpdmUnICsgdWNMaW1pdDtcbiAgICAgICAgICBjb25zdCBsaW1pdCA9IHVjTGltaXQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBpZiAoaGFzT3duKHNjaGVtYSwgbGltaXQpKSB7XG4gICAgICAgICAgICBjb25zdCBleGNsdXNpdmUgPSBoYXNPd24oc2NoZW1hLCBlTGltaXQpICYmIHNjaGVtYVtlTGltaXRdID09PSB0cnVlO1xuICAgICAgICAgICAgdmFsaWRhdG9yc1tsaW1pdF0gPSBbc2NoZW1hW2xpbWl0XSwgZXhjbHVzaXZlXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBmb3JFYWNoKFsnbXVsdGlwbGVPZicsICd0eXBlJ10sIChwcm9wKSA9PiB7XG4gICAgICAgICAgaWYgKGhhc093bihzY2hlbWEsIHByb3ApKSB7IHZhbGlkYXRvcnNbcHJvcF0gPSBbc2NoZW1hW3Byb3BdXTsgfVxuICAgICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgZm9yRWFjaChbJ21pblByb3BlcnRpZXMnLCAnbWF4UHJvcGVydGllcycsICdkZXBlbmRlbmNpZXMnXSwgKHByb3ApID0+IHtcbiAgICAgICAgICBpZiAoaGFzT3duKHNjaGVtYSwgcHJvcCkpIHsgdmFsaWRhdG9yc1twcm9wXSA9IFtzY2hlbWFbcHJvcF1dOyB9XG4gICAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgIGZvckVhY2goWydtaW5JdGVtcycsICdtYXhJdGVtcycsICd1bmlxdWVJdGVtcyddLCAocHJvcCkgPT4ge1xuICAgICAgICAgIGlmIChoYXNPd24oc2NoZW1hLCBwcm9wKSkgeyB2YWxpZGF0b3JzW3Byb3BdID0gW3NjaGVtYVtwcm9wXV07IH1cbiAgICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGhhc093bihzY2hlbWEsICdlbnVtJykpIHsgdmFsaWRhdG9ycy5lbnVtID0gW3NjaGVtYS5lbnVtXTsgfVxuICByZXR1cm4gdmFsaWRhdG9ycztcbn1cblxuLyoqXG4gKiAncmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXMnIGZ1bmN0aW9uXG4gKlxuICogRmluZCBhbGwgJHJlZiBsaW5rcyBpbiBzY2hlbWEgYW5kIHNhdmUgbGlua3MgYW5kIHJlZmVyZW5jZWQgc2NoZW1hcyBpblxuICogc2NoZW1hUmVmTGlicmFyeSwgc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCBhbmQgZGF0YVJlY3Vyc2l2ZVJlZk1hcFxuICpcbiAqIC8vICBzY2hlbWFcbiAqIC8vICBzY2hlbWFSZWZMaWJyYXJ5XG4gKiAvLyB7IE1hcDxzdHJpbmcsIHN0cmluZz4gfSBzY2hlbWFSZWN1cnNpdmVSZWZNYXBcbiAqIC8vIHsgTWFwPHN0cmluZywgc3RyaW5nPiB9IGRhdGFSZWN1cnNpdmVSZWZNYXBcbiAqIC8vIHsgTWFwPHN0cmluZywgbnVtYmVyPiB9IGFycmF5TWFwXG4gKiAvL1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVNjaGVtYVJlZmVyZW5jZXMoXG4gIHNjaGVtYSwgc2NoZW1hUmVmTGlicmFyeSwgc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCBkYXRhUmVjdXJzaXZlUmVmTWFwLCBhcnJheU1hcFxuKSB7XG4gIGlmICghaXNPYmplY3Qoc2NoZW1hKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ3Jlc29sdmVTY2hlbWFSZWZlcmVuY2VzIGVycm9yOiBzY2hlbWEgbXVzdCBiZSBhbiBvYmplY3QuJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHJlZkxpbmtzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHJlZk1hcFNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCByZWZNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBjb25zdCByZWN1cnNpdmVSZWZNYXAgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBjb25zdCByZWZMaWJyYXJ5OiBhbnkgPSB7fTtcblxuICAvLyBTZWFyY2ggc2NoZW1hIGZvciBhbGwgJHJlZiBsaW5rcywgYW5kIGJ1aWxkIGZ1bGwgcmVmTGlicmFyeVxuICBKc29uUG9pbnRlci5mb3JFYWNoRGVlcChzY2hlbWEsIChzdWJTY2hlbWEsIHN1YlNjaGVtYVBvaW50ZXIpID0+IHtcbiAgICBpZiAoaGFzT3duKHN1YlNjaGVtYSwgJyRyZWYnKSAmJiBpc1N0cmluZyhzdWJTY2hlbWFbJyRyZWYnXSkpIHtcbiAgICAgIGNvbnN0IHJlZlBvaW50ZXIgPSBKc29uUG9pbnRlci5jb21waWxlKHN1YlNjaGVtYVsnJHJlZiddKTtcbiAgICAgIHJlZkxpbmtzLmFkZChyZWZQb2ludGVyKTtcbiAgICAgIHJlZk1hcFNldC5hZGQoc3ViU2NoZW1hUG9pbnRlciArICd+ficgKyByZWZQb2ludGVyKTtcbiAgICAgIHJlZk1hcC5zZXQoc3ViU2NoZW1hUG9pbnRlciwgcmVmUG9pbnRlcik7XG4gICAgfVxuICB9KTtcbiAgcmVmTGlua3MuZm9yRWFjaChyZWYgPT4gcmVmTGlicmFyeVtyZWZdID0gZ2V0U3ViU2NoZW1hKHNjaGVtYSwgcmVmKSk7XG5cbiAgLy8gRm9sbG93IGFsbCByZWYgbGlua3MgYW5kIHNhdmUgaW4gcmVmTWFwU2V0LFxuICAvLyB0byBmaW5kIGFueSBtdWx0aS1saW5rIHJlY3Vyc2l2ZSByZWZlcm5jZXNcbiAgbGV0IGNoZWNrUmVmTGlua3MgPSB0cnVlO1xuICB3aGlsZSAoY2hlY2tSZWZMaW5rcykge1xuICAgIGNoZWNrUmVmTGlua3MgPSBmYWxzZTtcbiAgICBBcnJheS5mcm9tKHJlZk1hcCkuZm9yRWFjaCgoW2Zyb21SZWYxLCB0b1JlZjFdKSA9PiBBcnJheS5mcm9tKHJlZk1hcClcbiAgICAgIC5maWx0ZXIoKFtmcm9tUmVmMiwgdG9SZWYyXSkgPT5cbiAgICAgICAgSnNvblBvaW50ZXIuaXNTdWJQb2ludGVyKHRvUmVmMSwgZnJvbVJlZjIsIHRydWUpICYmXG4gICAgICAgICFKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIodG9SZWYyLCB0b1JlZjEsIHRydWUpICYmXG4gICAgICAgICFyZWZNYXBTZXQuaGFzKGZyb21SZWYxICsgZnJvbVJlZjIuc2xpY2UodG9SZWYxLmxlbmd0aCkgKyAnfn4nICsgdG9SZWYyKVxuICAgICAgKVxuICAgICAgLmZvckVhY2goKFtmcm9tUmVmMiwgdG9SZWYyXSkgPT4ge1xuICAgICAgICByZWZNYXBTZXQuYWRkKGZyb21SZWYxICsgZnJvbVJlZjIuc2xpY2UodG9SZWYxLmxlbmd0aCkgKyAnfn4nICsgdG9SZWYyKTtcbiAgICAgICAgY2hlY2tSZWZMaW5rcyA9IHRydWU7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvLyBCdWlsZCBmdWxsIHJlY3Vyc2l2ZVJlZk1hcFxuICAvLyBGaXJzdCBwYXNzIC0gc2F2ZSBhbGwgaW50ZXJuYWxseSByZWN1cnNpdmUgcmVmcyBmcm9tIHJlZk1hcFNldFxuICBBcnJheS5mcm9tKHJlZk1hcFNldClcbiAgICAubWFwKHJlZkxpbmsgPT4gcmVmTGluay5zcGxpdCgnfn4nKSlcbiAgICAuZmlsdGVyKChbZnJvbVJlZiwgdG9SZWZdKSA9PiBKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIodG9SZWYsIGZyb21SZWYpKVxuICAgIC5mb3JFYWNoKChbZnJvbVJlZiwgdG9SZWZdKSA9PiByZWN1cnNpdmVSZWZNYXAuc2V0KGZyb21SZWYsIHRvUmVmKSk7XG4gIC8vIFNlY29uZCBwYXNzIC0gY3JlYXRlIHJlY3Vyc2l2ZSB2ZXJzaW9ucyBvZiBhbnkgb3RoZXIgcmVmcyB0aGF0IGxpbmsgdG8gcmVjdXJzaXZlIHJlZnNcbiAgQXJyYXkuZnJvbShyZWZNYXApXG4gICAgLmZpbHRlcigoW2Zyb21SZWYxLCB0b1JlZjFdKSA9PiBBcnJheS5mcm9tKHJlY3Vyc2l2ZVJlZk1hcC5rZXlzKCkpXG4gICAgICAuZXZlcnkoZnJvbVJlZjIgPT4gIUpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcihmcm9tUmVmMSwgZnJvbVJlZjIsIHRydWUpKVxuICAgIClcbiAgICAuZm9yRWFjaCgoW2Zyb21SZWYxLCB0b1JlZjFdKSA9PiBBcnJheS5mcm9tKHJlY3Vyc2l2ZVJlZk1hcClcbiAgICAgIC5maWx0ZXIoKFtmcm9tUmVmMiwgdG9SZWYyXSkgPT5cbiAgICAgICAgIXJlY3Vyc2l2ZVJlZk1hcC5oYXMoZnJvbVJlZjEgKyBmcm9tUmVmMi5zbGljZSh0b1JlZjEubGVuZ3RoKSkgJiZcbiAgICAgICAgSnNvblBvaW50ZXIuaXNTdWJQb2ludGVyKHRvUmVmMSwgZnJvbVJlZjIsIHRydWUpICYmXG4gICAgICAgICFKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIodG9SZWYxLCBmcm9tUmVmMSwgdHJ1ZSlcbiAgICAgIClcbiAgICAgIC5mb3JFYWNoKChbZnJvbVJlZjIsIHRvUmVmMl0pID0+IHJlY3Vyc2l2ZVJlZk1hcC5zZXQoXG4gICAgICAgIGZyb21SZWYxICsgZnJvbVJlZjIuc2xpY2UodG9SZWYxLmxlbmd0aCksXG4gICAgICAgIGZyb21SZWYxICsgdG9SZWYyLnNsaWNlKHRvUmVmMS5sZW5ndGgpXG4gICAgICApKVxuICAgICk7XG5cbiAgLy8gQ3JlYXRlIGNvbXBpbGVkIHNjaGVtYSBieSByZXBsYWNpbmcgYWxsIG5vbi1yZWN1cnNpdmUgJHJlZiBsaW5rcyB3aXRoXG4gIC8vIHRoaWVpciBsaW5rZWQgc2NoZW1hcyBhbmQsIHdoZXJlIHBvc3NpYmxlLCBjb21iaW5pbmcgc2NoZW1hcyBpbiBhbGxPZiBhcnJheXMuXG4gIGxldCBjb21waWxlZFNjaGVtYSA9IHsgLi4uc2NoZW1hIH07XG4gIGRlbGV0ZSBjb21waWxlZFNjaGVtYS5kZWZpbml0aW9ucztcbiAgY29tcGlsZWRTY2hlbWEgPVxuICAgIGdldFN1YlNjaGVtYShjb21waWxlZFNjaGVtYSwgJycsIHJlZkxpYnJhcnksIHJlY3Vyc2l2ZVJlZk1hcCk7XG5cbiAgLy8gTWFrZSBzdXJlIGFsbCByZW1haW5pbmcgc2NoZW1hICRyZWZzIGFyZSByZWN1cnNpdmUsIGFuZCBidWlsZCBmaW5hbFxuICAvLyBzY2hlbWFSZWZMaWJyYXJ5LCBzY2hlbWFSZWN1cnNpdmVSZWZNYXAsIGRhdGFSZWN1cnNpdmVSZWZNYXAsICYgYXJyYXlNYXBcbiAgSnNvblBvaW50ZXIuZm9yRWFjaERlZXAoY29tcGlsZWRTY2hlbWEsIChzdWJTY2hlbWEsIHN1YlNjaGVtYVBvaW50ZXIpID0+IHtcbiAgICBpZiAoaXNTdHJpbmcoc3ViU2NoZW1hWyckcmVmJ10pKSB7XG4gICAgICBsZXQgcmVmUG9pbnRlciA9IEpzb25Qb2ludGVyLmNvbXBpbGUoc3ViU2NoZW1hWyckcmVmJ10pO1xuICAgICAgaWYgKCFKc29uUG9pbnRlci5pc1N1YlBvaW50ZXIocmVmUG9pbnRlciwgc3ViU2NoZW1hUG9pbnRlciwgdHJ1ZSkpIHtcbiAgICAgICAgcmVmUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoc3ViU2NoZW1hUG9pbnRlciwgcmVjdXJzaXZlUmVmTWFwKTtcbiAgICAgICAgSnNvblBvaW50ZXIuc2V0KGNvbXBpbGVkU2NoZW1hLCBzdWJTY2hlbWFQb2ludGVyLCB7ICRyZWY6IGAjJHtyZWZQb2ludGVyfWAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIWhhc093bihzY2hlbWFSZWZMaWJyYXJ5LCAncmVmUG9pbnRlcicpKSB7XG4gICAgICAgIHNjaGVtYVJlZkxpYnJhcnlbcmVmUG9pbnRlcl0gPSAhcmVmUG9pbnRlci5sZW5ndGggPyBjb21waWxlZFNjaGVtYSA6XG4gICAgICAgICAgZ2V0U3ViU2NoZW1hKGNvbXBpbGVkU2NoZW1hLCByZWZQb2ludGVyLCBzY2hlbWFSZWZMaWJyYXJ5LCByZWN1cnNpdmVSZWZNYXApO1xuICAgICAgfVxuICAgICAgaWYgKCFzY2hlbWFSZWN1cnNpdmVSZWZNYXAuaGFzKHN1YlNjaGVtYVBvaW50ZXIpKSB7XG4gICAgICAgIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcC5zZXQoc3ViU2NoZW1hUG9pbnRlciwgcmVmUG9pbnRlcik7XG4gICAgICB9XG4gICAgICBjb25zdCBmcm9tRGF0YVJlZiA9IEpzb25Qb2ludGVyLnRvRGF0YVBvaW50ZXIoc3ViU2NoZW1hUG9pbnRlciwgY29tcGlsZWRTY2hlbWEpO1xuICAgICAgaWYgKCFkYXRhUmVjdXJzaXZlUmVmTWFwLmhhcyhmcm9tRGF0YVJlZikpIHtcbiAgICAgICAgY29uc3QgdG9EYXRhUmVmID0gSnNvblBvaW50ZXIudG9EYXRhUG9pbnRlcihyZWZQb2ludGVyLCBjb21waWxlZFNjaGVtYSk7XG4gICAgICAgIGRhdGFSZWN1cnNpdmVSZWZNYXAuc2V0KGZyb21EYXRhUmVmLCB0b0RhdGFSZWYpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3ViU2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiZcbiAgICAgIChoYXNPd24oc3ViU2NoZW1hLCAnaXRlbXMnKSB8fCBoYXNPd24oc3ViU2NoZW1hLCAnYWRkaXRpb25hbEl0ZW1zJykpXG4gICAgKSB7XG4gICAgICBjb25zdCBkYXRhUG9pbnRlciA9IEpzb25Qb2ludGVyLnRvRGF0YVBvaW50ZXIoc3ViU2NoZW1hUG9pbnRlciwgY29tcGlsZWRTY2hlbWEpO1xuICAgICAgaWYgKCFhcnJheU1hcC5oYXMoZGF0YVBvaW50ZXIpKSB7XG4gICAgICAgIGNvbnN0IHR1cGxlSXRlbXMgPSBpc0FycmF5KHN1YlNjaGVtYS5pdGVtcykgPyBzdWJTY2hlbWEuaXRlbXMubGVuZ3RoIDogMDtcbiAgICAgICAgYXJyYXlNYXAuc2V0KGRhdGFQb2ludGVyLCB0dXBsZUl0ZW1zKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHRydWUpO1xuICByZXR1cm4gY29tcGlsZWRTY2hlbWE7XG59XG5cbi8qKlxuICogJ2dldFN1YlNjaGVtYScgZnVuY3Rpb25cbiAqXG4gKiAvLyAgIHNjaGVtYVxuICogLy8gIHsgUG9pbnRlciB9IHBvaW50ZXJcbiAqIC8vICB7IG9iamVjdCB9IHNjaGVtYVJlZkxpYnJhcnlcbiAqIC8vICB7IE1hcDxzdHJpbmcsIHN0cmluZz4gfSBzY2hlbWFSZWN1cnNpdmVSZWZNYXBcbiAqIC8vICB7IHN0cmluZ1tdID0gW10gfSB1c2VkUG9pbnRlcnNcbiAqIC8vXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdWJTY2hlbWEoXG4gIHNjaGVtYSwgcG9pbnRlciwgc2NoZW1hUmVmTGlicmFyeSA9IG51bGwsXG4gIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcDogTWFwPHN0cmluZywgc3RyaW5nPiA9IG51bGwsIHVzZWRQb2ludGVyczogc3RyaW5nW10gPSBbXVxuKSB7XG4gIGlmICghc2NoZW1hUmVmTGlicmFyeSB8fCAhc2NoZW1hUmVjdXJzaXZlUmVmTWFwKSB7XG4gICAgcmV0dXJuIEpzb25Qb2ludGVyLmdldENvcHkoc2NoZW1hLCBwb2ludGVyKTtcbiAgfVxuICBpZiAodHlwZW9mIHBvaW50ZXIgIT09ICdzdHJpbmcnKSB7IHBvaW50ZXIgPSBKc29uUG9pbnRlci5jb21waWxlKHBvaW50ZXIpOyB9XG4gIHVzZWRQb2ludGVycyA9IFsgLi4udXNlZFBvaW50ZXJzLCBwb2ludGVyIF07XG4gIGxldCBuZXdTY2hlbWE6IGFueSA9IG51bGw7XG4gIGlmIChwb2ludGVyID09PSAnJykge1xuICAgIG5ld1NjaGVtYSA9IGNsb25lRGVlcChzY2hlbWEpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHNob3J0UG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMocG9pbnRlciwgc2NoZW1hUmVjdXJzaXZlUmVmTWFwKTtcbiAgICBpZiAoc2hvcnRQb2ludGVyICE9PSBwb2ludGVyKSB7IHVzZWRQb2ludGVycyA9IFsgLi4udXNlZFBvaW50ZXJzLCBzaG9ydFBvaW50ZXIgXTsgfVxuICAgIG5ld1NjaGVtYSA9IEpzb25Qb2ludGVyLmdldEZpcnN0Q29weShbXG4gICAgICBbc2NoZW1hUmVmTGlicmFyeSwgW3Nob3J0UG9pbnRlcl1dLFxuICAgICAgW3NjaGVtYSwgcG9pbnRlcl0sXG4gICAgICBbc2NoZW1hLCBzaG9ydFBvaW50ZXJdXG4gICAgXSk7XG4gIH1cbiAgcmV0dXJuIEpzb25Qb2ludGVyLmZvckVhY2hEZWVwQ29weShuZXdTY2hlbWEsIChzdWJTY2hlbWEsIHN1YlBvaW50ZXIpID0+IHtcbiAgICBpZiAoaXNPYmplY3Qoc3ViU2NoZW1hKSkge1xuXG4gICAgICAvLyBSZXBsYWNlIG5vbi1yZWN1cnNpdmUgJHJlZiBsaW5rcyB3aXRoIHJlZmVyZW5jZWQgc2NoZW1hc1xuICAgICAgaWYgKGlzU3RyaW5nKHN1YlNjaGVtYS4kcmVmKSkge1xuICAgICAgICBjb25zdCByZWZQb2ludGVyID0gSnNvblBvaW50ZXIuY29tcGlsZShzdWJTY2hlbWEuJHJlZik7XG4gICAgICAgIGlmIChyZWZQb2ludGVyLmxlbmd0aCAmJiB1c2VkUG9pbnRlcnMuZXZlcnkocHRyID0+XG4gICAgICAgICAgIUpzb25Qb2ludGVyLmlzU3ViUG9pbnRlcihyZWZQb2ludGVyLCBwdHIsIHRydWUpXG4gICAgICAgICkpIHtcbiAgICAgICAgICBjb25zdCByZWZTY2hlbWEgPSBnZXRTdWJTY2hlbWEoXG4gICAgICAgICAgICBzY2hlbWEsIHJlZlBvaW50ZXIsIHNjaGVtYVJlZkxpYnJhcnksIHNjaGVtYVJlY3Vyc2l2ZVJlZk1hcCwgdXNlZFBvaW50ZXJzXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoT2JqZWN0LmtleXMoc3ViU2NoZW1hKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiByZWZTY2hlbWE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGV4dHJhS2V5cyA9IHsgLi4uc3ViU2NoZW1hIH07XG4gICAgICAgICAgICBkZWxldGUgZXh0cmFLZXlzLiRyZWY7XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VTY2hlbWFzKHJlZlNjaGVtYSwgZXh0cmFLZXlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogQ29udmVydCBzY2hlbWFzIHdpdGggJ3R5cGUnIGFycmF5cyB0byAnb25lT2YnXG5cbiAgICAgIC8vIENvbWJpbmUgYWxsT2Ygc3ViU2NoZW1hc1xuICAgICAgaWYgKGlzQXJyYXkoc3ViU2NoZW1hLmFsbE9mKSkgeyByZXR1cm4gY29tYmluZUFsbE9mKHN1YlNjaGVtYSk7IH1cblxuICAgICAgLy8gRml4IGluY29ycmVjdGx5IHBsYWNlZCBhcnJheSBvYmplY3QgcmVxdWlyZWQgbGlzdHNcbiAgICAgIGlmIChzdWJTY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBpc0FycmF5KHN1YlNjaGVtYS5yZXF1aXJlZCkpIHtcbiAgICAgICAgcmV0dXJuIGZpeFJlcXVpcmVkQXJyYXlQcm9wZXJ0aWVzKHN1YlNjaGVtYSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdWJTY2hlbWE7XG4gIH0sIHRydWUsIDxzdHJpbmc+cG9pbnRlcik7XG59XG5cbi8qKlxuICogJ2NvbWJpbmVBbGxPZicgZnVuY3Rpb25cbiAqXG4gKiBBdHRlbXB0IHRvIGNvbnZlcnQgYW4gYWxsT2Ygc2NoZW1hIG9iamVjdCBpbnRvXG4gKiBhIG5vbi1hbGxPZiBzY2hlbWEgb2JqZWN0IHdpdGggZXF1aXZhbGVudCBydWxlcy5cbiAqXG4gKiAvLyAgIHNjaGVtYSAtIGFsbE9mIHNjaGVtYSBvYmplY3RcbiAqIC8vICAtIGNvbnZlcnRlZCBzY2hlbWEgb2JqZWN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lQWxsT2Yoc2NoZW1hKSB7XG4gIGlmICghaXNPYmplY3Qoc2NoZW1hKSB8fCAhaXNBcnJheShzY2hlbWEuYWxsT2YpKSB7IHJldHVybiBzY2hlbWE7IH1cbiAgbGV0IG1lcmdlZFNjaGVtYSA9IG1lcmdlU2NoZW1hcyguLi5zY2hlbWEuYWxsT2YpO1xuICBpZiAoT2JqZWN0LmtleXMoc2NoZW1hKS5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgZXh0cmFLZXlzID0geyAuLi5zY2hlbWEgfTtcbiAgICBkZWxldGUgZXh0cmFLZXlzLmFsbE9mO1xuICAgIG1lcmdlZFNjaGVtYSA9IG1lcmdlU2NoZW1hcyhtZXJnZWRTY2hlbWEsIGV4dHJhS2V5cyk7XG4gIH1cbiAgcmV0dXJuIG1lcmdlZFNjaGVtYTtcbn1cblxuLyoqXG4gKiAnZml4UmVxdWlyZWRBcnJheVByb3BlcnRpZXMnIGZ1bmN0aW9uXG4gKlxuICogRml4ZXMgYW4gaW5jb3JyZWN0bHkgcGxhY2VkIHJlcXVpcmVkIGxpc3QgaW5zaWRlIGFuIGFycmF5IHNjaGVtYSwgYnkgbW92aW5nXG4gKiBpdCBpbnRvIGl0ZW1zLnByb3BlcnRpZXMgb3IgYWRkaXRpb25hbEl0ZW1zLnByb3BlcnRpZXMsIHdoZXJlIGl0IGJlbG9uZ3MuXG4gKlxuICogLy8gICBzY2hlbWEgLSBhbGxPZiBzY2hlbWEgb2JqZWN0XG4gKiAvLyAgLSBjb252ZXJ0ZWQgc2NoZW1hIG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gZml4UmVxdWlyZWRBcnJheVByb3BlcnRpZXMoc2NoZW1hKSB7XG4gIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBpc0FycmF5KHNjaGVtYS5yZXF1aXJlZCkpIHtcbiAgICBjb25zdCBpdGVtc09iamVjdCA9IGhhc093bihzY2hlbWEuaXRlbXMsICdwcm9wZXJ0aWVzJykgPyAnaXRlbXMnIDpcbiAgICAgIGhhc093bihzY2hlbWEuYWRkaXRpb25hbEl0ZW1zLCAncHJvcGVydGllcycpID8gJ2FkZGl0aW9uYWxJdGVtcycgOiBudWxsO1xuICAgIGlmIChpdGVtc09iamVjdCAmJiAhaGFzT3duKHNjaGVtYVtpdGVtc09iamVjdF0sICdyZXF1aXJlZCcpICYmIChcbiAgICAgIGhhc093bihzY2hlbWFbaXRlbXNPYmplY3RdLCAnYWRkaXRpb25hbFByb3BlcnRpZXMnKSB8fFxuICAgICAgc2NoZW1hLnJlcXVpcmVkLmV2ZXJ5KGtleSA9PiBoYXNPd24oc2NoZW1hW2l0ZW1zT2JqZWN0XS5wcm9wZXJ0aWVzLCBrZXkpKVxuICAgICkpIHtcbiAgICAgIHNjaGVtYSA9IGNsb25lRGVlcChzY2hlbWEpO1xuICAgICAgc2NoZW1hW2l0ZW1zT2JqZWN0XS5yZXF1aXJlZCA9IHNjaGVtYS5yZXF1aXJlZDtcbiAgICAgIGRlbGV0ZSBzY2hlbWEucmVxdWlyZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBzY2hlbWE7XG59XG4iXX0=
