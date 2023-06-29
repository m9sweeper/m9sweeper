import { OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from 'vendor/@ajsf/core';
import * as i0 from "@angular/core";
export declare class MaterialNumberComponent implements OnInit {
    matFormFieldDefaultOptions: any;
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
    constructor(matFormFieldDefaultOptions: any, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    updateValue(event: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MaterialNumberComponent, [{ optional: true; }, null]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MaterialNumberComponent, "material-number-widget", never, { "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false>;
}
