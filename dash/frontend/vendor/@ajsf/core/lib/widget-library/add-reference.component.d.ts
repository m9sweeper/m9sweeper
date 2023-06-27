import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
import * as i0 from "@angular/core";
export declare class AddReferenceComponent implements OnInit {
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
    static ɵfac: i0.ɵɵFactoryDeclaration<AddReferenceComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<AddReferenceComponent, "add-reference-widget", never, { "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false>;
}
