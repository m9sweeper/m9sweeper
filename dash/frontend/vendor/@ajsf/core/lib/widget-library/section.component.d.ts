import { OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
import * as i0 from "@angular/core";
export declare class SectionComponent implements OnInit {
    private jsf;
    options: any;
    expanded: boolean;
    containerType: string;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(jsf: JsonSchemaFormService);
    get sectionTitle(): string;
    ngOnInit(): void;
    toggleExpanded(): void;
    getFlexAttribute(attribute: string): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<SectionComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SectionComponent, "section-widget", never, { "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false>;
}
