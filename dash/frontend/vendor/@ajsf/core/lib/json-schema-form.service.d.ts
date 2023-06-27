import { AbstractControl, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import * as i0 from '@angular/core';
export interface TitleMapItem {
    name?: string;
    value?: any;
    checked?: boolean;
    group?: string;
    items?: TitleMapItem[];
}
export interface ErrorMessages {
    [control_name: string]: {
        message: string | Function | Object;
        code: string;
    }[];
}
export declare class JsonSchemaFormService {
    JsonFormCompatibility: boolean;
    ReactJsonSchemaFormCompatibility: boolean;
    AngularSchemaFormCompatibility: boolean;
    tpldata: any;
    ajvOptions: any;
    ajv: any;
    validateFormData: any;
    formValues: any;
    data: any;
    schema: any;
    layout: any[];
    formGroupTemplate: any;
    formGroup: any;
    framework: any;
    formOptions: any;
    validData: any;
    isValid: boolean;
    ajvErrors: any;
    validationErrors: any;
    dataErrors: any;
    formValueSubscription: any;
    dataChanges: Subject<any>;
    isValidChanges: Subject<any>;
    validationErrorChanges: Subject<any>;
    arrayMap: Map<string, number>;
    dataMap: Map<string, any>;
    dataRecursiveRefMap: Map<string, string>;
    schemaRecursiveRefMap: Map<string, string>;
    schemaRefLibrary: any;
    layoutRefLibrary: any;
    templateRefLibrary: any;
    hasRootReference: boolean;
    language: string;
    defaultFormOptions: any;
    constructor();
    setLanguage(language?: string): void;
    getData(): any;
    getSchema(): any;
    getLayout(): any[];
    resetAllValues(): void;
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
    buildRemoteError(errors: ErrorMessages): void;
    validateData(newValue: any, updateSubscriptions?: boolean): void;
    buildFormGroupTemplate(formValues?: any, setValues?: boolean): void;
    buildFormGroup(): void;
    buildLayout(widgetLibrary: any): void;
    setOptions(newOptions: any): void;
    compileAjvSchema(): void;
    buildSchemaFromData(data?: any, requireAllFields?: boolean): any;
    buildSchemaFromLayout(layout?: any): any;
    setTpldata(newTpldata?: any): void;
    parseText(text?: string, value?: any, values?: any, key?: number | string): string;
    parseExpression(expression?: string, value?: any, values?: any, key?: number | string, tpldata?: any): any;
    setArrayItemTitle(parentCtx?: any, childNode?: any, index?: number): string;
    setItemTitle(ctx: any): string;
    evaluateCondition(layoutNode: any, dataIndex: number[]): boolean;
    initializeControl(ctx: any, bind?: boolean): boolean;
    formatErrors(errors: any, validationMessages?: any): string;
    updateValue(ctx: any, value: any): void;
    updateArrayCheckboxList(ctx: any, checkboxList: TitleMapItem[]): void;
    getFormControl(ctx: any): AbstractControl;
    getFormControlValue(ctx: any): AbstractControl;
    getFormControlGroup(ctx: any): UntypedFormArray | UntypedFormGroup;
    getFormControlName(ctx: any): string;
    getLayoutArray(ctx: any): any[];
    getParentNode(ctx: any): any;
    getDataPointer(ctx: any): string;
    getLayoutPointer(ctx: any): string;
    isControlBound(ctx: any): boolean;
    addItem(ctx: any, name?: string): boolean;
    moveArrayItem(ctx: any, oldIndex: number, newIndex: number): boolean;
    removeItem(ctx: any): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<JsonSchemaFormService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<JsonSchemaFormService>;
}
