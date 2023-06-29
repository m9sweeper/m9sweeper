import { ChangeDetectorRef, OnChanges, OnInit } from '@angular/core';
import { JsonSchemaFormService } from 'vendor/@ajsf/core';
import * as i0 from "@angular/core";
export declare class MaterialDesignFrameworkComponent implements OnInit, OnChanges {
    private changeDetector;
    private jsf;
    frameworkInitialized: boolean;
    inputType: string;
    options: any;
    widgetLayoutNode: any;
    widgetOptions: any;
    formControl: any;
    parentArray: any;
    isOrderable: boolean;
    dynamicTitle: string;
    layoutNode: any;
    layoutIndex: number[];
    dataIndex: number[];
    constructor(changeDetector: ChangeDetectorRef, jsf: JsonSchemaFormService);
    get showRemoveButton(): boolean;
    ngOnInit(): void;
    ngOnChanges(): void;
    initializeFramework(): void;
    updateTitle(): void;
    removeItem(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<MaterialDesignFrameworkComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MaterialDesignFrameworkComponent, "material-design-framework", never, { "layoutNode": "layoutNode"; "layoutIndex": "layoutIndex"; "dataIndex": "dataIndex"; }, {}, never, never, false>;
}
