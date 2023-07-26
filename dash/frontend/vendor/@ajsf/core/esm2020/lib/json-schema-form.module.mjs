import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { JsonSchemaFormComponent } from './json-schema-form.component.mjs';
import { NoFrameworkModule } from './framework-library/no-framework.module.mjs';
import { WidgetLibraryModule } from './widget-library/widget-library.module.mjs';
import * as i0 from "@angular/core";
export class JsonSchemaFormModule {
}
JsonSchemaFormModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
JsonSchemaFormModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormModule, declarations: [JsonSchemaFormComponent], imports: [CommonModule, FormsModule, ReactiveFormsModule,
        WidgetLibraryModule, NoFrameworkModule], exports: [JsonSchemaFormComponent, WidgetLibraryModule] });
JsonSchemaFormModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormModule, imports: [CommonModule, FormsModule, ReactiveFormsModule,
        WidgetLibraryModule, NoFrameworkModule, WidgetLibraryModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: JsonSchemaFormModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule, FormsModule, ReactiveFormsModule,
                        WidgetLibraryModule, NoFrameworkModule
                    ],
                    declarations: [JsonSchemaFormComponent],
                    exports: [JsonSchemaFormComponent, WidgetLibraryModule]
                }]
        }] });
//# sourceMappingURL=eventLog:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1zY2hlbWEtZm9ybS5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLWNvcmUvc3JjL2xpYi9qc29uLXNjaGVtYS1mb3JtLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDdkUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDNUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7O0FBVTdFLE1BQU0sT0FBTyxvQkFBb0I7O2lIQUFwQixvQkFBb0I7a0hBQXBCLG9CQUFvQixpQkFIaEIsdUJBQXVCLGFBSHBDLFlBQVksRUFBRSxXQUFXLEVBQUUsbUJBQW1CO1FBQzlDLG1CQUFtQixFQUFFLGlCQUFpQixhQUc5Qix1QkFBdUIsRUFBRSxtQkFBbUI7a0hBRTNDLG9CQUFvQixZQU43QixZQUFZLEVBQUUsV0FBVyxFQUFFLG1CQUFtQjtRQUM5QyxtQkFBbUIsRUFBRSxpQkFBaUIsRUFHTCxtQkFBbUI7MkZBRTNDLG9CQUFvQjtrQkFSaEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUU7d0JBQ1AsWUFBWSxFQUFFLFdBQVcsRUFBRSxtQkFBbUI7d0JBQzlDLG1CQUFtQixFQUFFLGlCQUFpQjtxQkFDdkM7b0JBQ0QsWUFBWSxFQUFFLENBQUMsdUJBQXVCLENBQUM7b0JBQ3ZDLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixDQUFDO2lCQUN4RCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybUNvbXBvbmVudCB9IGZyb20gJy4vanNvbi1zY2hlbWEtZm9ybS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTm9GcmFtZXdvcmtNb2R1bGUgfSBmcm9tICcuL2ZyYW1ld29yay1saWJyYXJ5L25vLWZyYW1ld29yay5tb2R1bGUnO1xuaW1wb3J0IHsgV2lkZ2V0TGlicmFyeU1vZHVsZSB9IGZyb20gJy4vd2lkZ2V0LWxpYnJhcnkvd2lkZ2V0LWxpYnJhcnkubW9kdWxlJztcblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSwgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gICAgV2lkZ2V0TGlicmFyeU1vZHVsZSwgTm9GcmFtZXdvcmtNb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbSnNvblNjaGVtYUZvcm1Db21wb25lbnRdLFxuICBleHBvcnRzOiBbSnNvblNjaGVtYUZvcm1Db21wb25lbnQsIFdpZGdldExpYnJhcnlNb2R1bGVdXG59KVxuZXhwb3J0IGNsYXNzIEpzb25TY2hlbWFGb3JtTW9kdWxlIHtcbn1cbiJdfQ==
