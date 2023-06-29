import { Framework } from './framework';
import { WidgetLibraryService } from '../widget-library/widget-library.service';
import * as i0 from "@angular/core";
export declare class FrameworkLibraryService {
    private frameworks;
    private widgetLibrary;
    activeFramework: Framework;
    stylesheets: (HTMLStyleElement | HTMLLinkElement)[];
    scripts: HTMLScriptElement[];
    loadExternalAssets: boolean;
    defaultFramework: string;
    frameworkLibrary: {
        [name: string]: Framework;
    };
    constructor(frameworks: any[], widgetLibrary: WidgetLibraryService);
    setLoadExternalAssets(loadExternalAssets?: boolean): void;
    setFramework(framework?: string | Framework, loadExternalAssets?: boolean): boolean;
    registerFrameworkWidgets(framework: Framework): boolean;
    hasFramework(type: string): boolean;
    getFramework(): any;
    getFrameworkWidgets(): any;
    getFrameworkStylesheets(load?: boolean): string[];
    getFrameworkScripts(load?: boolean): string[];
    static ɵfac: i0.ɵɵFactoryDeclaration<FrameworkLibraryService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FrameworkLibraryService>;
}
