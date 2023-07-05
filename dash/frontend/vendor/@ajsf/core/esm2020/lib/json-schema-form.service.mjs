import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import Ajv from 'ajv';
import jsonDraft6 from 'ajv/lib/refs/json-schema-draft-06.json';
import { buildFormGroup, buildFormGroupTemplate, formatFormData, getControl, fixTitle, forEach, hasOwn, toTitleCase, buildLayout, getLayoutNode, buildSchemaFromData, buildSchemaFromLayout, removeRecursiveReferences, hasValue, isArray, isDefined, isEmpty, isObject, JsonPointer } from './shared/index.mjs';
import { deValidationMessages, enValidationMessages, esValidationMessages, frValidationMessages, itValidationMessages, ptValidationMessages, zhValidationMessages } from './locale/index.mjs';
import * as i0 from "@angular/core";
export class JsonSchemaFormService {
    constructor() {
        this.JsonFormCompatibility = false;
        this.ReactJsonSchemaFormCompatibility = false;
        this.AngularSchemaFormCompatibility = false;
        this.tpldata = {};
        this.ajvOptions = {
            allErrors: true,
            jsonPointers: true,
            unknownFormats: 'ignore'
        };
        this.ajv = new Ajv(this.ajvOptions); // AJV: Another JSON Schema Validator
        this.validateFormData = null; // Compiled AJV function to validate active form's schema
        this.formValues = {}; // Internal form data (may not have correct types)
        this.data = {}; // Output form data (formValues, formatted with correct data types)
        this.schema = {}; // Internal JSON Schema
        this.layout = []; // Internal form layout
        this.formGroupTemplate = {}; // Template used to create formGroup
        this.formGroup = null; // Angular formGroup, which powers the reactive form
        this.framework = null; // Active framework component
        this.validData = null; // Valid form data (or null) (=== isValid ? data : null)
        this.isValid = null; // Is current form data valid?
        this.ajvErrors = null; // Ajv errors for current data
        this.validationErrors = null; // Any validation errors for current data
        this.dataErrors = new Map(); //
        this.formValueSubscription = null; // Subscription to formGroup.valueChanges observable (for un- and re-subscribing)
        this.dataChanges = new Subject(); // Form data observable
        this.isValidChanges = new Subject(); // isValid observable
        this.validationErrorChanges = new Subject(); // validationErrors observable
        this.arrayMap = new Map(); // Maps arrays in data object and number of tuple values
        this.dataMap = new Map(); // Maps paths in form data to schema and formGroup paths
        this.dataRecursiveRefMap = new Map(); // Maps recursive reference points in form data
        this.schemaRecursiveRefMap = new Map(); // Maps recursive reference points in schema
        this.schemaRefLibrary = {}; // Library of schemas for resolving schema $refs
        this.layoutRefLibrary = { '': null }; // Library of layout nodes for adding to form
        this.templateRefLibrary = {}; // Library of formGroup templates for adding to form
        this.hasRootReference = false; // Does the form include a recursive reference to itself?
        this.language = 'en-US'; // Does the form include a recursive reference to itself?
        // Default global form options
        this.defaultFormOptions = {
            autocomplete: true,
            addSubmit: 'auto',
            // for addSubmit: true = always, false = never,
            // 'auto' = only if layout is undefined (form is built from schema alone)
            debug: false,
            disableInvalidSubmit: true,
            formDisabled: false,
            formReadonly: false,
            fieldsRequired: false,
            framework: 'no-framework',
            loadExternalAssets: false,
            pristine: { errors: true, success: true },
            supressPropertyTitles: false,
            setSchemaDefaults: 'auto',
            // true = always set (unless overridden by layout default or formValues)
            // false = never set
            // 'auto' = set in addable components, and everywhere if formValues not set
            setLayoutDefaults: 'auto',
            // true = always set (unless overridden by formValues)
            // false = never set
            // 'auto' = set in addable components, and everywhere if formValues not set
            validateOnRender: 'auto',
            // true = validate all fields immediately
            // false = only validate fields after they are touched by user
            // 'auto' = validate fields with values immediately, empty fields after they are touched
            widgets: {},
            defautWidgetOptions: {
                // Default options for form control widgets
                listItems: 1,
                addable: true,
                orderable: true,
                removable: true,
                enableErrorState: true,
                // disableErrorState: false, // Don't apply 'has-error' class when field fails validation?
                enableSuccessState: true,
                // disableSuccessState: false, // Don't apply 'has-success' class when field validates?
                feedback: false,
                feedbackOnRender: false,
                notitle: false,
                disabled: false,
                readonly: false,
                returnEmptyFields: true,
                validationMessages: {} // set by setLanguage()
            }
        };
        this.setLanguage(this.language);
        this.ajv.addMetaSchema(jsonDraft6);
    }
    setLanguage(language = 'en-US') {
        this.language = language;
        const languageValidationMessages = {
            de: deValidationMessages,
            en: enValidationMessages,
            es: esValidationMessages,
            fr: frValidationMessages,
            it: itValidationMessages,
            pt: ptValidationMessages,
            zh: zhValidationMessages,
        };
        const languageCode = language.slice(0, 2);
        const validationMessages = languageValidationMessages[languageCode];
        this.defaultFormOptions.defautWidgetOptions.validationMessages = cloneDeep(validationMessages);
    }
    getData() {
        return this.data;
    }
    getSchema() {
        return this.schema;
    }
    getLayout() {
        return this.layout;
    }
    resetAllValues() {
        this.JsonFormCompatibility = false;
        this.ReactJsonSchemaFormCompatibility = false;
        this.AngularSchemaFormCompatibility = false;
        this.tpldata = {};
        this.validateFormData = null;
        this.formValues = {};
        this.schema = {};
        this.layout = [];
        this.formGroupTemplate = {};
        this.formGroup = null;
        this.framework = null;
        this.data = {};
        this.validData = null;
        this.isValid = null;
        this.validationErrors = null;
        this.arrayMap = new Map();
        this.dataMap = new Map();
        this.dataRecursiveRefMap = new Map();
        this.schemaRecursiveRefMap = new Map();
        this.layoutRefLibrary = {};
        this.schemaRefLibrary = {};
        this.templateRefLibrary = {};
        this.formOptions = cloneDeep(this.defaultFormOptions);
    }
    /**
     * 'buildRemoteError' function
     *
     * Example errors:
     * {
     *   last_name: [ {
     *     message: 'Last name must by start with capital letter.',
     *     code: 'capital_letter'
     *   } ],
     *   email: [ {
     *     message: 'Email must be from example.com domain.',
     *     code: 'special_domain'
     *   }, {
     *     message: 'Email must contain an @ symbol.',
     *     code: 'at_symbol'
     *   } ]
     * }
     * //{ErrorMessages} errors
     */
    buildRemoteError(errors) {
        forEach(errors, (value, key) => {
            if (key in this.formGroup.controls) {
                for (const error of value) {
                    const err = {};
                    err[error['code']] = error['message'];
                    this.formGroup.get(key).setErrors(err, { emitEvent: true });
                }
            }
        });
    }
    validateData(newValue, updateSubscriptions = true) {
        // Format raw form data to correct data types
        this.data = formatFormData(newValue, this.dataMap, this.dataRecursiveRefMap, this.arrayMap, this.formOptions.returnEmptyFields);
        this.isValid = this.validateFormData(this.data);
        this.validData = this.isValid ? this.data : null;
        const compileErrors = errors => {
            const compiledErrors = {};
            (errors || []).forEach(error => {
                if (!compiledErrors[error.dataPath]) {
                    compiledErrors[error.dataPath] = [];
                }
                compiledErrors[error.dataPath].push(error.message);
            });
            return compiledErrors;
        };
        this.ajvErrors = this.validateFormData.errors;
        this.validationErrors = compileErrors(this.validateFormData.errors);
        if (updateSubscriptions) {
            this.dataChanges.next(this.data);
            this.isValidChanges.next(this.isValid);
            this.validationErrorChanges.next(this.ajvErrors);
        }
    }
    buildFormGroupTemplate(formValues = null, setValues = true) {
        this.formGroupTemplate = buildFormGroupTemplate(this, formValues, setValues);
    }
    buildFormGroup() {
        this.formGroup = buildFormGroup(this.formGroupTemplate);
        if (this.formGroup) {
            this.compileAjvSchema();
            this.validateData(this.formGroup.value);
            // Set up observables to emit data and validation info when form data changes
            if (this.formValueSubscription) {
                this.formValueSubscription.unsubscribe();
            }
            this.formValueSubscription = this.formGroup.valueChanges.subscribe(formValue => this.validateData(formValue));
        }
    }
    buildLayout(widgetLibrary) {
        this.layout = buildLayout(this, widgetLibrary);
    }
    setOptions(newOptions) {
        if (isObject(newOptions)) {
            const addOptions = cloneDeep(newOptions);
            // Backward compatibility for 'defaultOptions' (renamed 'defautWidgetOptions')
            if (isObject(addOptions.defaultOptions)) {
                Object.assign(this.formOptions.defautWidgetOptions, addOptions.defaultOptions);
                delete addOptions.defaultOptions;
            }
            if (isObject(addOptions.defautWidgetOptions)) {
                Object.assign(this.formOptions.defautWidgetOptions, addOptions.defautWidgetOptions);
                delete addOptions.defautWidgetOptions;
            }
            Object.assign(this.formOptions, addOptions);
            // convert disableErrorState / disableSuccessState to enable...
            const globalDefaults = this.formOptions.defautWidgetOptions;
            ['ErrorState', 'SuccessState']
                .filter(suffix => hasOwn(globalDefaults, 'disable' + suffix))
                .forEach(suffix => {
                globalDefaults['enable' + suffix] = !globalDefaults['disable' + suffix];
                delete globalDefaults['disable' + suffix];
            });
        }
    }
    compileAjvSchema() {
        if (!this.validateFormData) {
            // if 'ui:order' exists in properties, move it to root before compiling with ajv
            if (Array.isArray(this.schema.properties['ui:order'])) {
                this.schema['ui:order'] = this.schema.properties['ui:order'];
                delete this.schema.properties['ui:order'];
            }
            this.ajv.removeSchema(this.schema);
            this.validateFormData = this.ajv.compile(this.schema);
        }
    }
    buildSchemaFromData(data, requireAllFields = false) {
        if (data) {
            return buildSchemaFromData(data, requireAllFields);
        }
        this.schema = buildSchemaFromData(this.formValues, requireAllFields);
    }
    buildSchemaFromLayout(layout) {
        if (layout) {
            return buildSchemaFromLayout(layout);
        }
        this.schema = buildSchemaFromLayout(this.layout);
    }
    setTpldata(newTpldata = {}) {
        this.tpldata = newTpldata;
    }
    parseText(text = '', value = {}, values = {}, key = null) {
        if (!text || !/{{.+?}}/.test(text)) {
            return text;
        }
        return text.replace(/{{(.+?)}}/g, (...a) => this.parseExpression(a[1], value, values, key, this.tpldata));
    }
    parseExpression(expression = '', value = {}, values = {}, key = null, tpldata = null) {
        if (typeof expression !== 'string') {
            return '';
        }
        const index = typeof key === 'number' ? key + 1 + '' : key || '';
        expression = expression.trim();
        if ((expression[0] === "'" || expression[0] === '"') &&
            expression[0] === expression[expression.length - 1] &&
            expression.slice(1, expression.length - 1).indexOf(expression[0]) === -1) {
            return expression.slice(1, expression.length - 1);
        }
        if (expression === 'idx' || expression === '$index') {
            return index;
        }
        if (expression === 'value' && !hasOwn(values, 'value')) {
            return value;
        }
        if (['"', "'", ' ', '||', '&&', '+'].every(delim => expression.indexOf(delim) === -1)) {
            const pointer = JsonPointer.parseObjectPath(expression);
            return pointer[0] === 'value' && JsonPointer.has(value, pointer.slice(1))
                ? JsonPointer.get(value, pointer.slice(1))
                : pointer[0] === 'values' && JsonPointer.has(values, pointer.slice(1))
                    ? JsonPointer.get(values, pointer.slice(1))
                    : pointer[0] === 'tpldata' && JsonPointer.has(tpldata, pointer.slice(1))
                        ? JsonPointer.get(tpldata, pointer.slice(1))
                        : JsonPointer.has(values, pointer)
                            ? JsonPointer.get(values, pointer)
                            : '';
        }
        if (expression.indexOf('[idx]') > -1) {
            expression = expression.replace(/\[idx\]/g, index);
        }
        if (expression.indexOf('[$index]') > -1) {
            expression = expression.replace(/\[$index\]/g, index);
        }
        // TODO: Improve expression evaluation by parsing quoted strings first
        // let expressionArray = expression.match(/([^"']+|"[^"]+"|'[^']+')/g);
        if (expression.indexOf('||') > -1) {
            return expression
                .split('||')
                .reduce((all, term) => all || this.parseExpression(term, value, values, key, tpldata), '');
        }
        if (expression.indexOf('&&') > -1) {
            return expression
                .split('&&')
                .reduce((all, term) => all && this.parseExpression(term, value, values, key, tpldata), ' ')
                .trim();
        }
        if (expression.indexOf('+') > -1) {
            return expression
                .split('+')
                .map(term => this.parseExpression(term, value, values, key, tpldata))
                .join('');
        }
        return '';
    }
    setArrayItemTitle(parentCtx = {}, childNode = null, index = null) {
        const parentNode = parentCtx.layoutNode;
        const parentValues = this.getFormControlValue(parentCtx);
        const isArrayItem = (parentNode.type || '').slice(-5) === 'array' && isArray(parentValues);
        const text = JsonPointer.getFirst(isArrayItem && childNode.type !== '$ref'
            ? [
                [childNode, '/options/legend'],
                [childNode, '/options/title'],
                [parentNode, '/options/title'],
                [parentNode, '/options/legend']
            ]
            : [
                [childNode, '/options/title'],
                [childNode, '/options/legend'],
                [parentNode, '/options/title'],
                [parentNode, '/options/legend']
            ]);
        if (!text) {
            return text;
        }
        const childValue = isArray(parentValues) && index < parentValues.length
            ? parentValues[index]
            : parentValues;
        return this.parseText(text, childValue, parentValues, index);
    }
    setItemTitle(ctx) {
        return !ctx.options.title && /^(\d+|-)$/.test(ctx.layoutNode.name)
            ? null
            : this.parseText(ctx.options.title || toTitleCase(ctx.layoutNode.name), this.getFormControlValue(this), (this.getFormControlGroup(this) || {}).value, ctx.dataIndex[ctx.dataIndex.length - 1]);
    }
    evaluateCondition(layoutNode, dataIndex) {
        const arrayIndex = dataIndex && dataIndex[dataIndex.length - 1];
        let result = true;
        if (hasValue((layoutNode.options || {}).condition)) {
            if (typeof layoutNode.options.condition === 'string') {
                let pointer = layoutNode.options.condition;
                if (hasValue(arrayIndex)) {
                    pointer = pointer.replace('[arrayIndex]', `[${arrayIndex}]`);
                }
                pointer = JsonPointer.parseObjectPath(pointer);
                result = !!JsonPointer.get(this.data, pointer);
                if (!result && pointer[0] === 'model') {
                    result = !!JsonPointer.get({ model: this.data }, pointer);
                }
            }
            else if (typeof layoutNode.options.condition === 'function') {
                result = layoutNode.options.condition(this.data);
            }
            else if (typeof layoutNode.options.condition.functionBody === 'string') {
                try {
                    const dynFn = new Function('model', 'arrayIndices', layoutNode.options.condition.functionBody);
                    result = dynFn(this.data, dataIndex);
                }
                catch (e) {
                    result = true;
                    console.error('condition functionBody errored out on evaluation: ' +
                        layoutNode.options.condition.functionBody);
                }
            }
        }
        return result;
    }
    initializeControl(ctx, bind = true) {
        if (!isObject(ctx)) {
            return false;
        }
        if (isEmpty(ctx.options)) {
            ctx.options = !isEmpty((ctx.layoutNode || {}).options)
                ? ctx.layoutNode.options
                : cloneDeep(this.formOptions);
        }
        ctx.formControl = this.getFormControl(ctx);
        ctx.boundControl = bind && !!ctx.formControl;
        if (ctx.formControl) {
            ctx.controlName = this.getFormControlName(ctx);
            ctx.controlValue = ctx.formControl.value;
            ctx.controlDisabled = ctx.formControl.disabled;
            ctx.options.errorMessage =
                ctx.formControl.status === 'VALID'
                    ? null
                    : this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages);
            ctx.options.showErrors =
                this.formOptions.validateOnRender === true ||
                    (this.formOptions.validateOnRender === 'auto' &&
                        hasValue(ctx.controlValue));
            ctx.formControl.statusChanges.subscribe(status => (ctx.options.errorMessage =
                status === 'VALID'
                    ? null
                    : this.formatErrors(ctx.formControl.errors, ctx.options.validationMessages)));
            ctx.formControl.valueChanges.subscribe(value => {
                if (!!value) {
                    ctx.controlValue = value;
                }
            });
        }
        else {
            ctx.controlName = ctx.layoutNode.name;
            ctx.controlValue = ctx.layoutNode.value || null;
            const dataPointer = this.getDataPointer(ctx);
            if (bind && dataPointer) {
                console.error(`warning: control "${dataPointer}" is not bound to the Angular FormGroup.`);
            }
        }
        return ctx.boundControl;
    }
    formatErrors(errors, validationMessages = {}) {
        if (isEmpty(errors)) {
            return null;
        }
        if (!isObject(validationMessages)) {
            validationMessages = {};
        }
        const addSpaces = string => string[0].toUpperCase() +
            (string.slice(1) || '')
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/_/g, ' ');
        const formatError = error => typeof error === 'object'
            ? Object.keys(error)
                .map(key => error[key] === true
                ? addSpaces(key)
                : error[key] === false
                    ? 'Not ' + addSpaces(key)
                    : addSpaces(key) + ': ' + formatError(error[key]))
                .join(', ')
            : addSpaces(error.toString());
        const messages = [];
        return (Object.keys(errors)
            // Hide 'required' error, unless it is the only one
            .filter(errorKey => errorKey !== 'required' || Object.keys(errors).length === 1)
            .map(errorKey =>
        // If validationMessages is a string, return it
        typeof validationMessages === 'string'
            ? validationMessages
            : // If custom error message is a function, return function result
                typeof validationMessages[errorKey] === 'function'
                    ? validationMessages[errorKey](errors[errorKey])
                    : // If custom error message is a string, replace placeholders and return
                        typeof validationMessages[errorKey] === 'string'
                            ? // Does error message have any {{property}} placeholders?
                                !/{{.+?}}/.test(validationMessages[errorKey])
                                    ? validationMessages[errorKey]
                                    : // Replace {{property}} placeholders with values
                                        Object.keys(errors[errorKey]).reduce((errorMessage, errorProperty) => errorMessage.replace(new RegExp('{{' + errorProperty + '}}', 'g'), errors[errorKey][errorProperty]), validationMessages[errorKey])
                            : // If no custom error message, return formatted error data instead
                                addSpaces(errorKey) + ' Error: ' + formatError(errors[errorKey]))
            .join('<br>'));
    }
    updateValue(ctx, value) {
        // Set value of current control
        ctx.controlValue = value;
        if (ctx.boundControl) {
            ctx.formControl.setValue(value);
            ctx.formControl.markAsDirty();
        }
        ctx.layoutNode.value = value;
        // Set values of any related controls in copyValueTo array
        if (isArray(ctx.options.copyValueTo)) {
            for (const item of ctx.options.copyValueTo) {
                const targetControl = getControl(this.formGroup, item);
                if (isObject(targetControl) &&
                    typeof targetControl.setValue === 'function') {
                    targetControl.setValue(value);
                    targetControl.markAsDirty();
                }
            }
        }
    }
    updateArrayCheckboxList(ctx, checkboxList) {
        const formArray = this.getFormControl(ctx);
        // Remove all existing items
        while (formArray.value.length) {
            formArray.removeAt(0);
        }
        // Re-add an item for each checked box
        const refPointer = removeRecursiveReferences(ctx.layoutNode.dataPointer + '/-', this.dataRecursiveRefMap, this.arrayMap);
        for (const checkboxItem of checkboxList) {
            if (checkboxItem.checked) {
                const newFormControl = buildFormGroup(this.templateRefLibrary[refPointer]);
                newFormControl.setValue(checkboxItem.value);
                formArray.push(newFormControl);
            }
        }
        formArray.markAsDirty();
    }
    getFormControl(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            ctx.layoutNode.type === '$ref') {
            return null;
        }
        return getControl(this.formGroup, this.getDataPointer(ctx));
    }
    getFormControlValue(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            ctx.layoutNode.type === '$ref') {
            return null;
        }
        const control = getControl(this.formGroup, this.getDataPointer(ctx));
        return control ? control.value : null;
    }
    getFormControlGroup(ctx) {
        if (!ctx.layoutNode || !isDefined(ctx.layoutNode.dataPointer)) {
            return null;
        }
        return getControl(this.formGroup, this.getDataPointer(ctx), true);
    }
    getFormControlName(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex)) {
            return null;
        }
        return JsonPointer.toKey(this.getDataPointer(ctx));
    }
    getLayoutArray(ctx) {
        return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -1);
    }
    getParentNode(ctx) {
        return JsonPointer.get(this.layout, this.getLayoutPointer(ctx), 0, -2);
    }
    getDataPointer(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex)) {
            return null;
        }
        return JsonPointer.toIndexedPointer(ctx.layoutNode.dataPointer, ctx.dataIndex, this.arrayMap);
    }
    getLayoutPointer(ctx) {
        if (!hasValue(ctx.layoutIndex)) {
            return null;
        }
        return '/' + ctx.layoutIndex.join('/items/');
    }
    isControlBound(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex)) {
            return false;
        }
        const controlGroup = this.getFormControlGroup(ctx);
        const name = this.getFormControlName(ctx);
        return controlGroup ? hasOwn(controlGroup.controls, name) : false;
    }
    addItem(ctx, name) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.$ref) ||
            !hasValue(ctx.dataIndex) ||
            !hasValue(ctx.layoutIndex)) {
            return false;
        }
        // Create a new Angular form control from a template in templateRefLibrary
        const newFormGroup = buildFormGroup(this.templateRefLibrary[ctx.layoutNode.$ref]);
        // Add the new form control to the parent formArray or formGroup
        if (ctx.layoutNode.arrayItem) {
            // Add new array item to formArray
            this.getFormControlGroup(ctx).push(newFormGroup);
        }
        else {
            // Add new $ref item to formGroup
            this.getFormControlGroup(ctx).addControl(name || this.getFormControlName(ctx), newFormGroup);
        }
        // Copy a new layoutNode from layoutRefLibrary
        const newLayoutNode = getLayoutNode(ctx.layoutNode, this);
        newLayoutNode.arrayItem = ctx.layoutNode.arrayItem;
        if (ctx.layoutNode.arrayItemType) {
            newLayoutNode.arrayItemType = ctx.layoutNode.arrayItemType;
        }
        else {
            delete newLayoutNode.arrayItemType;
        }
        if (name) {
            newLayoutNode.name = name;
            newLayoutNode.dataPointer += '/' + JsonPointer.escape(name);
            newLayoutNode.options.title = fixTitle(name);
        }
        // Add the new layoutNode to the form layout
        JsonPointer.insert(this.layout, this.getLayoutPointer(ctx), newLayoutNode);
        return true;
    }
    moveArrayItem(ctx, oldIndex, newIndex) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex) ||
            !hasValue(ctx.layoutIndex) ||
            !isDefined(oldIndex) ||
            !isDefined(newIndex) ||
            oldIndex === newIndex) {
            return false;
        }
        // Move item in the formArray
        const formArray = this.getFormControlGroup(ctx);
        const arrayItem = formArray.at(oldIndex);
        formArray.removeAt(oldIndex);
        formArray.insert(newIndex, arrayItem);
        formArray.updateValueAndValidity();
        // Move layout item
        const layoutArray = this.getLayoutArray(ctx);
        layoutArray.splice(newIndex, 0, layoutArray.splice(oldIndex, 1)[0]);
        return true;
    }
    removeItem(ctx) {
        if (!ctx.layoutNode ||
            !isDefined(ctx.layoutNode.dataPointer) ||
            !hasValue(ctx.dataIndex) ||
            !hasValue(ctx.layoutIndex)) {
            return false;
        }
        // Remove the Angular form control from the parent formArray or formGroup
        if (ctx.layoutNode.arrayItem) {
            // Remove array item from formArray
            this.getFormControlGroup(ctx).removeAt(ctx.dataIndex[ctx.dataIndex.length - 1]);
        }
        else {
            // Remove $ref item from formGroup
            this.getFormControlGroup(ctx).removeControl(this.getFormControlName(ctx));
        }
        // Remove layoutNode from layout
        JsonPointer.remove(this.layout, this.getLayoutPointer(ctx));
        return true;
    }
}
JsonSchemaFormService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
JsonSchemaFormService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormService, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvYWpzZi1jb3JlL3NyYy9saWIvanNvbi1zY2hlbWEtZm9ybS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQixPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDdEIsT0FBTyxVQUFVLE1BQU0sd0NBQXdDLENBQUM7QUFDaEUsT0FBTyxFQUNMLGNBQWMsRUFDZCxzQkFBc0IsRUFDdEIsY0FBYyxFQUNkLFVBQVUsRUFDVixRQUFRLEVBQ1IsT0FBTyxFQUNQLE1BQU0sRUFDTixXQUFXLEVBQ1gsV0FBVyxFQUNYLGFBQWEsRUFDYixtQkFBbUIsRUFDbkIscUJBQXFCLEVBQ3JCLHlCQUF5QixFQUN6QixRQUFRLEVBQ1IsT0FBTyxFQUNQLFNBQVMsRUFDVCxPQUFPLEVBQ1AsUUFBUSxFQUNSLFdBQVcsRUFDWixNQUFNLFVBQVUsQ0FBQztBQUNsQixPQUFPLEVBQ0wsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3JCLE1BQU0sVUFBVSxDQUFDOztBQWtCbEIsTUFBTSxPQUFPLHFCQUFxQjtJQTRGaEM7UUEzRkEsMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBQzlCLHFDQUFnQyxHQUFHLEtBQUssQ0FBQztRQUN6QyxtQ0FBOEIsR0FBRyxLQUFLLENBQUM7UUFDdkMsWUFBTyxHQUFRLEVBQUUsQ0FBQztRQUVsQixlQUFVLEdBQVE7WUFDaEIsU0FBUyxFQUFFLElBQUk7WUFDZixZQUFZLEVBQUUs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Q0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUUsQ0FBQyxhQUFhLENBQzdELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FDN0IsQ0FBQztTQUNIO1FBRUQsZ0NBQWdDO1FBQ2hDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1RCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7O2tIQTV6QlUscUJBQXFCO3NIQUFyQixxQkFBcUI7MkZBQXJCLHFCQUFxQjtrQkFEakMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFic3RyYWN0Q29udHJvbCwgVW50eXBlZEZvcm1BcnJheSwgVW50eXBlZEZvcm1Hcm91cCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCc7XG5pbXBvcnQgQWp2IGZyb20gJ2Fqdic7XG5pbXBvcnQganNvbkRyYWZ0NiBmcm9tICdhanYvbGliL3JlZnMvanNvbi1zY2hlbWEtZHJhZnQtMDYuanNvbic7XG5pbXBvcnQge1xuICBidWlsZEZvcm1Hcm91cCxcbiAgYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZSxcbiAgZm9ybWF0Rm9ybURhdGEsXG4gIGdldENvbnRyb2wsXG4gIGZpeFRpdGxlLFxuICBmb3JFYWNoLFxuICBoYXNPd24sXG4gIHRvVGl0bGVDYXNlLFxuICBidWlsZExheW91dCxcbiAgZ2V0TGF5b3V0Tm9kZSxcbiAgYnVpbGRTY2hlbWFGcm9tRGF0YSxcbiAgYnVpbGRTY2hlbWFGcm9tTGF5b3V0LFxuICByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzLFxuICBoYXNWYWx1ZSxcbiAgaXNBcnJheSxcbiAgaXNEZWZpbmVkLFxuICBpc0VtcHR5LFxuICBpc09iamVjdCxcbiAgSnNvblBvaW50ZXJcbn0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtcbiAgZGVWYWxpZGF0aW9uTWVzc2FnZXMsXG4gIGVuVmFsaWRhdGlvbk1lc3NhZ2VzLFxuICBlc1ZhbGlkYXRpb25NZXNzYWdlcyxcbiAgZnJWYWxpZGF0aW9uTWVzc2FnZXMsXG4gIGl0VmFsaWRhdGlvbk1lc3NhZ2VzLFxuICBwdFZhbGlkYXRpb25NZXNzYWdlcyxcbiAgemhWYWxpZGF0aW9uTWVzc2FnZXNcbn0gZnJvbSAnLi9sb2NhbGUnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgVGl0bGVNYXBJdGVtIHtcbiAgbmFtZT86IHN0cmluZztcbiAgdmFsdWU/OiBhbnk7XG4gIGNoZWNrZWQ/OiBib29sZWFuO1xuICBncm91cD86IHN0cmluZztcbiAgaXRlbXM/OiBUaXRsZU1hcEl0ZW1bXTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRXJyb3JNZXNzYWdlcyB7XG4gIFtjb250cm9sX25hbWU6IHN0cmluZ106IHtcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCBGdW5jdGlvbiB8IE9iamVjdDtcbiAgICBjb2RlOiBzdHJpbmc7XG4gIH1bXTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEpzb25TY2hlbWFGb3JtU2VydmljZSB7XG4gIEpzb25Gb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICBSZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICBBbmd1bGFyU2NoZW1hRm9ybUNvbXBhdGliaWxpdHkgPSBmYWxzZTtcbiAgdHBsZGF0YTogYW55ID0ge307XG5cbiAgYWp2T3B0aW9uczogYW55ID0ge1xuICAgIGFsbEVycm9yczogdHJ1ZSxcbiAgICBqc29uUG9pbnRlcnM6IHRydWUsXG4gICAgdW5rbm93bkZvcm1hdHM6ICdpZ25vcmUnXG4gIH07XG4gIGFqdjogYW55ID0gbmV3IEFqdih0aGlzLmFqdk9wdGlvbnMpOyAvLyBBSlY6IEFub3RoZXIgSlNPTiBTY2hlbWEgVmFsaWRhdG9yXG4gIHZhbGlkYXRlRm9ybURhdGE6IGFueSA9IG51bGw7IC8vIENvbXBpbGVkIEFKViBmdW5jdGlvbiB0byB2YWxpZGF0ZSBhY3RpdmUgZm9ybSdzIHNjaGVtYVxuXG4gIGZvcm1WYWx1ZXM6IGFueSA9IHt9OyAvLyBJbnRlcm5hbCBmb3JtIGRhdGEgKG1heSBub3QgaGF2ZSBjb3JyZWN0IHR5cGVzKVxuICBkYXRhOiBhbnkgPSB7fTsgLy8gT3V0cHV0IGZvcm0gZGF0YSAoZm9ybVZhbHVlcywgZm9ybWF0dGVkIHdpdGggY29ycmVjdCBkYXRhIHR5cGVzKVxuICBzY2hlbWE6IGFueSA9IHt9OyAvLyBJbnRlcm5hbCBKU09OIFNjaGVtYVxuICBsYXlvdXQ6IGFueVtdID0gW107IC8vIEludGVybmFsIGZvcm0gbGF5b3V0XG4gIGZvcm1Hcm91cFRlbXBsYXRlOiBhbnkgPSB7fTsgLy8gVGVtcGxhdGUgdXNlZCB0byBjcmVhdGUgZm9ybUdyb3VwXG4gIGZvcm1Hcm91cDogYW55ID0gbnVsbDsgLy8gQW5ndWxhciBmb3JtR3JvdXAsIHdoaWNoIHBvd2VycyB0aGUgcmVhY3RpdmUgZm9ybVxuICBmcmFtZXdvcms6IGFueSA9IG51bGw7IC8vIEFjdGl2ZSBmcmFtZXdvcmsgY29tcG9uZW50XG4gIGZvcm1PcHRpb25zOiBhbnk7IC8vIEFjdGl2ZSBvcHRpb25zLCB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZm9ybVxuXG4gIHZhbGlkRGF0YTogYW55ID0gbnVsbDsgLy8gVmFsaWQgZm9ybSBkYXRhIChvciBudWxsKSAoPT09IGlzVmFsaWQgPyBkYXRhIDogbnVsbClcbiAgaXNWYWxpZDogYm9vbGVhbiA9IG51bGw7IC8vIElzIGN1cnJlbnQgZm9ybSBkYXRhIHZhbGlkP1xuICBhanZFcnJvcnM6IGFueSA9IG51bGw7IC8vIEFqdiBlcnJvcnMgZm9yIGN1cnJlbnQgZGF0YVxuICB2YWxpZGF0aW9uRXJyb3JzOiBhbnkgPSBudWxsOyAvLyBBbnkgdmFsaWRhdGlvbiBlcnJvcnMgZm9yIGN1cnJlbnQgZGF0YVxuICBkYXRhRXJyb3JzOiBhbnkgPSBuZXcgTWFwKCk7IC8vXG4gIGZvcm1WYWx1ZVN1YnNjcmlwdGlvbjogYW55ID0gbnVsbDsgLy8gU3Vic2NyaXB0aW9uIHRvIGZvcm1Hcm91cC52YWx1ZUNoYW5nZXMgb2JzZXJ2YWJsZSAoZm9yIHVuLSBhbmQgcmUtc3Vic2NyaWJpbmcpXG4gIGRhdGFDaGFuZ2VzOiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdCgpOyAvLyBGb3JtIGRhdGEgb2JzZXJ2YWJsZVxuICBpc1ZhbGlkQ2hhbmdlczogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3QoKTsgLy8gaXNWYWxpZCBvYnNlcnZhYmxlXG4gIHZhbGlkYXRpb25FcnJvckNoYW5nZXM6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0KCk7IC8vIHZhbGlkYXRpb25FcnJvcnMgb2JzZXJ2YWJsZVxuXG4gIGFycmF5TWFwOiBNYXA8c3RyaW5nLCBudW1iZXI+ID0gbmV3IE1hcCgpOyAvLyBNYXBzIGFycmF5cyBpbiBkYXRhIG9iamVjdCBhbmQgbnVtYmVyIG9mIHR1cGxlIHZhbHVlc1xuICBkYXRhTWFwOiBNYXA8c3RyaW5nLCBhbnk+ID0gbmV3IE1hcCgpOyAvLyBNYXBzIHBhdGhzIGluIGZvcm0gZGF0YSB0byBzY2hlbWEgYW5kIGZvcm1Hcm91cCBwYXRoc1xuICBkYXRhUmVjdXJzaXZlUmVmTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+ID0gbmV3IE1hcCgpOyAvLyBNYXBzIHJlY3Vyc2l2ZSByZWZlcmVuY2UgcG9pbnRzIGluIGZvcm0gZGF0YVxuICBzY2hlbWFSZWN1cnNpdmVSZWZNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7IC8vIE1hcHMgcmVjdXJzaXZlIHJlZmVyZW5jZSBwb2ludHMgaW4gc2NoZW1hXG4gIHNjaGVtYVJlZkxpYnJhcnk6IGFueSA9IHt9OyAvLyBMaWJyYXJ5IG9mIHNjaGVtYXMgZm9yIHJlc29sdmluZyBzY2hlbWEgJHJlZnNcbiAgbGF5b3V0UmVmTGlicmFyeTogYW55ID0geyAnJzogbnVsbCB9OyAvLyBMaWJyYXJ5IG9mIGxheW91dCBub2RlcyBmb3IgYWRkaW5nIHRvIGZvcm1cbiAgdGVtcGxhdGVSZWZMaWJyYXJ5OiBhbnkgPSB7fTsgLy8gTGlicmFyeSBvZiBmb3JtR3JvdXAgdGVtcGxhdGVzIGZvciBhZGRpbmcgdG8gZm9ybVxuICBoYXNSb290UmVmZXJlbmNlID0gZmFsc2U7IC8vIERvZXMgdGhlIGZvcm0gaW5jbHVkZSBhIHJlY3Vyc2l2ZSByZWZlcmVuY2UgdG8gaXRzZWxmP1xuXG4gIGxhbmd1YWdlID0gJ2VuLVVTJzsgLy8gRG9lcyB0aGUgZm9ybSBpbmNsdWRlIGEgcmVjdXJzaXZlIHJlZmVyZW5jZSB0byBpdHNlbGY/XG5cbiAgLy8gRGVmYXVsdCBnbG9iYWwgZm9ybSBvcHRpb25zXG4gIGRlZmF1bHRGb3JtT3B0aW9uczogYW55ID0ge1xuICAgIGF1dG9jb21wbGV0ZTogdHJ1ZSwgLy8gQWxsb3cgdGhlIHdlYiBicm93c2VyIHRvIHJlbWVtYmVyIHByZXZpb3VzIGZvcm0gc3VibWlzc2lvbiB2YWx1ZXMgYXMgZGVmYXVsdHNcbiAgICBhZGRTdWJtaXQ6ICdhdXRvJywgLy8gQWRkIGEgc3VibWl0IGJ1dHRvbiBpZiBsYXlvdXQgZG9lcyBub3QgaGF2ZSBvbmU/XG4gICAgLy8gZm9yIGFkZFN1Ym1pdDogdHJ1ZSA9IGFsd2F5cywgZmFsc2UgPSBuZXZlcixcbiAgICAvLyAnYXV0bycgPSBvbmx5IGlmIGxheW91dCBpcyB1bmRlZmluZWQgKGZvcm0gaXMgYnVpbHQgZnJvbSBzY2hlbWEgYWxvbmUpXG4gICAgZGVidWc6IGZhbHNlLCAvLyBTaG93IGRlYnVnZ2luZyBvdXRwdXQ/XG4gICAgZGlzYWJsZUludmFsaWRTdWJtaXQ6IHRydWUsIC8vIERpc2FibGUgc3VibWl0IGlmIGZvcm0gaW52YWxpZD9cbiAgICBmb3JtRGlzYWJsZWQ6IGZhbHNlLCAvLyBTZXQgZW50aXJlIGZvcm0gYXMgZGlzYWJsZWQ/IChub3QgZWRpdGFibGUsIGFuZCBkaXNhYmxlcyBvdXRwdXRzKVxuICAgIGZvcm1SZWFkb25seTogZmFsc2UsIC8vIFNldCBlbnRpcmUgZm9ybSBhcyByZWFkIG9ubHk/IChub3QgZWRpdGFibGUsIGJ1dCBvdXRwdXRzIHN0aWxsIGVuYWJsZWQpXG4gICAgZmllbGRzUmVxdWlyZWQ6IGZhbHNlLCAvLyAoc2V0IGF1dG9tYXRpY2FsbHkpIEFyZSB0aGVyZSBhbnkgcmVxdWlyZWQgZmllbGRzIGluIHRoZSBmb3JtP1xuICAgIGZyYW1ld29yazogJ25vLWZyYW1ld29yaycsIC8vIFRoZSBmcmFtZXdvcmsgdG8gbG9hZFxuICAgIGxvYWRFeHRlcm5hbEFzc2V0czogZmFsc2UsIC8vIExvYWQgZXh0ZXJuYWwgY3NzIGFuZCBKYXZhU2NyaXB0IGZvciBmcmFtZXdvcms/XG4gICAgcHJpc3RpbmU6IHsgZXJyb3JzOiB0cnVlLCBzdWNjZXNzOiB0cnVlIH0sXG4gICAgc3VwcmVzc1Byb3BlcnR5VGl0bGVzOiBmYWxzZSxcbiAgICBzZXRTY2hlbWFEZWZhdWx0czogJ2F1dG8nLCAvLyBTZXQgZmVmYXVsdCB2YWx1ZXMgZnJvbSBzY2hlbWE/XG4gICAgLy8gdHJ1ZSA9IGFsd2F5cyBzZXQgKHVubGVzcyBvdmVycmlkZGVuIGJ5IGxheW91dCBkZWZhdWx0IG9yIGZvcm1WYWx1ZXMpXG4gICAgLy8gZmFsc2UgPSBuZXZlciBzZXRcbiAgICAvLyAnYXV0bycgPSBzZXQgaW4gYWRkYWJsZSBjb21wb25lbnRzLCBhbmQgZXZlcnl3aGVyZSBpZiBmb3JtVmFsdWVzIG5vdCBzZXRcbiAgICBzZXRMYXlvdXREZWZhdWx0czogJ2F1dG8nLCAvLyBTZXQgZmVmYXVsdCB2YWx1ZXMgZnJvbSBsYXlvdXQ/XG4gICAgLy8gdHJ1ZSA9IGFsd2F5cyBzZXQgKHVubGVzcyBvdmVycmlkZGVuIGJ5IGZvcm1WYWx1ZXMpXG4gICAgLy8gZmFsc2UgPSBuZXZlciBzZXRcbiAgICAvLyAnYXV0bycgPSBzZXQgaW4gYWRkYWJsZSBjb21wb25lbnRzLCBhbmQgZXZlcnl3aGVyZSBpZiBmb3JtVmFsdWVzIG5vdCBzZXRcbiAgICB2YWxpZGF0ZU9uUmVuZGVyOiAnYXV0bycsIC8vIFZhbGlkYXRlIGZpZWxkcyBpbW1lZGlhdGVseSwgYmVmb3JlIHRoZXkgYXJlIHRvdWNoZWQ/XG4gICAgLy8gdHJ1ZSA9IHZhbGlkYXRlIGFsbCBmaWVsZHMgaW1tZWRpYXRlbHlcbiAgICAvLyBmYWxzZSA9IG9ubHkgdmFsaWRhdGUgZmllbGRzIGFmdGVyIHRoZXkgYXJlIHRvdWNoZWQgYnkgdXNlclxuICAgIC8vICdhdXRvJyA9IHZhbGlkYXRlIGZpZWxkcyB3aXRoIHZhbHVlcyBpbW1lZGlhdGVseSwgZW1wdHkgZmllbGRzIGFmdGVyIHRoZXkgYXJlIHRvdWNoZWRcbiAgICB3aWRnZXRzOiB7fSwgLy8gQW55IGN1c3RvbSB3aWRnZXRzIHRvIGxvYWRcbiAgICBkZWZhdXRXaWRnZXRPcHRpb25zOiB7XG4gICAgICAvLyBEZWZhdWx0IG9wdGlvbnMgZm9yIGZvcm0gY29udHJvbCB3aWRnZXRzXG4gICAgICBsaXN0SXRlbXM6IDEsIC8vIE51bWJlciBvZiBsaXN0IGl0ZW1zIHRvIGluaXRpYWxseSBhZGQgdG8gYXJyYXlzIHdpdGggbm8gZGVmYXVsdCB2YWx1ZVxuICAgICAgYWRkYWJsZTogdHJ1ZSwgLy8gQWxsb3cgYWRkaW5nIGl0ZW1zIHRvIGFuIGFycmF5IG9yICRyZWYgcG9pbnQ/XG4gICAgICBvcmRlcmFibGU6IHRydWUsIC8vIEFsbG93IHJlb3JkZXJpbmcgaXRlbXMgd2l0aGluIGFuIGFycmF5P1xuICAgICAgcmVtb3ZhYmxlOiB0cnVlLCAvLyBBbGxvdyByZW1vdmluZyBpdGVtcyBmcm9tIGFuIGFycmF5IG9yICRyZWYgcG9pbnQ/XG4gICAgICBlbmFibGVFcnJvclN0YXRlOiB0cnVlLCAvLyBBcHBseSAnaGFzLWVycm9yJyBjbGFzcyB3aGVuIGZpZWxkIGZhaWxzIHZhbGlkYXRpb24/XG4gICAgICAvLyBkaXNhYmxlRXJyb3JTdGF0ZTogZmFsc2UsIC8vIERvbid0IGFwcGx5ICdoYXMtZXJyb3InIGNsYXNzIHdoZW4gZmllbGQgZmFpbHMgdmFsaWRhdGlvbj9cbiAgICAgIGVuYWJsZVN1Y2Nlc3NTdGF0ZTogdHJ1ZSwgLy8gQXBwbHkgJ2hhcy1zdWNjZXNzJyBjbGFzcyB3aGVuIGZpZWxkIHZhbGlkYXRlcz9cbiAgICAgIC8vIGRpc2FibGVTdWNjZXNzU3RhdGU6IGZhbHNlLCAvLyBEb24ndCBhcHBseSAnaGFzLXN1Y2Nlc3MnIGNsYXNzIHdoZW4gZmllbGQgdmFsaWRhdGVzP1xuICAgICAgZmVlZGJhY2s6IGZhbHNlLCAvLyBTaG93IGlubGluZSBmZWVkYmFjayBpY29ucz9cbiAgICAgIGZlZWRiYWNrT25SZW5kZXI6IGZhbHNlLCAvLyBTaG93IGVycm9yTWVzc2FnZSBvbiBSZW5kZXI/XG4gICAgICBub3RpdGxlOiBmYWxzZSwgLy8gSGlkZSB0aXRsZT9cbiAgICAgIGRpc2FibGVkOiBmYWxzZSwgLy8gU2V0IGNvbnRyb2wgYXMgZGlzYWJsZWQ/IChub3QgZWRpdGFibGUsIGFuZCBleGNsdWRlZCBmcm9tIG91dHB1dClcbiAgICAgIHJlYWRvbmx5OiBmYWxzZSwgLy8gU2V0IGNvbnRyb2wgYXMgcmVhZCBvbmx5PyAobm90IGVkaXRhYmxlLCBidXQgaW5jbHVkZWQgaW4gb3V0cHV0KVxuICAgICAgcmV0dXJuRW1wdHlGaWVsZHM6IHRydWUsIC8vIHJldHVybiB2YWx1ZXMgZm9yIGZpZWxkcyB0aGF0IGNvbnRhaW4gbm8gZGF0YT9cbiAgICAgIHZhbGlkYXRpb25NZXNzYWdlczoge30gLy8gc2V0IGJ5IHNldExhbmd1YWdlKClcbiAgICB9XG4gIH07XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZXRMYW5ndWFnZSh0aGlzLmxhbmd1YWdlKTtcbiAgICB0aGlzLmFqdi5hZGRNZXRhU2NoZW1hKGpzb25EcmFmdDYpO1xuICB9XG5cbiAgc2V0TGFuZ3VhZ2UobGFuZ3VhZ2U6IHN0cmluZyA9ICdlbi1VUycpIHtcbiAgICB0aGlzLmxhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gICAgY29uc3QgbGFuZ3VhZ2VWYWxpZGF0aW9uTWVzc2FnZXMgPSB7XG4gICAgICBkZTogZGVWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBlbjogZW5WYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBlczogZXNWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBmcjogZnJWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBpdDogaXRWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICBwdDogcHRWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICB6aDogemhWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgfTtcbiAgICBjb25zdCBsYW5ndWFnZUNvZGUgPSBsYW5ndWFnZS5zbGljZSgwLCAyKTtcblxuICAgIGNvbnN0IHZhbGlkYXRpb25NZXNzYWdlcyA9IGxhbmd1YWdlVmFsaWRhdGlvbk1lc3NhZ2VzW2xhbmd1YWdlQ29kZV07XG5cbiAgICB0aGlzLmRlZmF1bHRGb3JtT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zLnZhbGlkYXRpb25NZXNzYWdlcyA9IGNsb25lRGVlcChcbiAgICAgIHZhbGlkYXRpb25NZXNzYWdlc1xuICAgICk7XG4gIH1cblxuICBnZXREYXRhKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGE7XG4gIH1cblxuICBnZXRTY2hlbWEoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NoZW1hO1xuICB9XG5cbiAgZ2V0TGF5b3V0KCkge1xuICAgIHJldHVybiB0aGlzLmxheW91dDtcbiAgfVxuXG4gIHJlc2V0QWxsVmFsdWVzKCkge1xuICAgIHRoaXMuSnNvbkZvcm1Db21wYXRpYmlsaXR5ID0gZmFsc2U7XG4gICAgdGhpcy5SZWFjdEpzb25TY2hlbWFGb3JtQ29tcGF0aWJpbGl0eSA9IGZhbHNlO1xuICAgIHRoaXMuQW5ndWxhclNjaGVtYUZvcm1Db21wYXRpYmlsaXR5ID0gZmFsc2U7XG4gICAgdGhpcy50cGxkYXRhID0ge307XG4gICAgdGhpcy52YWxpZGF0ZUZvcm1EYXRhID0gbnVsbDtcbiAgICB0aGlzLmZvcm1WYWx1ZXMgPSB7fTtcbiAgICB0aGlzLnNjaGVtYSA9IHt9O1xuICAgIHRoaXMubGF5b3V0ID0gW107XG4gICAgdGhpcy5mb3JtR3JvdXBUZW1wbGF0ZSA9IHt9O1xuICAgIHRoaXMuZm9ybUdyb3VwID0gbnVsbDtcbiAgICB0aGlzLmZyYW1ld29yayA9IG51bGw7XG4gICAgdGhpcy5kYXRhID0ge307XG4gICAgdGhpcy52YWxpZERhdGEgPSBudWxsO1xuICAgIHRoaXMuaXNWYWxpZCA9IG51bGw7XG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzID0gbnVsbDtcbiAgICB0aGlzLmFycmF5TWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuZGF0YU1hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmRhdGFSZWN1cnNpdmVSZWZNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5zY2hlbWFSZWN1cnNpdmVSZWZNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5sYXlvdXRSZWZMaWJyYXJ5ID0ge307XG4gICAgdGhpcy5zY2hlbWFSZWZMaWJyYXJ5ID0ge307XG4gICAgdGhpcy50ZW1wbGF0ZVJlZkxpYnJhcnkgPSB7fTtcbiAgICB0aGlzLmZvcm1PcHRpb25zID0gY2xvbmVEZWVwKHRoaXMuZGVmYXVsdEZvcm1PcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiAnYnVpbGRSZW1vdGVFcnJvcicgZnVuY3Rpb25cbiAgICpcbiAgICogRXhhbXBsZSBlcnJvcnM6XG4gICAqIHtcbiAgICogICBsYXN0X25hbWU6IFsge1xuICAgKiAgICAgbWVzc2FnZTogJ0xhc3QgbmFtZSBtdXN0IGJ5IHN0YXJ0IHdpdGggY2FwaXRhbCBsZXR0ZXIuJyxcbiAgICogICAgIGNvZGU6ICdjYXBpdGFsX2xldHRlcidcbiAgICogICB9IF0sXG4gICAqICAgZW1haWw6IFsge1xuICAgKiAgICAgbWVzc2FnZTogJ0VtYWlsIG11c3QgYmUgZnJvbSBleGFtcGxlLmNvbSBkb21haW4uJyxcbiAgICogICAgIGNvZGU6ICdzcGVjaWFsX2RvbWFpbidcbiAgICogICB9LCB7XG4gICAqICAgICBtZXNzYWdlOiAnRW1haWwgbXVzdCBjb250YWluIGFuIEAgc3ltYm9sLicsXG4gICAqICAgICBjb2RlOiAnYXRfc3ltYm9sJ1xuICAgKiAgIH0gXVxuICAgKiB9XG4gICAqIC8ve0Vycm9yTWVzc2FnZXN9IGVycm9yc1xuICAgKi9cbiAgYnVpbGRSZW1vdGVFcnJvcihlcnJvcnM6IEVycm9yTWVzc2FnZXMpIHtcbiAgICBmb3JFYWNoKGVycm9ycywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGlmIChrZXkgaW4gdGhpcy5mb3JtR3JvdXAuY29udHJvbHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBlcnJvciBvZiB2YWx1ZSkge1xuICAgICAgICAgIGNvbnN0IGVyciA9IHt9O1xuICAgICAgICAgIGVycltlcnJvclsnY29kZSddXSA9IGVycm9yWydtZXNzYWdlJ107XG4gICAgICAgICAgdGhpcy5mb3JtR3JvdXAuZ2V0KGtleSkuc2V0RXJyb3JzKGVyciwgeyBlbWl0RXZlbnQ6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhbGlkYXRlRGF0YShuZXdWYWx1ZTogYW55LCB1cGRhdGVTdWJzY3JpcHRpb25zID0gdHJ1ZSk6IHZvaWQge1xuICAgIC8vIEZvcm1hdCByYXcgZm9ybSBkYXRhIHRvIGNvcnJlY3QgZGF0YSB0eXBlc1xuICAgIHRoaXMuZGF0YSA9IGZvcm1hdEZvcm1EYXRhKFxuICAgICAgbmV3VmFsdWUsXG4gICAgICB0aGlzLmRhdGFNYXAsXG4gICAgICB0aGlzLmRhdGFSZWN1cnNpdmVSZWZNYXAsXG4gICAgICB0aGlzLmFycmF5TWFwLFxuICAgICAgdGhpcy5mb3JtT3B0aW9ucy5yZXR1cm5FbXB0eUZpZWxkc1xuICAgICk7XG4gICAgdGhpcy5pc1ZhbGlkID0gdGhpcy52YWxpZGF0ZUZvcm1EYXRhKHRoaXMuZGF0YSk7XG4gICAgdGhpcy52YWxpZERhdGEgPSB0aGlzLmlzVmFsaWQgPyB0aGlzLmRhdGEgOiBudWxsO1xuICAgIGNvbnN0IGNvbXBpbGVFcnJvcnMgPSBlcnJvcnMgPT4ge1xuICAgICAgY29uc3QgY29tcGlsZWRFcnJvcnMgPSB7fTtcbiAgICAgIChlcnJvcnMgfHwgW10pLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgICBpZiAoIWNvbXBpbGVkRXJyb3JzW2Vycm9yLmRhdGFQYXRoXSkge1xuICAgICAgICAgIGNvbXBpbGVkRXJyb3JzW2Vycm9yLmRhdGFQYXRoXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGNvbXBpbGVkRXJyb3JzW2Vycm9yLmRhdGFQYXRoXS5wdXNoKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gY29tcGlsZWRFcnJvcnM7XG4gICAgfTtcbiAgICB0aGlzLmFqdkVycm9ycyA9IHRoaXMudmFsaWRhdGVGb3JtRGF0YS5lcnJvcnM7XG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3JzID0gY29tcGlsZUVycm9ycyh0aGlzLnZhbGlkYXRlRm9ybURhdGEuZXJyb3JzKTtcbiAgICBpZiAodXBkYXRlU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5kYXRhQ2hhbmdlcy5uZXh0KHRoaXMuZGF0YSk7XG4gICAgICB0aGlzLmlzVmFsaWRDaGFuZ2VzLm5leHQodGhpcy5pc1ZhbGlkKTtcbiAgICAgIHRoaXMudmFsaWRhdGlvbkVycm9yQ2hhbmdlcy5uZXh0KHRoaXMuYWp2RXJyb3JzKTtcbiAgICB9XG4gIH1cblxuICBidWlsZEZvcm1Hcm91cFRlbXBsYXRlKGZvcm1WYWx1ZXM6IGFueSA9IG51bGwsIHNldFZhbHVlcyA9IHRydWUpIHtcbiAgICB0aGlzLmZvcm1Hcm91cFRlbXBsYXRlID0gYnVpbGRGb3JtR3JvdXBUZW1wbGF0ZShcbiAgICAgIHRoaXMsXG4gICAgICBmb3JtVmFsdWVzLFxuICAgICAgc2V0VmFsdWVzXG4gICAgKTtcbiAgfVxuXG4gIGJ1aWxkRm9ybUdyb3VwKCkge1xuICAgIHRoaXMuZm9ybUdyb3VwID0gPFVudHlwZWRGb3JtR3JvdXA+YnVpbGRGb3JtR3JvdXAodGhpcy5mb3JtR3JvdXBUZW1wbGF0ZSk7XG4gICAgaWYgKHRoaXMuZm9ybUdyb3VwKSB7XG4gICAgICB0aGlzLmNvbXBpbGVBanZTY2hlbWEoKTtcbiAgICAgIHRoaXMudmFsaWRhdGVEYXRhKHRoaXMuZm9ybUdyb3VwLnZhbHVlKTtcblxuICAgICAgLy8gU2V0IHVwIG9ic2VydmFibGVzIHRvIGVtaXQgZGF0YSBhbmQgdmFsaWRhdGlvbiBpbmZvIHdoZW4gZm9ybSBkYXRhIGNoYW5nZXNcbiAgICAgIGlmICh0aGlzLmZvcm1WYWx1ZVN1YnNjcmlwdGlvbikge1xuICAgICAgICB0aGlzLmZvcm1WYWx1ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5mb3JtVmFsdWVTdWJzY3JpcHRpb24gPSB0aGlzLmZvcm1Hcm91cC52YWx1ZUNoYW5nZXMuc3Vic2NyaWJlKFxuICAgICAgICBmb3JtVmFsdWUgPT4gdGhpcy52YWxpZGF0ZURhdGEoZm9ybVZhbHVlKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBidWlsZExheW91dCh3aWRnZXRMaWJyYXJ5OiBhbnkpIHtcbiAgICB0aGlzLmxheW91dCA9IGJ1aWxkTGF5b3V0KHRoaXMsIHdpZGdldExpYnJhcnkpO1xuICB9XG5cbiAgc2V0T3B0aW9ucyhuZXdPcHRpb25zOiBhbnkpIHtcbiAgICBpZiAoaXNPYmplY3QobmV3T3B0aW9ucykpIHtcbiAgICAgIGNvbnN0IGFkZE9wdGlvbnMgPSBjbG9uZURlZXAobmV3T3B0aW9ucyk7XG4gICAgICAvLyBCYWNrd2FyZCBjb21wYXRpYmlsaXR5IGZvciAnZGVmYXVsdE9wdGlvbnMnIChyZW5hbWVkICdkZWZhdXRXaWRnZXRPcHRpb25zJylcbiAgICAgIGlmIChpc09iamVjdChhZGRPcHRpb25zLmRlZmF1bHRPcHRpb25zKSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgIHRoaXMuZm9ybU9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucyxcbiAgICAgICAgICBhZGRPcHRpb25zLmRlZmF1bHRPcHRpb25zXG4gICAgICAgICk7XG4gICAgICAgIGRlbGV0ZSBhZGRPcHRpb25zLmRlZmF1bHRPcHRpb25zO1xuICAgICAgfVxuICAgICAgaWYgKGlzT2JqZWN0KGFkZE9wdGlvbnMuZGVmYXV0V2lkZ2V0T3B0aW9ucykpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB0aGlzLmZvcm1PcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnMsXG4gICAgICAgICAgYWRkT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zXG4gICAgICAgICk7XG4gICAgICAgIGRlbGV0ZSBhZGRPcHRpb25zLmRlZmF1dFdpZGdldE9wdGlvbnM7XG4gICAgICB9XG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMuZm9ybU9wdGlvbnMsIGFkZE9wdGlvbnMpO1xuXG4gICAgICAvLyBjb252ZXJ0IGRpc2FibGVFcnJvclN0YXRlIC8gZGlzYWJsZVN1Y2Nlc3NTdGF0ZSB0byBlbmFibGUuLi5cbiAgICAgIGNvbnN0IGdsb2JhbERlZmF1bHRzID0gdGhpcy5mb3JtT3B0aW9ucy5kZWZhdXRXaWRnZXRPcHRpb25zO1xuICAgICAgWydFcnJvclN0YXRlJywgJ1N1Y2Nlc3NTdGF0ZSddXG4gICAgICAgIC5maWx0ZXIoc3VmZml4ID0+IGhhc093bihnbG9iYWxEZWZhdWx0cywgJ2Rpc2FibGUnICsgc3VmZml4KSlcbiAgICAgICAgLmZvckVhY2goc3VmZml4ID0+IHtcbiAgICAgICAgICBnbG9iYWxEZWZhdWx0c1snZW5hYmxlJyArIHN1ZmZpeF0gPSAhZ2xvYmFsRGVmYXVsdHNbXG4gICAgICAgICAgICAnZGlzYWJsZScgKyBzdWZmaXhcbiAgICAgICAgICBdO1xuICAgICAgICAgIGRlbGV0ZSBnbG9iYWxEZWZhdWx0c1snZGlzYWJsZScgKyBzdWZmaXhdO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb21waWxlQWp2U2NoZW1hKCkge1xuICAgIGlmICghdGhpcy52YWxpZGF0ZUZvcm1EYXRhKSB7XG4gICAgICAvLyBpZiAndWk6b3JkZXInIGV4aXN0cyBpbiBwcm9wZXJ0aWVzLCBtb3ZlIGl0IHRvIHJvb3QgYmVmb3JlIGNvbXBpbGluZyB3aXRoIGFqdlxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5zY2hlbWEucHJvcGVydGllc1sndWk6b3JkZXInXSkpIHtcbiAgICAgICAgdGhpcy5zY2hlbWFbJ3VpOm9yZGVyJ10gPSB0aGlzLnNjaGVtYS5wcm9wZXJ0aWVzWyd1aTpvcmRlciddO1xuICAgICAgICBkZWxldGUgdGhpcy5zY2hlbWEucHJvcGVydGllc1sndWk6b3JkZXInXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWp2LnJlbW92ZVNjaGVtYSh0aGlzLnNjaGVtYSk7XG4gICAgICB0aGlzLnZhbGlkYXRlRm9ybURhdGEgPSB0aGlzLmFqdi5jb21waWxlKHRoaXMuc2NoZW1hKTtcbiAgICB9XG4gIH1cblxuICBidWlsZFNjaGVtYUZyb21EYXRhKGRhdGE/OiBhbnksIHJlcXVpcmVBbGxGaWVsZHMgPSBmYWxzZSk6IGFueSB7XG4gICAgaWYgKGRhdGEpIHtcbiAgICAgIHJldHVybiBidWlsZFNjaGVtYUZyb21EYXRhKGRhdGEsIHJlcXVpcmVBbGxGaWVsZHMpO1xuICAgIH1cbiAgICB0aGlzLnNjaGVtYSA9IGJ1aWxkU2NoZW1hRnJvbURhdGEodGhpcy5mb3JtVmFsdWVzLCByZXF1aXJlQWxsRmllbGRzKTtcbiAgfVxuXG4gIGJ1aWxkU2NoZW1hRnJvbUxheW91dChsYXlvdXQ/OiBhbnkpOiBhbnkge1xuICAgIGlmIChsYXlvdXQpIHtcbiAgICAgIHJldHVybiBidWlsZFNjaGVtYUZyb21MYXlvdXQobGF5b3V0KTtcbiAgICB9XG4gICAgdGhpcy5zY2hlbWEgPSBidWlsZFNjaGVtYUZyb21MYXlvdXQodGhpcy5sYXlvdXQpO1xuICB9XG5cbiAgc2V0VHBsZGF0YShuZXdUcGxkYXRhOiBhbnkgPSB7fSk6IHZvaWQge1xuICAgIHRoaXMudHBsZGF0YSA9IG5ld1RwbGRhdGE7XG4gIH1cblxuICBwYXJzZVRleHQoXG4gICAgdGV4dCA9ICcnLFxuICAgIHZhbHVlOiBhbnkgPSB7fSxcbiAgICB2YWx1ZXM6IGFueSA9IHt9LFxuICAgIGtleTogbnVtYmVyIHwgc3RyaW5nID0gbnVsbFxuICApOiBzdHJpbmcge1xuICAgIGlmICghdGV4dCB8fCAhL3t7Lis/fX0vLnRlc3QodGV4dCkpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC97eyguKz8pfX0vZywgKC4uLmEpID0+XG4gICAgICB0aGlzLnBhcnNlRXhwcmVzc2lvbihhWzFdLCB2YWx1ZSwgdmFsdWVzLCBrZXksIHRoaXMudHBsZGF0YSlcbiAgICApO1xuICB9XG5cbiAgcGFyc2VFeHByZXNzaW9uKFxuICAgIGV4cHJlc3Npb24gPSAnJyxcbiAgICB2YWx1ZTogYW55ID0ge30sXG4gICAgdmFsdWVzOiBhbnkgPSB7fSxcbiAgICBrZXk6IG51bWJlciB8IHN0cmluZyA9IG51bGwsXG4gICAgdHBsZGF0YTogYW55ID0gbnVsbFxuICApIHtcbiAgICBpZiAodHlwZW9mIGV4cHJlc3Npb24gIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNvbnN0IGluZGV4ID0gdHlwZW9mIGtleSA9PT0gJ251bWJlcicgPyBrZXkgKyAxICsgJycgOiBrZXkgfHwgJyc7XG4gICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24udHJpbSgpO1xuICAgIGlmIChcbiAgICAgIChleHByZXNzaW9uWzBdID09PSBcIidcIiB8fCBleHByZXNzaW9uWzBdID09PSAnXCInKSAmJlxuICAgICAgZXhwcmVzc2lvblswXSA9PT0gZXhwcmVzc2lvbltleHByZXNzaW9uLmxlbmd0aCAtIDFdICYmXG4gICAgICBleHByZXNzaW9uLnNsaWNlKDEsIGV4cHJlc3Npb24ubGVuZ3RoIC0gMSkuaW5kZXhPZihleHByZXNzaW9uWzBdKSA9PT0gLTFcbiAgICApIHtcbiAgICAgIHJldHVybiBleHByZXNzaW9uLnNsaWNlKDEsIGV4cHJlc3Npb24ubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIGlmIChleHByZXNzaW9uID09PSAnaWR4JyB8fCBleHByZXNzaW9uID09PSAnJGluZGV4Jykge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cbiAgICBpZiAoZXhwcmVzc2lvbiA9PT0gJ3ZhbHVlJyAmJiAhaGFzT3duKHZhbHVlcywgJ3ZhbHVlJykpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgWydcIicsIFwiJ1wiLCAnICcsICd8fCcsICcmJicsICcrJ10uZXZlcnkoXG4gICAgICAgIGRlbGltID0+IGV4cHJlc3Npb24uaW5kZXhPZihkZWxpbSkgPT09IC0xXG4gICAgICApXG4gICAgKSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gSnNvblBvaW50ZXIucGFyc2VPYmplY3RQYXRoKGV4cHJlc3Npb24pO1xuICAgICAgcmV0dXJuIHBvaW50ZXJbMF0gPT09ICd2YWx1ZScgJiYgSnNvblBvaW50ZXIuaGFzKHZhbHVlLCBwb2ludGVyLnNsaWNlKDEpKVxuICAgICAgICA/IEpzb25Qb2ludGVyLmdldCh2YWx1ZSwgcG9pbnRlci5zbGljZSgxKSlcbiAgICAgICAgOiBwb2ludGVyWzBdID09PSAndmFsdWVzJyAmJiBKc29uUG9pbnRlci5oYXModmFsdWVzLCBwb2ludGVyLnNsaWNlKDEpKVxuICAgICAgICAgID8gSnNvblBvaW50ZXIuZ2V0KHZhbHVlcywgcG9pbnRlci5zbGljZSgxKSlcbiAgICAgICAgICA6IHBvaW50ZXJbMF0gPT09ICd0cGxkYXRhJyAmJiBKc29uUG9pbnRlci5oYXModHBsZGF0YSwgcG9pbnRlci5zbGljZSgxKSlcbiAgICAgICAgICAgID8gSnNvblBvaW50ZXIuZ2V0KHRwbGRhdGEsIHBvaW50ZXIuc2xpY2UoMSkpXG4gICAgICAgICAgICA6IEpzb25Qb2ludGVyLmhhcyh2YWx1ZXMsIHBvaW50ZXIpXG4gICAgICAgICAgICAgID8gSnNvblBvaW50ZXIuZ2V0KHZhbHVlcywgcG9pbnRlcilcbiAgICAgICAgICAgICAgOiAnJztcbiAgICB9XG4gICAgaWYgKGV4cHJlc3Npb24uaW5kZXhPZignW2lkeF0nKSA+IC0xKSB7XG4gICAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC9cXFtpZHhcXF0vZywgPHN0cmluZz5pbmRleCk7XG4gICAgfVxuICAgIGlmIChleHByZXNzaW9uLmluZGV4T2YoJ1skaW5kZXhdJykgPiAtMSkge1xuICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmVwbGFjZSgvXFxbJGluZGV4XFxdL2csIDxzdHJpbmc+aW5kZXgpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBJbXByb3ZlIGV4cHJlc3Npb24gZXZhbHVhdGlvbiBieSBwYXJzaW5nIHF1b3RlZCBzdHJpbmdzIGZpcnN0XG4gICAgLy8gbGV0IGV4cHJlc3Npb25BcnJheSA9IGV4cHJlc3Npb24ubWF0Y2goLyhbXlwiJ10rfFwiW15cIl0rXCJ8J1teJ10rJykvZyk7XG4gICAgaWYgKGV4cHJlc3Npb24uaW5kZXhPZignfHwnKSA+IC0xKSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvblxuICAgICAgICAuc3BsaXQoJ3x8JylcbiAgICAgICAgLnJlZHVjZShcbiAgICAgICAgICAoYWxsLCB0ZXJtKSA9PlxuICAgICAgICAgICAgYWxsIHx8IHRoaXMucGFyc2VFeHByZXNzaW9uKHRlcm0sIHZhbHVlLCB2YWx1ZXMsIGtleSwgdHBsZGF0YSksXG4gICAgICAgICAgJydcbiAgICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGV4cHJlc3Npb24uaW5kZXhPZignJiYnKSA+IC0xKSB7XG4gICAgICByZXR1cm4gZXhwcmVzc2lvblxuICAgICAgICAuc3BsaXQoJyYmJylcbiAgICAgICAgLnJlZHVjZShcbiAgICAgICAgICAoYWxsLCB0ZXJtKSA9PlxuICAgICAgICAgICAgYWxsICYmIHRoaXMucGFyc2VFeHByZXNzaW9uKHRlcm0sIHZhbHVlLCB2YWx1ZXMsIGtleSwgdHBsZGF0YSksXG4gICAgICAgICAgJyAnXG4gICAgICAgIClcbiAgICAgICAgLnRyaW0oKTtcbiAgICB9XG4gICAgaWYgKGV4cHJlc3Npb24uaW5kZXhPZignKycpID4gLTEpIHtcbiAgICAgIHJldHVybiBleHByZXNzaW9uXG4gICAgICAgIC5zcGxpdCgnKycpXG4gICAgICAgIC5tYXAodGVybSA9PiB0aGlzLnBhcnNlRXhwcmVzc2lvbih0ZXJtLCB2YWx1ZSwgdmFsdWVzLCBrZXksIHRwbGRhdGEpKVxuICAgICAgICAuam9pbignJyk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIHNldEFycmF5SXRlbVRpdGxlKFxuICAgIHBhcmVudEN0eDogYW55ID0ge30sXG4gICAgY2hpbGROb2RlOiBhbnkgPSBudWxsLFxuICAgIGluZGV4OiBudW1iZXIgPSBudWxsXG4gICk6IHN0cmluZyB7XG4gICAgY29uc3QgcGFyZW50Tm9kZSA9IHBhcmVudEN0eC5sYXlvdXROb2RlO1xuICAgIGNvbnN0IHBhcmVudFZhbHVlczogYW55ID0gdGhpcy5nZXRGb3JtQ29udHJvbFZhbHVlKHBhcmVudEN0eCk7XG4gICAgY29uc3QgaXNBcnJheUl0ZW0gPVxuICAgICAgKHBhcmVudE5vZGUudHlwZSB8fCAnJykuc2xpY2UoLTUpID09PSAnYXJyYXknICYmIGlzQXJyYXkocGFyZW50VmFsdWVzKTtcbiAgICBjb25zdCB0ZXh0ID0gSnNvblBvaW50ZXIuZ2V0Rmlyc3QoXG4gICAgICBpc0FycmF5SXRlbSAmJiBjaGlsZE5vZGUudHlwZSAhPT0gJyRyZWYnXG4gICAgICAgID8gW1xuICAgICAgICAgIFtjaGlsZE5vZGUsICcvb3B0aW9ucy9sZWdlbmQnXSxcbiAgICAgICAgICBbY2hpbGROb2RlLCAnL29wdGlvbnMvdGl0bGUnXSxcbiAgICAgICAgICBbcGFyZW50Tm9kZSwgJy9vcHRpb25zL3RpdGxlJ10sXG4gICAgICAgICAgW3BhcmVudE5vZGUsICcvb3B0aW9ucy9sZWdlbmQnXVxuICAgICAgICBdXG4gICAgICAgIDogW1xuICAgICAgICAgIFtjaGlsZE5vZGUsICcvb3B0aW9ucy90aXRsZSddLFxuICAgICAgICAgIFtjaGlsZE5vZGUsICcvb3B0aW9ucy9sZWdlbmQnXSxcbiAgICAgICAgICBbcGFyZW50Tm9kZSwgJy9vcHRpb25zL3RpdGxlJ10sXG4gICAgICAgICAgW3BhcmVudE5vZGUsICcvb3B0aW9ucy9sZWdlbmQnXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBpZiAoIXRleHQpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBjb25zdCBjaGlsZFZhbHVlID1cbiAgICAgIGlzQXJyYXkocGFyZW50VmFsdWVzKSAmJiBpbmRleCA8IHBhcmVudFZhbHVlcy5sZW5ndGhcbiAgICAgICAgPyBwYXJlbnRWYWx1ZXNbaW5kZXhdXG4gICAgICAgIDogcGFyZW50VmFsdWVzO1xuICAgIHJldHVybiB0aGlzLnBhcnNlVGV4dCh0ZXh0LCBjaGlsZFZhbHVlLCBwYXJlbnRWYWx1ZXMsIGluZGV4KTtcbiAgfVxuXG4gIHNldEl0ZW1UaXRsZShjdHg6IGFueSkge1xuICAgIHJldHVybiAhY3R4Lm9wdGlvbnMudGl0bGUgJiYgL14oXFxkK3wtKSQvLnRlc3QoY3R4LmxheW91dE5vZGUubmFtZSlcbiAgICAgID8gbnVsbFxuICAgICAgOiB0aGlzLnBhcnNlVGV4dChcbiAgICAgICAgY3R4Lm9wdGlvbnMudGl0bGUgfHwgdG9UaXRsZUNhc2UoY3R4LmxheW91dE5vZGUubmFtZSksXG4gICAgICAgIHRoaXMuZ2V0Rm9ybUNvbnRyb2xWYWx1ZSh0aGlzKSxcbiAgICAgICAgKHRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cCh0aGlzKSB8fCA8YW55Pnt9KS52YWx1ZSxcbiAgICAgICAgY3R4LmRhdGFJbmRleFtjdHguZGF0YUluZGV4Lmxlbmd0aCAtIDFdXG4gICAgICApO1xuICB9XG5cbiAgZXZhbHVhdGVDb25kaXRpb24obGF5b3V0Tm9kZTogYW55LCBkYXRhSW5kZXg6IG51bWJlcltdKTogYm9vbGVhbiB7XG4gICAgY29uc3QgYXJyYXlJbmRleCA9IGRhdGFJbmRleCAmJiBkYXRhSW5kZXhbZGF0YUluZGV4Lmxlbmd0aCAtIDFdO1xuICAgIGxldCByZXN1bHQgPSB0cnVlO1xuICAgIGlmIChoYXNWYWx1ZSgobGF5b3V0Tm9kZS5vcHRpb25zIHx8IHt9KS5jb25kaXRpb24pKSB7XG4gICAgICBpZiAodHlwZW9mIGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGxldCBwb2ludGVyID0gbGF5b3V0Tm9kZS5vcHRpb25zLmNvbmRpdGlvbjtcbiAgICAgICAgaWYgKGhhc1ZhbHVlKGFycmF5SW5kZXgpKSB7XG4gICAgICAgICAgcG9pbnRlciA9IHBvaW50ZXIucmVwbGFjZSgnW2FycmF5SW5kZXhdJywgYFske2FycmF5SW5kZXh9XWApO1xuICAgICAgICB9XG4gICAgICAgIHBvaW50ZXIgPSBKc29uUG9pbnRlci5wYXJzZU9iamVjdFBhdGgocG9pbnRlcik7XG4gICAgICAgIHJlc3VsdCA9ICEhSnNvblBvaW50ZXIuZ2V0KHRoaXMuZGF0YSwgcG9pbnRlcik7XG4gICAgICAgIGlmICghcmVzdWx0ICYmIHBvaW50ZXJbMF0gPT09ICdtb2RlbCcpIHtcbiAgICAgICAgICByZXN1bHQgPSAhIUpzb25Qb2ludGVyLmdldCh7IG1vZGVsOiB0aGlzLmRhdGEgfSwgcG9pbnRlcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmVzdWx0ID0gbGF5b3V0Tm9kZS5vcHRpb25zLmNvbmRpdGlvbih0aGlzLmRhdGEpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgdHlwZW9mIGxheW91dE5vZGUub3B0aW9ucy5jb25kaXRpb24uZnVuY3Rpb25Cb2R5ID09PSAnc3RyaW5nJ1xuICAgICAgKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgZHluRm4gPSBuZXcgRnVuY3Rpb24oXG4gICAgICAgICAgICAnbW9kZWwnLFxuICAgICAgICAgICAgJ2FycmF5SW5kaWNlcycsXG4gICAgICAgICAgICBsYXlvdXROb2RlLm9wdGlvbnMuY29uZGl0aW9uLmZ1bmN0aW9uQm9keVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmVzdWx0ID0gZHluRm4odGhpcy5kYXRhLCBkYXRhSW5kZXgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgJ2NvbmRpdGlvbiBmdW5jdGlvbkJvZHkgZXJyb3JlZCBvdXQgb24gZXZhbHVhdGlvbjogJyArXG4gICAgICAgICAgICBsYXlvdXROb2RlLm9wdGlvbnMuY29uZGl0aW9uLmZ1bmN0aW9uQm9keVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGluaXRpYWxpemVDb250cm9sKGN0eDogYW55LCBiaW5kID0gdHJ1ZSk6IGJvb2xlYW4ge1xuICAgIGlmICghaXNPYmplY3QoY3R4KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXNFbXB0eShjdHgub3B0aW9ucykpIHtcbiAgICAgIGN0eC5vcHRpb25zID0gIWlzRW1wdHkoKGN0eC5sYXlvdXROb2RlIHx8IHt9KS5vcHRpb25zKVxuICAgICAgICA/IGN0eC5sYXlvdXROb2RlLm9wdGlvbnNcbiAgICAgICAgOiBjbG9uZURlZXAodGhpcy5mb3JtT3B0aW9ucyk7XG4gICAgfVxuICAgIGN0eC5mb3JtQ29udHJvbCA9IHRoaXMuZ2V0Rm9ybUNvbnRyb2woY3R4KTtcbiAgICBjdHguYm91bmRDb250cm9sID0gYmluZCAmJiAhIWN0eC5mb3JtQ29udHJvbDtcbiAgICBpZiAoY3R4LmZvcm1Db250cm9sKSB7XG4gICAgICBjdHguY29udHJvbE5hbWUgPSB0aGlzLmdldEZvcm1Db250cm9sTmFtZShjdHgpO1xuICAgICAgY3R4LmNvbnRyb2xWYWx1ZSA9IGN0eC5mb3JtQ29udHJvbC52YWx1ZTtcbiAgICAgIGN0eC5jb250cm9sRGlzYWJsZWQgPSBjdHguZm9ybUNvbnRyb2wuZGlzYWJsZWQ7XG4gICAgICBjdHgub3B0aW9ucy5lcnJvck1lc3NhZ2UgPVxuICAgICAgICBjdHguZm9ybUNvbnRyb2wuc3RhdHVzID09PSAnVkFMSUQnXG4gICAgICAgICAgPyBudWxsXG4gICAgICAgICAgOiB0aGlzLmZvcm1hdEVycm9ycyhcbiAgICAgICAgICAgIGN0eC5mb3JtQ29udHJvbC5lcnJvcnMsXG4gICAgICAgICAgICBjdHgub3B0aW9ucy52YWxpZGF0aW9uTWVzc2FnZXNcbiAgICAgICAgICApO1xuICAgICAgY3R4Lm9wdGlvbnMuc2hvd0Vycm9ycyA9XG4gICAgICAgIHRoaXMuZm9ybU9wdGlvbnMudmFsaWRhdGVPblJlbmRlciA9PT0gdHJ1ZSB8fFxuICAgICAgICAodGhpcy5mb3JtT3B0aW9ucy52YWxpZGF0ZU9uUmVuZGVyID09PSAnYXV0bycgJiZcbiAgICAgICAgICBoYXNWYWx1ZShjdHguY29udHJvbFZhbHVlKSk7XG4gICAgICBjdHguZm9ybUNvbnRyb2wuc3RhdHVzQ2hhbmdlcy5zdWJzY3JpYmUoXG4gICAgICAgIHN0YXR1cyA9PlxuICAgICAgICAgIChjdHgub3B0aW9ucy5lcnJvck1lc3NhZ2UgPVxuICAgICAgICAgICAgc3RhdHVzID09PSAnVkFMSUQnXG4gICAgICAgICAgICAgID8gbnVsbFxuICAgICAgICAgICAgICA6IHRoaXMuZm9ybWF0RXJyb3JzKFxuICAgICAgICAgICAgICAgIGN0eC5mb3JtQ29udHJvbC5lcnJvcnMsXG4gICAgICAgICAgICAgICAgY3R4Lm9wdGlvbnMudmFsaWRhdGlvbk1lc3NhZ2VzXG4gICAgICAgICAgICAgICkpXG4gICAgICApO1xuICAgICAgY3R4LmZvcm1Db250cm9sLnZhbHVlQ2hhbmdlcy5zdWJzY3JpYmUodmFsdWUgPT4ge1xuICAgICAgICBpZiAoISF2YWx1ZSkge1xuICAgICAgICAgIGN0eC5jb250cm9sVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5jb250cm9sTmFtZSA9IGN0eC5sYXlvdXROb2RlLm5hbWU7XG4gICAgICBjdHguY29udHJvbFZhbHVlID0gY3R4LmxheW91dE5vZGUudmFsdWUgfHwgbnVsbDtcbiAgICAgIGNvbnN0IGRhdGFQb2ludGVyID0gdGhpcy5nZXREYXRhUG9pbnRlcihjdHgpO1xuICAgICAgaWYgKGJpbmQgJiYgZGF0YVBvaW50ZXIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBgd2FybmluZzogY29udHJvbCBcIiR7ZGF0YVBvaW50ZXJ9XCIgaXMgbm90IGJvdW5kIHRvIHRoZSBBbmd1bGFyIEZvcm1Hcm91cC5gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdHguYm91bmRDb250cm9sO1xuICB9XG5cbiAgZm9ybWF0RXJyb3JzKGVycm9yczogYW55LCB2YWxpZGF0aW9uTWVzc2FnZXM6IGFueSA9IHt9KTogc3RyaW5nIHtcbiAgICBpZiAoaXNFbXB0eShlcnJvcnMpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKCFpc09iamVjdCh2YWxpZGF0aW9uTWVzc2FnZXMpKSB7XG4gICAgICB2YWxpZGF0aW9uTWVzc2FnZXMgPSB7fTtcbiAgICB9XG4gICAgY29uc3QgYWRkU3BhY2VzID0gc3RyaW5nID0+XG4gICAgICBzdHJpbmdbMF0udG9VcHBlckNhc2UoKSArXG4gICAgICAoc3RyaW5nLnNsaWNlKDEpIHx8ICcnKVxuICAgICAgICAucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxICQyJylcbiAgICAgICAgLnJlcGxhY2UoL18vZywgJyAnKTtcbiAgICBjb25zdCBmb3JtYXRFcnJvciA9IGVycm9yID0+XG4gICAgICB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnXG4gICAgICAgID8gT2JqZWN0LmtleXMoZXJyb3IpXG4gICAgICAgICAgLm1hcChrZXkgPT5cbiAgICAgICAgICAgIGVycm9yW2tleV0gPT09IHRydWVcbiAgICAgICAgICAgICAgPyBhZGRTcGFjZXMoa2V5KVxuICAgICAgICAgICAgICA6IGVycm9yW2tleV0gPT09IGZhbHNlXG4gICAgICAgICAgICAgICAgPyAnTm90ICcgKyBhZGRTcGFjZXMoa2V5KVxuICAgICAgICAgICAgICAgIDogYWRkU3BhY2VzKGtleSkgKyAnOiAnICsgZm9ybWF0RXJyb3IoZXJyb3Jba2V5XSlcbiAgICAgICAgICApXG4gICAgICAgICAgLmpvaW4oJywgJylcbiAgICAgICAgOiBhZGRTcGFjZXMoZXJyb3IudG9TdHJpbmcoKSk7XG4gICAgY29uc3QgbWVzc2FnZXMgPSBbXTtcbiAgICByZXR1cm4gKFxuICAgICAgT2JqZWN0LmtleXMoZXJyb3JzKVxuICAgICAgICAvLyBIaWRlICdyZXF1aXJlZCcgZXJyb3IsIHVubGVzcyBpdCBpcyB0aGUgb25seSBvbmVcbiAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICBlcnJvcktleSA9PlxuICAgICAgICAgICAgZXJyb3JLZXkgIT09ICdyZXF1aXJlZCcgfHwgT2JqZWN0LmtleXMoZXJyb3JzKS5sZW5ndGggPT09IDFcbiAgICAgICAgKVxuICAgICAgICAubWFwKGVycm9yS2V5ID0+XG4gICAgICAgICAgLy8gSWYgdmFsaWRhdGlvbk1lc3NhZ2VzIGlzIGEgc3RyaW5nLCByZXR1cm4gaXRcbiAgICAgICAgICB0eXBlb2YgdmFsaWRhdGlvbk1lc3NhZ2VzID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgPyB2YWxpZGF0aW9uTWVzc2FnZXNcbiAgICAgICAgICAgIDogLy8gSWYgY3VzdG9tIGVycm9yIG1lc3NhZ2UgaXMgYSBmdW5jdGlvbiwgcmV0dXJuIGZ1bmN0aW9uIHJlc3VsdFxuICAgICAgICAgICAgdHlwZW9mIHZhbGlkYXRpb25NZXNzYWdlc1tlcnJvcktleV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgPyB2YWxpZGF0aW9uTWVzc2FnZXNbZXJyb3JLZXldKGVycm9yc1tlcnJvcktleV0pXG4gICAgICAgICAgICAgIDogLy8gSWYgY3VzdG9tIGVycm9yIG1lc3NhZ2UgaXMgYSBzdHJpbmcsIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGFuZCByZXR1cm5cbiAgICAgICAgICAgICAgdHlwZW9mIHZhbGlkYXRpb25NZXNzYWdlc1tlcnJvcktleV0gPT09ICdzdHJpbmcnXG4gICAgICAgICAgICAgICAgPyAvLyBEb2VzIGVycm9yIG1lc3NhZ2UgaGF2ZSBhbnkge3twcm9wZXJ0eX19IHBsYWNlaG9sZGVycz9cbiAgICAgICAgICAgICAgICAhL3t7Lis/fX0vLnRlc3QodmFsaWRhdGlvbk1lc3NhZ2VzW2Vycm9yS2V5XSlcbiAgICAgICAgICAgICAgICAgID8gdmFsaWRhdGlvbk1lc3NhZ2VzW2Vycm9yS2V5XVxuICAgICAgICAgICAgICAgICAgOiAvLyBSZXBsYWNlIHt7cHJvcGVydHl9fSBwbGFjZWhvbGRlcnMgd2l0aCB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGVycm9yc1tlcnJvcktleV0pLnJlZHVjZShcbiAgICAgICAgICAgICAgICAgICAgKGVycm9yTWVzc2FnZSwgZXJyb3JQcm9wZXJ0eSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2UucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZWdFeHAoJ3t7JyArIGVycm9yUHJvcGVydHkgKyAnfX0nLCAnZycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzW2Vycm9yS2V5XVtlcnJvclByb3BlcnR5XVxuICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb25NZXNzYWdlc1tlcnJvcktleV1cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICA6IC8vIElmIG5vIGN1c3RvbSBlcnJvciBtZXNzYWdlLCByZXR1cm4gZm9ybWF0dGVkIGVycm9yIGRhdGEgaW5zdGVhZFxuICAgICAgICAgICAgICAgIGFkZFNwYWNlcyhlcnJvcktleSkgKyAnIEVycm9yOiAnICsgZm9ybWF0RXJyb3IoZXJyb3JzW2Vycm9yS2V5XSlcbiAgICAgICAgKVxuICAgICAgICAuam9pbignPGJyPicpXG4gICAgKTtcbiAgfVxuXG4gIHVwZGF0ZVZhbHVlKGN0eDogYW55LCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gU2V0IHZhbHVlIG9mIGN1cnJlbnQgY29udHJvbFxuICAgIGN0eC5jb250cm9sVmFsdWUgPSB2YWx1ZTtcbiAgICBpZiAoY3R4LmJvdW5kQ29udHJvbCkge1xuICAgICAgY3R4LmZvcm1Db250cm9sLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIGN0eC5mb3JtQ29udHJvbC5tYXJrQXNEaXJ0eSgpO1xuICAgIH1cbiAgICBjdHgubGF5b3V0Tm9kZS52YWx1ZSA9IHZhbHVlO1xuXG4gICAgLy8gU2V0IHZhbHVlcyBvZiBhbnkgcmVsYXRlZCBjb250cm9scyBpbiBjb3B5VmFsdWVUbyBhcnJheVxuICAgIGlmIChpc0FycmF5KGN0eC5vcHRpb25zLmNvcHlWYWx1ZVRvKSkge1xuICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGN0eC5vcHRpb25zLmNvcHlWYWx1ZVRvKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldENvbnRyb2wgPSBnZXRDb250cm9sKHRoaXMuZm9ybUdyb3VwLCBpdGVtKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGlzT2JqZWN0KHRhcmdldENvbnRyb2wpICYmXG4gICAgICAgICAgdHlwZW9mIHRhcmdldENvbnRyb2wuc2V0VmFsdWUgPT09ICdmdW5jdGlvbidcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGFyZ2V0Q29udHJvbC5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgdGFyZ2V0Q29udHJvbC5tYXJrQXNEaXJ0eSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlQXJyYXlDaGVja2JveExpc3QoY3R4OiBhbnksIGNoZWNrYm94TGlzdDogVGl0bGVNYXBJdGVtW10pOiB2b2lkIHtcbiAgICBjb25zdCBmb3JtQXJyYXkgPSA8VW50eXBlZEZvcm1BcnJheT50aGlzLmdldEZvcm1Db250cm9sKGN0eCk7XG5cbiAgICAvLyBSZW1vdmUgYWxsIGV4aXN0aW5nIGl0ZW1zXG4gICAgd2hpbGUgKGZvcm1BcnJheS52YWx1ZS5sZW5ndGgpIHtcbiAgICAgIGZvcm1BcnJheS5yZW1vdmVBdCgwKTtcbiAgICB9XG5cbiAgICAvLyBSZS1hZGQgYW4gaXRlbSBmb3IgZWFjaCBjaGVja2VkIGJveFxuICAgIGNvbnN0IHJlZlBvaW50ZXIgPSByZW1vdmVSZWN1cnNpdmVSZWZlcmVuY2VzKFxuICAgICAgY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIgKyAnLy0nLFxuICAgICAgdGhpcy5kYXRhUmVjdXJzaXZlUmVmTWFwLFxuICAgICAgdGhpcy5hcnJheU1hcFxuICAgICk7XG4gICAgZm9yIChjb25zdCBjaGVja2JveEl0ZW0gb2YgY2hlY2tib3hMaXN0KSB7XG4gICAgICBpZiAoY2hlY2tib3hJdGVtLmNoZWNrZWQpIHtcbiAgICAgICAgY29uc3QgbmV3Rm9ybUNvbnRyb2wgPSBidWlsZEZvcm1Hcm91cChcbiAgICAgICAgICB0aGlzLnRlbXBsYXRlUmVmTGlicmFyeVtyZWZQb2ludGVyXVxuICAgICAgICApO1xuICAgICAgICBuZXdGb3JtQ29udHJvbC5zZXRWYWx1ZShjaGVja2JveEl0ZW0udmFsdWUpO1xuICAgICAgICBmb3JtQXJyYXkucHVzaChuZXdGb3JtQ29udHJvbCk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvcm1BcnJheS5tYXJrQXNEaXJ0eSgpO1xuICB9XG5cbiAgZ2V0Rm9ybUNvbnRyb2woY3R4OiBhbnkpOiBBYnN0cmFjdENvbnRyb2wge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgIGN0eC5sYXlvdXROb2RlLnR5cGUgPT09ICckcmVmJ1xuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBnZXRDb250cm9sKHRoaXMuZm9ybUdyb3VwLCB0aGlzLmdldERhdGFQb2ludGVyKGN0eCkpO1xuICB9XG5cbiAgZ2V0Rm9ybUNvbnRyb2xWYWx1ZShjdHg6IGFueSk6IEFic3RyYWN0Q29udHJvbCB7XG4gICAgaWYgKFxuICAgICAgIWN0eC5sYXlvdXROb2RlIHx8XG4gICAgICAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyKSB8fFxuICAgICAgY3R4LmxheW91dE5vZGUudHlwZSA9PT0gJyRyZWYnXG4gICAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udHJvbCA9IGdldENvbnRyb2wodGhpcy5mb3JtR3JvdXAsIHRoaXMuZ2V0RGF0YVBvaW50ZXIoY3R4KSk7XG4gICAgcmV0dXJuIGNvbnRyb2wgPyBjb250cm9sLnZhbHVlIDogbnVsbDtcbiAgfVxuXG4gIGdldEZvcm1Db250cm9sR3JvdXAoY3R4OiBhbnkpOiBVbnR5cGVkRm9ybUFycmF5IHwgVW50eXBlZEZvcm1Hcm91cCB7XG4gICAgaWYgKCFjdHgubGF5b3V0Tm9kZSB8fCAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBnZXRDb250cm9sKHRoaXMuZm9ybUdyb3VwLCB0aGlzLmdldERhdGFQb2ludGVyKGN0eCksIHRydWUpO1xuICB9XG5cbiAgZ2V0Rm9ybUNvbnRyb2xOYW1lKGN0eDogYW55KTogc3RyaW5nIHtcbiAgICBpZiAoXG4gICAgICAhY3R4LmxheW91dE5vZGUgfHxcbiAgICAgICFpc0RlZmluZWQoY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmRhdGFJbmRleClcbiAgICApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gSnNvblBvaW50ZXIudG9LZXkodGhpcy5nZXREYXRhUG9pbnRlcihjdHgpKTtcbiAgfVxuXG4gIGdldExheW91dEFycmF5KGN0eDogYW55KTogYW55W10ge1xuICAgIHJldHVybiBKc29uUG9pbnRlci5nZXQodGhpcy5sYXlvdXQsIHRoaXMuZ2V0TGF5b3V0UG9pbnRlcihjdHgpLCAwLCAtMSk7XG4gIH1cblxuICBnZXRQYXJlbnROb2RlKGN0eDogYW55KTogYW55IHtcbiAgICByZXR1cm4gSnNvblBvaW50ZXIuZ2V0KHRoaXMubGF5b3V0LCB0aGlzLmdldExheW91dFBvaW50ZXIoY3R4KSwgMCwgLTIpO1xuICB9XG5cbiAgZ2V0RGF0YVBvaW50ZXIoY3R4OiBhbnkpOiBzdHJpbmcge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgICFoYXNWYWx1ZShjdHguZGF0YUluZGV4KVxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBKc29uUG9pbnRlci50b0luZGV4ZWRQb2ludGVyKFxuICAgICAgY3R4LmxheW91dE5vZGUuZGF0YVBvaW50ZXIsXG4gICAgICBjdHguZGF0YUluZGV4LFxuICAgICAgdGhpcy5hcnJheU1hcFxuICAgICk7XG4gIH1cblxuICBnZXRMYXlvdXRQb2ludGVyKGN0eDogYW55KTogc3RyaW5nIHtcbiAgICBpZiAoIWhhc1ZhbHVlKGN0eC5sYXlvdXRJbmRleCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gJy8nICsgY3R4LmxheW91dEluZGV4LmpvaW4oJy9pdGVtcy8nKTtcbiAgfVxuXG4gIGlzQ29udHJvbEJvdW5kKGN0eDogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKFxuICAgICAgIWN0eC5sYXlvdXROb2RlIHx8XG4gICAgICAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyKSB8fFxuICAgICAgIWhhc1ZhbHVlKGN0eC5kYXRhSW5kZXgpXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRyb2xHcm91cCA9IHRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpO1xuICAgIGNvbnN0IG5hbWUgPSB0aGlzLmdldEZvcm1Db250cm9sTmFtZShjdHgpO1xuICAgIHJldHVybiBjb250cm9sR3JvdXAgPyBoYXNPd24oY29udHJvbEdyb3VwLmNvbnRyb2xzLCBuYW1lKSA6IGZhbHNlO1xuICB9XG5cbiAgYWRkSXRlbShjdHg6IGFueSwgbmFtZT86IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS4kcmVmKSB8fFxuICAgICAgIWhhc1ZhbHVlKGN0eC5kYXRhSW5kZXgpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmxheW91dEluZGV4KVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIG5ldyBBbmd1bGFyIGZvcm0gY29udHJvbCBmcm9tIGEgdGVtcGxhdGUgaW4gdGVtcGxhdGVSZWZMaWJyYXJ5XG4gICAgY29uc3QgbmV3Rm9ybUdyb3VwID0gYnVpbGRGb3JtR3JvdXAoXG4gICAgICB0aGlzLnRlbXBsYXRlUmVmTGlicmFyeVtjdHgubGF5b3V0Tm9kZS4kcmVmXVxuICAgICk7XG5cbiAgICAvLyBBZGQgdGhlIG5ldyBmb3JtIGNvbnRyb2wgdG8gdGhlIHBhcmVudCBmb3JtQXJyYXkgb3IgZm9ybUdyb3VwXG4gICAgaWYgKGN0eC5sYXlvdXROb2RlLmFycmF5SXRlbSkge1xuICAgICAgLy8gQWRkIG5ldyBhcnJheSBpdGVtIHRvIGZvcm1BcnJheVxuICAgICAgKDxVbnR5cGVkRm9ybUFycmF5PnRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpKS5wdXNoKG5ld0Zvcm1Hcm91cCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFkZCBuZXcgJHJlZiBpdGVtIHRvIGZvcm1Hcm91cFxuICAgICAgKDxVbnR5cGVkRm9ybUdyb3VwPnRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpKS5hZGRDb250cm9sKFxuICAgICAgICBuYW1lIHx8IHRoaXMuZ2V0Rm9ybUNvbnRyb2xOYW1lKGN0eCksXG4gICAgICAgIG5ld0Zvcm1Hcm91cFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IGEgbmV3IGxheW91dE5vZGUgZnJvbSBsYXlvdXRSZWZMaWJyYXJ5XG4gICAgY29uc3QgbmV3TGF5b3V0Tm9kZSA9IGdldExheW91dE5vZGUoY3R4LmxheW91dE5vZGUsIHRoaXMpO1xuICAgIG5ld0xheW91dE5vZGUuYXJyYXlJdGVtID0gY3R4LmxheW91dE5vZGUuYXJyYXlJdGVtO1xuICAgIGlmIChjdHgubGF5b3V0Tm9kZS5hcnJheUl0ZW1UeXBlKSB7XG4gICAgICBuZXdMYXlvdXROb2RlLmFycmF5SXRlbVR5cGUgPSBjdHgubGF5b3V0Tm9kZS5hcnJheUl0ZW1UeXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgbmV3TGF5b3V0Tm9kZS5hcnJheUl0ZW1UeXBlO1xuICAgIH1cbiAgICBpZiAobmFtZSkge1xuICAgICAgbmV3TGF5b3V0Tm9kZS5uYW1lID0gbmFtZTtcbiAgICAgIG5ld0xheW91dE5vZGUuZGF0YVBvaW50ZXIgKz0gJy8nICsgSnNvblBvaW50ZXIuZXNjYXBlKG5hbWUpO1xuICAgICAgbmV3TGF5b3V0Tm9kZS5vcHRpb25zLnRpdGxlID0gZml4VGl0bGUobmFtZSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBuZXcgbGF5b3V0Tm9kZSB0byB0aGUgZm9ybSBsYXlvdXRcbiAgICBKc29uUG9pbnRlci5pbnNlcnQodGhpcy5sYXlvdXQsIHRoaXMuZ2V0TGF5b3V0UG9pbnRlcihjdHgpLCBuZXdMYXlvdXROb2RlKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgbW92ZUFycmF5SXRlbShjdHg6IGFueSwgb2xkSW5kZXg6IG51bWJlciwgbmV3SW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmIChcbiAgICAgICFjdHgubGF5b3V0Tm9kZSB8fFxuICAgICAgIWlzRGVmaW5lZChjdHgubGF5b3V0Tm9kZS5kYXRhUG9pbnRlcikgfHxcbiAgICAgICFoYXNWYWx1ZShjdHguZGF0YUluZGV4KSB8fFxuICAgICAgIWhhc1ZhbHVlKGN0eC5sYXlvdXRJbmRleCkgfHxcbiAgICAgICFpc0RlZmluZWQob2xkSW5kZXgpIHx8XG4gICAgICAhaXNEZWZpbmVkKG5ld0luZGV4KSB8fFxuICAgICAgb2xkSW5kZXggPT09IG5ld0luZGV4XG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gTW92ZSBpdGVtIGluIHRoZSBmb3JtQXJyYXlcbiAgICBjb25zdCBmb3JtQXJyYXkgPSA8VW50eXBlZEZvcm1BcnJheT50aGlzLmdldEZvcm1Db250cm9sR3JvdXAoY3R4KTtcbiAgICBjb25zdCBhcnJheUl0ZW0gPSBmb3JtQXJyYXkuYXQob2xkSW5kZXgpO1xuICAgIGZvcm1BcnJheS5yZW1vdmVBdChvbGRJbmRleCk7XG4gICAgZm9ybUFycmF5Lmluc2VydChuZXdJbmRleCwgYXJyYXlJdGVtKTtcbiAgICBmb3JtQXJyYXkudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuXG4gICAgLy8gTW92ZSBsYXlvdXQgaXRlbVxuICAgIGNvbnN0IGxheW91dEFycmF5ID0gdGhpcy5nZXRMYXlvdXRBcnJheShjdHgpO1xuICAgIGxheW91dEFycmF5LnNwbGljZShuZXdJbmRleCwgMCwgbGF5b3V0QXJyYXkuc3BsaWNlKG9sZEluZGV4LCAxKVswXSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZW1vdmVJdGVtKGN0eDogYW55KTogYm9vbGVhbiB7XG4gICAgaWYgKFxuICAgICAgIWN0eC5sYXlvdXROb2RlIHx8XG4gICAgICAhaXNEZWZpbmVkKGN0eC5sYXlvdXROb2RlLmRhdGFQb2ludGVyKSB8fFxuICAgICAgIWhhc1ZhbHVlKGN0eC5kYXRhSW5kZXgpIHx8XG4gICAgICAhaGFzVmFsdWUoY3R4LmxheW91dEluZGV4KVxuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0aGUgQW5ndWxhciBmb3JtIGNvbnRyb2wgZnJvbSB0aGUgcGFyZW50IGZvcm1BcnJheSBvciBmb3JtR3JvdXBcbiAgICBpZiAoY3R4LmxheW91dE5vZGUuYXJyYXlJdGVtKSB7XG4gICAgICAvLyBSZW1vdmUgYXJyYXkgaXRlbSBmcm9tIGZvcm1BcnJheVxuICAgICAgKDxVbnR5cGVkRm9ybUFycmF5PnRoaXMuZ2V0Rm9ybUNvbnRyb2xHcm91cChjdHgpKS5yZW1vdmVBdChcbiAgICAgICAgY3R4LmRhdGFJbmRleFtjdHguZGF0YUluZGV4Lmxlbmd0aCAtIDFdXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZW1vdmUgJHJlZiBpdGVtIGZyb20gZm9ybUdyb3VwXG4gICAgICAoPFVudHlwZWRGb3JtR3JvdXA+dGhpcy5nZXRGb3JtQ29udHJvbEdyb3VwKGN0eCkpLnJlbW92ZUNvbnRyb2woXG4gICAgICAgIHRoaXMuZ2V0Rm9ybUNvbnRyb2xOYW1lKGN0eClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGxheW91dE5vZGUgZnJvbSBsYXlvdXRcbiAgICBKc29uUG9pbnRlci5yZW1vdmUodGhpcy5sYXlvdXQsIHRoaXMuZ2V0TGF5b3V0UG9pbnRlcihjdHgpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19
