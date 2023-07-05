import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from 'vendor/@ajsf/core';
import * as i0 from "@angular/core";
export declare class MaterialAddReferenceComponent implements OnInit {
    private jsf;
    options: any;
    itemCount: number;
    previousLayoutIndex: number[];
    previousDataIndex: number[];
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    ngOnInit(): void;
    get showAddButton(): boolean;
    addItem(event: any): void;
    get buttonText(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<MaterialAddReferenceComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MaterialAddReferenceComponent, "material-add-reference-widget", never, { "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false>;
}
