import { OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { JsonSchemaFormService } from 'vendor/@ajsf/core';
import * as i0 from "@angular/core";
export declare class MaterialCheckboxComponent implements OnInit {
    private jsf;
    formControl: AbstractControl;
    controlName: string;
    controlValue: any;
    controlDisabled: boolean;
    boundControl: boolean;
    options: any;
    trueValue: any;
    falseValue: any;
    showSlideToggle: boolean;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    updateValue(event: any): void;
    get isChecked(): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<MaterialCheckboxComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MaterialCheckboxComponent, "material-checkbox-widget", never, { "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false>;
}
