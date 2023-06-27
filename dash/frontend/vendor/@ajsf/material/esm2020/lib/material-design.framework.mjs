import { Injectable } from '@angular/core';
import { Framework } from '@ajsf/core';
import { FlexLayoutRootComponent, FlexLayoutSectionComponent, MaterialAddReferenceComponent, MaterialButtonComponent, MaterialButtonGroupComponent, MaterialCheckboxComponent, MaterialCheckboxesComponent, MaterialChipListComponent, MaterialDatepickerComponent, MaterialDesignFrameworkComponent, MaterialFileComponent, MaterialInputComponent, MaterialNumberComponent, MaterialOneOfComponent, MaterialRadiosComponent, MaterialSelectComponent, MaterialSliderComponent, MaterialStepperComponent, MaterialTabsComponent, MaterialTextareaComponent } from './widgets/public_api.mjs';
import * as i0 from "@angular/core";
// Material Design Framework
// https://github.com/angular/material2
export class MaterialDesignFramework extends Framework {
    constructor() {
        super(...arguments);
        this.name = 'material-design';
        this.framework = MaterialDesignFrameworkComponent;
        this.stylesheets = [
            '//fonts.googleapis.com/icon?family=Material+Icons',
            '//fonts.googleapis.com/css?family=Roboto:300,400,500,700',
        ];
        this.widgets = {
            'root': FlexLayoutRootComponent,
            'section': FlexLayoutSectionComponent,
            '$ref': MaterialAddReferenceComponent,
            'button': MaterialButtonComponent,
            'button-group': MaterialButtonGroupComponent,
            'checkbox': MaterialCheckboxComponent,
            'checkboxes': MaterialCheckboxesComponent,
            'chip-list': MaterialChipListComponent,
            'date': MaterialDatepickerComponent,
            'file': MaterialFileComponent,
            'number': MaterialNumberComponent,
            'one-of': MaterialOneOfComponent,
            'radios': MaterialRadiosComponent,
            'select': MaterialSelectComponent,
            'slider': MaterialSliderComponent,
            'stepper': MaterialStepperComponent,
            'tabs': MaterialTabsComponent,
            'text': MaterialInputComponent,
            'textarea': MaterialTextareaComponent,
            'alt-date': 'date',
            'any-of': 'one-of',
            'card': 'section',
            'color': 'text',
            'expansion-panel': 'section',
            'hidden': 'none',
            'image': 'none',
            'integer': 'number',
            'radiobuttons': 'button-group',
            'range': 'slider',
            'submit': 'button',
            'tagsinput': 'chip-list',
            'wizard': 'stepper',
        };
    }
}
MaterialDesignFramework.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MaterialDesignFramework, deps: null, target: i0.ɵɵFactoryTarget.Injectable });
MaterialDesignFramework.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MaterialDesignFramework });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.0", ngImport: i0, type: MaterialDesignFramework, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtZGVzaWduLmZyYW1ld29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtbWF0ZXJpYWwvc3JjL2xpYi9tYXRlcmlhbC1kZXNpZ24uZnJhbWV3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNyQyxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLDBCQUEwQixFQUMxQiw2QkFBNkIsRUFDN0IsdUJBQXVCLEVBQ3ZCLDRCQUE0QixFQUM1Qix5QkFBeUIsRUFDekIsMkJBQTJCLEVBQzNCLHlCQUF5QixFQUN6QiwyQkFBMkIsRUFDM0IsZ0NBQWdDLEVBQ2hDLHFCQUFxQixFQUNyQixzQkFBc0IsRUFDdEIsdUJBQXVCLEVBQ3ZCLHNCQUFzQixFQUN0Qix1QkFBdUIsRUFDdkIsdUJBQXVCLEVBQ3ZCLHVCQUF1QixFQUN2Qix3QkFBd0IsRUFDeEIscUJBQXFCLEVBQ3JCLHlCQUF5QixFQUMxQixNQUFNLHNCQUFzQixDQUFDOztBQUc5Qiw0QkFBNEI7QUFDNUIsdUNBQXVDO0FBR3ZDLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxTQUFTO0lBRHREOztRQUVFLFNBQUksR0FBRyxpQkFBaUIsQ0FBQztRQUV6QixjQUFTLEdBQUcsZ0NBQWdDLENBQUM7UUFFN0MsZ0JBQVcsR0FBRztZQUNaLG1EQUFtRDtZQUNuRCwwREFBMEQ7U0FDM0QsQ0FBQztRQUVGLFlBQU8sR0FBRztZQUNSLE1BQU0sRUFBRSx1QkFBdUI7WUFDL0IsU0FBUyxFQUFFLDBCQUEwQjtZQUNyQyxNQUFNLEVBQUUsNkJBQTZCO1lBQ3JDLFFBQVEsRUFBRSx1QkFBdUI7WUFDakMsY0FBYyxFQUFFLDRCQUE0QjtZQUM1QyxVQUFVLEVBQUUseUJBQXlCO1lBQ3JDLFlBQVksRUFBRSwyQkFBMkI7WUFDekMsV0FBVyxFQUFFLHlCQUF5QjtZQUN0QyxNQUFNLEVBQUUsMkJBQTJCO1lBQ25DLE1BQU0sRUFBRSxxQkFBcUI7WUFDN0IsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxRQUFRLEVBQUUsc0JBQXNCO1lBQ2hDLFFBQVEsRUFBRSx1QkFBdUI7WUFDakMsUUFBUSxFQUFFLHVCQUF1QjtZQUNqQyxRQUFRLEVBQUUsdUJBQXVCO1lBQ2pDLFNBQVMsRUFBRSx3QkFBd0I7WUFDbkMsTUFBTSxFQUFFLHFCQUFxQjtZQUM3QixNQUFNLEVBQUUsc0JBQXNCO1lBQzlCLFVBQVUsRUFBRSx5QkFBeUI7WUFDckMsVUFBVSxFQUFFLE1BQU07WUFDbEIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsTUFBTSxFQUFFLFNBQVM7WUFDakIsT0FBTyxFQUFFLE1BQU07WUFDZixpQkFBaUIsRUFBRSxTQUFTO1lBQzVCLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLE9BQU8sRUFBRSxNQUFNO1lBQ2YsU0FBUyxFQUFFLFFBQVE7WUFDbkIsY0FBYyxFQUFFLGNBQWM7WUFDOUIsT0FBTyxFQUFFLFFBQVE7WUFDakIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsV0FBVyxFQUFFLFdBQVc7WUFDeEIsUUFBUSxFQUFFLFNBQVM7U0FDcEIsQ0FBQztLQUNIOztvSEE1Q1ksdUJBQXVCO3dIQUF2Qix1QkFBdUI7MkZBQXZCLHVCQUF1QjtrQkFEbkMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0ZyYW1ld29ya30gZnJvbSAnQGFqc2YvY29yZSc7XG5pbXBvcnQge1xuICBGbGV4TGF5b3V0Um9vdENvbXBvbmVudCxcbiAgRmxleExheW91dFNlY3Rpb25Db21wb25lbnQsXG4gIE1hdGVyaWFsQWRkUmVmZXJlbmNlQ29tcG9uZW50LFxuICBNYXRlcmlhbEJ1dHRvbkNvbXBvbmVudCxcbiAgTWF0ZXJpYWxCdXR0b25Hcm91cENvbXBvbmVudCxcbiAgTWF0ZXJpYWxDaGVja2JveENvbXBvbmVudCxcbiAgTWF0ZXJpYWxDaGVja2JveGVzQ29tcG9uZW50LFxuICBNYXRlcmlhbENoaXBMaXN0Q29tcG9uZW50LFxuICBNYXRlcmlhbERhdGVwaWNrZXJDb21wb25lbnQsXG4gIE1hdGVyaWFsRGVzaWduRnJhbWV3b3JrQ29tcG9uZW50LFxuICBNYXRlcmlhbEZpbGVDb21wb25lbnQsXG4gIE1hdGVyaWFsSW5wdXRDb21wb25lbnQsXG4gIE1hdGVyaWFsTnVtYmVyQ29tcG9uZW50LFxuICBNYXRlcmlhbE9uZU9mQ29tcG9uZW50LFxuICBNYXRlcmlhbFJhZGlvc0NvbXBvbmVudCxcbiAgTWF0ZXJpYWxTZWxlY3RDb21wb25lbnQsXG4gIE1hdGVyaWFsU2xpZGVyQ29tcG9uZW50LFxuICBNYXRlcmlhbFN0ZXBwZXJDb21wb25lbnQsXG4gIE1hdGVyaWFsVGFic0NvbXBvbmVudCxcbiAgTWF0ZXJpYWxUZXh0YXJlYUNvbXBvbmVudFxufSBmcm9tICcuL3dpZGdldHMvcHVibGljX2FwaSc7XG5cblxuLy8gTWF0ZXJpYWwgRGVzaWduIEZyYW1ld29ya1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvbWF0ZXJpYWwyXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbERlc2lnbkZyYW1ld29yayBleHRlbmRzIEZyYW1ld29yayB7XG4gIG5hbWUgPSAnbWF0ZXJpYWwtZGVzaWduJztcblxuICBmcmFtZXdvcmsgPSBNYXRlcmlhbERlc2lnbkZyYW1ld29ya0NvbXBvbmVudDtcblxuICBzdHlsZXNoZWV0cyA9IFtcbiAgICAnLy9mb250cy5nb29nbGVhcGlzLmNvbS9pY29uP2ZhbWlseT1NYXRlcmlhbCtJY29ucycsXG4gICAgJy8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzP2ZhbWlseT1Sb2JvdG86MzAwLDQwMCw1MDAsNzAwJyxcbiAgXTtcblxuICB3aWRnZXRzID0ge1xuICAgICdyb290JzogRmxleExheW91dFJvb3RDb21wb25lbnQsXG4gICAgJ3NlY3Rpb24nOiBGbGV4TGF5b3V0U2VjdGlvbkNvbXBvbmVudCxcbiAgICAnJHJlZic6IE1hdGVyaWFsQWRkUmVmZXJlbmNlQ29tcG9uZW50LFxuICAgICdidXR0b24nOiBNYXRlcmlhbEJ1dHRvbkNvbXBvbmVudCxcbiAgICAnYnV0dG9uLWdyb3VwJzogTWF0ZXJpYWxCdXR0b25Hcm91cENvbXBvbmVudCxcbiAgICAnY2hlY2tib3gnOiBNYXRlcmlhbENoZWNrYm94Q29tcG9uZW50LFxuICAgICdjaGVja2JveGVzJzogTWF0ZXJpYWxDaGVja2JveGVzQ29tcG9uZW50LFxuICAgICdjaGlwLWxpc3QnOiBNYXRlcmlhbENoaXBMaXN0Q29tcG9uZW50LFxuICAgICdkYXRlJzogTWF0ZXJpYWxEYXRlcGlja2VyQ29tcG9uZW50LFxuICAgICdmaWxlJzogTWF0ZXJpYWxGaWxlQ29tcG9uZW50LFxuICAgICdudW1iZXInOiBNYXRlcmlhbE51bWJlckNvbXBvbmVudCxcbiAgICAnb25lLW9mJzogTWF0ZXJpYWxPbmVPZkNvbXBvbmVudCxcbiAgICAncmFkaW9zJzogTWF0ZXJpYWxSYWRpb3NDb21wb25lbnQsXG4gICAgJ3NlbGVjdCc6IE1hdGVyaWFsU2VsZWN0Q29tcG9uZW50LFxuICAgICdzbGlkZXInOiBNYXRlcmlhbFNsaWRlckNvbXBvbmVudCxcbiAgICAnc3RlcHBlcic6IE1hdGVyaWFsU3RlcHBlckNvbXBvbmVudCxcbiAgICAndGFicyc6IE1hdGVyaWFsVGFic0NvbXBvbmVudCxcbiAgICAndGV4dCc6IE1hdGVyaWFsSW5wdXRDb21wb25lbnQsXG4gICAgJ3RleHRhcmVhJzogTWF0ZXJpYWxUZXh0YXJlYUNvbXBvbmVudCxcbiAgICAnYWx0LWRhdGUnOiAnZGF0ZScsXG4gICAgJ2FueS1vZic6ICdvbmUtb2YnLFxuICAgICdjYXJkJzogJ3NlY3Rpb24nLFxuICAgICdjb2xvcic6ICd0ZXh0JyxcbiAgICAnZXhwYW5zaW9uLXBhbmVsJzogJ3NlY3Rpb24nLFxuICAgICdoaWRkZW4nOiAnbm9uZScsXG4gICAgJ2ltYWdlJzogJ25vbmUnLFxuICAgICdpbnRlZ2VyJzogJ251bWJlcicsXG4gICAgJ3JhZGlvYnV0dG9ucyc6ICdidXR0b24tZ3JvdXAnLFxuICAgICdyYW5nZSc6ICdzbGlkZXInLFxuICAgICdzdWJtaXQnOiAnYnV0dG9uJyxcbiAgICAndGFnc2lucHV0JzogJ2NoaXAtbGlzdCcsXG4gICAgJ3dpemFyZCc6ICdzdGVwcGVyJyxcbiAgfTtcbn1cbiJdfQ==
