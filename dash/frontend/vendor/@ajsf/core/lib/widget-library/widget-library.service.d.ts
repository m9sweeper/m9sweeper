import * as i0 from "@angular/core";
export declare class WidgetLibraryService {
    defaultWidget: string;
    widgetLibrary: any;
    registeredWidgets: any;
    frameworkWidgets: any;
    activeWidgets: any;
    constructor();
    setActiveWidgets(): boolean;
    setDefaultWidget(type: string): boolean;
    hasWidget(type: string, widgetSet?: string): boolean;
    hasDefaultWidget(type: string): boolean;
    registerWidget(type: string, widget: any): boolean;
    unRegisterWidget(type: string): boolean;
    unRegisterAllWidgets(unRegisterFrameworkWidgets?: boolean): boolean;
    registerFrameworkWidgets(widgets: any): boolean;
    unRegisterFrameworkWidgets(): boolean;
    getWidget(type?: string, widgetSet?: string): any;
    getAllWidgets(): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidgetLibraryService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WidgetLibraryService>;
}
