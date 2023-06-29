import { ComponentFactoryResolver, ComponentRef, OnChanges, OnInit, ViewContainerRef } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
import * as i0 from "@angular/core";
export declare class TemplateComponent implements OnInit, OnChanges {
    private componentFactory;
    private jsf;
    newComponent: ComponentRef<any>;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    widgetContainer: ViewContainerRef;
    constructor(componentFactory: ComponentFactoryResolver, jsf: JsonSchemaFormService);
    ngOnInit(): void;
    ngOnChanges(): void;
    updateComponent(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<TemplateComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TemplateComponent, "template-widget", never, { "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false>;
}
