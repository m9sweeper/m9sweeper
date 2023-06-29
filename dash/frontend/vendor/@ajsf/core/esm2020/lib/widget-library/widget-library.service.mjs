import { AddReferenceComponent } from './add-reference.component.mjs';
import { ButtonComponent } from './button.component.mjs';
import { CheckboxComponent } from './checkbox.component.mjs';
import { CheckboxesComponent } from './checkboxes.component.mjs';
import { FileComponent } from './file.component.mjs';
import { hasOwn } from '../shared/utility.functions.mjs';
import { Injectable } from '@angular/core';
import { InputComponent } from './input.component.mjs';
import { MessageComponent } from './message.component.mjs';
import { NoneComponent } from './none.component.mjs';
import { NumberComponent } from './number.component.mjs';
import { OneOfComponent } from './one-of.component.mjs';
import { RadiosComponent } from './radios.component.mjs';
import { RootComponent } from './root.component.mjs';
import { SectionComponent } from './section.component.mjs';
import { SelectComponent } from './select.component.mjs';
import { SelectFrameworkComponent } from './select-framework.component.mjs';
import { SelectWidgetComponent } from './select-widget.component.mjs';
import { SubmitComponent } from './submit.component.mjs';
import { TabsComponent } from './tabs.component.mjs';
import { TemplateComponent } from './template.component.mjs';
import { TextareaComponent } from './textarea.component.mjs';
import * as i0 from "@angular/core";
export class WidgetLibraryService {
    constructor() {
        this.defaultWidget = 'text';
        this.widgetLibrary = {
            // Angular JSON Schema Form administrative widgets
            'none': NoneComponent,
            'root': RootComponent,
            'select-framework': SelectFrameworkComponent,
            'select-widget': SelectWidgetComponent,
            '$ref': AddReferenceComponent,
            // Free-form text HTML 'input' form control widgets <input type="...">
            'email': 'text',
            'integer': 'number',
            'number': NumberComponent,
            'password': 'text',
            'search': 'text',
            'tel': 'text',
            'text': InputComponent,
            'url': 'text',
            // Controlled text HTML 'input' form control widgets <input type="...">
            'color': 'text',
            'date': 'text',
            'datetime': 'text',
            'datetime-local': 'text',
            'month': 'text',
            'range': 'number',
            'time': 'text',
            'week': 'text',
            // Non-text HTML 'input' form control widgets <input type="...">
            // 'button': <input type="button"> not used, use <button> instead
            'checkbox': CheckboxComponent,
            'file': FileComponent,
            'hidden': 'text',
            'image': 'text',
            'radio': 'radios',
            'reset': 'submit',
            'submit': SubmitComponent,
            // Other (non-'input') HTML form control widgets
            'button': ButtonComponent,
            'select': SelectComponent,
            // 'option': automatically generated by select widgets
            // 'optgroup': automatically generated by select widgets
            'textarea': TextareaComponent,
            // HTML form control widget sets
            'checkboxes': CheckboxesComponent,
            'checkboxes-inline': 'checkboxes',
            'checkboxbuttons': 'checkboxes',
            'radios': RadiosComponent,
            'radios-inline': 'radios',
            'radiobuttons': 'radios',
            // HTML Layout widgets
            // 'label': automatically added to data widgets
            // 'legend': automatically added to fieldsets
            'section': SectionComponent,
            'div': 'section',
            'fieldset': 'section',
            'flex': 'section',
            // Non-HTML layout widgets
            'one-of': OneOfComponent,
            // TODO: Finish 'one-of' widget
            'array': 'section',
            'tabarray': 'tabs',
            'tab': 'section',
            'tabs': TabsComponent,
            'message': MessageComponent,
            'help': 'message',
            'msg': 'message',
            'html': 'message',
            'template': TemplateComponent,
            // Widgets included for compatibility with JSON Form API
            'advancedfieldset': 'section',
            'authfieldset': 'section',
            'optionfieldset': 'one-of',
            'selectfieldset': 'one-of',
            'conditional': 'section',
            'actions': 'section',
            'tagsinput': 'section',
            // See: http://ulion.github.io/jsonform/playground/?example=fields-checkboxbuttons
            // Widgets included for compatibility with React JSON Schema Form API
            'updown': 'number',
            'date-time': 'datetime-local',
            'alt-datetime': 'datetime-local',
            'alt-date': 'date',
            // Widgets included for compatibility with Angular Schema Form API
            'wizard': 'section',
            // Widgets included for compatibility with other libraries
            'textline': 'text',
            // Recommended 3rd-party add-on widgets (TODO: create wrappers for these...)
            // 'ng2-select': Select control replacement - http://valor-software.com/ng2-select/
            // 'flatpickr': Flatpickr date picker - https://github.com/chmln/flatpickr
            // 'pikaday': Pikaday date picker - https://github.com/dbushell/Pikaday
            // 'spectrum': Spectrum color picker - http://bgrins.github.io/spectrum
            // 'bootstrap-slider': Bootstrap Slider range control - https://github.com/seiyria/bootstrap-slider
            // 'ace': ACE code editor - https://ace.c9.io
            // 'ckeditor': CKEditor HTML / rich text editor - http://ckeditor.com
            // 'tinymce': TinyMCE HTML / rich text editor - https://www.tinymce.com
            // 'imageselect': Bootstrap drop-down image selector - http://silviomoreto.github.io/bootstrap-select
            // 'wysihtml5': HTML editor - http://jhollingworth.github.io/bootstrap-wysihtml5
            // 'quill': Quill HTML / rich text editor (?) - https://quilljs.com
        };
        this.registeredWidgets = {};
        this.frameworkWidgets = {};
        this.activeWidgets = {};
        this.setActiveWidgets();
    }
    setActiveWidgets() {
        this.activeWidgets = Object.assign({}, this.widgetLibrary, this.frameworkWidgets, this.registeredWidgets);
        for (const widgetName of Object.keys(this.activeWidgets)) {
            let widget = this.activeWidgets[widgetName];
            // Resolve aliases
            if (typeof widget === 'string') {
                const usedAliases = [];
                while (typeof widget === 'string' && !usedAliases.includes(widget)) {
                    usedAliases.push(widget);
                    widget = this.activeWidgets[widget];
                }
                if (typeof widget !== 'string') {
                    this.activeWidgets[widgetName] = widget;
                }
            }
        }
        return true;
    }
    setDefaultWidget(type) {
        if (!this.hasWidget(type)) {
            return false;
        }
        this.defaultWidget = type;
        return true;
    }
    hasWidget(type, widgetSet = 'activeWidgets') {
        if (!type || typeof type !== 'string') {
            return false;
        }
        return hasOwn(this[widgetSet], type);
    }
    hasDefaultWidget(type) {
        return this.hasWidget(type, 'widgetLibrary');
    }
    registerWidget(type, widget) {
        if (!type || !widget || typeof type !== 'string') {
            return false;
        }
        this.registeredWidgets[type] = widget;
        return this.setActiveWidgets();
    }
    unRegisterWidget(type) {
        if (!hasOwn(this.registeredWidgets, type)) {
            return false;
        }
        delete this.registeredWidgets[type];
        return this.setActiveWidgets();
    }
    unRegisterAllWidgets(unRegisterFrameworkWidgets = true) {
        this.registeredWidgets = {};
        if (unRegisterFrameworkWidgets) {
            this.frameworkWidgets = {};
        }
        return this.setActiveWidgets();
    }
    registerFrameworkWidgets(widgets) {
        if (widgets === null || typeof widgets !== 'object') {
            widgets = {};
        }
        this.frameworkWidgets = widgets;
        return this.setActiveWidgets();
    }
    unRegisterFrameworkWidgets() {
        if (Object.keys(this.frameworkWidgets).length) {
            this.frameworkWidgets = {};
            return this.setActiveWidgets();
        }
        return false;
    }
    getWidget(type, widgetSet = 'activeWidgets') {
        if (this.hasWidget(type, widgetSet)) {
            return this[widgetSet][type];
        }
        else if (this.hasWidget(this.defaultWidget, widgetSet)) {
            return this[widgetSet][this.defaultWidget];
        }
        else {
            return null;
        }
    }
    getAllWidgets() {
        return {
            widgetLibrary: this.widgetLibrary,
            registeredWidgets: this.registeredWidgets,
            frameworkWidgets: this.frameworkWidgets,
            activeWidgets: this.activeWidgets,
        };
    }
}
WidgetLibraryService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: WidgetLibraryService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
WidgetLibraryService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: WidgetLibraryService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: WidgetLibraryService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return []; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LWxpYnJhcnkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvbGliL3dpZGdldC1saWJyYXJ5L3dpZGdldC1saWJyYXJ5LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzdELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDckQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDckQsT0FBTyxFQUFFLHdC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SUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQ3hELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUM1QzthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTztZQUNMLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNqQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO1lBQ3pDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxnQkFBZ0I7WUFDdkMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1NBQ2xDLENBQUM7SUFDSixDQUFDOztpSEE5TVUsb0JBQW9CO3FIQUFwQixvQkFBb0IsY0FGbkIsTUFBTTsyRkFFUCxvQkFBb0I7a0JBSGhDLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWRkUmVmZXJlbmNlQ29tcG9uZW50IH0gZnJvbSAnLi9hZGQtcmVmZXJlbmNlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBCdXR0b25Db21wb25lbnQgfSBmcm9tICcuL2J1dHRvbi5jb21wb25lbnQnO1xuaW1wb3J0IHsgQ2hlY2tib3hDb21wb25lbnQgfSBmcm9tICcuL2NoZWNrYm94LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBDaGVja2JveGVzQ29tcG9uZW50IH0gZnJvbSAnLi9jaGVja2JveGVzLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWxlQ29tcG9uZW50IH0gZnJvbSAnLi9maWxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBoYXNPd24gfSBmcm9tICcuLi9zaGFyZWQvdXRpbGl0eS5mdW5jdGlvbnMnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSW5wdXRDb21wb25lbnQgfSBmcm9tICcuL2lucHV0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBNZXNzYWdlQ29tcG9uZW50IH0gZnJvbSAnLi9tZXNzYWdlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOb25lQ29tcG9uZW50IH0gZnJvbSAnLi9ub25lLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOdW1iZXJDb21wb25lbnQgfSBmcm9tICcuL251bWJlci5jb21wb25lbnQnO1xuaW1wb3J0IHsgT25lT2ZDb21wb25lbnQgfSBmcm9tICcuL29uZS1vZi5jb21wb25lbnQnO1xuaW1wb3J0IHsgUmFkaW9zQ29tcG9uZW50IH0gZnJvbSAnLi9yYWRpb3MuY29tcG9uZW50JztcbmltcG9ydCB7IFJvb3RDb21wb25lbnQgfSBmcm9tICcuL3Jvb3QuY29tcG9uZW50JztcbmltcG9ydCB7IFNlY3Rpb25Db21wb25lbnQgfSBmcm9tICcuL3NlY3Rpb24uY29tcG9uZW50JztcbmltcG9ydCB7IFNlbGVjdENvbXBvbmVudCB9IGZyb20gJy4vc2VsZWN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBTZWxlY3RGcmFtZXdvcmtDb21wb25lbnQgfSBmcm9tICcuL3NlbGVjdC1mcmFtZXdvcmsuY29tcG9uZW50JztcbmltcG9ydCB7IFNlbGVjdFdpZGdldENvbXBvbmVudCB9IGZyb20gJy4vc2VsZWN0LXdpZGdldC5jb21wb25lbnQnO1xuaW1wb3J0IHsgU3VibWl0Q29tcG9uZW50IH0gZnJvbSAnLi9zdWJtaXQuY29tcG9uZW50JztcbmltcG9ydCB7IFRhYnNDb21wb25lbnQgfSBmcm9tICcuL3RhYnMuY29tcG9uZW50JztcbmltcG9ydCB7IFRlbXBsYXRlQ29tcG9uZW50IH0gZnJvbSAnLi90ZW1wbGF0ZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgVGV4dGFyZWFDb21wb25lbnQgfSBmcm9tICcuL3RleHRhcmVhLmNvbXBvbmVudCc7XG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBXaWRnZXRMaWJyYXJ5U2VydmljZSB7XG5cbiAgZGVmYXVsdFdpZGdldCA9ICd0ZXh0JztcbiAgd2lkZ2V0TGlicmFyeTogYW55ID0ge1xuXG4gIC8vIEFuZ3VsYXIgSlNPTiBTY2hlbWEgRm9ybSBhZG1pbmlzdHJhdGl2ZSB3aWRnZXRzXG4gICAgJ25vbmUnOiBOb25lQ29tcG9uZW50LCAvLyBQbGFjZWhvbGRlciwgZm9yIGRldmVsb3BtZW50IC0gZGlzcGxheXMgbm90aGluZ1xuICAgICdyb290JzogUm9vdENvbXBvbmVudCwgLy8gRm9ybSByb290LCByZW5kZXJzIGEgY29tcGxldGUgbGF5b3V0XG4gICAgJ3NlbGVjdC1mcmFtZXdvcmsnOiBTZWxlY3RGcmFtZXdvcmtDb21wb25lbnQsIC8vIEFwcGxpZXMgdGhlIHNlbGVjdGVkIGZyYW1ld29yayB0byBhIHNwZWNpZmllZCB3aWRnZXRcbiAgICAnc2VsZWN0LXdpZGdldCc6IFNlbGVjdFdpZGdldENvbXBvbmVudCwgLy8gRGlzcGxheXMgYSBzcGVjaWZpZWQgd2lkZ2V0XG4gICAgJyRyZWYnOiBBZGRSZWZlcmVuY2VDb21wb25lbnQsIC8vIEJ1dHRvbiB0byBhZGQgYSBuZXcgYXJyYXkgaXRlbSBvciAkcmVmIGVsZW1lbnRcblxuICAvLyBGcmVlLWZvcm0gdGV4dCBIVE1MICdpbnB1dCcgZm9ybSBjb250cm9sIHdpZGdldHMgPGlucHV0IHR5cGU9XCIuLi5cIj5cbiAgICAnZW1haWwnOiAndGV4dCcsXG4gICAgJ2ludGVnZXInOiAnbnVtYmVyJywgLy8gTm90ZTogJ2ludGVnZXInIGlzIG5vdCBhIHJlY29nbml6ZWQgSFRNTCBpbnB1dCB0eXBlXG4gICAgJ251bWJlcic6IE51bWJlckNvbXBvbmVudCxcbiAgICAncGFzc3dvcmQnOiAndGV4dCcsXG4gICAgJ3NlYXJjaCc6ICd0ZXh0JyxcbiAgICAndGVsJzogJ3RleHQnLFxuICAgICd0ZXh0JzogSW5wdXRDb21wb25lbnQsXG4gICAgJ3VybCc6ICd0ZXh0JyxcblxuICAvLyBDb250cm9sbGVkIHRleHQgSFRNTCAnaW5wdXQnIGZvcm0gY29udHJvbCB3aWRnZXRzIDxpbnB1dCB0eXBlPVwiLi4uXCI+XG4gICAgJ2NvbG9yJzogJ3RleHQnLFxuICAgICdkYXRlJzogJ3RleHQnLFxuICAgICdkYXRldGltZSc6ICd0ZXh0JyxcbiAgICAnZGF0ZXRpbWUtbG9jYWwnOiAndGV4dCcsXG4gICAgJ21vbnRoJzogJ3RleHQnLFxuICAgICdyYW5nZSc6ICdudW1iZXInLFxuICAgICd0aW1lJzogJ3RleHQnLFxuICAgICd3ZWVrJzogJ3RleHQnLFxuXG4gIC8vIE5vbi10ZXh0IEhUTUwgJ2lucHV0JyBmb3JtIGNvbnRyb2wgd2lkZ2V0cyA8aW5wdXQgdHlwZT1cIi4uLlwiPlxuICAgIC8vICdidXR0b24nOiA8aW5wdXQgdHlwZT1cImJ1dHRvblwiPiBub3QgdXNlZCwgdXNlIDxidXR0b24+IGluc3RlYWRcbiAgICAnY2hlY2tib3gnOiBDaGVja2JveENvbXBvbmVudCwgLy8gVE9ETzogU2V0IHRlcm5hcnkgPSB0cnVlIGZvciAzLXN0YXRlID8/XG4gICAgJ2ZpbGUnOiBGaWxlQ29tcG9uZW50LCAvLyBUT0RPOiBGaW5pc2ggJ2ZpbGUnIHdpZGdldFxuICAgICdoaWRkZW4nOiAndGV4dCcsXG4gICAgJ2ltYWdlJzogJ3RleHQnLCAvLyBUT0RPOiBGaWd1cmUgb3V0IGhvdyB0byBoYW5kbGUgdGhlc2VcbiAgICAncmFkaW8nOiAncmFkaW9zJyxcbiAgICAncmVzZXQnOiAnc3VibWl0JywgLy8gVE9ETzogRmlndXJlIG91dCBob3cgdG8gaGFuZGxlIHRoZXNlXG4gICAgJ3N1Ym1pdCc6IFN1Ym1pdENvbXBvbmVudCxcblxuICAvLyBPdGhlciAobm9uLSdpbnB1dCcpIEhUTUwgZm9ybSBjb250cm9sIHdpZGdldHNcbiAgICAnYnV0dG9uJzogQnV0dG9uQ29tcG9uZW50LFxuICAgICdzZWxlY3QnOiBTZWxlY3RDb21wb25lbnQsXG4gICAgLy8gJ29wdGlvbic6IGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGJ5IHNlbGVjdCB3aWRnZXRzXG4gICAgLy8gJ29wdGdyb3VwJzogYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgYnkgc2VsZWN0IHdpZGdldHNcbiAgICAndGV4dGFyZWEnOiBUZXh0YXJlYUNvbXBvbmVudCxcblxuICAvLyBIVE1MIGZvcm0gY29udHJvbCB3aWRnZXQgc2V0c1xuICAgICdjaGVja2JveGVzJzogQ2hlY2tib3hlc0NvbXBvbmVudCwgLy8gR3JvdXBlZCBsaXN0IG9mIGNoZWNrYm94ZXNcbiAgICAnY2hlY2tib3hlcy1pbmxpbmUnOiAnY2hlY2tib3hlcycsIC8vIENoZWNrYm94ZXMgaW4gb25lIGxpbmVcbiAgICAnY2hlY2tib3hidXR0b25zJzogJ2NoZWNrYm94ZXMnLCAvLyBDaGVja2JveGVzIGFzIGh0bWwgYnV0dG9uc1xuICAgICdyYWRpb3MnOiBSYWRpb3NDb21wb25lbnQsIC8vIEdyb3VwZWQgbGlzdCBvZiByYWRpbyBidXR0b25zXG4gICAgJ3JhZGlvcy1pbmxpbmUnOiAncmFkaW9zJywgLy8gUmFkaW8gY29udHJvbHMgaW4gb25lIGxpbmVcbiAgICAncmFkaW9idXR0b25zJzogJ3JhZGlvcycsIC8vIFJhZGlvIGNvbnRyb2xzIGFzIGh0bWwgYnV0dG9uc1xuXG4gIC8vIEhUTUwgTGF5b3V0IHdpZGdldHNcbiAgICAvLyAnbGFiZWwnOiBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIGRhdGEgd2lkZ2V0c1xuICAgIC8vICdsZWdlbmQnOiBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIGZpZWxkc2V0c1xuICAgICdzZWN0aW9uJzogU2VjdGlvbkNvbXBvbmVudCwgLy8gSnVzdCBhIGRpdiA8ZGl2PlxuICAgICdkaXYnOiAnc2VjdGlvbicsIC8vIFN0aWxsIGp1c3QgYSBkaXYgPGRpdj5cbiAgICAnZmllbGRzZXQnOiAnc2VjdGlvbicsIC8vIEEgZmllbGRzZXQsIHdpdGggYW4gb3B0aW9uYWwgbGVnZW5kIDxmaWVsZHNldD5cbiAgICAnZmxleCc6ICdzZWN0aW9uJywgLy8gQSBmbGV4Ym94IGNvbnRhaW5lciA8ZGl2IHN0eWxlPVwiZGlzcGxheTogZmxleFwiPlxuXG4gIC8vIE5vbi1IVE1MIGxheW91dCB3aWRnZXRzXG4gICAgJ29uZS1vZic6IE9uZU9mQ29tcG9uZW50LCAvLyBBIHNlbGVjdCBib3ggdGhhdCBjaGFuZ2VzIGFub3RoZXIgaW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IEZpbmlzaCAnb25lLW9mJyB3aWRnZXRcbiAgICAnYXJyYXknOiAnc2VjdGlvbicsIC8vIEEgbGlzdCB5b3UgY2FuIGFkZCwgcmVtb3ZlIGFuZCByZW9yZGVyIDxmaWVsZHNldD5cbiAgICAndGFiYXJyYXknOiAndGFicycsIC8vIEEgdGFiYmVkIHZlcnNpb24gb2YgYXJyYXlcbiAgICAndGFiJzogJ3NlY3Rpb24nLCAvLyBBIHRhYiBncm91cCwgc2ltaWxhciB0byBhIGZpZWxkc2V0IG9yIHNlY3Rpb24gPGZpZWxkc2V0PlxuICAgICd0YWJzJzogVGFic0NvbXBvbmVudCwgLy8gQSB0YWJiZWQgc2V0IG9mIHBhbmVscyB3aXRoIGRpZmZlcmVudCBjb250cm9sc1xuICAgICdtZXNzYWdlJzogTWVzc2FnZUNvbXBvbmVudCwgLy8gSW5zZXJ0IGFyYml0cmFyeSBodG1sXG4gICAgJ2hlbHAnOiAnbWVzc2FnZScsIC8vIEluc2VydCBhcmJpdHJhcnkgaHRtbFxuICAgICdtc2cnOiAnbWVzc2FnZScsIC8vIEluc2VydCBhcmJpdHJhcnkgaHRtbFxuICAgICdodG1sJzogJ21lc3NhZ2UnLCAvLyBJbnNlcnQgYXJiaXRyYXJ5IGh0bWxcbiAgICAndGVtcGxhdGUnOiBUZW1wbGF0ZUNvbXBvbmVudCwgLy8gSW5zZXJ0IGEgY3VzdG9tIEFuZ3VsYXIgY29tcG9uZW50XG5cbiAgLy8gV2lkZ2V0cyBpbmNsdWRlZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEpTT04gRm9ybSBBUElcbiAgICAnYWR2YW5jZWRmaWVsZHNldCc6ICdzZWN0aW9uJywgLy8gQWRkcyAnQWR2YW5jZWQgc2V0dGluZ3MnIHRpdGxlIDxmaWVsZHNldD5cbiAgICAnYXV0aGZpZWxkc2V0JzogJ3NlY3Rpb24nLCAvLyBBZGRzICdBdXRoZW50aWNhdGlvbiBzZXR0aW5ncycgdGl0bGUgPGZpZWxkc2V0PlxuICAgICdvcHRpb25maWVsZHNldCc6ICdvbmUtb2YnLCAvLyBPcHRpb24gY29udHJvbCwgZGlzcGxheXMgc2VsZWN0ZWQgc3ViLWl0ZW0gPGZpZWxkc2V0PlxuICAgICdzZWxlY3RmaWVsZHNldCc6ICdvbmUtb2YnLCAvLyBTZWxlY3QgY29udHJvbCwgZGlzcGxheXMgc2VsZWN0ZWQgc3ViLWl0ZW0gPGZpZWxkc2V0PlxuICAgICdjb25kaXRpb25hbCc6ICdzZWN0aW9uJywgLy8gSWRlbnRpY2FsIHRvICdzZWN0aW9uJyAoZGVwZWNpYXRlZCkgPGRpdj5cbiAgICAnYWN0aW9ucyc6ICdzZWN0aW9uJywgLy8gSG9yaXpvbnRhbCBidXR0b24gbGlzdCwgY2FuIG9ubHkgc3VibWl0LCB1c2VzIGJ1dHRvbnMgYXMgaXRlbXMgPGRpdj5cbiAgICAndGFnc2lucHV0JzogJ3NlY3Rpb24nLCAvLyBGb3IgZW50ZXJpbmcgc2hvcnQgdGV4dCB0YWdzIDxkaXY+XG4gICAgLy8gU2VlOiBodHRwOi8vdWxpb24uZ2l0aHViLmlvL2pzb25mb3JtL3BsYXlncm91bmQvP2V4YW1wbGU9ZmllbGRzLWNoZWNrYm94YnV0dG9uc1xuXG4gIC8vIFdpZGdldHMgaW5jbHVkZWQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBSZWFjdCBKU09OIFNjaGVtYSBGb3JtIEFQSVxuICAgICd1cGRvd24nOiAnbnVtYmVyJyxcbiAgICAnZGF0ZS10aW1lJzogJ2RhdGV0aW1lLWxvY2FsJyxcbiAgICAnYWx0LWRhdGV0aW1lJzogJ2RhdGV0aW1lLWxvY2FsJyxcbiAgICAnYWx0LWRhdGUnOiAnZGF0ZScsXG5cbiAgLy8gV2lkZ2V0cyBpbmNsdWRlZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFuZ3VsYXIgU2NoZW1hIEZvcm0gQVBJXG4gICAgJ3dpemFyZCc6ICdzZWN0aW9uJywgLy8gVE9ETzogU2VxdWVudGlhbCBwYW5lbHMgd2l0aCBcIk5leHRcIiBhbmQgXCJQcmV2aW91c1wiIGJ1dHRvbnNcblxuICAvLyBXaWRnZXRzIGluY2x1ZGVkIGZvciBjb21wYXRpYmlsaXR5IHdpdGggb3RoZXIgbGlicmFyaWVzXG4gICAgJ3RleHRsaW5lJzogJ3RleHQnLFxuXG4gIC8vIFJlY29tbWVuZGVkIDNyZC1wYXJ0eSBhZGQtb24gd2lkZ2V0cyAoVE9ETzogY3JlYXRlIHdyYXBwZXJzIGZvciB0aGVzZS4uLilcbiAgICAvLyAnbmcyLXNlbGVjdCc6IFNlbGVjdCBjb250cm9sIHJlcGxhY2VtZW50IC0gaHR0cDovL3ZhbG9yLXNvZnR3YXJlLmNvbS9uZzItc2VsZWN0L1xuICAgIC8vICdmbGF0cGlja3InOiBGbGF0cGlja3IgZGF0ZSBwaWNrZXIgLSBodHRwczovL2dpdGh1Yi5jb20vY2htbG4vZmxhdHBpY2tyXG4gICAgLy8gJ3Bpa2FkYXknOiBQaWthZGF5IGRhdGUgcGlja2VyIC0gaHR0cHM6Ly9naXRodWIuY29tL2RidXNoZWxsL1Bpa2FkYXlcbiAgICAvLyAnc3BlY3RydW0nOiBTcGVjdHJ1bSBjb2xvciBwaWNrZXIgLSBodHRwOi8vYmdyaW5zLmdpdGh1Yi5pby9zcGVjdHJ1bVxuICAgIC8vICdib290c3RyYXAtc2xpZGVyJzogQm9vdHN0cmFwIFNsaWRlciByYW5nZSBjb250cm9sIC0gaHR0cHM6Ly9naXRodWIuY29tL3NlaXlyaWEvYm9vdHN0cmFwLXNsaWRlclxuICAgIC8vICdhY2UnOiBBQ0UgY29kZSBlZGl0b3IgLSBodHRwczovL2FjZS5jOS5pb1xuICAgIC8vICdja2VkaXRvcic6IENLRWRpdG9yIEhUTUwgLyByaWNoIHRleHQgZWRpdG9yIC0gaHR0cDovL2NrZWRpdG9yLmNvbVxuICAgIC8vICd0aW55bWNlJzogVGlueU1DRSBIVE1MIC8gcmljaCB0ZXh0IGVkaXRvciAtIGh0dHBzOi8vd3d3LnRpbnltY2UuY29tXG4gICAgLy8gJ2ltYWdlc2VsZWN0JzogQm9vdHN0cmFwIGRyb3AtZG93biBpbWFnZSBzZWxlY3RvciAtIGh0dHA6Ly9zaWx2aW9tb3JldG8uZ2l0aHViLmlvL2Jvb3RzdHJhcC1zZWxlY3RcbiAgICAvLyAnd3lzaWh0bWw1JzogSFRNTCBlZGl0b3IgLSBodHRwOi8vamhvbGxpbmd3b3J0aC5naXRodWIuaW8vYm9vdHN0cmFwLXd5c2lodG1sNVxuICAgIC8vICdxdWlsbCc6IFF1aWxsIEhUTUwgLyByaWNoIHRleHQgZWRpdG9yICg/KSAtIGh0dHBzOi8vcXVpbGxqcy5jb21cbiAgfTtcbiAgcmVnaXN0ZXJlZFdpZGdldHM6IGFueSA9IHsgfTtcbiAgZnJhbWV3b3JrV2lkZ2V0czogYW55ID0geyB9O1xuICBhY3RpdmVXaWRnZXRzOiBhbnkgPSB7IH07XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZXRBY3RpdmVXaWRnZXRzKCk7XG4gIH1cblxuICBzZXRBY3RpdmVXaWRnZXRzKCk6IGJvb2xlYW4ge1xuICAgIHRoaXMuYWN0aXZlV2lkZ2V0cyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICB7IH0sIHRoaXMud2lkZ2V0TGlicmFyeSwgdGhpcy5mcmFtZXdvcmtXaWRnZXRzLCB0aGlzLnJlZ2lzdGVyZWRXaWRnZXRzXG4gICAgKTtcbiAgICBmb3IgKGNvbnN0IHdpZGdldE5hbWUgb2YgT2JqZWN0LmtleXModGhpcy5hY3RpdmVXaWRnZXRzKSkge1xuICAgICAgbGV0IHdpZGdldDogYW55ID0gdGhpcy5hY3RpdmVXaWRnZXRzW3dpZGdldE5hbWVdO1xuICAgICAgLy8gUmVzb2x2ZSBhbGlhc2VzXG4gICAgICBpZiAodHlwZW9mIHdpZGdldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3QgdXNlZEFsaWFzZXM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIHdoaWxlICh0eXBlb2Ygd2lkZ2V0ID09PSAnc3RyaW5nJyAmJiAhdXNlZEFsaWFzZXMuaW5jbHVkZXMod2lkZ2V0KSkge1xuICAgICAgICAgIHVzZWRBbGlhc2VzLnB1c2god2lkZ2V0KTtcbiAgICAgICAgICB3aWRnZXQgPSB0aGlzLmFjdGl2ZVdpZGdldHNbd2lkZ2V0XTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHdpZGdldCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVdpZGdldHNbd2lkZ2V0TmFtZV0gPSB3aWRnZXQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBzZXREZWZhdWx0V2lkZ2V0KHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5oYXNXaWRnZXQodHlwZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdGhpcy5kZWZhdWx0V2lkZ2V0ID0gdHlwZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGhhc1dpZGdldCh0eXBlOiBzdHJpbmcsIHdpZGdldFNldCA9ICdhY3RpdmVXaWRnZXRzJyk6IGJvb2xlYW4ge1xuICAgIGlmICghdHlwZSB8fCB0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgcmV0dXJuIGhhc093bih0aGlzW3dpZGdldFNldF0sIHR5cGUpO1xuICB9XG5cbiAgaGFzRGVmYXVsdFdpZGdldCh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5oYXNXaWRnZXQodHlwZSwgJ3dpZGdldExpYnJhcnknKTtcbiAgfVxuXG4gIHJlZ2lzdGVyV2lkZ2V0KHR5cGU6IHN0cmluZywgd2lkZ2V0OiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoIXR5cGUgfHwgIXdpZGdldCB8fCB0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdGhpcy5yZWdpc3RlcmVkV2lkZ2V0c1t0eXBlXSA9IHdpZGdldDtcbiAgICByZXR1cm4gdGhpcy5zZXRBY3RpdmVXaWRnZXRzKCk7XG4gIH1cblxuICB1blJlZ2lzdGVyV2lkZ2V0KHR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghaGFzT3duKHRoaXMucmVnaXN0ZXJlZFdpZGdldHMsIHR5cGUpKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIGRlbGV0ZSB0aGlzLnJlZ2lzdGVyZWRXaWRnZXRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZVdpZGdldHMoKTtcbiAgfVxuXG4gIHVuUmVnaXN0ZXJBbGxXaWRnZXRzKHVuUmVnaXN0ZXJGcmFtZXdvcmtXaWRnZXRzID0gdHJ1ZSk6IGJvb2xlYW4ge1xuICAgIHRoaXMucmVnaXN0ZXJlZFdpZGdldHMgPSB7IH07XG4gICAgaWYgKHVuUmVnaXN0ZXJGcmFtZXdvcmtXaWRnZXRzKSB7IHRoaXMuZnJhbWV3b3JrV2lkZ2V0cyA9IHsgfTsgfVxuICAgIHJldHVybiB0aGlzLnNldEFjdGl2ZVdpZGdldHMoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyRnJhbWV3b3JrV2lkZ2V0cyh3aWRnZXRzOiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAod2lkZ2V0cyA9PT0gbnVsbCB8fCB0eXBlb2Ygd2lkZ2V0cyAhPT0gJ29iamVjdCcpIHsgd2lkZ2V0cyA9IHsgfTsgfVxuICAgIHRoaXMuZnJhbWV3b3JrV2lkZ2V0cyA9IHdpZGdldHM7XG4gICAgcmV0dXJuIHRoaXMuc2V0QWN0aXZlV2lkZ2V0cygpO1xuICB9XG5cbiAgdW5SZWdpc3RlckZyYW1ld29ya1dpZGdldHMoKTogYm9vbGVhbiB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuZnJhbWV3b3JrV2lkZ2V0cykubGVuZ3RoKSB7XG4gICAgICB0aGlzLmZyYW1ld29ya1dpZGdldHMgPSB7IH07XG4gICAgICByZXR1cm4gdGhpcy5zZXRBY3RpdmVXaWRnZXRzKCk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldFdpZGdldCh0eXBlPzogc3RyaW5nLCB3aWRnZXRTZXQgPSAnYWN0aXZlV2lkZ2V0cycpOiBhbnkge1xuICAgIGlmICh0aGlzLmhhc1dpZGdldCh0eXBlLCB3aWRnZXRTZXQpKSB7XG4gICAgICByZXR1cm4gdGhpc1t3aWRnZXRTZXRdW3R5cGVdO1xuICAgIH0gZWxzZSBpZiAodGhpcy5oYXNXaWRnZXQodGhpcy5kZWZhdWx0V2lkZ2V0LCB3aWRnZXRTZXQpKSB7XG4gICAgICByZXR1cm4gdGhpc1t3aWRnZXRTZXRdW3RoaXMuZGVmYXVsdFdpZGdldF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldEFsbFdpZGdldHMoKTogYW55IHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkZ2V0TGlicmFyeTogdGhpcy53aWRnZXRMaWJyYXJ5LFxuICAgICAgcmVnaXN0ZXJlZFdpZGdldHM6IHRoaXMucmVnaXN0ZXJlZFdpZGdldHMsXG4gICAgICBmcmFtZXdvcmtXaWRnZXRzOiB0aGlzLmZyYW1ld29ya1dpZGdldHMsXG4gICAgICBhY3RpdmVXaWRnZXRzOiB0aGlzLmFjdGl2ZVdpZGdldHMsXG4gICAgfTtcbiAgfVxufVxuIl19
