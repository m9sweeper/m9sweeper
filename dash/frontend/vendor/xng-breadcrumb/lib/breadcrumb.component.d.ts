import { OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { BreadcrumbDefinition, BreadcrumbService } from './breadcrumb.service';
import * as i0 from "@angular/core";
export declare class BreadcrumbComponent implements OnInit {
    private breadcrumbService;
    breadcrumbs$: Observable<BreadcrumbDefinition[]>;
    separatorTemplate: TemplateRef<void>;
    private _separator;
    /**
     * Breadcrumb item can be customized with this template
     * Template context is provided label, additional info, first and last indexes
     * Use cases:
     * 1) Add an icon along with label
     * 2) i18n. {{breadcrumb | translate}} or {{breadcrumb | transloco}}
     * 3) Change text case {{breadcrumb | titlecase}}
     */
    itemTemplate: any;
    /**
     * If true, breadcrumb is auto generated even without any mapping label
     * Default label is same as route segment
     */
    autoGenerate: boolean;
    /**
     * By default query params will be preserved with breadcrumbs
     */
    preserveQueryParams: boolean;
    /**
     * By default query fragments will be preserved with breadcrumbs
     */
    preserveFragment: boolean;
    /**
     * custom class provided by consumer to increase specificity
     * This will benefit to override styles that are conflicting
     */
    class: string;
    /**
     * anchorTarget = "_blank" makes the breadcrumb link open in a new tab
     */
    anchorTarget: '_blank' | undefined;
    /**
     * separator between breadcrumbs, defaults to '/'.
     * User can customize separator either by passing a String or Template
     *
     * String --> Ex: <xng-breadcrumb separator="-"> </xng-breadcrumb>
     *
     * Template --> Ex: <xng-breadcrumb [separator]="separatorTemplate"> </xng-breadcrumb>
     * <ng-template #separatorTemplate><mat-icon>arrow_right</mat-icon></ng-template>
     */
    set separator(value: string | TemplateRef<void>);
    get separator(): string | TemplateRef<void>;
    setupMessage: string;
    someParameterValue: any;
    constructor(breadcrumbService: BreadcrumbService, activateRoute: ActivatedRoute);
    setupComponent(someParam: any): void;
    ngOnInit(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BreadcrumbComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BreadcrumbComponent, "xng-breadcrumb", never, { "autoGenerate": { "alias": "autoGenerate"; "required": false; }; "preserveQueryParams": { "alias": "preserveQueryParams"; "required": false; }; "preserveFragment": { "alias": "preserveFragment"; "required": false; }; "class": { "alias": "class"; "required": false; }; "anchorTarget": { "alias": "anchorTarget"; "required": false; }; "separator": { "alias": "separator"; "required": false; }; }, {}, ["itemTemplate"], never, false, never>;
}
