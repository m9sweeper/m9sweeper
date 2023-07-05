import { ChangeDetectorRef, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FrameworkLibraryService } from './framework-library/framework-library.service';
import { JsonSchemaFormService } from './json-schema-form.service';
import { WidgetLibraryService } from './widget-library/widget-library.service';
import * as i0 from '@angular/core';
export declare const JSON_SCHEMA_FORM_VALUE_ACCESSOR: any;
/**
 * @module 'JsonSchemaFormComponent' - Angular JSON Schema Form
 *
 * Root module of the Angular JSON Schema Form client-side library,
 * an Angular library which generates an HTML form from a JSON schema
 * structured data model and/or a JSON Schema Form layout description.
 *
 * This library also validates input data by the user, using both validators on
 * individual controls to provide real-time feedback while the user is filling
 * out the form, and then validating the entire input against the schema when
 * the form is submitted to make sure the returned JSON data object is valid.
 *
 * This library is similar to, and mostly API compatible with:
 *
 * - JSON Schema Form's Angular Schema Form library for AngularJs
 *   http://schemaform.io
 *   http://schemaform.io/examples/bootstrap-example.html (examples)
 *
 * - Mozilla's react-jsonschema-form library for React
 *   https://github.com/mozilla-services/react-jsonschema-form
 *   https://mozilla-services.github.io/react-jsonschema-form (examples)
 *
 * - Joshfire's JSON Form library for jQuery
 *   https://github.com/joshfire/jsonform
 *   http://ulion.github.io/jsonform/playground (examples)
 *
 * This library depends on:
 *  - Angular (obviously)                  https://angular.io
 *  - lodash, JavaScript utility library   https://github.com/lodash/lodash
 *  - ajv, Another JSON Schema validator   https://github.com/epoberezkin/ajv
 *
 * In addition, the Example Playground also depends on:
 *  - brace, Browserified Ace editor       http://thlorenz.github.io/brace
 */
