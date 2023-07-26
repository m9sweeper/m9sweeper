import { Framework, FrameworkLibraryService, JsonSchemaFormModule, JsonSchemaFormService, WidgetLibraryModule, WidgetLibraryService } from '@ajsf/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MaterialDesignFramework } from './material-design.framework.mjs';
import { MATERIAL_FRAMEWORK_COMPONENTS } from './widgets/public_api.mjs';
import { fixAngularFlex } from './angular-flex-monkey-patch.mjs';
import * as i0 from "@angular/core";
import * as i1 from "./widgets/flex-layout-root.component.mjs";
import * as i2 from "./widgets/flex-layout-section.component.mjs";
import * as i3 from "./widgets/material-add-reference.component.mjs";
import * as i4 from "./widgets/material-one-of.component.mjs";
import * as i5 from "./widgets/material-button.component.mjs";
import * as i6 from "./widgets/material-button-group.component.mjs";
import * as i7 from "./widgets/material-checkbox.component.mjs";
import * as i8 from "./widgets/material-checkboxes.component.mjs";
import * as i9 from "./widgets/material-chip-list.component.mjs";
import * as i10 from "./widgets/material-datepicker.component.mjs";
import * as i11 from "./widgets/material-file.component.mjs";
import * as i12 from "./widgets/material-input.component.mjs";
import * as i13 from "./widgets/material-number.component.mjs";
import * as i14 from "./widgets/material-radios.component.mjs";
import * as i15 from "./widgets/material-select.component.mjs";
import * as i16 from "./widgets/material-slider.component.mjs";
import * as i17 from "./widgets/material-stepper.component.mjs";
import * as i18 from "./widgets/material-tabs.component.mjs";
import * as i19 from "./widgets/material-textarea.component.mjs";
import * as i20 from "./material-design-framework.component.mjs";
/**
 * unused @angular/material modules:
 * MatDialogModule, MatGridListModule, MatListModule, MatMenuModule,
 * MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule,
 * MatSidenavModule, MatSnackBarModule, MatSortModule, MatTableModule,
 * ,
 */
export const ANGULAR_MATERIAL_MODULES = [
    MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatCardModule,
    MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatExpansionModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule,
    MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
    MatStepperModule, MatTabsModule, MatTooltipModule,
    MatToolbarModule, MatMenuModule, MatToolbarModule,
];
export class MaterialDesignFrameworkModule {
    constructor() {
        fixAngularFlex();
    }
}
MaterialDesignFrameworkModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFrameworkModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MaterialDesignFrameworkModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFrameworkModule, declarations: [i1.FlexLayoutRootComponent, i2.FlexLayoutSectionComponent, i3.MaterialAddReferenceComponent, i4.MaterialOneOfComponent, i5.MaterialButtonComponent, i6.MaterialButtonGroupComponent, i7.MaterialCheckboxComponent, i8.MaterialCheckboxesComponent, i9.MaterialChipListComponent, i10.MaterialDatepickerComponent, i11.MaterialFileComponent, i12.MaterialInputComponent, i13.MaterialNumberComponent, i14.MaterialRadiosComponent, i15.MaterialSelectComponent, i16.MaterialSliderComponent, i17.MaterialStepperComponent, i18.MaterialTabsComponent, i19.MaterialTextareaComponent, i20.MaterialDesignFrameworkComponent], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule, MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatCardModule,
        MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatExpansionModule,
        MatFormFieldModule, MatIconModule, MatInputModule, MatNativeDateModule,
        MatRadioModule, MatSelectModule, MatSliderModule, MatSlideToggleModule,
        MatStepperModule, MatTabsModule, MatTooltipModule,
        MatToolbarModule, MatMenuModule, MatToolbarModule, WidgetLibraryModule,
        JsonSchemaFormModule], exports: [JsonSchemaFormModule, i1.FlexLayoutRootComponent, i2.FlexLayoutSectionComponent, i3.MaterialAddReferenceComponent, i4.MaterialOneOfComponent, i5.MaterialButtonComponent, i6.MaterialButtonGroupComponent, i7.MaterialCheckboxComponent, i8.MaterialCheckboxesComponent, i9.MaterialChipListComponent, i10.MaterialDatepickerComponent, i11.MaterialFileComponent, i12.MaterialInputComponent, i13.MaterialNumberComponent, i14.MaterialRadiosComponent, i15.MaterialSelectComponent, i16.MaterialSliderComponent, i17.MaterialStepperComponent, i18.MaterialTabsComponent, i19.MaterialTextareaComponent, i20.MaterialDesignFrameworkComponent] });
MaterialDesignFrameworkModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFrameworkModule, providers: [
        JsonSchemaFormService,
        FrameworkLibraryService,
        WidgetLibraryService,
        { provide: Framework, useClass: MaterialDesignFramework, multi: true },
    ], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule, ANGULAR_MATERIAL_MODULES, WidgetLibraryModule,
        JsonSchemaFormModule, JsonSchemaFormModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialDesignFrameworkModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        FormsModule,
                        ReactiveFormsModule,
                        FlexLayoutModule,
                        ...ANGULAR_MATERIAL_MODULES,
                        WidgetLibraryModule,
                        JsonSchemaFormModule,
                    ],
                    declarations: [
                        ...MATERIAL_FRAMEWORK_COMPONENTS,
                    ],
                    exports: [
                        JsonSchemaFormModule,
                        ...MATERIAL_FRAMEWORK_COMPONENTS,
                    ],
                    providers: [
                        JsonSchemaFormService,
                        FrameworkLibraryService,
                        WidgetLibraryService,
                        { provide: Framework, useClass: MaterialDesignFramework, multi: true },
                    ]
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=eventLog:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy9saWIvbWF0ZXJpYWwtZGVzaWduLWZyYW1ld29yay5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLFNBQVMsRUFDVCx1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQ3BCLHFCQUFxQixFQUNyQixtQkFBbUIsRUFBRSxvQkFBb0IsRUFDMUMsTUFBTSxZQUFZLENBQUM7QUFDcEIsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFdBQVcsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUN0RSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzNELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQy9ELE9BQU8sRUFBQyxrQkFB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LEdBQUcsNkJBQTZCO3FCQUNuQztvQkFDRCxPQUFPLEVBQUU7d0JBQ0wsb0JBQW9CO3dCQUNwQixHQUFHLDZCQUE2QjtxQkFDbkM7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLHFCQUFxQjt3QkFDckIsdUJBQXVCO3dCQUN2QixvQkFBb0I7d0JBQ3BCLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtxQkFDekU7aUJBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBGcmFtZXdvcmssXG4gIEZyYW1ld29ya0xpYnJhcnlTZXJ2aWNlLFxuICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgSnNvblNjaGVtYUZvcm1TZXJ2aWNlLFxuICBXaWRnZXRMaWJyYXJ5TW9kdWxlLCBXaWRnZXRMaWJyYXJ5U2VydmljZVxufSBmcm9tICdAYWpzZi9jb3JlJztcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0Zvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQge0ZsZXhMYXlvdXRNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2ZsZXgtbGF5b3V0JztcbmltcG9ydCB7TWF0QXV0b2NvbXBsZXRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9hdXRvY29tcGxldGUnO1xuaW1wb3J0IHtNYXRCdXR0b25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2J1dHRvbic7XG5pbXBvcnQge01hdEJ1dHRvblRvZ2dsZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uLXRvZ2dsZSc7XG5pbXBvcnQge01hdENhcmRNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NhcmQnO1xuaW1wb3J0IHtNYXRDaGVja2JveE1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY2hlY2tib3gnO1xuaW1wb3J0IHtNYXRDaGlwc01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY2hpcHMnO1xuaW1wb3J0IHtNYXROYXRpdmVEYXRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0RGF0ZXBpY2tlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGF0ZXBpY2tlcic7XG5pbXBvcnQge01hdEV4cGFuc2lvbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZXhwYW5zaW9uJztcbmltcG9ydCB7TWF0Rm9ybUZpZWxkTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9mb3JtLWZpZWxkJztcbmltcG9ydCB7TWF0SWNvbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvaWNvbic7XG5pbXBvcnQge01hdElucHV0TW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pbnB1dCc7XG5pbXBvcnQge01hdFJhZGlvTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9yYWRpbyc7XG5pbXBvcnQge01hdFNlbGVjdE1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0JztcbmltcG9ydCB7TWF0U2xpZGVUb2dnbGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NsaWRlLXRvZ2dsZSc7XG5pbXBvcnQge01hdFNsaWRlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc2xpZGVyJztcbmltcG9ydCB7TWF0U3RlcHBlck1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc3RlcHBlcic7XG5pbXBvcnQge01hdFRhYnNNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3RhYnMnO1xuaW1wb3J0IHtNYXRUb29sdGlwTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC90b29sdGlwJztcbmltcG9ydCB7TWF0TWVudU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbWVudSc7XG5pbXBvcnQge01hdFRvb2xiYXJNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3Rvb2xiYXInO1xuaW1wb3J0IHtNYXRlcmlhbERlc2lnbkZyYW1ld29ya30gZnJvbSAnLi9tYXRlcmlhbC1kZXNpZ24uZnJhbWV3b3JrJztcbmltcG9ydCB7TUFURVJJQUxfRlJBTUVXT1JLX0NPTVBPTkVOVFN9IGZyb20gJy4vd2lkZ2V0cy9wdWJsaWNfYXBpJztcbmltcG9ydCB7Zml4QW5ndWxhckZsZXh9IGZyb20gJy4vYW5ndWxhci1mbGV4LW1vbmtleS1wYXRjaCc7XG5cbi8qKlxuICogdW51c2VkIEBhbmd1bGFyL21hdGVyaWFsIG1vZHVsZXM6XG4gKiBNYXREaWFsb2dNb2R1bGUsIE1hdEdyaWRMaXN0TW9kdWxlLCBNYXRMaXN0TW9kdWxlLCBNYXRNZW51TW9kdWxlLFxuICogTWF0UGFnaW5hdG9yTW9kdWxlLCBNYXRQcm9ncmVzc0Jhck1vZHVsZSwgTWF0UHJvZ3Jlc3NTcGlubmVyTW9kdWxlLFxuICogTWF0U2lkZW5hdk1vZHVsZSwgTWF0U25hY2tCYXJNb2R1bGUsIE1hdFNvcnRNb2R1bGUsIE1hdFRhYmxlTW9kdWxlLFxuICogLFxuICovXG5leHBvcnQgY29uc3QgQU5HVUxBUl9NQVRFUklBTF9NT0RVTEVTID0gW1xuICBNYXRBdXRvY29tcGxldGVNb2R1bGUsIE1hdEJ1dHRvbk1vZHVsZSwgTWF0QnV0dG9uVG9nZ2xlTW9kdWxlLCBNYXRDYXJkTW9kdWxlLFxuICBNYXRDaGVja2JveE1vZHVsZSwgTWF0Q2hpcHNNb2R1bGUsIE1hdERhdGVwaWNrZXJNb2R1bGUsIE1hdEV4cGFuc2lvbk1vZHVsZSxcbiAgTWF0Rm9ybUZpZWxkTW9kdWxlLCBNYXRJY29uTW9kdWxlLCBNYXRJbnB1dE1vZHVsZSwgTWF0TmF0aXZlRGF0ZU1vZHVsZSxcbiAgTWF0UmFkaW9Nb2R1bGUsIE1hdFNlbGVjdE1vZHVsZSwgTWF0U2xpZGVyTW9kdWxlLCBNYXRTbGlkZVRvZ2dsZU1vZHVsZSxcbiAgTWF0U3RlcHBlck1vZHVsZSwgTWF0VGFic01vZHVsZSwgTWF0VG9vbHRpcE1vZHVsZSxcbiAgTWF0VG9vbGJhck1vZHVsZSwgTWF0TWVudU1vZHVsZSwgTWF0VG9vbGJhck1vZHVsZSxcbl07XG5cbkBOZ01vZHVsZSh7XG4gICAgaW1wb3J0czogW1xuICAgICAgICBDb21tb25Nb2R1bGUsXG4gICAgICAgIEZvcm1zTW9kdWxlLFxuICAgICAgICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICAgICAgICBGbGV4TGF5b3V0TW9kdWxlLFxuICAgICAgICAuLi5BTkdVTEFSX01BVEVSSUFMX01PRFVMRVMsXG4gICAgICAgIFdpZGdldExpYnJhcnlNb2R1bGUsXG4gICAgICAgIEpzb25TY2hlbWFGb3JtTW9kdWxlLFxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgIC4uLk1BVEVSSUFMX0ZSQU1FV09SS19DT01QT05FTlRTLFxuICAgIF0sXG4gICAgZXhwb3J0czogW1xuICAgICAgICBKc29uU2NoZW1hRm9ybU1vZHVsZSxcbiAgICAgICAgLi4uTUFURVJJQUxfRlJBTUVXT1JLX0NPTVBPTkVOVFMsXG4gICAgXSxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgSnNvblNjaGVtYUZvcm1TZXJ2aWNlLFxuICAgICAgICBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSxcbiAgICAgICAgV2lkZ2V0TGlicmFyeVNlcnZpY2UsXG4gICAgICAgIHsgcHJvdmlkZTogRnJhbWV3b3JrLCB1c2VDbGFzczogTWF0ZXJpYWxEZXNpZ25GcmFtZXdvcmssIG11bHRpOiB0cnVlIH0sXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbERlc2lnbkZyYW1ld29ya01vZHVsZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGZpeEFuZ3VsYXJGbGV4KCk7XG4gIH1cbn1cbiJdfQ==
