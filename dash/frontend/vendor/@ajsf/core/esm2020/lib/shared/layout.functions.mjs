import uniqueId from 'lodash/uniqueId';
import cloneDeep from 'lodash/cloneDeep';
import { checkInlineType, getFromSchema, getInputType, isInputRequired, removeRecursiveReferences, updateInputOptions } from './json-schema.functions.mjs';
import { copy, fixTitle, forEach, hasOwn } from './utility.functions.mjs';
import { inArray, isArray, isDefined, isEmpty, isNumber, isObject, isString } from './validator.functions.mjs';
import { JsonPointer } from './jsonpointer.functions.mjs';
/**
 * Layout function library:
 *
 * buildLayout:            Builds a complete layout from an input layout and schema
 *
 * buildLayoutFromSchema:  Builds a complete layout entirely from an input schema
 *
 * mapLayout:
 *
 * getLayoutNode:
 *
 * buildTitleMap:
 */
/**
 * 'buildLayout' function
 *
 * //   jsf
 * //   widgetLibrary
 * //
 */
export function buildLayout(jsf, widgetLibrary) {
    let hasSubmitButton = !JsonPointer.get(jsf, '/formOptions/addSubmit');
    const formLayout = mapLayout(jsf.layout, (layoutItem, index, layoutPointer) => {
        const newNode = {
            _id: uniqueId(),
            options: {},
        };
        if (isObject(layoutItem)) {
            Object.assign(newNode, layoutItem);
            Object.keys(newNode)
                .filter(option => !inArray(option, [
                '_id', '$ref', 'arrayItem', 'arrayItemType', 'dataPointer', 'dataType',
                'items', 'key', 'name', 'options', 'recursiveReference', 'type', 'widget'
            ]))
                .forEach(option => {
                newNode.options[option] = newNode[option];
                delete newNode[option];
            });
            if (!hasOwn(newNode, 'type') && isString(newNode.widget)) {
                newNode.type = newNode.widget;
                delete newNode.widget;
            }
            if (!hasOwn(newNode.options, 'title')) {
                if (hasOwn(newNode.options, 'legend')) {
                    newNode.options.title = newNode.options.legend;
                    delete newNode.options.legend;
                }
            }
            if (!hasOwn(newNode.options, 'validationMessages')) {
                if (hasOwn(newNode.options, 'errorMessages')) {
                    newNode.options.validationMessages = newNode.options.errorMessages;
                    delete newNode.options.errorMessages;
                    // Convert Angular Schema Form (AngularJS) 'validationMessage' to
                    // Angular JSON Schema Form 'validationMessages'
                    // TV4 codes from https://github.com/geraintluff/tv4/blob/master/source/api.js
                }
                else if (hasOwn(newNode.options, 'validationMessage')) {
                    if (typeof newNode.options.validationMessage === 'string') {
                        newNode.options.validationMessages = newNode.options.validationMessage;
                    }
                    else {
                        newNode.options.validationMessages = {};
                        Object.keys(newNode.options.validationMessage).forEach(key => {
                            const code = key + '';
                            const newKey = code === '0' ? 'type' :
                                code === '1' ? 'enum' :
                                    code === '100' ? 'multipleOf' :
                                        code === '101' ? 'minimum' :
                                            code === '102' ? 'exclusiveMinimum' :
                                                code === '103' ? 'maximum' :
                                                    code === '104' ? 'exclusiveMaximum' :
                                                        code === '200' ? 'minLength' :
                                                            code === '201' ? 'maxLength' :
                                                                code === '202' ? 'pattern' :
                                                                    code === '300' ? 'minProperties' :
                                                                        code === '301' ? 'maxProperties' :
                                                                            code === '302' ? 'required' :
                                                                                code === '304' ? 'dependencies' :
                                                                                    code === '400' ? 'minItems' :
                                                                                        code === '401' ? 'maxItems' :
                                                                                            code === '402' ? 'uniqueItems' :
                                                                                                code === '500' ? 'format' : code + '';
                            newNode.options.validationMessages[newKey] = newNode.options.validationMessage[key];
                        });
                    }
                    delete newNode.options.validationMessage;
                }
            }
        }
        else if (JsonPointer.isJsonPointer(layoutItem)) {
            newNode.dataPointer = layoutItem;
        }
        else if (isString(layoutItem)) {
            newNode.key = layoutItem;
        }
        else {
            console.error('buildLayout error: Form layout element not recognized:');
            console.error(layoutItem);
            return null;
        }
        let nodeSchema = null;
        // If newNode does not have a dataPointer, try to find an equivalent
        if (!hasOwn(newNode, 'dataPointer')) {
            // If newNode has a key, change it to a dataPointer
            if (hasOwn(newNode, 'key')) {
                newNode.dataPointer = newNode.key === '*' ? newNode.key :
                    JsonPointer.compile(JsonPointer.parseObjectPath(newNode.key), '-');
                delete newNode.key;
                // If newNode is an array, search for dataPointer in child nodes
            }
            else if (hasOwn(newNode, 'type') && newNode.type.slice(-5) === 'array') {
                const findDataPointer = (items) => {
                    if (items === null || typeof items !== 'object') {
                        return;
                    }
                    if (hasOwn(items, 'dataPointer')) {
                        return items.dataPointer;
                    }
                    if (isArray(items.items)) {
                        for (const item of items.items) {
                            if (hasOwn(item, 'dataPointer') && item.dataPointer.indexOf('/-') !== -1) {
                                return item.dataPointer;
                            }
                            if (hasOwn(item, 'items')) {
                                const searchItem = findDataPointer(item);
                                if (searchItem) {
                                    return searchItem;
                                }
                            }
                        }
                    }
                };
                const childDataPointer = findDataPointer(newNode);
                if (childDataPointer) {
                    newNode.dataPointer =
                        childDataPointer.slice(0, childDataPointer.lastIndexOf('/-'));
                }
            }
        }
        if (hasOwn(newNode, 'dataPointer')) {
            if (newNode.dataPointer === '*') {
                return buildLayoutFromSchema(jsf, widgetLibrary, jsf.formValues);
            }
            const nodeValue = JsonPointer.get(jsf.formValues, newNode.dataPointer.replace(/\/-/g, '/1'));
            // TODO: Create function getFormValues(jsf, dataPointer, forRefLibrary)
            // check formOptions.setSchemaDefaults and formOptions.setLayoutDefaults
            // then set apropriate values from initialVaues, schema, or layout
            newNode.dataPointer =
                JsonPointer.toGenericPointer(newNode.dataPointer, jsf.arrayMap);
            const LastKey = JsonPointer.toKey(newNode.dataPointer);
            if (!newNode.name && isString(LastKey) && LastKey !== '-') {
                newNode.name = LastKey;
            }
            const shortDataPointer = removeRecursiveReferences(newNode.dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
            const recursive = !shortDataPointer.length ||
                shortDataPointer !== newNode.dataPointer;
            let schemaPointer;
            if (!jsf.dataMap.has(shortDataPointer)) {
                jsf.dataMap.set(shortDataPointer, new Map());
            }
            const nodeDataMap = jsf.dataMap.get(shortDataPointer);
            if (nodeDataMap.has('schemaPointer')) {
                schemaPointer = nodeDataMap.get('schemaPointer');
            }
            else {
                schemaPointer = JsonPointer.toSchemaPointer(shortDataPointer, jsf.schema);
                nodeDataMap.set('schemaPointer', schemaPointer);
            }
            nodeDataMap.set('disabled', !!newNode.options.disabled);
            nodeSchema = JsonPointer.get(jsf.schema, schemaPointer);
            if (nodeSchema) {
                if (!hasOwn(newNode, 'type')) {
                    newNode.type = getInputType(nodeSchema, newNode);
                }
                else if (!widgetLibrary.hasWidget(newNode.type)) {
                    const oldWidgetType = newNode.type;
                    newNode.type = getInputType(nodeSchema, newNode);
                    console.error(`error: widget type "${oldWidgetType}" ` +
                        `not found in library. Replacing with "${newNode.type}".`);
                }
                else {
                    newNode.type = checkInlineType(newNode.type, nodeSchema, newNode);
                }
                if (nodeSchema.type === 'object' && isArray(nodeSchema.required)) {
                    nodeDataMap.set('required', nodeSchema.required);
                }
                newNode.dataType =
                    nodeSchema.type || (hasOwn(nodeSchema, '$ref') ? '$ref' : null);
                updateInputOptions(newNode, nodeSchema, jsf);
                // Present checkboxes as single control, rather than array
                if (newNode.type === 'checkboxes' && hasOwn(nodeSchema, 'items')) {
                    updateInputOptions(newNode, nodeSchema.items, jsf);
                }
                else if (newNode.dataType === 'array') {
                    newNode.options.maxItems = Math.min(nodeSchema.maxItems || 1000, newNode.options.maxItems || 1000);
                    newNode.options.minItems = Math.max(nodeSchema.minItems || 0, newNode.options.minItems || 0);
                    newNode.options.listItems = Math.max(newNode.options.listItems || 0, isArray(nodeValue) ? nodeValue.length : 0);
                    newNode.options.tupleItems =
                        isArray(nodeSchema.items) ? nodeSchema.items.length : 0;
                    if (newNode.options.maxItems < newNode.options.tupleItems) {
                        newNode.options.tupleItems = newNode.options.maxItems;
                        newNode.options.listItems = 0;
                    }
                    else if (newNode.options.maxItems <
                        newNode.options.tupleItems + newNode.options.listItems) {
                        newNode.options.listItems =
                            newNode.options.maxItems - newNode.options.tupleItems;
                    }
                    else if (newNode.options.minItems >
                        newNode.options.tupleItems + newNode.options.listItems) {
                        newNode.options.listItems =
                            newNode.options.minItems - newNode.options.tupleItems;
                    }
                    if (!nodeDataMap.has('maxItems')) {
                        nodeDataMap.set('maxItems', newNode.options.maxItems);
                        nodeDataMap.set('minItems', newNode.options.minItems);
                        nodeDataMap.set('tupleItems', newNode.options.tupleItems);
                        nodeDataMap.set('listItems', newNode.options.listItems);
                    }
                    if (!jsf.arrayMap.has(shortDataPointer)) {
                        jsf.arrayMap.set(shortDataPointer, newNode.options.tupleItems);
                    }
                }
                if (isInputRequired(jsf.schema, schemaPointer)) {
                    newNode.options.required = true;
                    jsf.fieldsRequired = true;
                }
            }
            else {
                // TODO: create item in FormGroup model from layout key (?)
                updateInputOptions(newNode, {}, jsf);
            }
            if (!newNode.options.title && !/^\d+$/.test(newNode.name)) {
                newNode.options.title = fixTitle(newNode.name);
            }
            if (hasOwn(newNode.options, 'copyValueTo')) {
                if (typeof newNode.options.copyValueTo === 'string') {
                    newNode.options.copyValueTo = [newNode.options.copyValueTo];
                }
                if (isArray(newNode.options.copyValueTo)) {
                    newNode.options.copyValueTo = newNode.options.copyValueTo.map(item => JsonPointer.compile(JsonPointer.parseObjectPath(item), '-'));
                }
            }
            newNode.widget = widgetLibrary.getWidget(newNode.type);
            nodeDataMap.set('inputType', newNode.type);
            nodeDataMap.set('widget', newNode.widget);
            if (newNode.dataType === 'array' &&
                (hasOwn(newNode, 'items') || hasOwn(newNode, 'additionalItems'))) {
                const itemRefPointer = removeRecursiveReferences(newNode.dataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
                if (!jsf.dataMap.has(itemRefPointer)) {
                    jsf.dataMap.set(itemRefPointer, new Map());
                }
                jsf.dataMap.get(itemRefPointer).set('inputType', 'section');
                // Fix insufficiently nested array item groups
                if (newNode.items.length > 1) {
                    const arrayItemGroup = [];
                    for (let i = newNode.items.length - 1; i >= 0; i--) {
                        const subItem = newNode.items[i];
                        if (hasOwn(subItem, 'dataPointer') &&
                            subItem.dataPointer.slice(0, itemRefPointer.length) === itemRefPointer) {
                            const arrayItem = newNode.items.splice(i, 1)[0];
                            arrayItem.dataPointer = newNode.dataPointer + '/-' +
                                arrayItem.dataPointer.slice(itemRefPointer.length);
                            arrayItemGroup.unshift(arrayItem);
                        }
                        else {
                            subItem.arrayItem = true;
                            // TODO: Check schema to get arrayItemType and removable
                            subItem.arrayItemType = 'list';
                            subItem.removable = newNode.options.removable !== false;
                        }
                    }
                    if (arrayItemGroup.length) {
                        newNode.items.push({
                            _id: uniqueId(),
                            arrayItem: true,
                            arrayItemType: newNode.options.tupleItems > newNode.items.length ?
                                'tuple' : 'list',
                            items: arrayItemGroup,
                            options: { removable: newNode.options.removable !== false, },
                            dataPointer: newNode.dataPointer + '/-',
                            type: 'section',
                            widget: widgetLibrary.getWidget('section'),
                        });
                    }
                }
                else {
                    // TODO: Fix to hndle multiple items
                    newNode.items[0].arrayItem = true;
                    if (!newNode.items[0].dataPointer) {
                        newNode.items[0].dataPointer =
                            JsonPointer.toGenericPointer(itemRefPointer, jsf.arrayMap);
                    }
                    if (!JsonPointer.has(newNode, '/items/0/options/removable')) {
                        newNode.items[0].options.removable = true;
                    }
                    if (newNode.options.orderable === false) {
                        newNode.items[0].options.orderable = false;
                    }
                    newNode.items[0].arrayItemType =
                        newNode.options.tupleItems ? 'tuple' : 'list';
                }
                if (isArray(newNode.items)) {
                    const arrayListItems = newNode.items.filter(item => item.type !== '$ref').length -
                        newNode.options.tupleItems;
                    if (arrayListItems > newNode.options.listItems) {
                        newNode.options.listItems = arrayListItems;
                        nodeDataMap.set('listItems', arrayListItems);
                    }
                }
                if (!hasOwn(jsf.layoutRefLibrary, itemRefPointer)) {
                    jsf.layoutRefLibrary[itemRefPointer] =
                        cloneDeep(newNode.items[newNode.items.length - 1]);
                    if (recursive) {
                        jsf.layoutRefLibrary[itemRefPointer].recursiveReference = true;
                    }
                    forEach(jsf.layoutRefLibrary[itemRefPointer], (item, key) => {
                        if (hasOwn(item, '_id')) {
                            item._id = null;
                        }
                        if (recursive) {
                            if (hasOwn(item, 'dataPointer')) {
                                item.dataPointer = item.dataPointer.slice(itemRefPointer.length);
                            }
                        }
                    }, 'top-down');
                }
                // Add any additional default items
                if (!newNode.recursiveReference || newNode.options.required) {
                    const arrayLength = Math.min(Math.max(newNode.options.tupleItems + newNode.options.listItems, isArray(nodeValue) ? nodeValue.length : 0), newNode.options.maxItems);
                    for (let i = newNode.items.length; i < arrayLength; i++) {
                        newNode.items.push(getLayoutNode({
                            $ref: itemRefPointer,
                            dataPointer: newNode.dataPointer,
                            recursiveReference: newNode.recursiveReference,
                        }, jsf, widgetLibrary));
                    }
                }
                // If needed, add button to add items to array
                if (newNode.options.addable !== false &&
                    newNode.options.minItems < newNode.options.maxItems &&
                    (newNode.items[newNode.items.length - 1] || {}).type !== '$ref') {
                    let buttonText = 'Add';
                    if (newNode.options.title) {
                        if (/^add\b/i.test(newNode.options.title)) {
                            buttonText = newNode.options.title;
                        }
                        else {
                            buttonText += ' ' + newNode.options.title;
                        }
                    }
                    else if (newNode.name && !/^\d+$/.test(newNode.name)) {
                        if (/^add\b/i.test(newNode.name)) {
                            buttonText += ' ' + fixTitle(newNode.name);
                        }
                        else {
                            buttonText = fixTitle(newNode.name);
                        }
                        // If newNode doesn't have a title, look for title of parent array item
                    }
                    else {
                        const parentSchema = getFromSchema(jsf.schema, newNode.dataPointer, 'parentSchema');
                        if (hasOwn(parentSchema, 'title')) {
                            buttonText += ' to ' + parentSchema.title;
                        }
                        else {
                            const pointerArray = JsonPointer.parse(newNode.dataPointer);
                            buttonText += ' to ' + fixTitle(pointerArray[pointerArray.length - 2]);
                        }
                    }
                    newNode.items.push({
                        _id: uniqueId(),
                        arrayItem: true,
                        arrayItemType: 'list',
                        dataPointer: newNode.dataPointer + '/-',
                        options: {
                            listItems: newNode.options.listItems,
                            maxItems: newNode.options.maxItems,
                            minItems: newNode.options.minItems,
                            removable: false,
                            title: buttonText,
                            tupleItems: newNode.options.tupleItems,
                        },
                        recursiveReference: recursive,
                        type: '$ref',
                        widget: widgetLibrary.getWidget('$ref'),
                        $ref: itemRefPointer,
                    });
                    if (isString(JsonPointer.get(newNode, '/style/add'))) {
                        newNode.items[newNode.items.length - 1].options.fieldStyle =
                            newNode.style.add;
                        delete newNode.style.add;
                        if (isEmpty(newNode.style)) {
                            delete newNode.style;
                        }
                    }
                }
            }
            else {
                newNode.arrayItem = false;
            }
        }
        else if (hasOwn(newNode, 'type') || hasOwn(newNode, 'items')) {
            const parentType = JsonPointer.get(jsf.layout, layoutPointer, 0, -2).type;
            if (!hasOwn(newNode, 'type')) {
                newNode.type =
                    inArray(parentType, ['tabs', 'tabarray']) ? 'tab' : 'array';
            }
            newNode.arrayItem = parentType === 'array';
            newNode.widget = widgetLibrary.getWidget(newNode.type);
            updateInputOptions(newNode, {}, jsf);
        }
        if (newNode.type === 'submit') {
            hasSubmitButton = true;
        }
        return newNode;
    });
    if (jsf.hasRootReference) {
        const fullLayout = cloneDeep(formLayout);
        if (fullLayout[fullLayout.length - 1].type === 'submit') {
            fullLayout.pop();
        }
        jsf.layoutRefLibrary[''] = {
            _id: null,
            dataPointer: '',
            dataType: 'object',
            items: fullLayout,
            name: '',
            options: cloneDeep(jsf.formOptions.defautWidgetOptions),
            recursiveReference: true,
            required: false,
            type: 'section',
            widget: widgetLibrary.getWidget('section'),
        };
    }
    if (!hasSubmitButton) {
        formLayout.push({
            _id: uniqueId(),
            options: { title: 'Submit' },
            type: 'submit',
            widget: widgetLibrary.getWidget('submit'),
        });
    }
    return formLayout;
}
/**
 * 'buildLayoutFromSchema' function
 *
 * //   jsf -
 * //   widgetLibrary -
 * //   nodeValue -
 * //  { string = '' } schemaPointer -
 * //  { string = '' } dataPointer -
 * //  { boolean = false } arrayItem -
 * //  { string = null } arrayItemType -
 * //  { boolean = null } removable -
 * //  { boolean = false } forRefLibrary -
 * //  { string = '' } dataPointerPrefix -
 * //
 */
export function buildLayoutFromSchema(jsf, widgetLibrary, nodeValue = null, schemaPointer = '', dataPointer = '', arrayItem = false, arrayItemType = null, removable = null, forRefLibrary = false, dataPointerPrefix = '') {
    const schema = JsonPointer.get(jsf.schema, schemaPointer);
    if (!hasOwn(schema, 'type') && !hasOwn(schema, '$ref') &&
        !hasOwn(schema, 'x-schema-form')) {
        return null;
    }
    const newNodeType = getInputType(schema);
    if (!isDefined(nodeValue) && (jsf.formOptions.setSchemaDefaults === true ||
        (jsf.formOptions.setSchemaDefaults === 'auto' && isEmpty(jsf.formValues)))) {
        nodeValue = JsonPointer.get(jsf.schema, schemaPointer + '/default');
    }
    let newNode = {
        _id: forRefLibrary ? null : uniqueId(),
        arrayItem: arrayItem,
        dataPointer: JsonPointer.toGenericPointer(dataPointer, jsf.arrayMap),
        dataType: schema.type || (hasOwn(schema, '$ref') ? '$ref' : null),
        options: {},
        required: isInputRequired(jsf.schema, schemaPointer),
        type: newNodeType,
        widget: widgetLibrary.getWidget(newNodeType),
    };
    const lastDataKey = JsonPointer.toKey(newNode.dataPointer);
    if (lastDataKey !== '-') {
        newNode.name = lastDataKey;
    }
    if (newNode.arrayItem) {
        newNode.arrayItemType = arrayItemType;
        newNode.options.removable = removable !== false;
    }
    const shortDataPointer = removeRecursiveReferences(dataPointerPrefix + dataPointer, jsf.dataRecursiveRefMap, jsf.arrayMap);
    const recursive = !shortDataPointer.length ||
        shortDataPointer !== dataPointerPrefix + dataPointer;
    if (!jsf.dataMap.has(shortDataPointer)) {
        jsf.dataMap.set(shortDataPointer, new Map());
    }
    const nodeDataMap = jsf.dataMap.get(shortDataPointer);
    if (!nodeDataMap.has('inputType')) {
        nodeDataMap.set('schemaPointer', schemaPointer);
        nodeDataMap.set('inputType', newNode.type);
        nodeDataMap.set('widget', newNode.widget);
        nodeDataMap.set('disabled', !!newNode.options.disabled);
    }
    updateInputOptions(newNode, schema, jsf);
    if (!newNode.options.title && newNode.name && !/^\d+$/.test(newNode.name)) {
        newNode.options.title = fixTitle(newNode.name);
    }
    if (newNode.dataType === 'object') {
        if (isArray(schema.required) && !nodeDataMap.has('required')) {
            nodeDataMap.set('required', schema.required);
        }
        if (isObject(schema.properties)) {
            const newSection = [];
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
                .forEach(key => {
                const keySchemaPointer = hasOwn(schema.properties, key) ?
                    '/properties/' + key : '/additionalProperties';
                const innerItem = buildLayoutFromSchema(jsf, widgetLibrary, isObject(nodeValue) ? nodeValue[key] : null, schemaPointer + keySchemaPointer, dataPointer + '/' + key, false, null, null, forRefLibrary, dataPointerPrefix);
                if (innerItem) {
                    if (isInputRequired(schema, '/' + key)) {
                        innerItem.options.required = true;
                        jsf.fieldsRequired = true;
                    }
                    newSection.push(innerItem);
                }
            });
            if (dataPointer === '' && !forRefLibrary) {
                newNode = newSection;
            }
            else {
                newNode.items = newSection;
            }
        }
        // TODO: Add patternProperties and additionalProperties inputs?
        // ... possibly provide a way to enter both key names and values?
        // if (isObject(schema.patternProperties)) { }
        // if (isObject(schema.additionalProperties)) { }
    }
    else if (newNode.dataType === 'array') {
        newNode.items = [];
        newNode.options.maxItems = Math.min(schema.maxItems || 1000, newNode.options.maxItems || 1000);
        newNode.options.minItems = Math.max(schema.minItems || 0, newNode.options.minItems || 0);
        if (!newNode.options.minItems && isInputRequired(jsf.schema, schemaPointer)) {
            newNode.options.minItems = 1;
        }
        if (!hasOwn(newNode.options, 'listItems')) {
            newNode.options.listItems = 1;
        }
        newNode.options.tupleItems = isArray(schema.items) ? schema.items.length : 0;
        if (newNode.options.maxItems <= newNode.options.tupleItems) {
            newNode.options.tupleItems = newNode.options.maxItems;
            newNode.options.listItems = 0;
        }
        else if (newNode.options.maxItems <
            newNode.options.tupleItems + newNode.options.listItems) {
            newNode.options.listItems = newNode.options.maxItems - newNode.options.tupleItems;
        }
        else if (newNode.options.minItems >
            newNode.options.tupleItems + newNode.options.listItems) {
            newNode.options.listItems = newNode.options.minItems - newNode.options.tupleItems;
        }
        if (!nodeDataMap.has('maxItems')) {
            nodeDataMap.set('maxItems', newNode.options.maxItems);
            nodeDataMap.set('minItems', newNode.options.minItems);
            nodeDataMap.set('tupleItems', newNode.options.tupleItems);
            nodeDataMap.set('listItems', newNode.options.listItems);
        }
        if (!jsf.arrayMap.has(shortDataPointer)) {
            jsf.arrayMap.set(shortDataPointer, newNode.options.tupleItems);
        }
        removable = newNode.options.removable !== false;
        let additionalItemsSchemaPointer = null;
        // If 'items' is an array = tuple items
        if (isArray(schema.items)) {
            newNode.items = [];
            for (let i = 0; i < newNode.options.tupleItems; i++) {
                let newItem;
                const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/' + i, jsf.dataRecursiveRefMap, jsf.arrayMap);
                const itemRecursive = !itemRefPointer.length ||
                    itemRefPointer !== shortDataPointer + '/' + i;
                // If removable, add tuple item layout to layoutRefLibrary
                if (removable && i >= newNode.options.minItems) {
                    if (!hasOwn(jsf.layoutRefLibrary, itemRefPointer)) {
                        // Set to null first to prevent recursive reference from causing endless loop
                        jsf.layoutRefLibrary[itemRefPointer] = null;
                        jsf.layoutRefLibrary[itemRefPointer] = buildLayoutFromSchema(jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null, schemaPointer + '/items/' + i, itemRecursive ? '' : dataPointer + '/' + i, true, 'tuple', true, true, itemRecursive ? dataPointer + '/' + i : '');
                        if (itemRecursive) {
                            jsf.layoutRefLibrary[itemRefPointer].recursiveReference = true;
                        }
                    }
                    newItem = getLayoutNode({
                        $ref: itemRefPointer,
                        dataPointer: dataPointer + '/' + i,
                        recursiveReference: itemRecursive,
                    }, jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null);
                }
                else {
                    newItem = buildLayoutFromSchema(jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null, schemaPointer + '/items/' + i, dataPointer + '/' + i, true, 'tuple', false, forRefLibrary, dataPointerPrefix);
                }
                if (newItem) {
                    newNode.items.push(newItem);
                }
            }
            // If 'additionalItems' is an object = additional list items, after tuple items
            if (isObject(schema.additionalItems)) {
                additionalItemsSchemaPointer = schemaPointer + '/additionalItems';
            }
            // If 'items' is an object = list items only (no tuple items)
        }
        else if (isObject(schema.items)) {
            additionalItemsSchemaPointer = schemaPointer + '/items';
        }
        if (additionalItemsSchemaPointer) {
            const itemRefPointer = removeRecursiveReferences(shortDataPointer + '/-', jsf.dataRecursiveRefMap, jsf.arrayMap);
            const itemRecursive = !itemRefPointer.length ||
                itemRefPointer !== shortDataPointer + '/-';
            const itemSchemaPointer = removeRecursiveReferences(additionalItemsSchemaPointer, jsf.schemaRecursiveRefMap, jsf.arrayMap);
            // Add list item layout to layoutRefLibrary
            if (itemRefPointer.length && !hasOwn(jsf.layoutRefLibrary, itemRefPointer)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.layoutRefLibrary[itemRefPointer] = null;
                jsf.layoutRefLibrary[itemRefPointer] = buildLayoutFromSchema(jsf, widgetLibrary, null, itemSchemaPointer, itemRecursive ? '' : dataPointer + '/-', true, 'list', removable, true, itemRecursive ? dataPointer + '/-' : '');
                if (itemRecursive) {
                    jsf.layoutRefLibrary[itemRefPointer].recursiveReference = true;
                }
            }
            // Add any additional default items
            if (!itemRecursive || newNode.options.required) {
                const arrayLength = Math.min(Math.max(itemRecursive ? 0 :
                    newNode.options.tupleItems + newNode.options.listItems, isArray(nodeValue) ? nodeValue.length : 0), newNode.options.maxItems);
                if (newNode.items.length < arrayLength) {
                    for (let i = newNode.items.length; i < arrayLength; i++) {
                        newNode.items.push(getLayoutNode({
                            $ref: itemRefPointer,
                            dataPointer: dataPointer + '/-',
                            recursiveReference: itemRecursive,
                        }, jsf, widgetLibrary, isArray(nodeValue) ? nodeValue[i] : null));
                    }
                }
            }
            // If needed, add button to add items to array
            if (newNode.options.addable !== false &&
                newNode.options.minItems < newNode.options.maxItems &&
                (newNode.items[newNode.items.length - 1] || {}).type !== '$ref') {
                let buttonText = ((jsf.layoutRefLibrary[itemRefPointer] || {}).options || {}).title;
                const prefix = buttonText ? 'Add ' : 'Add to ';
                if (!buttonText) {
                    buttonText = schema.title || fixTitle(JsonPointer.toKey(dataPointer));
                }
                if (!/^add\b/i.test(buttonText)) {
                    buttonText = prefix + buttonText;
                }
                newNode.items.push({
                    _id: uniqueId(),
                    arrayItem: true,
                    arrayItemType: 'list',
                    dataPointer: newNode.dataPointer + '/-',
                    options: {
                        listItems: newNode.options.listItems,
                        maxItems: newNode.options.maxItems,
                        minItems: newNode.options.minItems,
                        removable: false,
                        title: buttonText,
                        tupleItems: newNode.options.tupleItems,
                    },
                    recursiveReference: itemRecursive,
                    type: '$ref',
                    widget: widgetLibrary.getWidget('$ref'),
                    $ref: itemRefPointer,
                });
            }
        }
    }
    else if (newNode.dataType === '$ref') {
        const schemaRef = JsonPointer.compile(schema.$ref);
        const dataRef = JsonPointer.toDataPointer(schemaRef, jsf.schema);
        let buttonText = '';
        // Get newNode title
        if (newNode.options.add) {
            buttonText = newNode.options.add;
        }
        else if (newNode.name && !/^\d+$/.test(newNode.name)) {
            buttonText =
                (/^add\b/i.test(newNode.name) ? '' : 'Add ') + fixTitle(newNode.name);
            // If newNode doesn't have a title, look for title of parent array item
        }
        else {
            const parentSchema = JsonPointer.get(jsf.schema, schemaPointer, 0, -1);
            if (hasOwn(parentSchema, 'title')) {
                buttonText = 'Add to ' + parentSchema.title;
            }
            else {
                const pointerArray = JsonPointer.parse(newNode.dataPointer);
                buttonText = 'Add to ' + fixTitle(pointerArray[pointerArray.length - 2]);
            }
        }
        Object.assign(newNode, {
            recursiveReference: true,
            widget: widgetLibrary.getWidget('$ref'),
            $ref: dataRef,
        });
        Object.assign(newNode.options, {
            removable: false,
            title: buttonText,
        });
        if (isNumber(JsonPointer.get(jsf.schema, schemaPointer, 0, -1).maxItems)) {
            newNode.options.maxItems =
                JsonPointer.get(jsf.schema, schemaPointer, 0, -1).maxItems;
        }
        // Add layout template to layoutRefLibrary
        if (dataRef.length) {
            if (!hasOwn(jsf.layoutRefLibrary, dataRef)) {
                // Set to null first to prevent recursive reference from causing endless loop
                jsf.layoutRefLibrary[dataRef] = null;
                const newLayout = buildLayoutFromSchema(jsf, widgetLibrary, null, schemaRef, '', newNode.arrayItem, newNode.arrayItemType, true, true, dataPointer);
                if (newLayout) {
                    newLayout.recursiveReference = true;
                    jsf.layoutRefLibrary[dataRef] = newLayout;
                }
                else {
                    delete jsf.layoutRefLibrary[dataRef];
                }
            }
            else if (!jsf.layoutRefLibrary[dataRef].recursiveReference) {
                jsf.layoutRefLibrary[dataRef].recursiveReference = true;
            }
        }
    }
    return newNode;
}
/**
 * 'mapLayout' function
 *
 * Creates a new layout by running each element in an existing layout through
 * an iteratee. Recursively maps within array elements 'items' and 'tabs'.
 * The iteratee is invoked with four arguments: (value, index, layout, path)
 *
 * The returned layout may be longer (or shorter) then the source layout.
 *
 * If an item from the source layout returns multiple items (as '*' usually will),
 * this function will keep all returned items in-line with the surrounding items.
 *
 * If an item from the source layout causes an error and returns null, it is
 * skipped without error, and the function will still return all non-null items.
 *
 * //   layout - the layout to map
 * //  { (v: any, i?: number, l?: any, p?: string) => any }
 *   function - the funciton to invoke on each element
 * //  { string|string[] = '' } layoutPointer - the layoutPointer to layout, inside rootLayout
 * //  { any[] = layout } rootLayout - the root layout, which conatins layout
 * //
 */
export function mapLayout(layout, fn, layoutPointer = '', rootLayout = layout) {
    let indexPad = 0;
    let newLayout = [];
    forEach(layout, (item, index) => {
        const realIndex = +index + indexPad;
        const newLayoutPointer = layoutPointer + '/' + realIndex;
        let newNode = copy(item);
        let itemsArray = [];
        if (isObject(item)) {
            if (hasOwn(item, 'tabs')) {
                item.items = item.tabs;
                delete item.tabs;
            }
            if (hasOwn(item, 'items')) {
                itemsArray = isArray(item.items) ? item.items : [item.items];
            }
        }
        if (itemsArray.length) {
            newNode.items = mapLayout(itemsArray, fn, newLayoutPointer + '/items', rootLayout);
        }
        newNode = fn(newNode, realIndex, newLayoutPointer, rootLayout);
        if (!isDefined(newNode)) {
            indexPad--;
        }
        else {
            if (isArray(newNode)) {
                indexPad += newNode.length - 1;
            }
            newLayout = newLayout.concat(newNode);
        }
    });
    return newLayout;
}
/**
 * 'getLayoutNode' function
 * Copy a new layoutNode from layoutRefLibrary
 *
 * //   refNode -
 * //   layoutRefLibrary -
 * //  { any = null } widgetLibrary -
 * //  { any = null } nodeValue -
 * //  copied layoutNode
 */
export function getLayoutNode(refNode, jsf, widgetLibrary = null, nodeValue = null) {
    // If recursive reference and building initial layout, return Add button
    if (refNode.recursiveReference && widgetLibrary) {
        const newLayoutNode = cloneDeep(refNode);
        if (!newLayoutNode.options) {
            newLayoutNode.options = {};
        }
        Object.assign(newLayoutNode, {
            recursiveReference: true,
            widget: widgetLibrary.getWidget('$ref'),
        });
        Object.assign(newLayoutNode.options, {
            removable: false,
            title: 'Add ' + newLayoutNode.$ref,
        });
        return newLayoutNode;
        // Otherwise, return referenced layout
    }
    else {
        let newLayoutNode = jsf.layoutRefLibrary[refNode.$ref];
        // If value defined, build new node from schema (to set array lengths)
        if (isDefined(nodeValue)) {
            newLayoutNode = buildLayoutFromSchema(jsf, widgetLibrary, nodeValue, JsonPointer.toSchemaPointer(refNode.$ref, jsf.schema), refNode.$ref, newLayoutNode.arrayItem, newLayoutNode.arrayItemType, newLayoutNode.options.removable, false);
        }
        else {
            // If value not defined, copy node from layoutRefLibrary
            newLayoutNode = cloneDeep(newLayoutNode);
            JsonPointer.forEachDeep(newLayoutNode, (subNode, pointer) => {
                // Reset all _id's in newLayoutNode to unique values
                if (hasOwn(subNode, '_id')) {
                    subNode._id = uniqueId();
                }
                // If adding a recursive item, prefix current dataPointer
                // to all dataPointers in new layoutNode
                if (refNode.recursiveReference && hasOwn(subNode, 'dataPointer')) {
                    subNode.dataPointer = refNode.dataPointer + subNode.dataPointer;
                }
            });
        }
        return newLayoutNode;
    }
}
/**
 * 'buildTitleMap' function
 *
 * //   titleMap -
 * //   enumList -
 * //  { boolean = true } fieldRequired -
 * //  { boolean = true } flatList -
 * // { TitleMapItem[] }
 */
export function buildTitleMap(titleMap, enumList, fieldRequired = true, flatList = true) {
    let newTitleMap = [];
    let hasEmptyValue = false;
    if (titleMap) {
        if (isArray(titleMap)) {
            if (enumList) {
                for (const i of Object.keys(titleMap)) {
                    if (isObject(titleMap[i])) { // JSON Form style
                        const value = titleMap[i].value;
                        if (enumList.includes(value)) {
                            const name = titleMap[i].name;
                            newTitleMap.push({ name, value });
                            if (value === undefined || value === null) {
                                hasEmptyValue = true;
                            }
                        }
                    }
                    else if (isString(titleMap[i])) { // React Jsonschema Form style
                        if (i < enumList.length) {
                            const name = titleMap[i];
                            const value = enumList[i];
                            newTitleMap.push({ name, value });
                            if (value === undefined || value === null) {
                                hasEmptyValue = true;
                            }
                        }
                    }
                }
            }
            else { // If array titleMap and no enum list, just return the titleMap - Angular Schema Form style
                newTitleMap = titleMap;
                if (!fieldRequired) {
                    hasEmptyValue = !!newTitleMap
                        .filter(i => i.value === undefined || i.value === null)
                        .length;
                }
            }
        }
        else if (enumList) { // Alternate JSON Form style, with enum list
            for (const i of Object.keys(enumList)) {
                const value = enumList[i];
                if (hasOwn(titleMap, value)) {
                    const name = titleMap[value];
                    newTitleMap.push({ name, value });
                    if (value === undefined || value === null) {
                        hasEmptyValue = true;
                    }
                }
            }
        }
        else { // Alternate JSON Form style, without enum list
            for (const value of Object.keys(titleMap)) {
                const name = titleMap[value];
                newTitleMap.push({ name, value });
                if (value === undefined || value === null) {
                    hasEmptyValue = true;
                }
            }
        }
    }
    else if (enumList) { // Build map from enum list alone
        for (const i of Object.keys(enumList)) {
            const name = enumList[i];
            const value = enumList[i];
            newTitleMap.push({ name, value });
            if (value === undefined || value === null) {
                hasEmptyValue = true;
            }
        }
    }
    else { // If no titleMap and no enum list, return default map of boolean values
        newTitleMap = [{ name: 'True', value: true }, { name: 'False', value: false }];
    }
    // Does titleMap have groups?
    if (newTitleMap.some(title => hasOwn(title, 'group'))) {
        hasEmptyValue = false;
        // If flatList = true, flatten items & update name to group: name
        if (flatList) {
            newTitleMap = newTitleMap.reduce((groupTitleMap, title) => {
                if (hasOwn(title, 'group')) {
                    if (isArray(title.items)) {
                        groupTitleMap = [
                            ...groupTitleMap,
                            ...title.items.map(item => ({ ...item, ...{ name: `${title.group}: ${item.name}` } }))
                        ];
                        if (title.items.some(item => item.value === undefined || item.value === null)) {
                            hasEmptyValue = true;
                        }
                    }
                    if (hasOwn(title, 'name') && hasOwn(title, 'value')) {
                        title.name = `${title.group}: ${title.name}`;
                        delete title.group;
                        groupTitleMap.push(title);
                        if (title.value === undefined || title.value === null) {
                            hasEmptyValue = true;
                        }
                    }
                }
                else {
                    groupTitleMap.push(title);
                    if (title.value === undefined || title.value === null) {
                        hasEmptyValue = true;
                    }
                }
                return groupTitleMap;
            }, []);
            // If flatList = false, combine items from matching groups
        }
        else {
            newTitleMap = newTitleMap.reduce((groupTitleMap, title) => {
                if (hasOwn(title, 'group')) {
                    if (title.group !== (groupTitleMap[groupTitleMap.length - 1] || {}).group) {
                        groupTitleMap.push({ group: title.group, items: title.items || [] });
                    }
                    if (hasOwn(title, 'name') && hasOwn(title, 'value')) {
                        groupTitleMap[groupTitleMap.length - 1].items
                            .push({ name: title.name, value: title.value });
                        if (title.value === undefined || title.value === null) {
                            hasEmptyValue = true;
                        }
                    }
                }
                else {
                    groupTitleMap.push(title);
                    if (title.value === undefined || title.value === null) {
                        hasEmptyValue = true;
                    }
                }
                return groupTitleMap;
            }, []);
        }
    }
    if (!fieldRequired && !hasEmptyValue) {
        newTitleMap.unshift({ name: '<em>None</em>', value: null });
    }
    return newTitleMap;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvbGliL3NoYXJlZC9sYXlvdXQuZnVuY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sU0FBUyxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE9BQU8sRUFDTCxlQUFlLEVBQ2YsYUFBYSxFQUNiLFlBQVksRUFDWixlQUFlLEVBQ2YseUJBQXlCLEVBQ3pCLGtCQUFrQixFQUNqQixNQUFNLHlCQUF5QixDQUFDO0FBQ25DLE9BQU8sRUFDTCxJQUFJLEVBQ0osUUFBUSxFQUNSLE9BQU8sRUFDUCxNQUFNLEVBQ0wsTUFBTSxxQkFBcUIsQ0FBQztBQUMvQixPQUFPLEVBQ0wsT0FBTyxFQUNQLE9BQU8sRUFDUCxTQUFTLEVBQ1QsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxFQUNQLE1BQU0sdUJBQXVCLENBQUM7QUFDakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBS3REOzs7Ozs7Ozs7Ozs7R0FZRztBQUVIOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxXQUFXLENBQUMsR0FBRyxFQUFFLGFBQWE7SUFDNUMsSUFBSSxlQUFlLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3RFLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsRUFBRTtRQUM1RSxNQUFNLE9BQU8sR0FBUTtZQUNuQixHQUFHLEVBQUUsUUFBUSxFQUFFO1lBQ2YsT0FBTyxFQUFFLEVBQUU7U0FDWixDQUFDO1FBQ0YsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLEVB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QztvQkFDMUIsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTt3QkFDckQsYUFBYSxHQUFHLElBQUksQ0FBQztxQkFDdEI7aUJBQ0Y7Z0JBQ0QsT0FBTyxhQUFhLENBQUM7WUFDdkIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ1I7S0FDRjtJQUNELElBQUksQ0FBQyxhQUFhLElBQUksQ0FBQyxhQUFhLEVBQUU7UUFDcEMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7S0FDN0Q7SUFDRCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHVuaXF1ZUlkIGZyb20gJ2xvZGFzaC91bmlxdWVJZCc7XG5pbXBvcnQgY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC9jbG9uZURlZXAnO1xuaW1wb3J0IHtcbiAgY2hlY2tJbmxpbmVUeXBlLFxuICBnZXRGcm9tU2NoZW1hLFxuICBnZXRJbnB1dFR5cGUsXG4gIGlzSW5wdXRSZXF1aXJlZCxcbiAgcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyxcbiAgdXBkYXRlSW5wdXRPcHRpb25zXG4gIH0gZnJvbSAnLi9qc29uLXNjaGVtYS5mdW5jdGlvbnMnO1xuaW1wb3J0IHtcbiAgY29weSxcbiAgZml4VGl0bGUsXG4gIGZvckVhY2gsXG4gIGhhc093blxuICB9IGZyb20gJy4vdXRpbGl0eS5mdW5jdGlvbnMnO1xuaW1wb3J0IHtcbiAgaW5BcnJheSxcbiAgaXNBcnJheSxcbiAgaXNEZWZpbmVkLFxuICBpc0VtcHR5LFxuICBpc051bWJlcixcbiAgaXNPYmplY3QsXG4gIGlzU3RyaW5nXG4gIH0gZnJvbSAnLi92YWxpZGF0b3IuZnVuY3Rpb25zJztcbmltcG9ydCB7IEpzb25Qb2ludGVyIH0gZnJvbSAnLi9qc29ucG9pbnRlci5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgVGl0bGVNYXBJdGVtIH0gZnJvbSAnLi4vanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlJztcblxuXG5cbi8qKlxuICogTGF5b3V0IGZ1bmN0aW9uIGxpYnJhcnk6XG4gKlxuICogYnVpbGRMYXlvdXQ6ICAgICAgICAgICAgQnVpbGRzIGEgY29tcGxldGUgbGF5b3V0IGZyb20gYW4gaW5wdXQgbGF5b3V0IGFuZCBzY2hlbWFcbiAqXG4gKiBidWlsZExheW91dEZyb21TY2hlbWE6ICBCdWlsZHMgYSBjb21wbGV0ZSBsYXlvdXQgZW50aXJlbHkgZnJvbSBhbiBpbnB1dCBzY2hlbWFcbiAqXG4gKiBtYXBMYXlvdXQ6XG4gKlxuICogZ2V0TGF5b3V0Tm9kZTpcbiAqXG4gKiBidWlsZFRpdGxlTWFwOlxuICovXG5cbi8qKlxuICogJ2J1aWxkTGF5b3V0JyBmdW5jdGlvblxuICpcbiAqIC8vICAganNmXG4gKiAvLyAgIHdpZGdldExpYnJhcnlcbiAqIC8vXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZExheW91dChqc2YsIHdpZGdldExpYnJhcnkpIHtcbiAgbGV0IGhhc1N1Ym1pdEJ1dHRvbiA9ICFKc29uUG9pbnRlci5nZXQoanNmLCAnL2Zvcm1PcHRpb25zL2FkZFN1Ym1pdCcpO1xuICBjb25zdCBmb3JtTGF5b3V0ID0gbWFwTGF5b3V0KGpzZi5sYXlvdXQsIChsYXlvdXRJdGVtLCBpbmRleCwgbGF5b3V0UG9pbnRlcikgPT4ge1xuICAgIGNvbnN0IG5ld05vZGU6IGFueSA9IHtcbiAgICAgIF9pZDogdW5pcXVlSWQoKSxcbiAgICAgIG9wdGlvbnM6IHt9LFxuICAgIH07XG4gICAgaWYgKGlzT2JqZWN0KGxheW91dEl0ZW0pKSB7XG4gICAgICBPYmplY3QuYXNzaWduKG5ld05vZGUsIGxheW91dEl0ZW0pO1xuICAgICAgT2JqZWN0LmtleXMobmV3Tm9kZSlcbiAgICAgICAgLmZpbHRlcihvcHRpb24gPT4gIWluQXJyYXkob3B0aW9uLCBbXG4gICAgICAgICAgJ19pZCcsICckcmVmJywgJ2FycmF5SXRlbScsICdhcnJheUl0ZW1UeXBlJywgJ2RhdGFQb2ludGVyJywgJ2RhdGFUeXBlJyxcbiAgICAgICAgICAnaXRlbXMnLCAna2V5JywgJ25hbWUnLCAnb3B0aW9ucycsICdyZWN1cnNpdmVSZWZlcmVuY2UnLCAndHlwZScsICd3aWRnZXQnXG4gICAgICAgIF0pKVxuICAgICAgICAuZm9yRWFjaChvcHRpb24gPT4ge1xuICAgICAgICAgIG5ld05vZGUub3B0aW9uc1tvcHRpb25dID0gbmV3Tm9kZVtvcHRpb25dO1xuICAgICAgICAgIGRlbGV0ZSBuZXdOb2RlW29wdGlvbl07XG4gICAgICAgIH0pO1xuICAgICAgaWYgKCFoYXNPd24obmV3Tm9kZSwgJ3R5cGUnKSAmJiBpc1N0cmluZyhuZXdOb2RlLndpZGdldCkpIHtcbiAgICAgICAgbmV3Tm9kZS50eXBlID0gbmV3Tm9kZS53aWRnZXQ7XG4gICAgICAgIGRlbGV0ZSBuZXdOb2RlLndpZGdldDtcbiAgICAgIH1cbiAgICAgIGlmICghaGFzT3duKG5ld05vZGUub3B0aW9ucywgJ3RpdGxlJykpIHtcbiAgICAgICAgaWYgKGhhc093bihuZXdOb2RlLm9wdGlvbnMsICdsZWdlbmQnKSkge1xuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy50aXRsZSA9IG5ld05vZGUub3B0aW9ucy5sZWdlbmQ7XG4gICAgICAgICAgZGVsZXRlIG5ld05vZGUub3B0aW9ucy5sZWdlbmQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaGFzT3duKG5ld05vZGUub3B0aW9ucywgJ3ZhbGlkYXRpb25NZXNzYWdlcycpKSB7XG4gICAgICAgIGlmIChoYXNPd24obmV3Tm9kZS5vcHRpb25zLCAnZXJyb3JNZXNzYWdlcycpKSB7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlcyA9IG5ld05vZGUub3B0aW9ucy5lcnJvck1lc3NhZ2VzO1xuICAgICAgICAgIGRlbGV0ZSBuZXdOb2RlLm9wdGlvbnMuZXJyb3JNZXNzYWdlcztcblxuICAgICAgICAgIC8vIENvbnZlcnQgQW5ndWxhciBTY2hlbWEgRm9ybSAoQW5ndWxhckpTKSAndmFsaWRhdGlvbk1lc3NhZ2UnIHRvXG4gICAgICAgICAgLy8gQW5ndWxhciBKU09OIFNjaGVtYSBGb3JtICd2YWxpZGF0aW9uTWVzc2FnZXMnXG4gICAgICAgICAgLy8gVFY0IGNvZGVzIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2dlcmFpbnRsdWZmL3R2NC9ibG9iL21hc3Rlci9zb3VyY2UvYXBpLmpzXG4gICAgICAgIH0gZWxzZSBpZiAoaGFzT3duKG5ld05vZGUub3B0aW9ucywgJ3ZhbGlkYXRpb25NZXNzYWdlJykpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIG5ld05vZGUub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZXMgPSBuZXdOb2RlLm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZXMgPSB7fTtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG5ld05vZGUub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBjb2RlID0ga2V5ICsgJyc7XG4gICAgICAgICAgICAgIGNvbnN0IG5ld0tleSA9XG4gICAgICAgICAgICAgICAgY29kZSA9PT0gJzAnID8gJ3R5cGUnIDpcbiAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICcxJyA/ICdlbnVtJyA6XG4gICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICcxMDAnID8gJ211bHRpcGxlT2YnIDpcbiAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMTAxJyA/ICdtaW5pbXVtJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMTAyJyA/ICdleGNsdXNpdmVNaW5pbXVtJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICcxMDMnID8gJ21heGltdW0nIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMTA0JyA/ICdleGNsdXNpdmVNYXhpbXVtJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMjAwJyA/ICdtaW5MZW5ndGgnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzIwMScgPyAnbWF4TGVuZ3RoJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzIwMicgPyAncGF0dGVybicgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzMwMCcgPyAnbWluUHJvcGVydGllcycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnMzAxJyA/ICdtYXhQcm9wZXJ0aWVzJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZSA9PT0gJzMwMicgPyAncmVxdWlyZWQnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICczMDQnID8gJ2RlcGVuZGVuY2llcycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnNDAwJyA/ICdtaW5JdGVtcycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUgPT09ICc0MDEnID8gJ21heEl0ZW1zJyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnNDAyJyA/ICd1bmlxdWVJdGVtcycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlID09PSAnNTAwJyA/ICdmb3JtYXQnIDogY29kZSArICcnO1xuICAgICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2VzW25ld0tleV0gPSBuZXdOb2RlLm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2Vba2V5XTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWxldGUgbmV3Tm9kZS5vcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChKc29uUG9pbnRlci5pc0pzb25Qb2ludGVyKGxheW91dEl0ZW0pKSB7XG4gICAgICBuZXdOb2RlLmRhdGFQb2ludGVyID0gbGF5b3V0SXRlbTtcbiAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKGxheW91dEl0ZW0pKSB7XG4gICAgICBuZXdOb2RlLmtleSA9IGxheW91dEl0ZW07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2J1aWxkTGF5b3V0IGVycm9yOiBGb3JtIGxheW91dCBlbGVtZW50IG5vdCByZWNvZ25pemVkOicpO1xuICAgICAgY29uc29sZS5lcnJvcihsYXlvdXRJdGVtKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBsZXQgbm9kZVNjaGVtYTogYW55ID0gbnVsbDtcblxuICAgIC8vIElmIG5ld05vZGUgZG9lcyBub3QgaGF2ZSBhIGRhdGFQb2ludGVyLCB0cnkgdG8gZmluZCBhbiBlcXVpdmFsZW50XG4gICAgaWYgKCFoYXNPd24obmV3Tm9kZSwgJ2RhdGFQb2ludGVyJykpIHtcblxuICAgICAgLy8gSWYgbmV3Tm9kZSBoYXMgYSBrZXksIGNoYW5nZSBpdCB0byBhIGRhdGFQb2ludGVyXG4gICAgICBpZiAoaGFzT3duKG5ld05vZGUsICdrZXknKSkge1xuICAgICAgICBuZXdOb2RlLmRhdGFQb2ludGVyID0gbmV3Tm9kZS5rZXkgPT09ICcqJyA/IG5ld05vZGUua2V5IDpcbiAgICAgICAgICBKc29uUG9pbnRlci5jb21waWxlKEpzb25Qb2ludGVyLnBhcnNlT2JqZWN0UGF0aChuZXdOb2RlLmtleSksICctJyk7XG4gICAgICAgIGRlbGV0ZSBuZXdOb2RlLmtleTtcblxuICAgICAgICAvLyBJZiBuZXdOb2RlIGlzIGFuIGFycmF5LCBzZWFyY2ggZm9yIGRhdGFQb2ludGVyIGluIGNoaWxkIG5vZGVzXG4gICAgICB9IGVsc2UgaWYgKGhhc093bihuZXdOb2RlLCAndHlwZScpICYmIG5ld05vZGUudHlwZS5zbGljZSgtNSkgPT09ICdhcnJheScpIHtcbiAgICAgICAgY29uc3QgZmluZERhdGFQb2ludGVyID0gKGl0ZW1zKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW1zID09PSBudWxsIHx8IHR5cGVvZiBpdGVtcyAhPT0gJ29iamVjdCcpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgaWYgKGhhc093bihpdGVtcywgJ2RhdGFQb2ludGVyJykpIHsgcmV0dXJuIGl0ZW1zLmRhdGFQb2ludGVyOyB9XG4gICAgICAgICAgaWYgKGlzQXJyYXkoaXRlbXMuaXRlbXMpKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMuaXRlbXMpIHtcbiAgICAgICAgICAgICAgaWYgKGhhc093bihpdGVtLCAnZGF0YVBvaW50ZXInKSAmJiBpdGVtLmRhdGFQb2ludGVyLmluZGV4T2YoJy8tJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZGF0YVBvaW50ZXI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGhhc093bihpdGVtLCAnaXRlbXMnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaEl0ZW0gPSBmaW5kRGF0YVBvaW50ZXIoaXRlbSk7XG4gICAgICAgICAgICAgICAgaWYgKHNlYXJjaEl0ZW0pIHsgcmV0dXJuIHNlYXJjaEl0ZW07IH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgY2hpbGREYXRhUG9pbnRlciA9IGZpbmREYXRhUG9pbnRlcihuZXdOb2RlKTtcbiAgICAgICAgaWYgKGNoaWxkRGF0YVBvaW50ZXIpIHtcbiAgICAgICAgICBuZXdOb2RlLmRhdGFQb2ludGVyID1cbiAgICAgICAgICAgIGNoaWxkRGF0YVBvaW50ZXIuc2xpY2UoMCwgY2hpbGREYXRhUG9pbnRlci5sYXN0SW5kZXhPZignLy0nKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaGFzT3duKG5ld05vZGUsICdkYXRhUG9pbnRlcicpKSB7XG4gICAgICBpZiAobmV3Tm9kZS5kYXRhUG9pbnRlciA9PT0gJyonKSB7XG4gICAgICAgIHJldHVybiBidWlsZExheW91dEZyb21TY2hlbWEoanNmLCB3aWRnZXRMaWJyYXJ5LCBqc2YuZm9ybVZhbHVlcyk7XG4gICAgICB9XG4gICAgICBjb25zdCBub2RlVmFsdWUgPVxuICAgICAgICBKc29uUG9pbnRlci5nZXQoanNmLmZvcm1WYWx1ZXMsIG5ld05vZGUuZGF0YVBvaW50ZXIucmVwbGFjZSgvXFwvLS9nLCAnLzEnKSk7XG5cbiAgICAgIC8vIFRPRE86IENyZWF0ZSBmdW5jdGlvbiBnZXRGb3JtVmFsdWVzKGpzZiwgZGF0YVBvaW50ZXIsIGZvclJlZkxpYnJhcnkpXG4gICAgICAvLyBjaGVjayBmb3JtT3B0aW9ucy5zZXRTY2hlbWFEZWZhdWx0cyBhbmQgZm9ybU9wdGlvbnMuc2V0TGF5b3V0RGVmYXVsdHNcbiAgICAgIC8vIHRoZW4gc2V0IGFwcm9wcmlhdGUgdmFsdWVzIGZyb20gaW5pdGlhbFZhdWVzLCBzY2hlbWEsIG9yIGxheW91dFxuXG4gICAgICBuZXdOb2RlLmRhdGFQb2ludGVyID1cbiAgICAgICAgSnNvblBvaW50ZXIudG9HZW5lcmljUG9pbnRlcihuZXdOb2RlLmRhdGFQb2ludGVyLCBqc2YuYXJyYXlNYXApO1xuICAgICAgY29uc3QgTGFzdEtleSA9IEpzb25Qb2ludGVyLnRvS2V5KG5ld05vZGUuZGF0YVBvaW50ZXIpO1xuICAgICAgaWYgKCFuZXdOb2RlLm5hbWUgJiYgaXNTdHJpbmcoTGFzdEtleSkgJiYgTGFzdEtleSAhPT0gJy0nKSB7XG4gICAgICAgIG5ld05vZGUubmFtZSA9IExhc3RLZXk7XG4gICAgICB9XG4gICAgICBjb25zdCBzaG9ydERhdGFQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgbmV3Tm9kZS5kYXRhUG9pbnRlciwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgKTtcbiAgICAgIGNvbnN0IHJlY3Vyc2l2ZSA9ICFzaG9ydERhdGFQb2ludGVyLmxlbmd0aCB8fFxuICAgICAgICBzaG9ydERhdGFQb2ludGVyICE9PSBuZXdOb2RlLmRhdGFQb2ludGVyO1xuICAgICAgbGV0IHNjaGVtYVBvaW50ZXI6IHN0cmluZztcbiAgICAgIGlmICghanNmLmRhdGFNYXAuaGFzKHNob3J0RGF0YVBvaW50ZXIpKSB7XG4gICAgICAgIGpzZi5kYXRhTWFwLnNldChzaG9ydERhdGFQb2ludGVyLCBuZXcgTWFwKCkpO1xuICAgICAgfVxuICAgICAgY29uc3Qgbm9kZURhdGFNYXAgPSBqc2YuZGF0YU1hcC5nZXQoc2hvcnREYXRhUG9pbnRlcik7XG4gICAgICBpZiAobm9kZURhdGFNYXAuaGFzKCdzY2hlbWFQb2ludGVyJykpIHtcbiAgICAgICAgc2NoZW1hUG9pbnRlciA9IG5vZGVEYXRhTWFwLmdldCgnc2NoZW1hUG9pbnRlcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NoZW1hUG9pbnRlciA9IEpzb25Qb2ludGVyLnRvU2NoZW1hUG9pbnRlcihzaG9ydERhdGFQb2ludGVyLCBqc2Yuc2NoZW1hKTtcbiAgICAgICAgbm9kZURhdGFNYXAuc2V0KCdzY2hlbWFQb2ludGVyJywgc2NoZW1hUG9pbnRlcik7XG4gICAgICB9XG4gICAgICBub2RlRGF0YU1hcC5zZXQoJ2Rpc2FibGVkJywgISFuZXdOb2RlLm9wdGlvbnMuZGlzYWJsZWQpO1xuICAgICAgbm9kZVNjaGVtYSA9IEpzb25Qb2ludGVyLmdldChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyKTtcbiAgICAgIGlmIChub2RlU2NoZW1hKSB7XG4gICAgICAgIGlmICghaGFzT3duKG5ld05vZGUsICd0eXBlJykpIHtcbiAgICAgICAgICBuZXdOb2RlLnR5cGUgPSBnZXRJbnB1dFR5cGUobm9kZVNjaGVtYSwgbmV3Tm9kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXdpZGdldExpYnJhcnkuaGFzV2lkZ2V0KG5ld05vZGUudHlwZSkpIHtcbiAgICAgICAgICBjb25zdCBvbGRXaWRnZXRUeXBlID0gbmV3Tm9kZS50eXBlO1xuICAgICAgICAgIG5ld05vZGUudHlwZSA9IGdldElucHV0VHlwZShub2RlU2NoZW1hLCBuZXdOb2RlKTtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBlcnJvcjogd2lkZ2V0IHR5cGUgXCIke29sZFdpZGdldFR5cGV9XCIgYCArXG4gICAgICAgICAgICBgbm90IGZvdW5kIGluIGxpYnJhcnkuIFJlcGxhY2luZyB3aXRoIFwiJHtuZXdOb2RlLnR5cGV9XCIuYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3Tm9kZS50eXBlID0gY2hlY2tJbmxpbmVUeXBlKG5ld05vZGUudHlwZSwgbm9kZVNjaGVtYSwgbmV3Tm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGVTY2hlbWEudHlwZSA9PT0gJ29iamVjdCcgJiYgaXNBcnJheShub2RlU2NoZW1hLnJlcXVpcmVkKSkge1xuICAgICAgICAgIG5vZGVEYXRhTWFwLnNldCgncmVxdWlyZWQnLCBub2RlU2NoZW1hLnJlcXVpcmVkKTtcbiAgICAgICAgfVxuICAgICAgICBuZXdOb2RlLmRhdGFUeXBlID1cbiAgICAgICAgICBub2RlU2NoZW1hLnR5cGUgfHwgKGhhc093bihub2RlU2NoZW1hLCAnJHJlZicpID8gJyRyZWYnIDogbnVsbCk7XG4gICAgICAgIHVwZGF0ZUlucHV0T3B0aW9ucyhuZXdOb2RlLCBub2RlU2NoZW1hLCBqc2YpO1xuXG4gICAgICAgIC8vIFByZXNlbnQgY2hlY2tib3hlcyBhcyBzaW5nbGUgY29udHJvbCwgcmF0aGVyIHRoYW4gYXJyYXlcbiAgICAgICAgaWYgKG5ld05vZGUudHlwZSA9PT0gJ2NoZWNrYm94ZXMnICYmIGhhc093bihub2RlU2NoZW1hLCAnaXRlbXMnKSkge1xuICAgICAgICAgIHVwZGF0ZUlucHV0T3B0aW9ucyhuZXdOb2RlLCBub2RlU2NoZW1hLml0ZW1zLCBqc2YpO1xuICAgICAgICB9IGVsc2UgaWYgKG5ld05vZGUuZGF0YVR5cGUgPT09ICdhcnJheScpIHtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMgPSBNYXRoLm1pbihcbiAgICAgICAgICAgIG5vZGVTY2hlbWEubWF4SXRlbXMgfHwgMTAwMCwgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIHx8IDEwMDBcbiAgICAgICAgICApO1xuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyA9IE1hdGgubWF4KFxuICAgICAgICAgICAgbm9kZVNjaGVtYS5taW5JdGVtcyB8fCAwLCBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgfHwgMFxuICAgICAgICAgICk7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyA9IE1hdGgubWF4KFxuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyB8fCAwLCBpc0FycmF5KG5vZGVWYWx1ZSkgPyBub2RlVmFsdWUubGVuZ3RoIDogMFxuICAgICAgICAgICk7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgPVxuICAgICAgICAgICAgaXNBcnJheShub2RlU2NoZW1hLml0ZW1zKSA/IG5vZGVTY2hlbWEuaXRlbXMubGVuZ3RoIDogMDtcbiAgICAgICAgICBpZiAobmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIDwgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMpIHtcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zID0gbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zO1xuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyA9IDA7XG4gICAgICAgICAgfSBlbHNlIGlmIChuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMgPFxuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgKyBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zID1cbiAgICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIC0gbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXM7XG4gICAgICAgICAgfSBlbHNlIGlmIChuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgPlxuICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgKyBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zID1cbiAgICAgICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zIC0gbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXM7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghbm9kZURhdGFNYXAuaGFzKCdtYXhJdGVtcycpKSB7XG4gICAgICAgICAgICBub2RlRGF0YU1hcC5zZXQoJ21heEl0ZW1zJywgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zKTtcbiAgICAgICAgICAgIG5vZGVEYXRhTWFwLnNldCgnbWluSXRlbXMnLCBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMpO1xuICAgICAgICAgICAgbm9kZURhdGFNYXAuc2V0KCd0dXBsZUl0ZW1zJywgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMpO1xuICAgICAgICAgICAgbm9kZURhdGFNYXAuc2V0KCdsaXN0SXRlbXMnLCBuZXdOb2RlLm9wdGlvbnMubGlzdEl0ZW1zKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFqc2YuYXJyYXlNYXAuaGFzKHNob3J0RGF0YVBvaW50ZXIpKSB7XG4gICAgICAgICAgICBqc2YuYXJyYXlNYXAuc2V0KHNob3J0RGF0YVBvaW50ZXIsIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzSW5wdXRSZXF1aXJlZChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyKSkge1xuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5yZXF1aXJlZCA9IHRydWU7XG4gICAgICAgICAganNmLmZpZWxkc1JlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVE9ETzogY3JlYXRlIGl0ZW0gaW4gRm9ybUdyb3VwIG1vZGVsIGZyb20gbGF5b3V0IGtleSAoPylcbiAgICAgICAgdXBkYXRlSW5wdXRPcHRpb25zKG5ld05vZGUsIHt9LCBqc2YpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW5ld05vZGUub3B0aW9ucy50aXRsZSAmJiAhL15cXGQrJC8udGVzdChuZXdOb2RlLm5hbWUpKSB7XG4gICAgICAgIG5ld05vZGUub3B0aW9ucy50aXRsZSA9IGZpeFRpdGxlKG5ld05vZGUubmFtZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChoYXNPd24obmV3Tm9kZS5vcHRpb25zLCAnY29weVZhbHVlVG8nKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5ld05vZGUub3B0aW9ucy5jb3B5VmFsdWVUbyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMuY29weVZhbHVlVG8gPSBbbmV3Tm9kZS5vcHRpb25zLmNvcHlWYWx1ZVRvXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBcnJheShuZXdOb2RlLm9wdGlvbnMuY29weVZhbHVlVG8pKSB7XG4gICAgICAgICAgbmV3Tm9kZS5vcHRpb25zLmNvcHlWYWx1ZVRvID0gbmV3Tm9kZS5vcHRpb25zLmNvcHlWYWx1ZVRvLm1hcChpdGVtID0+XG4gICAgICAgICAgICBKc29uUG9pbnRlci5jb21waWxlKEpzb25Qb2ludGVyLnBhcnNlT2JqZWN0UGF0aChpdGVtKSwgJy0nKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbmV3Tm9kZS53aWRnZXQgPSB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldChuZXdOb2RlLnR5cGUpO1xuICAgICAgbm9kZURhdGFNYXAuc2V0KCdpbnB1dFR5cGUnLCBuZXdOb2RlLnR5cGUpO1xuICAgICAgbm9kZURhdGFNYXAuc2V0KCd3aWRnZXQnLCBuZXdOb2RlLndpZGdldCk7XG5cbiAgICAgIGlmIChuZXdOb2RlLmRhdGFUeXBlID09PSAnYXJyYXknICYmXG4gICAgICAgIChoYXNPd24obmV3Tm9kZSwgJ2l0ZW1zJykgfHwgaGFzT3duKG5ld05vZGUsICdhZGRpdGlvbmFsSXRlbXMnKSlcbiAgICAgICkge1xuICAgICAgICBjb25zdCBpdGVtUmVmUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgICAgICAgbmV3Tm9kZS5kYXRhUG9pbnRlciArICcvLScsIGpzZi5kYXRhUmVjdXJzaXZlUmVmTWFwLCBqc2YuYXJyYXlNYXBcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFqc2YuZGF0YU1hcC5oYXMoaXRlbVJlZlBvaW50ZXIpKSB7XG4gICAgICAgICAganNmLmRhdGFNYXAuc2V0KGl0ZW1SZWZQb2ludGVyLCBuZXcgTWFwKCkpO1xuICAgICAgICB9XG4gICAgICAgIGpzZi5kYXRhTWFwLmdldChpdGVtUmVmUG9pbnRlcikuc2V0KCdpbnB1dFR5cGUnLCAnc2VjdGlvbicpO1xuXG4gICAgICAgIC8vIEZpeCBpbnN1ZmZpY2llbnRseSBuZXN0ZWQgYXJyYXkgaXRlbSBncm91cHNcbiAgICAgICAgaWYgKG5ld05vZGUuaXRlbXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGNvbnN0IGFycmF5SXRlbUdyb3VwID0gW107XG4gICAgICAgICAgZm9yIChsZXQgaSA9IG5ld05vZGUuaXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IHN1Ykl0ZW0gPSBuZXdOb2RlLml0ZW1zW2ldO1xuICAgICAgICAgICAgaWYgKGhhc093bihzdWJJdGVtLCAnZGF0YVBvaW50ZXInKSAmJlxuICAgICAgICAgICAgICBzdWJJdGVtLmRhdGFQb2ludGVyLnNsaWNlKDAsIGl0ZW1SZWZQb2ludGVyLmxlbmd0aCkgPT09IGl0ZW1SZWZQb2ludGVyXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgY29uc3QgYXJyYXlJdGVtID0gbmV3Tm9kZS5pdGVtcy5zcGxpY2UoaSwgMSlbMF07XG4gICAgICAgICAgICAgIGFycmF5SXRlbS5kYXRhUG9pbnRlciA9IG5ld05vZGUuZGF0YVBvaW50ZXIgKyAnLy0nICtcbiAgICAgICAgICAgICAgICBhcnJheUl0ZW0uZGF0YVBvaW50ZXIuc2xpY2UoaXRlbVJlZlBvaW50ZXIubGVuZ3RoKTtcbiAgICAgICAgICAgICAgYXJyYXlJdGVtR3JvdXAudW5zaGlmdChhcnJheUl0ZW0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3ViSXRlbS5hcnJheUl0ZW0gPSB0cnVlO1xuICAgICAgICAgICAgICAvLyBUT0RPOiBDaGVjayBzY2hlbWEgdG8gZ2V0IGFycmF5SXRlbVR5cGUgYW5kIHJlbW92YWJsZVxuICAgICAgICAgICAgICBzdWJJdGVtLmFycmF5SXRlbVR5cGUgPSAnbGlzdCc7XG4gICAgICAgICAgICAgIHN1Ykl0ZW0ucmVtb3ZhYmxlID0gbmV3Tm9kZS5vcHRpb25zLnJlbW92YWJsZSAhPT0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChhcnJheUl0ZW1Hcm91cC5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5ld05vZGUuaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgIF9pZDogdW5pcXVlSWQoKSxcbiAgICAgICAgICAgICAgYXJyYXlJdGVtOiB0cnVlLFxuICAgICAgICAgICAgICBhcnJheUl0ZW1UeXBlOiBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyA+IG5ld05vZGUuaXRlbXMubGVuZ3RoID9cbiAgICAgICAgICAgICAgICAndHVwbGUnIDogJ2xpc3QnLFxuICAgICAgICAgICAgICBpdGVtczogYXJyYXlJdGVtR3JvdXAsXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHsgcmVtb3ZhYmxlOiBuZXdOb2RlLm9wdGlvbnMucmVtb3ZhYmxlICE9PSBmYWxzZSwgfSxcbiAgICAgICAgICAgICAgZGF0YVBvaW50ZXI6IG5ld05vZGUuZGF0YVBvaW50ZXIgKyAnLy0nLFxuICAgICAgICAgICAgICB0eXBlOiAnc2VjdGlvbicsXG4gICAgICAgICAgICAgIHdpZGdldDogd2lkZ2V0TGlicmFyeS5nZXRXaWRnZXQoJ3NlY3Rpb24nKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUT0RPOiBGaXggdG8gaG5kbGUgbXVsdGlwbGUgaXRlbXNcbiAgICAgICAgICBuZXdOb2RlLml0ZW1zWzBdLmFycmF5SXRlbSA9IHRydWU7XG4gICAgICAgICAgaWYgKCFuZXdOb2RlLml0ZW1zWzBdLmRhdGFQb2ludGVyKSB7XG4gICAgICAgICAgICBuZXdOb2RlLml0ZW1zWzBdLmRhdGFQb2ludGVyID1cbiAgICAgICAgICAgICAgSnNvblBvaW50ZXIudG9HZW5lcmljUG9pbnRlcihpdGVtUmVmUG9pbnRlciwganNmLmFycmF5TWFwKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFKc29uUG9pbnRlci5oYXMobmV3Tm9kZSwgJy9pdGVtcy8wL29wdGlvbnMvcmVtb3ZhYmxlJykpIHtcbiAgICAgICAgICAgIG5ld05vZGUuaXRlbXNbMF0ub3B0aW9ucy5yZW1vdmFibGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobmV3Tm9kZS5vcHRpb25zLm9yZGVyYWJsZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIG5ld05vZGUuaXRlbXNbMF0ub3B0aW9ucy5vcmRlcmFibGUgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbmV3Tm9kZS5pdGVtc1swXS5hcnJheUl0ZW1UeXBlID1cbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zID8gJ3R1cGxlJyA6ICdsaXN0JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0FycmF5KG5ld05vZGUuaXRlbXMpKSB7XG4gICAgICAgICAgY29uc3QgYXJyYXlMaXN0SXRlbXMgPVxuICAgICAgICAgICAgbmV3Tm9kZS5pdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgIT09ICckcmVmJykubGVuZ3RoIC1cbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zO1xuICAgICAgICAgIGlmIChhcnJheUxpc3RJdGVtcyA+IG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMpIHtcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPSBhcnJheUxpc3RJdGVtcztcbiAgICAgICAgICAgIG5vZGVEYXRhTWFwLnNldCgnbGlzdEl0ZW1zJywgYXJyYXlMaXN0SXRlbXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaGFzT3duKGpzZi5sYXlvdXRSZWZMaWJyYXJ5LCBpdGVtUmVmUG9pbnRlcikpIHtcbiAgICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPVxuICAgICAgICAgICAgY2xvbmVEZWVwKG5ld05vZGUuaXRlbXNbbmV3Tm9kZS5pdGVtcy5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgaWYgKHJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdLnJlY3Vyc2l2ZVJlZmVyZW5jZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvckVhY2goanNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdLCAoaXRlbSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoaGFzT3duKGl0ZW0sICdfaWQnKSkgeyBpdGVtLl9pZCA9IG51bGw7IH1cbiAgICAgICAgICAgIGlmIChyZWN1cnNpdmUpIHtcbiAgICAgICAgICAgICAgaWYgKGhhc093bihpdGVtLCAnZGF0YVBvaW50ZXInKSkge1xuICAgICAgICAgICAgICAgIGl0ZW0uZGF0YVBvaW50ZXIgPSBpdGVtLmRhdGFQb2ludGVyLnNsaWNlKGl0ZW1SZWZQb2ludGVyLmxlbmd0aCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAndG9wLWRvd24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBhbnkgYWRkaXRpb25hbCBkZWZhdWx0IGl0ZW1zXG4gICAgICAgIGlmICghbmV3Tm9kZS5yZWN1cnNpdmVSZWZlcmVuY2UgfHwgbmV3Tm9kZS5vcHRpb25zLnJlcXVpcmVkKSB7XG4gICAgICAgICAgY29uc3QgYXJyYXlMZW5ndGggPSBNYXRoLm1pbihNYXRoLm1heChcbiAgICAgICAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zICsgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyxcbiAgICAgICAgICAgIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZS5sZW5ndGggOiAwXG4gICAgICAgICAgKSwgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zKTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gbmV3Tm9kZS5pdGVtcy5sZW5ndGg7IGkgPCBhcnJheUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBuZXdOb2RlLml0ZW1zLnB1c2goZ2V0TGF5b3V0Tm9kZSh7XG4gICAgICAgICAgICAgICRyZWY6IGl0ZW1SZWZQb2ludGVyLFxuICAgICAgICAgICAgICBkYXRhUG9pbnRlcjogbmV3Tm9kZS5kYXRhUG9pbnRlcixcbiAgICAgICAgICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiBuZXdOb2RlLnJlY3Vyc2l2ZVJlZmVyZW5jZSxcbiAgICAgICAgICAgIH0sIGpzZiwgd2lkZ2V0TGlicmFyeSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIG5lZWRlZCwgYWRkIGJ1dHRvbiB0byBhZGQgaXRlbXMgdG8gYXJyYXlcbiAgICAgICAgaWYgKG5ld05vZGUub3B0aW9ucy5hZGRhYmxlICE9PSBmYWxzZSAmJlxuICAgICAgICAgIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyA8IG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyAmJlxuICAgICAgICAgIChuZXdOb2RlLml0ZW1zW25ld05vZGUuaXRlbXMubGVuZ3RoIC0gMV0gfHwge30pLnR5cGUgIT09ICckcmVmJ1xuICAgICAgICApIHtcbiAgICAgICAgICBsZXQgYnV0dG9uVGV4dCA9ICdBZGQnO1xuICAgICAgICAgIGlmIChuZXdOb2RlLm9wdGlvbnMudGl0bGUpIHtcbiAgICAgICAgICAgIGlmICgvXmFkZFxcYi9pLnRlc3QobmV3Tm9kZS5vcHRpb25zLnRpdGxlKSkge1xuICAgICAgICAgICAgICBidXR0b25UZXh0ID0gbmV3Tm9kZS5vcHRpb25zLnRpdGxlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYnV0dG9uVGV4dCArPSAnICcgKyBuZXdOb2RlLm9wdGlvbnMudGl0bGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChuZXdOb2RlLm5hbWUgJiYgIS9eXFxkKyQvLnRlc3QobmV3Tm9kZS5uYW1lKSkge1xuICAgICAgICAgICAgaWYgKC9eYWRkXFxiL2kudGVzdChuZXdOb2RlLm5hbWUpKSB7XG4gICAgICAgICAgICAgIGJ1dHRvblRleHQgKz0gJyAnICsgZml4VGl0bGUobmV3Tm9kZS5uYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGJ1dHRvblRleHQgPSBmaXhUaXRsZShuZXdOb2RlLm5hbWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBuZXdOb2RlIGRvZXNuJ3QgaGF2ZSBhIHRpdGxlLCBsb29rIGZvciB0aXRsZSBvZiBwYXJlbnQgYXJyYXkgaXRlbVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRTY2hlbWEgPVxuICAgICAgICAgICAgICBnZXRGcm9tU2NoZW1hKGpzZi5zY2hlbWEsIG5ld05vZGUuZGF0YVBvaW50ZXIsICdwYXJlbnRTY2hlbWEnKTtcbiAgICAgICAgICAgIGlmIChoYXNPd24ocGFyZW50U2NoZW1hLCAndGl0bGUnKSkge1xuICAgICAgICAgICAgICBidXR0b25UZXh0ICs9ICcgdG8gJyArIHBhcmVudFNjaGVtYS50aXRsZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBvaW50ZXJBcnJheSA9IEpzb25Qb2ludGVyLnBhcnNlKG5ld05vZGUuZGF0YVBvaW50ZXIpO1xuICAgICAgICAgICAgICBidXR0b25UZXh0ICs9ICcgdG8gJyArIGZpeFRpdGxlKHBvaW50ZXJBcnJheVtwb2ludGVyQXJyYXkubGVuZ3RoIC0gMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBuZXdOb2RlLml0ZW1zLnB1c2goe1xuICAgICAgICAgICAgX2lkOiB1bmlxdWVJZCgpLFxuICAgICAgICAgICAgYXJyYXlJdGVtOiB0cnVlLFxuICAgICAgICAgICAgYXJyYXlJdGVtVHlwZTogJ2xpc3QnLFxuICAgICAgICAgICAgZGF0YVBvaW50ZXI6IG5ld05vZGUuZGF0YVBvaW50ZXIgKyAnLy0nLFxuICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICBsaXN0SXRlbXM6IG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMsXG4gICAgICAgICAgICAgIG1heEl0ZW1zOiBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMsXG4gICAgICAgICAgICAgIG1pbkl0ZW1zOiBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMsXG4gICAgICAgICAgICAgIHJlbW92YWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgIHRpdGxlOiBidXR0b25UZXh0LFxuICAgICAgICAgICAgICB0dXBsZUl0ZW1zOiBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IHJlY3Vyc2l2ZSxcbiAgICAgICAgICAgIHR5cGU6ICckcmVmJyxcbiAgICAgICAgICAgIHdpZGdldDogd2lkZ2V0TGlicmFyeS5nZXRXaWRnZXQoJyRyZWYnKSxcbiAgICAgICAgICAgICRyZWY6IGl0ZW1SZWZQb2ludGVyLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChpc1N0cmluZyhKc29uUG9pbnRlci5nZXQobmV3Tm9kZSwgJy9zdHlsZS9hZGQnKSkpIHtcbiAgICAgICAgICAgIG5ld05vZGUuaXRlbXNbbmV3Tm9kZS5pdGVtcy5sZW5ndGggLSAxXS5vcHRpb25zLmZpZWxkU3R5bGUgPVxuICAgICAgICAgICAgICBuZXdOb2RlLnN0eWxlLmFkZDtcbiAgICAgICAgICAgIGRlbGV0ZSBuZXdOb2RlLnN0eWxlLmFkZDtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5KG5ld05vZGUuc3R5bGUpKSB7IGRlbGV0ZSBuZXdOb2RlLnN0eWxlOyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdOb2RlLmFycmF5SXRlbSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaGFzT3duKG5ld05vZGUsICd0eXBlJykgfHwgaGFzT3duKG5ld05vZGUsICdpdGVtcycpKSB7XG4gICAgICBjb25zdCBwYXJlbnRUeXBlOiBzdHJpbmcgPVxuICAgICAgICBKc29uUG9pbnRlci5nZXQoanNmLmxheW91dCwgbGF5b3V0UG9pbnRlciwgMCwgLTIpLnR5cGU7XG4gICAgICBpZiAoIWhhc093bihuZXdOb2RlLCAndHlwZScpKSB7XG4gICAgICAgIG5ld05vZGUudHlwZSA9XG4gICAgICAgICAgaW5BcnJheShwYXJlbnRUeXBlLCBbJ3RhYnMnLCAndGFiYXJyYXknXSkgPyAndGFiJyA6ICdhcnJheSc7XG4gICAgICB9XG4gICAgICBuZXdOb2RlLmFycmF5SXRlbSA9IHBhcmVudFR5cGUgPT09ICdhcnJheSc7XG4gICAgICBuZXdOb2RlLndpZGdldCA9IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KG5ld05vZGUudHlwZSk7XG4gICAgICB1cGRhdGVJbnB1dE9wdGlvbnMobmV3Tm9kZSwge30sIGpzZik7XG4gICAgfVxuICAgIGlmIChuZXdOb2RlLnR5cGUgPT09ICdzdWJtaXQnKSB7IGhhc1N1Ym1pdEJ1dHRvbiA9IHRydWU7IH1cbiAgICByZXR1cm4gbmV3Tm9kZTtcbiAgfSk7XG4gIGlmIChqc2YuaGFzUm9vdFJlZmVyZW5jZSkge1xuICAgIGNvbnN0IGZ1bGxMYXlvdXQgPSBjbG9uZURlZXAoZm9ybUxheW91dCk7XG4gICAgaWYgKGZ1bGxMYXlvdXRbZnVsbExheW91dC5sZW5ndGggLSAxXS50eXBlID09PSAnc3VibWl0JykgeyBmdWxsTGF5b3V0LnBvcCgpOyB9XG4gICAganNmLmxheW91dFJlZkxpYnJhcnlbJyddID0ge1xuICAgICAgX2lkOiBudWxsLFxuICAgICAgZGF0YVBvaW50ZXI6ICcnLFxuICAgICAgZGF0YVR5cGU6ICdvYmplY3QnLFxuICAgICAgaXRlbXM6IGZ1bGxMYXlvdXQsXG4gICAgICBuYW1lOiAnJyxcbiAgICAgIG9wdGlvbnM6IGNsb25lRGVlcChqc2YuZm9ybU9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucyksXG4gICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IHRydWUsXG4gICAgICByZXF1aXJlZDogZmFsc2UsXG4gICAgICB0eXBlOiAnc2VjdGlvbicsXG4gICAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KCdzZWN0aW9uJyksXG4gICAgfTtcbiAgfVxuICBpZiAoIWhhc1N1Ym1pdEJ1dHRvbikge1xuICAgIGZvcm1MYXlvdXQucHVzaCh7XG4gICAgICBfaWQ6IHVuaXF1ZUlkKCksXG4gICAgICBvcHRpb25zOiB7IHRpdGxlOiAnU3VibWl0JyB9LFxuICAgICAgdHlwZTogJ3N1Ym1pdCcsXG4gICAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KCdzdWJtaXQnKSxcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZm9ybUxheW91dDtcbn1cblxuLyoqXG4gKiAnYnVpbGRMYXlvdXRGcm9tU2NoZW1hJyBmdW5jdGlvblxuICpcbiAqIC8vICAganNmIC1cbiAqIC8vICAgd2lkZ2V0TGlicmFyeSAtXG4gKiAvLyAgIG5vZGVWYWx1ZSAtXG4gKiAvLyAgeyBzdHJpbmcgPSAnJyB9IHNjaGVtYVBvaW50ZXIgLVxuICogLy8gIHsgc3RyaW5nID0gJycgfSBkYXRhUG9pbnRlciAtXG4gKiAvLyAgeyBib29sZWFuID0gZmFsc2UgfSBhcnJheUl0ZW0gLVxuICogLy8gIHsgc3RyaW5nID0gbnVsbCB9IGFycmF5SXRlbVR5cGUgLVxuICogLy8gIHsgYm9vbGVhbiA9IG51bGwgfSByZW1vdmFibGUgLVxuICogLy8gIHsgYm9vbGVhbiA9IGZhbHNlIH0gZm9yUmVmTGlicmFyeSAtXG4gKiAvLyAgeyBzdHJpbmcgPSAnJyB9IGRhdGFQb2ludGVyUHJlZml4IC1cbiAqIC8vXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZExheW91dEZyb21TY2hlbWEoXG4gIGpzZiwgd2lkZ2V0TGlicmFyeSwgbm9kZVZhbHVlID0gbnVsbCwgc2NoZW1hUG9pbnRlciA9ICcnLFxuICBkYXRhUG9pbnRlciA9ICcnLCBhcnJheUl0ZW0gPSBmYWxzZSwgYXJyYXlJdGVtVHlwZTogc3RyaW5nID0gbnVsbCxcbiAgcmVtb3ZhYmxlOiBib29sZWFuID0gbnVsbCwgZm9yUmVmTGlicmFyeSA9IGZhbHNlLCBkYXRhUG9pbnRlclByZWZpeCA9ICcnXG4pIHtcbiAgY29uc3Qgc2NoZW1hID0gSnNvblBvaW50ZXIuZ2V0KGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIpO1xuICBpZiAoIWhhc093bihzY2hlbWEsICd0eXBlJykgJiYgIWhhc093bihzY2hlbWEsICckcmVmJykgJiZcbiAgICAhaGFzT3duKHNjaGVtYSwgJ3gtc2NoZW1hLWZvcm0nKVxuICApIHsgcmV0dXJuIG51bGw7IH1cbiAgY29uc3QgbmV3Tm9kZVR5cGU6IHN0cmluZyA9IGdldElucHV0VHlwZShzY2hlbWEpO1xuICBpZiAoIWlzRGVmaW5lZChub2RlVmFsdWUpICYmIChcbiAgICBqc2YuZm9ybU9wdGlvbnMuc2V0U2NoZW1hRGVmYXVsdHMgPT09IHRydWUgfHxcbiAgICAoanNmLmZvcm1PcHRpb25zLnNldFNjaGVtYURlZmF1bHRzID09PSAnYXV0bycgJiYgaXNFbXB0eShqc2YuZm9ybVZhbHVlcykpXG4gICkpIHtcbiAgICBub2RlVmFsdWUgPSBKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlciArICcvZGVmYXVsdCcpO1xuICB9XG4gIGxldCBuZXdOb2RlOiBhbnkgPSB7XG4gICAgX2lkOiBmb3JSZWZMaWJyYXJ5ID8gbnVsbCA6IHVuaXF1ZUlkKCksXG4gICAgYXJyYXlJdGVtOiBhcnJheUl0ZW0sXG4gICAgZGF0YVBvaW50ZXI6IEpzb25Qb2ludGVyLnRvR2VuZXJpY1BvaW50ZXIoZGF0YVBvaW50ZXIsIGpzZi5hcnJheU1hcCksXG4gICAgZGF0YVR5cGU6IHNjaGVtYS50eXBlIHx8IChoYXNPd24oc2NoZW1hLCAnJHJlZicpID8gJyRyZWYnIDogbnVsbCksXG4gICAgb3B0aW9uczoge30sXG4gICAgcmVxdWlyZWQ6IGlzSW5wdXRSZXF1aXJlZChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyKSxcbiAgICB0eXBlOiBuZXdOb2RlVHlwZSxcbiAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KG5ld05vZGVUeXBlKSxcbiAgfTtcbiAgY29uc3QgbGFzdERhdGFLZXkgPSBKc29uUG9pbnRlci50b0tleShuZXdOb2RlLmRhdGFQb2ludGVyKTtcbiAgaWYgKGxhc3REYXRhS2V5ICE9PSAnLScpIHsgbmV3Tm9kZS5uYW1lID0gbGFzdERhdGFLZXk7IH1cbiAgaWYgKG5ld05vZGUuYXJyYXlJdGVtKSB7XG4gICAgbmV3Tm9kZS5hcnJheUl0ZW1UeXBlID0gYXJyYXlJdGVtVHlwZTtcbiAgICBuZXdOb2RlLm9wdGlvbnMucmVtb3ZhYmxlID0gcmVtb3ZhYmxlICE9PSBmYWxzZTtcbiAgfVxuICBjb25zdCBzaG9ydERhdGFQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICBkYXRhUG9pbnRlclByZWZpeCArIGRhdGFQb2ludGVyLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICk7XG4gIGNvbnN0IHJlY3Vyc2l2ZSA9ICFzaG9ydERhdGFQb2ludGVyLmxlbmd0aCB8fFxuICAgIHNob3J0RGF0YVBvaW50ZXIgIT09IGRhdGFQb2ludGVyUHJlZml4ICsgZGF0YVBvaW50ZXI7XG4gIGlmICghanNmLmRhdGFNYXAuaGFzKHNob3J0RGF0YVBvaW50ZXIpKSB7XG4gICAganNmLmRhdGFNYXAuc2V0KHNob3J0RGF0YVBvaW50ZXIsIG5ldyBNYXAoKSk7XG4gIH1cbiAgY29uc3Qgbm9kZURhdGFNYXAgPSBqc2YuZGF0YU1hcC5nZXQoc2hvcnREYXRhUG9pbnRlcik7XG4gIGlmICghbm9kZURhdGFNYXAuaGFzKCdpbnB1dFR5cGUnKSkge1xuICAgIG5vZGVEYXRhTWFwLnNldCgnc2NoZW1hUG9pbnRlcicsIHNjaGVtYVBvaW50ZXIpO1xuICAgIG5vZGVEYXRhTWFwLnNldCgnaW5wdXRUeXBlJywgbmV3Tm9kZS50eXBlKTtcbiAgICBub2RlRGF0YU1hcC5zZXQoJ3dpZGdldCcsIG5ld05vZGUud2lkZ2V0KTtcbiAgICBub2RlRGF0YU1hcC5zZXQoJ2Rpc2FibGVkJywgISFuZXdOb2RlLm9wdGlvbnMuZGlzYWJsZWQpO1xuICB9XG4gIHVwZGF0ZUlucHV0T3B0aW9ucyhuZXdOb2RlLCBzY2hlbWEsIGpzZik7XG4gIGlmICghbmV3Tm9kZS5vcHRpb25zLnRpdGxlICYmIG5ld05vZGUubmFtZSAmJiAhL15cXGQrJC8udGVzdChuZXdOb2RlLm5hbWUpKSB7XG4gICAgbmV3Tm9kZS5vcHRpb25zLnRpdGxlID0gZml4VGl0bGUobmV3Tm9kZS5uYW1lKTtcbiAgfVxuXG4gIGlmIChuZXdOb2RlLmRhdGFUeXBlID09PSAnb2JqZWN0Jykge1xuICAgIGlmIChpc0FycmF5KHNjaGVtYS5yZXF1aXJlZCkgJiYgIW5vZGVEYXRhTWFwLmhhcygncmVxdWlyZWQnKSkge1xuICAgICAgbm9kZURhdGFNYXAuc2V0KCdyZXF1aXJlZCcsIHNjaGVtYS5yZXF1aXJlZCk7XG4gICAgfVxuICAgIGlmIChpc09iamVjdChzY2hlbWEucHJvcGVydGllcykpIHtcbiAgICAgIGNvbnN0IG5ld1NlY3Rpb246IGFueVtdID0gW107XG4gICAgICBjb25zdCBwcm9wZXJ0eUtleXMgPSBzY2hlbWFbJ3VpOm9yZGVyJ10gfHwgT2JqZWN0LmtleXMoc2NoZW1hLnByb3BlcnRpZXMpO1xuICAgICAgaWYgKHByb3BlcnR5S2V5cy5pbmNsdWRlcygnKicpICYmICFoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsICcqJykpIHtcbiAgICAgICAgY29uc3QgdW5uYW1lZEtleXMgPSBPYmplY3Qua2V5cyhzY2hlbWEucHJvcGVydGllcylcbiAgICAgICAgICAuZmlsdGVyKGtleSA9PiAhcHJvcGVydHlLZXlzLmluY2x1ZGVzKGtleSkpO1xuICAgICAgICBmb3IgKGxldCBpID0gcHJvcGVydHlLZXlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKHByb3BlcnR5S2V5c1tpXSA9PT0gJyonKSB7XG4gICAgICAgICAgICBwcm9wZXJ0eUtleXMuc3BsaWNlKGksIDEsIC4uLnVubmFtZWRLZXlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHByb3BlcnR5S2V5c1xuICAgICAgICAuZmlsdGVyKGtleSA9PiBoYXNPd24oc2NoZW1hLnByb3BlcnRpZXMsIGtleSkgfHxcbiAgICAgICAgICBoYXNPd24oc2NoZW1hLCAnYWRkaXRpb25hbFByb3BlcnRpZXMnKVxuICAgICAgICApXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgY29uc3Qga2V5U2NoZW1hUG9pbnRlciA9IGhhc093bihzY2hlbWEucHJvcGVydGllcywga2V5KSA/XG4gICAgICAgICAgICAnL3Byb3BlcnRpZXMvJyArIGtleSA6ICcvYWRkaXRpb25hbFByb3BlcnRpZXMnO1xuICAgICAgICAgIGNvbnN0IGlubmVySXRlbSA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAgICAgIGpzZiwgd2lkZ2V0TGlicmFyeSwgaXNPYmplY3Qobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZVtrZXldIDogbnVsbCxcbiAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIgKyBrZXlTY2hlbWFQb2ludGVyLFxuICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLycgKyBrZXksXG4gICAgICAgICAgICBmYWxzZSwgbnVsbCwgbnVsbCwgZm9yUmVmTGlicmFyeSwgZGF0YVBvaW50ZXJQcmVmaXhcbiAgICAgICAgICApO1xuICAgICAgICAgIGlmIChpbm5lckl0ZW0pIHtcbiAgICAgICAgICAgIGlmIChpc0lucHV0UmVxdWlyZWQoc2NoZW1hLCAnLycgKyBrZXkpKSB7XG4gICAgICAgICAgICAgIGlubmVySXRlbS5vcHRpb25zLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAganNmLmZpZWxkc1JlcXVpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld1NlY3Rpb24ucHVzaChpbm5lckl0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICBpZiAoZGF0YVBvaW50ZXIgPT09ICcnICYmICFmb3JSZWZMaWJyYXJ5KSB7XG4gICAgICAgIG5ld05vZGUgPSBuZXdTZWN0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3Tm9kZS5pdGVtcyA9IG5ld1NlY3Rpb247XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFRPRE86IEFkZCBwYXR0ZXJuUHJvcGVydGllcyBhbmQgYWRkaXRpb25hbFByb3BlcnRpZXMgaW5wdXRzP1xuICAgIC8vIC4uLiBwb3NzaWJseSBwcm92aWRlIGEgd2F5IHRvIGVudGVyIGJvdGgga2V5IG5hbWVzIGFuZCB2YWx1ZXM/XG4gICAgLy8gaWYgKGlzT2JqZWN0KHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcykpIHsgfVxuICAgIC8vIGlmIChpc09iamVjdChzY2hlbWEuYWRkaXRpb25hbFByb3BlcnRpZXMpKSB7IH1cblxuICB9IGVsc2UgaWYgKG5ld05vZGUuZGF0YVR5cGUgPT09ICdhcnJheScpIHtcbiAgICBuZXdOb2RlLml0ZW1zID0gW107XG4gICAgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zID0gTWF0aC5taW4oXG4gICAgICBzY2hlbWEubWF4SXRlbXMgfHwgMTAwMCwgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIHx8IDEwMDBcbiAgICApO1xuICAgIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyA9IE1hdGgubWF4KFxuICAgICAgc2NoZW1hLm1pbkl0ZW1zIHx8IDAsIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyB8fCAwXG4gICAgKTtcbiAgICBpZiAoIW5ld05vZGUub3B0aW9ucy5taW5JdGVtcyAmJiBpc0lucHV0UmVxdWlyZWQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlcikpIHtcbiAgICAgIG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyA9IDE7XG4gICAgfVxuICAgIGlmICghaGFzT3duKG5ld05vZGUub3B0aW9ucywgJ2xpc3RJdGVtcycpKSB7IG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPSAxOyB9XG4gICAgbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMgPSBpc0FycmF5KHNjaGVtYS5pdGVtcykgPyBzY2hlbWEuaXRlbXMubGVuZ3RoIDogMDtcbiAgICBpZiAobmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIDw9IG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zKSB7XG4gICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyA9IG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcztcbiAgICAgIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMgPSAwO1xuICAgIH0gZWxzZSBpZiAobmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zIDxcbiAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zICsgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtc1xuICAgICkge1xuICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyA9IG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyAtIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zO1xuICAgIH0gZWxzZSBpZiAobmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zID5cbiAgICAgIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zICsgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtc1xuICAgICkge1xuICAgICAgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyA9IG5ld05vZGUub3B0aW9ucy5taW5JdGVtcyAtIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zO1xuICAgIH1cbiAgICBpZiAoIW5vZGVEYXRhTWFwLmhhcygnbWF4SXRlbXMnKSkge1xuICAgICAgbm9kZURhdGFNYXAuc2V0KCdtYXhJdGVtcycsIG5ld05vZGUub3B0aW9ucy5tYXhJdGVtcyk7XG4gICAgICBub2RlRGF0YU1hcC5zZXQoJ21pbkl0ZW1zJywgbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zKTtcbiAgICAgIG5vZGVEYXRhTWFwLnNldCgndHVwbGVJdGVtcycsIG5ld05vZGUub3B0aW9ucy50dXBsZUl0ZW1zKTtcbiAgICAgIG5vZGVEYXRhTWFwLnNldCgnbGlzdEl0ZW1zJywgbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyk7XG4gICAgfVxuICAgIGlmICghanNmLmFycmF5TWFwLmhhcyhzaG9ydERhdGFQb2ludGVyKSkge1xuICAgICAganNmLmFycmF5TWFwLnNldChzaG9ydERhdGFQb2ludGVyLCBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyk7XG4gICAgfVxuICAgIHJlbW92YWJsZSA9IG5ld05vZGUub3B0aW9ucy5yZW1vdmFibGUgIT09IGZhbHNlO1xuICAgIGxldCBhZGRpdGlvbmFsSXRlbXNTY2hlbWFQb2ludGVyOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLy8gSWYgJ2l0ZW1zJyBpcyBhbiBhcnJheSA9IHR1cGxlIGl0ZW1zXG4gICAgaWYgKGlzQXJyYXkoc2NoZW1hLml0ZW1zKSkge1xuICAgICAgbmV3Tm9kZS5pdGVtcyA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtczsgaSsrKSB7XG4gICAgICAgIGxldCBuZXdJdGVtOiBhbnk7XG4gICAgICAgIGNvbnN0IGl0ZW1SZWZQb2ludGVyID0gcmVtb3ZlUmVjdXJzaXZlUmVmZXJlbmNlcyhcbiAgICAgICAgICBzaG9ydERhdGFQb2ludGVyICsgJy8nICsgaSwganNmLmRhdGFSZWN1cnNpdmVSZWZNYXAsIGpzZi5hcnJheU1hcFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpdGVtUmVjdXJzaXZlID0gIWl0ZW1SZWZQb2ludGVyLmxlbmd0aCB8fFxuICAgICAgICAgIGl0ZW1SZWZQb2ludGVyICE9PSBzaG9ydERhdGFQb2ludGVyICsgJy8nICsgaTtcblxuICAgICAgICAvLyBJZiByZW1vdmFibGUsIGFkZCB0dXBsZSBpdGVtIGxheW91dCB0byBsYXlvdXRSZWZMaWJyYXJ5XG4gICAgICAgIGlmIChyZW1vdmFibGUgJiYgaSA+PSBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMpIHtcbiAgICAgICAgICBpZiAoIWhhc093bihqc2YubGF5b3V0UmVmTGlicmFyeSwgaXRlbVJlZlBvaW50ZXIpKSB7XG4gICAgICAgICAgICAvLyBTZXQgdG8gbnVsbCBmaXJzdCB0byBwcmV2ZW50IHJlY3Vyc2l2ZSByZWZlcmVuY2UgZnJvbSBjYXVzaW5nIGVuZGxlc3MgbG9vcFxuICAgICAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdID0gbnVsbDtcbiAgICAgICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2l0ZW1SZWZQb2ludGVyXSA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAgICAgICAganNmLCB3aWRnZXRMaWJyYXJ5LCBpc0FycmF5KG5vZGVWYWx1ZSkgPyBub2RlVmFsdWVbaV0gOiBudWxsLFxuICAgICAgICAgICAgICBzY2hlbWFQb2ludGVyICsgJy9pdGVtcy8nICsgaSxcbiAgICAgICAgICAgICAgaXRlbVJlY3Vyc2l2ZSA/ICcnIDogZGF0YVBvaW50ZXIgKyAnLycgKyBpLFxuICAgICAgICAgICAgICB0cnVlLCAndHVwbGUnLCB0cnVlLCB0cnVlLCBpdGVtUmVjdXJzaXZlID8gZGF0YVBvaW50ZXIgKyAnLycgKyBpIDogJydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoaXRlbVJlY3Vyc2l2ZSkge1xuICAgICAgICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0ucmVjdXJzaXZlUmVmZXJlbmNlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgbmV3SXRlbSA9IGdldExheW91dE5vZGUoe1xuICAgICAgICAgICAgJHJlZjogaXRlbVJlZlBvaW50ZXIsXG4gICAgICAgICAgICBkYXRhUG9pbnRlcjogZGF0YVBvaW50ZXIgKyAnLycgKyBpLFxuICAgICAgICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiBpdGVtUmVjdXJzaXZlLFxuICAgICAgICAgIH0sIGpzZiwgd2lkZ2V0TGlicmFyeSwgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlW2ldIDogbnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3SXRlbSA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAgICAgIGpzZiwgd2lkZ2V0TGlicmFyeSwgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlW2ldIDogbnVsbCxcbiAgICAgICAgICAgIHNjaGVtYVBvaW50ZXIgKyAnL2l0ZW1zLycgKyBpLFxuICAgICAgICAgICAgZGF0YVBvaW50ZXIgKyAnLycgKyBpLFxuICAgICAgICAgICAgdHJ1ZSwgJ3R1cGxlJywgZmFsc2UsIGZvclJlZkxpYnJhcnksIGRhdGFQb2ludGVyUHJlZml4XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3SXRlbSkgeyBuZXdOb2RlLml0ZW1zLnB1c2gobmV3SXRlbSk7IH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgJ2FkZGl0aW9uYWxJdGVtcycgaXMgYW4gb2JqZWN0ID0gYWRkaXRpb25hbCBsaXN0IGl0ZW1zLCBhZnRlciB0dXBsZSBpdGVtc1xuICAgICAgaWYgKGlzT2JqZWN0KHNjaGVtYS5hZGRpdGlvbmFsSXRlbXMpKSB7XG4gICAgICAgIGFkZGl0aW9uYWxJdGVtc1NjaGVtYVBvaW50ZXIgPSBzY2hlbWFQb2ludGVyICsgJy9hZGRpdGlvbmFsSXRlbXMnO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiAnaXRlbXMnIGlzIGFuIG9iamVjdCA9IGxpc3QgaXRlbXMgb25seSAobm8gdHVwbGUgaXRlbXMpXG4gICAgfSBlbHNlIGlmIChpc09iamVjdChzY2hlbWEuaXRlbXMpKSB7XG4gICAgICBhZGRpdGlvbmFsSXRlbXNTY2hlbWFQb2ludGVyID0gc2NoZW1hUG9pbnRlciArICcvaXRlbXMnO1xuICAgIH1cblxuICAgIGlmIChhZGRpdGlvbmFsSXRlbXNTY2hlbWFQb2ludGVyKSB7XG4gICAgICBjb25zdCBpdGVtUmVmUG9pbnRlciA9IHJlbW92ZVJlY3Vyc2l2ZVJlZmVyZW5jZXMoXG4gICAgICAgIHNob3J0RGF0YVBvaW50ZXIgKyAnLy0nLCBqc2YuZGF0YVJlY3Vyc2l2ZVJlZk1hcCwganNmLmFycmF5TWFwXG4gICAgICApO1xuICAgICAgY29uc3QgaXRlbVJlY3Vyc2l2ZSA9ICFpdGVtUmVmUG9pbnRlci5sZW5ndGggfHxcbiAgICAgICAgaXRlbVJlZlBvaW50ZXIgIT09IHNob3J0RGF0YVBvaW50ZXIgKyAnLy0nO1xuICAgICAgY29uc3QgaXRlbVNjaGVtYVBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgICBhZGRpdGlvbmFsSXRlbXNTY2hlbWFQb2ludGVyLCBqc2Yuc2NoZW1hUmVjdXJzaXZlUmVmTWFwLCBqc2YuYXJyYXlNYXBcbiAgICAgICk7XG4gICAgICAvLyBBZGQgbGlzdCBpdGVtIGxheW91dCB0byBsYXlvdXRSZWZMaWJyYXJ5XG4gICAgICBpZiAoaXRlbVJlZlBvaW50ZXIubGVuZ3RoICYmICFoYXNPd24oanNmLmxheW91dFJlZkxpYnJhcnksIGl0ZW1SZWZQb2ludGVyKSkge1xuICAgICAgICAvLyBTZXQgdG8gbnVsbCBmaXJzdCB0byBwcmV2ZW50IHJlY3Vyc2l2ZSByZWZlcmVuY2UgZnJvbSBjYXVzaW5nIGVuZGxlc3MgbG9vcFxuICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBudWxsO1xuICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtpdGVtUmVmUG9pbnRlcl0gPSBidWlsZExheW91dEZyb21TY2hlbWEoXG4gICAgICAgICAganNmLCB3aWRnZXRMaWJyYXJ5LCBudWxsLFxuICAgICAgICAgIGl0ZW1TY2hlbWFQb2ludGVyLFxuICAgICAgICAgIGl0ZW1SZWN1cnNpdmUgPyAnJyA6IGRhdGFQb2ludGVyICsgJy8tJyxcbiAgICAgICAgICB0cnVlLCAnbGlzdCcsIHJlbW92YWJsZSwgdHJ1ZSwgaXRlbVJlY3Vyc2l2ZSA/IGRhdGFQb2ludGVyICsgJy8tJyA6ICcnXG4gICAgICAgICk7XG4gICAgICAgIGlmIChpdGVtUmVjdXJzaXZlKSB7XG4gICAgICAgICAganNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdLnJlY3Vyc2l2ZVJlZmVyZW5jZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWRkIGFueSBhZGRpdGlvbmFsIGRlZmF1bHQgaXRlbXNcbiAgICAgIGlmICghaXRlbVJlY3Vyc2l2ZSB8fCBuZXdOb2RlLm9wdGlvbnMucmVxdWlyZWQpIHtcbiAgICAgICAgY29uc3QgYXJyYXlMZW5ndGggPSBNYXRoLm1pbihNYXRoLm1heChcbiAgICAgICAgICBpdGVtUmVjdXJzaXZlID8gMCA6XG4gICAgICAgICAgICBuZXdOb2RlLm9wdGlvbnMudHVwbGVJdGVtcyArIG5ld05vZGUub3B0aW9ucy5saXN0SXRlbXMsXG4gICAgICAgICAgaXNBcnJheShub2RlVmFsdWUpID8gbm9kZVZhbHVlLmxlbmd0aCA6IDBcbiAgICAgICAgKSwgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zKTtcbiAgICAgICAgaWYgKG5ld05vZGUuaXRlbXMubGVuZ3RoIDwgYXJyYXlMZW5ndGgpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gbmV3Tm9kZS5pdGVtcy5sZW5ndGg7IGkgPCBhcnJheUxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBuZXdOb2RlLml0ZW1zLnB1c2goZ2V0TGF5b3V0Tm9kZSh7XG4gICAgICAgICAgICAgICRyZWY6IGl0ZW1SZWZQb2ludGVyLFxuICAgICAgICAgICAgICBkYXRhUG9pbnRlcjogZGF0YVBvaW50ZXIgKyAnLy0nLFxuICAgICAgICAgICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IGl0ZW1SZWN1cnNpdmUsXG4gICAgICAgICAgICB9LCBqc2YsIHdpZGdldExpYnJhcnksIGlzQXJyYXkobm9kZVZhbHVlKSA/IG5vZGVWYWx1ZVtpXSA6IG51bGwpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbmVlZGVkLCBhZGQgYnV0dG9uIHRvIGFkZCBpdGVtcyB0byBhcnJheVxuICAgICAgaWYgKG5ld05vZGUub3B0aW9ucy5hZGRhYmxlICE9PSBmYWxzZSAmJlxuICAgICAgICBuZXdOb2RlLm9wdGlvbnMubWluSXRlbXMgPCBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMgJiZcbiAgICAgICAgKG5ld05vZGUuaXRlbXNbbmV3Tm9kZS5pdGVtcy5sZW5ndGggLSAxXSB8fCB7fSkudHlwZSAhPT0gJyRyZWYnXG4gICAgICApIHtcbiAgICAgICAgbGV0IGJ1dHRvblRleHQgPVxuICAgICAgICAgICgoanNmLmxheW91dFJlZkxpYnJhcnlbaXRlbVJlZlBvaW50ZXJdIHx8IHt9KS5vcHRpb25zIHx8IHt9KS50aXRsZTtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gYnV0dG9uVGV4dCA/ICdBZGQgJyA6ICdBZGQgdG8gJztcbiAgICAgICAgaWYgKCFidXR0b25UZXh0KSB7XG4gICAgICAgICAgYnV0dG9uVGV4dCA9IHNjaGVtYS50aXRsZSB8fCBmaXhUaXRsZShKc29uUG9pbnRlci50b0tleShkYXRhUG9pbnRlcikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghL15hZGRcXGIvaS50ZXN0KGJ1dHRvblRleHQpKSB7IGJ1dHRvblRleHQgPSBwcmVmaXggKyBidXR0b25UZXh0OyB9XG4gICAgICAgIG5ld05vZGUuaXRlbXMucHVzaCh7XG4gICAgICAgICAgX2lkOiB1bmlxdWVJZCgpLFxuICAgICAgICAgIGFycmF5SXRlbTogdHJ1ZSxcbiAgICAgICAgICBhcnJheUl0ZW1UeXBlOiAnbGlzdCcsXG4gICAgICAgICAgZGF0YVBvaW50ZXI6IG5ld05vZGUuZGF0YVBvaW50ZXIgKyAnLy0nLFxuICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGxpc3RJdGVtczogbmV3Tm9kZS5vcHRpb25zLmxpc3RJdGVtcyxcbiAgICAgICAgICAgIG1heEl0ZW1zOiBuZXdOb2RlLm9wdGlvbnMubWF4SXRlbXMsXG4gICAgICAgICAgICBtaW5JdGVtczogbmV3Tm9kZS5vcHRpb25zLm1pbkl0ZW1zLFxuICAgICAgICAgICAgcmVtb3ZhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHRpdGxlOiBidXR0b25UZXh0LFxuICAgICAgICAgICAgdHVwbGVJdGVtczogbmV3Tm9kZS5vcHRpb25zLnR1cGxlSXRlbXMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IGl0ZW1SZWN1cnNpdmUsXG4gICAgICAgICAgdHlwZTogJyRyZWYnLFxuICAgICAgICAgIHdpZGdldDogd2lkZ2V0TGlicmFyeS5nZXRXaWRnZXQoJyRyZWYnKSxcbiAgICAgICAgICAkcmVmOiBpdGVtUmVmUG9pbnRlcixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gIH0gZWxzZSBpZiAobmV3Tm9kZS5kYXRhVHlwZSA9PT0gJyRyZWYnKSB7XG4gICAgY29uc3Qgc2NoZW1hUmVmID0gSnNvblBvaW50ZXIuY29tcGlsZShzY2hlbWEuJHJlZik7XG4gICAgY29uc3QgZGF0YVJlZiA9IEpzb25Qb2ludGVyLnRvRGF0YVBvaW50ZXIoc2NoZW1hUmVmLCBqc2Yuc2NoZW1hKTtcbiAgICBsZXQgYnV0dG9uVGV4dCA9ICcnO1xuXG4gICAgLy8gR2V0IG5ld05vZGUgdGl0bGVcbiAgICBpZiAobmV3Tm9kZS5vcHRpb25zLmFkZCkge1xuICAgICAgYnV0dG9uVGV4dCA9IG5ld05vZGUub3B0aW9ucy5hZGQ7XG4gICAgfSBlbHNlIGlmIChuZXdOb2RlLm5hbWUgJiYgIS9eXFxkKyQvLnRlc3QobmV3Tm9kZS5uYW1lKSkge1xuICAgICAgYnV0dG9uVGV4dCA9XG4gICAgICAgICgvXmFkZFxcYi9pLnRlc3QobmV3Tm9kZS5uYW1lKSA/ICcnIDogJ0FkZCAnKSArIGZpeFRpdGxlKG5ld05vZGUubmFtZSk7XG5cbiAgICAgIC8vIElmIG5ld05vZGUgZG9lc24ndCBoYXZlIGEgdGl0bGUsIGxvb2sgZm9yIHRpdGxlIG9mIHBhcmVudCBhcnJheSBpdGVtXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBhcmVudFNjaGVtYSA9XG4gICAgICAgIEpzb25Qb2ludGVyLmdldChqc2Yuc2NoZW1hLCBzY2hlbWFQb2ludGVyLCAwLCAtMSk7XG4gICAgICBpZiAoaGFzT3duKHBhcmVudFNjaGVtYSwgJ3RpdGxlJykpIHtcbiAgICAgICAgYnV0dG9uVGV4dCA9ICdBZGQgdG8gJyArIHBhcmVudFNjaGVtYS50aXRsZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHBvaW50ZXJBcnJheSA9IEpzb25Qb2ludGVyLnBhcnNlKG5ld05vZGUuZGF0YVBvaW50ZXIpO1xuICAgICAgICBidXR0b25UZXh0ID0gJ0FkZCB0byAnICsgZml4VGl0bGUocG9pbnRlckFycmF5W3BvaW50ZXJBcnJheS5sZW5ndGggLSAyXSk7XG4gICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5hc3NpZ24obmV3Tm9kZSwge1xuICAgICAgcmVjdXJzaXZlUmVmZXJlbmNlOiB0cnVlLFxuICAgICAgd2lkZ2V0OiB3aWRnZXRMaWJyYXJ5LmdldFdpZGdldCgnJHJlZicpLFxuICAgICAgJHJlZjogZGF0YVJlZixcbiAgICB9KTtcbiAgICBPYmplY3QuYXNzaWduKG5ld05vZGUub3B0aW9ucywge1xuICAgICAgcmVtb3ZhYmxlOiBmYWxzZSxcbiAgICAgIHRpdGxlOiBidXR0b25UZXh0LFxuICAgIH0pO1xuICAgIGlmIChpc051bWJlcihKc29uUG9pbnRlci5nZXQoanNmLnNjaGVtYSwgc2NoZW1hUG9pbnRlciwgMCwgLTEpLm1heEl0ZW1zKSkge1xuICAgICAgbmV3Tm9kZS5vcHRpb25zLm1heEl0ZW1zID1cbiAgICAgICAgSnNvblBvaW50ZXIuZ2V0KGpzZi5zY2hlbWEsIHNjaGVtYVBvaW50ZXIsIDAsIC0xKS5tYXhJdGVtcztcbiAgICB9XG5cbiAgICAvLyBBZGQgbGF5b3V0IHRlbXBsYXRlIHRvIGxheW91dFJlZkxpYnJhcnlcbiAgICBpZiAoZGF0YVJlZi5sZW5ndGgpIHtcbiAgICAgIGlmICghaGFzT3duKGpzZi5sYXlvdXRSZWZMaWJyYXJ5LCBkYXRhUmVmKSkge1xuICAgICAgICAvLyBTZXQgdG8gbnVsbCBmaXJzdCB0byBwcmV2ZW50IHJlY3Vyc2l2ZSByZWZlcmVuY2UgZnJvbSBjYXVzaW5nIGVuZGxlc3MgbG9vcFxuICAgICAgICBqc2YubGF5b3V0UmVmTGlicmFyeVtkYXRhUmVmXSA9IG51bGw7XG4gICAgICAgIGNvbnN0IG5ld0xheW91dCA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAgICBqc2YsIHdpZGdldExpYnJhcnksIG51bGwsIHNjaGVtYVJlZiwgJycsXG4gICAgICAgICAgbmV3Tm9kZS5hcnJheUl0ZW0sIG5ld05vZGUuYXJyYXlJdGVtVHlwZSwgdHJ1ZSwgdHJ1ZSwgZGF0YVBvaW50ZXJcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKG5ld0xheW91dCkge1xuICAgICAgICAgIG5ld0xheW91dC5yZWN1cnNpdmVSZWZlcmVuY2UgPSB0cnVlO1xuICAgICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2RhdGFSZWZdID0gbmV3TGF5b3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBqc2YubGF5b3V0UmVmTGlicmFyeVtkYXRhUmVmXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghanNmLmxheW91dFJlZkxpYnJhcnlbZGF0YVJlZl0ucmVjdXJzaXZlUmVmZXJlbmNlKSB7XG4gICAgICAgIGpzZi5sYXlvdXRSZWZMaWJyYXJ5W2RhdGFSZWZdLnJlY3Vyc2l2ZVJlZmVyZW5jZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXdOb2RlO1xufVxuXG4vKipcbiAqICdtYXBMYXlvdXQnIGZ1bmN0aW9uXG4gKlxuICogQ3JlYXRlcyBhIG5ldyBsYXlvdXQgYnkgcnVubmluZyBlYWNoIGVsZW1lbnQgaW4gYW4gZXhpc3RpbmcgbGF5b3V0IHRocm91Z2hcbiAqIGFuIGl0ZXJhdGVlLiBSZWN1cnNpdmVseSBtYXBzIHdpdGhpbiBhcnJheSBlbGVtZW50cyAnaXRlbXMnIGFuZCAndGFicycuXG4gKiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIGZvdXIgYXJndW1lbnRzOiAodmFsdWUsIGluZGV4LCBsYXlvdXQsIHBhdGgpXG4gKlxuICogVGhlIHJldHVybmVkIGxheW91dCBtYXkgYmUgbG9uZ2VyIChvciBzaG9ydGVyKSB0aGVuIHRoZSBzb3VyY2UgbGF5b3V0LlxuICpcbiAqIElmIGFuIGl0ZW0gZnJvbSB0aGUgc291cmNlIGxheW91dCByZXR1cm5zIG11bHRpcGxlIGl0ZW1zIChhcyAnKicgdXN1YWxseSB3aWxsKSxcbiAqIHRoaXMgZnVuY3Rpb24gd2lsbCBrZWVwIGFsbCByZXR1cm5lZCBpdGVtcyBpbi1saW5lIHdpdGggdGhlIHN1cnJvdW5kaW5nIGl0ZW1zLlxuICpcbiAqIElmIGFuIGl0ZW0gZnJvbSB0aGUgc291cmNlIGxheW91dCBjYXVzZXMgYW4gZXJyb3IgYW5kIHJldHVybnMgbnVsbCwgaXQgaXNcbiAqIHNraXBwZWQgd2l0aG91dCBlcnJvciwgYW5kIHRoZSBmdW5jdGlvbiB3aWxsIHN0aWxsIHJldHVybiBhbGwgbm9uLW51bGwgaXRlbXMuXG4gKlxuICogLy8gICBsYXlvdXQgLSB0aGUgbGF5b3V0IHRvIG1hcFxuICogLy8gIHsgKHY6IGFueSwgaT86IG51bWJlciwgbD86IGFueSwgcD86IHN0cmluZykgPT4gYW55IH1cbiAqICAgZnVuY3Rpb24gLSB0aGUgZnVuY2l0b24gdG8gaW52b2tlIG9uIGVhY2ggZWxlbWVudFxuICogLy8gIHsgc3RyaW5nfHN0cmluZ1tdID0gJycgfSBsYXlvdXRQb2ludGVyIC0gdGhlIGxheW91dFBvaW50ZXIgdG8gbGF5b3V0LCBpbnNpZGUgcm9vdExheW91dFxuICogLy8gIHsgYW55W10gPSBsYXlvdXQgfSByb290TGF5b3V0IC0gdGhlIHJvb3QgbGF5b3V0LCB3aGljaCBjb25hdGlucyBsYXlvdXRcbiAqIC8vXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBMYXlvdXQobGF5b3V0LCBmbiwgbGF5b3V0UG9pbnRlciA9ICcnLCByb290TGF5b3V0ID0gbGF5b3V0KSB7XG4gIGxldCBpbmRleFBhZCA9IDA7XG4gIGxldCBuZXdMYXlvdXQ6IGFueVtdID0gW107XG4gIGZvckVhY2gobGF5b3V0LCAoaXRlbSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCByZWFsSW5kZXggPSAraW5kZXggKyBpbmRleFBhZDtcbiAgICBjb25zdCBuZXdMYXlvdXRQb2ludGVyID0gbGF5b3V0UG9pbnRlciArICcvJyArIHJlYWxJbmRleDtcbiAgICBsZXQgbmV3Tm9kZTogYW55ID0gY29weShpdGVtKTtcbiAgICBsZXQgaXRlbXNBcnJheTogYW55W10gPSBbXTtcbiAgICBpZiAoaXNPYmplY3QoaXRlbSkpIHtcbiAgICAgIGlmIChoYXNPd24oaXRlbSwgJ3RhYnMnKSkge1xuICAgICAgICBpdGVtLml0ZW1zID0gaXRlbS50YWJzO1xuICAgICAgICBkZWxldGUgaXRlbS50YWJzO1xuICAgICAgfVxuICAgICAgaWYgKGhhc093bihpdGVtLCAnaXRlbXMnKSkge1xuICAgICAgICBpdGVtc0FycmF5ID0gaXNBcnJheShpdGVtLml0ZW1zKSA/IGl0ZW0uaXRlbXMgOiBbaXRlbS5pdGVtc107XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpdGVtc0FycmF5Lmxlbmd0aCkge1xuICAgICAgbmV3Tm9kZS5pdGVtcyA9IG1hcExheW91dChpdGVtc0FycmF5LCBmbiwgbmV3TGF5b3V0UG9pbnRlciArICcvaXRlbXMnLCByb290TGF5b3V0KTtcbiAgICB9XG4gICAgbmV3Tm9kZSA9IGZuKG5ld05vZGUsIHJlYWxJbmRleCwgbmV3TGF5b3V0UG9pbnRlciwgcm9vdExheW91dCk7XG4gICAgaWYgKCFpc0RlZmluZWQobmV3Tm9kZSkpIHtcbiAgICAgIGluZGV4UGFkLS07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc0FycmF5KG5ld05vZGUpKSB7IGluZGV4UGFkICs9IG5ld05vZGUubGVuZ3RoIC0gMTsgfVxuICAgICAgbmV3TGF5b3V0ID0gbmV3TGF5b3V0LmNvbmNhdChuZXdOb2RlKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbmV3TGF5b3V0O1xufVxuXG4vKipcbiAqICdnZXRMYXlvdXROb2RlJyBmdW5jdGlvblxuICogQ29weSBhIG5ldyBsYXlvdXROb2RlIGZyb20gbGF5b3V0UmVmTGlicmFyeVxuICpcbiAqIC8vICAgcmVmTm9kZSAtXG4gKiAvLyAgIGxheW91dFJlZkxpYnJhcnkgLVxuICogLy8gIHsgYW55ID0gbnVsbCB9IHdpZGdldExpYnJhcnkgLVxuICogLy8gIHsgYW55ID0gbnVsbCB9IG5vZGVWYWx1ZSAtXG4gKiAvLyAgY29waWVkIGxheW91dE5vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExheW91dE5vZGUoXG4gIHJlZk5vZGUsIGpzZiwgd2lkZ2V0TGlicmFyeTogYW55ID0gbnVsbCwgbm9kZVZhbHVlOiBhbnkgPSBudWxsXG4pIHtcblxuICAvLyBJZiByZWN1cnNpdmUgcmVmZXJlbmNlIGFuZCBidWlsZGluZyBpbml0aWFsIGxheW91dCwgcmV0dXJuIEFkZCBidXR0b25cbiAgaWYgKHJlZk5vZGUucmVjdXJzaXZlUmVmZXJlbmNlICYmIHdpZGdldExpYnJhcnkpIHtcbiAgICBjb25zdCBuZXdMYXlvdXROb2RlID0gY2xvbmVEZWVwKHJlZk5vZGUpO1xuICAgIGlmICghbmV3TGF5b3V0Tm9kZS5vcHRpb25zKSB7IG5ld0xheW91dE5vZGUub3B0aW9ucyA9IHt9OyB9XG4gICAgT2JqZWN0LmFzc2lnbihuZXdMYXlvdXROb2RlLCB7XG4gICAgICByZWN1cnNpdmVSZWZlcmVuY2U6IHRydWUsXG4gICAgICB3aWRnZXQ6IHdpZGdldExpYnJhcnkuZ2V0V2lkZ2V0KCckcmVmJyksXG4gICAgfSk7XG4gICAgT2JqZWN0LmFzc2lnbihuZXdMYXlvdXROb2RlLm9wdGlvbnMsIHtcbiAgICAgIHJlbW92YWJsZTogZmFsc2UsXG4gICAgICB0aXRsZTogJ0FkZCAnICsgbmV3TGF5b3V0Tm9kZS4kcmVmLFxuICAgIH0pO1xuICAgIHJldHVybiBuZXdMYXlvdXROb2RlO1xuXG4gICAgLy8gT3RoZXJ3aXNlLCByZXR1cm4gcmVmZXJlbmNlZCBsYXlvdXRcbiAgfSBlbHNlIHtcbiAgICBsZXQgbmV3TGF5b3V0Tm9kZSA9IGpzZi5sYXlvdXRSZWZMaWJyYXJ5W3JlZk5vZGUuJHJlZl07XG4gICAgLy8gSWYgdmFsdWUgZGVmaW5lZCwgYnVpbGQgbmV3IG5vZGUgZnJvbSBzY2hlbWEgKHRvIHNldCBhcnJheSBsZW5ndGhzKVxuICAgIGlmIChpc0RlZmluZWQobm9kZVZhbHVlKSkge1xuICAgICAgbmV3TGF5b3V0Tm9kZSA9IGJ1aWxkTGF5b3V0RnJvbVNjaGVtYShcbiAgICAgICAganNmLCB3aWRnZXRMaWJyYXJ5LCBub2RlVmFsdWUsXG4gICAgICAgIEpzb25Qb2ludGVyLnRvU2NoZW1hUG9pbnRlcihyZWZOb2RlLiRyZWYsIGpzZi5zY2hlbWEpLFxuICAgICAgICByZWZOb2RlLiRyZWYsIG5ld0xheW91dE5vZGUuYXJyYXlJdGVtLFxuICAgICAgICBuZXdMYXlvdXROb2RlLmFycmF5SXRlbVR5cGUsIG5ld0xheW91dE5vZGUub3B0aW9ucy5yZW1vdmFibGUsIGZhbHNlXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB2YWx1ZSBub3QgZGVmaW5lZCwgY29weSBub2RlIGZyb20gbGF5b3V0UmVmTGlicmFyeVxuICAgICAgbmV3TGF5b3V0Tm9kZSA9IGNsb25lRGVlcChuZXdMYXlvdXROb2RlKTtcbiAgICAgIEpzb25Qb2ludGVyLmZvckVhY2hEZWVwKG5ld0xheW91dE5vZGUsIChzdWJOb2RlLCBwb2ludGVyKSA9PiB7XG5cbiAgICAgICAgLy8gUmVzZXQgYWxsIF9pZCdzIGluIG5ld0xheW91dE5vZGUgdG8gdW5pcXVlIHZhbHVlc1xuICAgICAgICBpZiAoaGFzT3duKHN1Yk5vZGUsICdfaWQnKSkgeyBzdWJOb2RlLl9pZCA9IHVuaXF1ZUlkKCk7IH1cblxuICAgICAgICAvLyBJZiBhZGRpbmcgYSByZWN1cnNpdmUgaXRlbSwgcHJlZml4IGN1cnJlbnQgZGF0YVBvaW50ZXJcbiAgICAgICAgLy8gdG8gYWxsIGRhdGFQb2ludGVycyBpbiBuZXcgbGF5b3V0Tm9kZVxuICAgICAgICBpZiAocmVmTm9kZS5yZWN1cnNpdmVSZWZlcmVuY2UgJiYgaGFzT3duKHN1Yk5vZGUsICdkYXRhUG9pbnRlcicpKSB7XG4gICAgICAgICAgc3ViTm9kZS5kYXRhUG9pbnRlciA9IHJlZk5vZGUuZGF0YVBvaW50ZXIgKyBzdWJOb2RlLmRhdGFQb2ludGVyO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld0xheW91dE5vZGU7XG4gIH1cbn1cblxuLyoqXG4gKiAnYnVpbGRUaXRsZU1hcCcgZnVuY3Rpb25cbiAqXG4gKiAvLyAgIHRpdGxlTWFwIC1cbiAqIC8vICAgZW51bUxpc3QgLVxuICogLy8gIHsgYm9vbGVhbiA9IHRydWUgfSBmaWVsZFJlcXVpcmVkIC1cbiAqIC8vICB7IGJvb2xlYW4gPSB0cnVlIH0gZmxhdExpc3QgLVxuICogLy8geyBUaXRsZU1hcEl0ZW1bXSB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFRpdGxlTWFwKFxuICB0aXRsZU1hcCwgZW51bUxpc3QsIGZpZWxkUmVxdWlyZWQgPSB0cnVlLCBmbGF0TGlzdCA9IHRydWVcbikge1xuICBsZXQgbmV3VGl0bGVNYXA6IFRpdGxlTWFwSXRlbVtdID0gW107XG4gIGxldCBoYXNFbXB0eVZhbHVlID0gZmFsc2U7XG4gIGlmICh0aXRsZU1hcCkge1xuICAgIGlmIChpc0FycmF5KHRpdGxlTWFwKSkge1xuICAgICAgaWYgKGVudW1MaXN0KSB7XG4gICAgICAgIGZvciAoY29uc3QgaSBvZiBPYmplY3Qua2V5cyh0aXRsZU1hcCkpIHtcbiAgICAgICAgICBpZiAoaXNPYmplY3QodGl0bGVNYXBbaV0pKSB7IC8vIEpTT04gRm9ybSBzdHlsZVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aXRsZU1hcFtpXS52YWx1ZTtcbiAgICAgICAgICAgIGlmIChlbnVtTGlzdC5pbmNsdWRlcyh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IHRpdGxlTWFwW2ldLm5hbWU7XG4gICAgICAgICAgICAgIG5ld1RpdGxlTWFwLnB1c2goeyBuYW1lLCB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHsgaGFzRW1wdHlWYWx1ZSA9IHRydWU7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKHRpdGxlTWFwW2ldKSkgeyAvLyBSZWFjdCBKc29uc2NoZW1hIEZvcm0gc3R5bGVcbiAgICAgICAgICAgIGlmIChpIDwgZW51bUxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSB0aXRsZU1hcFtpXTtcbiAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlbnVtTGlzdFtpXTtcbiAgICAgICAgICAgICAgbmV3VGl0bGVNYXAucHVzaCh7IG5hbWUsIHZhbHVlIH0pO1xuICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkgeyBoYXNFbXB0eVZhbHVlID0gdHJ1ZTsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gSWYgYXJyYXkgdGl0bGVNYXAgYW5kIG5vIGVudW0gbGlzdCwganVzdCByZXR1cm4gdGhlIHRpdGxlTWFwIC0gQW5ndWxhciBTY2hlbWEgRm9ybSBzdHlsZVxuICAgICAgICBuZXdUaXRsZU1hcCA9IHRpdGxlTWFwO1xuICAgICAgICBpZiAoIWZpZWxkUmVxdWlyZWQpIHtcbiAgICAgICAgICBoYXNFbXB0eVZhbHVlID0gISFuZXdUaXRsZU1hcFxuICAgICAgICAgICAgLmZpbHRlcihpID0+IGkudmFsdWUgPT09IHVuZGVmaW5lZCB8fCBpLnZhbHVlID09PSBudWxsKVxuICAgICAgICAgICAgLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZW51bUxpc3QpIHsgLy8gQWx0ZXJuYXRlIEpTT04gRm9ybSBzdHlsZSwgd2l0aCBlbnVtIGxpc3RcbiAgICAgIGZvciAoY29uc3QgaSBvZiBPYmplY3Qua2V5cyhlbnVtTGlzdCkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBlbnVtTGlzdFtpXTtcbiAgICAgICAgaWYgKGhhc093bih0aXRsZU1hcCwgdmFsdWUpKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHRpdGxlTWFwW3ZhbHVlXTtcbiAgICAgICAgICBuZXdUaXRsZU1hcC5wdXNoKHsgbmFtZSwgdmFsdWUgfSk7XG4gICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHsgaGFzRW1wdHlWYWx1ZSA9IHRydWU7IH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7IC8vIEFsdGVybmF0ZSBKU09OIEZvcm0gc3R5bGUsIHdpdGhvdXQgZW51bSBsaXN0XG4gICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIE9iamVjdC5rZXlzKHRpdGxlTWFwKSkge1xuICAgICAgICBjb25zdCBuYW1lID0gdGl0bGVNYXBbdmFsdWVdO1xuICAgICAgICBuZXdUaXRsZU1hcC5wdXNoKHsgbmFtZSwgdmFsdWUgfSk7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7IGhhc0VtcHR5VmFsdWUgPSB0cnVlOyB9XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGVudW1MaXN0KSB7IC8vIEJ1aWxkIG1hcCBmcm9tIGVudW0gbGlzdCBhbG9uZVxuICAgIGZvciAoY29uc3QgaSBvZiBPYmplY3Qua2V5cyhlbnVtTGlzdCkpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSBlbnVtTGlzdFtpXTtcbiAgICAgIGNvbnN0IHZhbHVlID0gZW51bUxpc3RbaV07XG4gICAgICBuZXdUaXRsZU1hcC5wdXNoKHsgbmFtZSwgdmFsdWUgfSk7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkgeyBoYXNFbXB0eVZhbHVlID0gdHJ1ZTsgfVxuICAgIH1cbiAgfSBlbHNlIHsgLy8gSWYgbm8gdGl0bGVNYXAgYW5kIG5vIGVudW0gbGlzdCwgcmV0dXJuIGRlZmF1bHQgbWFwIG9mIGJvb2xlYW4gdmFsdWVzXG4gICAgbmV3VGl0bGVNYXAgPSBbeyBuYW1lOiAnVHJ1ZScsIHZhbHVlOiB0cnVlIH0sIHsgbmFtZTogJ0ZhbHNlJywgdmFsdWU6IGZhbHNlIH1dO1xuICB9XG5cbiAgLy8gRG9lcyB0aXRsZU1hcCBoYXZlIGdyb3Vwcz9cbiAgaWYgKG5ld1RpdGxlTWFwLnNvbWUodGl0bGUgPT4gaGFzT3duKHRpdGxlLCAnZ3JvdXAnKSkpIHtcbiAgICBoYXNFbXB0eVZhbHVlID0gZmFsc2U7XG5cbiAgICAvLyBJZiBmbGF0TGlzdCA9IHRydWUsIGZsYXR0ZW4gaXRlbXMgJiB1cGRhdGUgbmFtZSB0byBncm91cDogbmFtZVxuICAgIGlmIChmbGF0TGlzdCkge1xuICAgICAgbmV3VGl0bGVNYXAgPSBuZXdUaXRsZU1hcC5yZWR1Y2UoKGdyb3VwVGl0bGVNYXAsIHRpdGxlKSA9PiB7XG4gICAgICAgIGlmIChoYXNPd24odGl0bGUsICdncm91cCcpKSB7XG4gICAgICAgICAgaWYgKGlzQXJyYXkodGl0bGUuaXRlbXMpKSB7XG4gICAgICAgICAgICBncm91cFRpdGxlTWFwID0gW1xuICAgICAgICAgICAgICAuLi5ncm91cFRpdGxlTWFwLFxuICAgICAgICAgICAgICAuLi50aXRsZS5pdGVtcy5tYXAoaXRlbSA9PlxuICAgICAgICAgICAgICAgICh7IC4uLml0ZW0sIC4uLnsgbmFtZTogYCR7dGl0bGUuZ3JvdXB9OiAke2l0ZW0ubmFtZX1gIH0gfSlcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmICh0aXRsZS5pdGVtcy5zb21lKGl0ZW0gPT4gaXRlbS52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGl0ZW0udmFsdWUgPT09IG51bGwpKSB7XG4gICAgICAgICAgICAgIGhhc0VtcHR5VmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGFzT3duKHRpdGxlLCAnbmFtZScpICYmIGhhc093bih0aXRsZSwgJ3ZhbHVlJykpIHtcbiAgICAgICAgICAgIHRpdGxlLm5hbWUgPSBgJHt0aXRsZS5ncm91cH06ICR7dGl0bGUubmFtZX1gO1xuICAgICAgICAgICAgZGVsZXRlIHRpdGxlLmdyb3VwO1xuICAgICAgICAgICAgZ3JvdXBUaXRsZU1hcC5wdXNoKHRpdGxlKTtcbiAgICAgICAgICAgIGlmICh0aXRsZS52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHRpdGxlLnZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIGhhc0VtcHR5VmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBncm91cFRpdGxlTWFwLnB1c2godGl0bGUpO1xuICAgICAgICAgIGlmICh0aXRsZS52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHRpdGxlLnZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICBoYXNFbXB0eVZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdyb3VwVGl0bGVNYXA7XG4gICAgICB9LCBbXSk7XG5cbiAgICAgIC8vIElmIGZsYXRMaXN0ID0gZmFsc2UsIGNvbWJpbmUgaXRlbXMgZnJvbSBtYXRjaGluZyBncm91cHNcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3VGl0bGVNYXAgPSBuZXdUaXRsZU1hcC5yZWR1Y2UoKGdyb3VwVGl0bGVNYXAsIHRpdGxlKSA9PiB7XG4gICAgICAgIGlmIChoYXNPd24odGl0bGUsICdncm91cCcpKSB7XG4gICAgICAgICAgaWYgKHRpdGxlLmdyb3VwICE9PSAoZ3JvdXBUaXRsZU1hcFtncm91cFRpdGxlTWFwLmxlbmd0aCAtIDFdIHx8IHt9KS5ncm91cCkge1xuICAgICAgICAgICAgZ3JvdXBUaXRsZU1hcC5wdXNoKHsgZ3JvdXA6IHRpdGxlLmdyb3VwLCBpdGVtczogdGl0bGUuaXRlbXMgfHwgW10gfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChoYXNPd24odGl0bGUsICduYW1lJykgJiYgaGFzT3duKHRpdGxlLCAndmFsdWUnKSkge1xuICAgICAgICAgICAgZ3JvdXBUaXRsZU1hcFtncm91cFRpdGxlTWFwLmxlbmd0aCAtIDFdLml0ZW1zXG4gICAgICAgICAgICAgIC5wdXNoKHsgbmFtZTogdGl0bGUubmFtZSwgdmFsdWU6IHRpdGxlLnZhbHVlIH0pO1xuICAgICAgICAgICAgaWYgKHRpdGxlLnZhbHVlID09PSB1bmRlZmluZWQgfHwgdGl0bGUudmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgaGFzRW1wdHlWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGdyb3VwVGl0bGVNYXAucHVzaCh0aXRsZSk7XG4gICAgICAgICAgaWYgKHRpdGxlLnZhbHVlID09PSB1bmRlZmluZWQgfHwgdGl0bGUudmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGhhc0VtcHR5VmFsdWUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3JvdXBUaXRsZU1hcDtcbiAgICAgIH0sIFtdKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFmaWVsZFJlcXVpcmVkICYmICFoYXNFbXB0eVZhbHVlKSB7XG4gICAgbmV3VGl0bGVNYXAudW5zaGlmdCh7IG5hbWU6ICc8ZW0+Tm9uZTwvZW0+JywgdmFsdWU6IG51bGwgfSk7XG4gIH1cbiAgcmV0dXJuIG5ld1RpdGxlTWFwO1xufVxuIl19
