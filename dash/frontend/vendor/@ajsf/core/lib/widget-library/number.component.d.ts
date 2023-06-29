import { OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from '../json-schema-form.service';
import * as i0 from "@angular/core";
export declare class NumberComponent implements OnInit {
    private jsf;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    allowNegative: boolean;
    allowDecimal: boolean;
    allowExponents: boolean;
    lastValidNumber: string;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    updateValue(event: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NumberComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NumberComponent, "number-widget", never, { "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false>;
}