export declare class JsonSchemaFormComponent implements ControlValueAccessor, OnChanges, OnInit {
    private changeDetector;
    private frameworkLibrary;
    private widgetLibrary;
    jsf: JsonSchemaFormService;
    private unsubscribeOnActivateForm$;
    debugOutput: any;
    formValueSubscription: any;
    formInitialized: boolean;
    objectWrap: boolean;
    formValuesInput: string;
    previousInputs: {
        schema: any;
        layout: any[];
        data: any;
        options: any;
        framework: any | string;
        widgets: any;
        form: any;
        model: any;
        JSONSchema: any;
        UISchema: any;
        formData: any;
        loadExternalAssets: boolean;
        debug: boolean;
    };
    schema: any;
    layout: any[];
    data: any;
    options: any;
    framework: any | string;
    widgets: any;
    form: any;
    model: any;
    JSONSchema: any;
    UISchema: any;
    formData: any;
    ngModel: any;
    language: string;
    loadExternalAssets: boolean;
    debug: boolean;
    get value(): any;
    set value(value: any);
    onChanges: EventEmitter<any>;
    onSubmit: EventEmitter<any>;
    isValid: EventEmitter<boolean>;
    validationErrors: EventEmitter<any>;
    formSchema: EventEmitter<any>;
    formLayout: EventEmitter<any>;
    dataChange: EventEmitter<any>;
    modelChange: EventEmitter<any>;
    formDataChange: EventEmitter<any>;
    ngModelChange: EventEmitter<any>;
    onChange: Function;
    onTouched: Function;
    constructor(changeDetector: ChangeDetectorRef, frameworkLibrary: FrameworkLibraryService, widgetLibrary: WidgetLibraryService, jsf: JsonSchemaFormService);
    private resetScriptsAndStyleSheets;
    private loadScripts;
    private loadStyleSheets;
    private loadAssets;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    writeValue(value: any): void;
    registerOnChange(fn: Function): void;
    registerOnTouched(fn: Function): void;
    setDisabledState(isDisabled: boolean): void;
    updateForm(): void;
    setFormValues(formValues: any, resetFirst?: boolean): void;
    submitForm(): void;
    /**
     * 'initializeForm' function
     *
     * - Update 'schema', 'layout', and 'formValues', from inputs.
     *
     * - Create 'schemaRefLibrary' and 'schemaRecursiveRefMap'
     *   to resolve schema $ref links, including recursive $ref links.
     *
     * - Create 'dataRecursiveRefMap' to resolve recursive links in data
     *   and corectly set output formats for recursively nested values.
     *
     * - Create 'layoutRefLibrary' and 'templateRefLibrary' to store
     *   new layout nodes and formGroup elements to use when dynamically
     *   adding form components to arrays and recursive $ref points.
     *
     * - Create 'dataMap' to map the data to the schema and template.
     *
     * - Create the master 'formGroupTemplate' then from it 'formGroup'
     *   the Angular formGroup used to control the reactive form.
     */
    initializeForm(): void;
    /**
     * 'initializeOptions' function
     *
     * Initialize 'options' (global form options) and set framework
     * Combine available inputs:
     * 1. options - recommended
     * 2. form.options - Single input style
     */
    private initializeOptions;
    /**
     * 'initializeSchema' function
     *
     * Initialize 'schema'
     * Use first available input:
     * 1. schema - recommended / Angular Schema Form style
     * 2. form.schema - Single input / JSON Form style
     * 3. JSONSchema - React JSON Schema Form style
     * 4. form.JSONSchema - For testing single input React JSON Schema Forms
     * 5. form - For testing single schema-only inputs
     *
     * ... if no schema input found, the 'activateForm' function, below,
     *     will make two additional attempts to build a schema
     * 6. If layout input - build schema from layout
     * 7. If data input - build schema from data
     */
    private initializeSchema;
    /**
     * 'initializeData' function
     *
     * Initialize 'formValues'
     * defulat or previously submitted values used to populate form
     * Use first available input:
     * 1. data - recommended
     * 2. model - Angular Schema Form style
     * 3. form.value - JSON Form style
     * 4. form.data - Single input style
     * 5. formData - React JSON Schema Form style
     * 6. form.formData - For easier testing of React JSON Schema Forms
     * 7. (none) no data - initialize data from schema and layout defaults only
     */
    private initializeData;
    /**
     * 'initializeLayout' function
     *
     * Initialize 'layout'
     * Use first available array input:
     * 1. layout - recommended
     * 2. form - Angular Schema Form style
     * 3. form.form - JSON Form style
     * 4. form.layout - Single input style
     * 5. (none) no layout - set default layout instead
     *    (full layout will be built later from the schema)
     *
     * Also, if alternate layout formats are available,
     * import from 'UISchema' or 'customFormItems'
     * used for React JSON Schema Form and JSON Form API compatibility
     * Use first available input:
     * 1. UISchema - React JSON Schema Form style
     * 2. form.UISchema - For testing single input React JSON Schema Forms
     * 2. form.customFormItems - JSON Form style
     * 3. (none) no input - don't import
     */
    private initializeLayout;
    /**
     * 'activateForm' function
     *
     * ...continued from 'initializeSchema' function, above
     * If 'schema' has not been initialized (i.e. no schema input found)
     * 6. If layout input - build schema from layout input
     * 7. If data input - build schema from data input
     *
     * Create final layout,
     * build the FormGroup template and the Angular FormGroup,
     * subscribe to changes,
     * and activate the form.
     */
    private activateForm;
    static ɵfac: i0.ɵɵFactoryDeclaration<JsonSchemaFormComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<JsonSchemaFormComponent, "json-schema-form", never, { "schema": "schema"; "layout": "layout"; "data": "data"; "options": "options"; "framework": "framework"; "widgets": "widgets"; "form": "form"; "model": "model"; "JSONSchema": "JSONSchema"; "UISchema": "UISchema"; "formData": "formData"; "ngModel": "ngModel"; "language": "language"; "loadExternalAssets": "loadExternalAssets"; "debug": "debug"; "value": "value"; }, { "onChanges": "onChanges"; "onSubmit": "onSubmit"; "isValid": "isValid"; "validationErrors": "validationErrors"; "formSchema": "formSchema"; "formLayout": "formLayout"; "dataChange": "dataChange"; "modelChange": "modelChange"; "formDataChange": "formDataChange"; "ngModelChange": "ngModelChange"; }, never, never, false>;
}
