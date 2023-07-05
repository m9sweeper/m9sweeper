import { JsonSchemaFormService } from 'vendor/@ajsf/core';
import * as i0 from "@angular/core";
export declare class FlexLayoutRootComponent {
    private jsf;
    dataIndex: number[];
    layoutIndex: number[];
    layout: any[];
    isFlexItem: boolean;
    constructor(jsf: JsonSchemaFormService);
    removeItem(item: any): void;
    getFlexAttribute(node: any, attribute: string): any;
    showWidget(layoutNode: any): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<FlexLayoutRootComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FlexLayoutRootComponent, "flex-layout-root-widget", never, { "dataIndex": "dataIndex"; "layoutIndex": "layoutIndex"; "layout": "layout"; "isFlexItem": "isFlexItem"; }, {}, never, never, false>;
}
