import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from './types/breadcrumb';
import { BreadcrumbObject } from './types/breadcrumb.config';
import * as i0 from "@angular/core";
export type BreadcrumbDefinition = Breadcrumb & BreadcrumbObject;
export declare class BreadcrumbService {
    private activatedRoute;
    private router;
    private baseHref;
    /**
     * dynamicBreadcrumbStore holds information about dynamically updated breadcrumbs.
     * Breadcrumbs can be set from anywhere (component, service) in the app.
     * On every breadcrumb update check this store and use the info if available.
     */
    private dynamicBreadcrumbStore;
    /**
     * breadcrumbList for the current route
     * When breadcrumb info is changed dynamically, check if the currentBreadcrumbs is effected
     * If effected, update the change and emit a new stream
     */
    private currentBreadcrumbs;
    private previousBreadcrumbs;
    /**
     * Breadcrumbs observable to be subscribed by BreadcrumbComponent
     * Emits on every route change OR dynamic update of breadcrumb
     */
    private breadcrumbs;
    breadcrumbs$: import("rxjs").Observable<BreadcrumbDefinition[]>;
    constructor(activatedRoute: ActivatedRoute, router: Router);
    /**
     * Whenever route changes build breadcrumb list again
     */
    private detectRouteChanges;
    private setupBreadcrumbs;
    private getRootBreadcrumb;
    private prepareBreadcrumbItem;
    private prepareBreadcrumbList;
    private getFromStore;
    /**
     * use exact match instead of regexp.test
     * for /mentor/[^/]+ we should match '/mentor/12' but not '/mentor/12/abc'
     */
    private matchRegex;
    /**
     * if the path segment has route params, read the param value from url
     * for each segment of route this gets called
     *
     * for mentor/:id/view - it gets called with mentor, :id, view 3 times
     */
    private resolvePathSegment;
    /**
     * queryParams & fragments for previous breadcrumb path are copied over to new list
     */
    private getQueryParamsFromPreviousList;
    /**
     * set current activated route query params to the last breadcrumb item
     */
    private setQueryParamsForActiveBreadcrumb;
    /**
     * For a specific route, breadcrumb can be defined either on parent OR it's child(which has empty path)
     * When both are defined, child takes precedence
     *
     * Ex: Below we are setting breadcrumb on both parent and child.
     * So, child takes precedence and "Defined On Child" is displayed for the route 'home'
     * { path: 'home', loadChildren: () => import('./home/home.module').then((m) => m.HomeModule) , data: {breadcrumb: "Defined On Module"}}
     *                                                AND
     * children: [
     *   { path: '', component: ShowUserComponent, data: {breadcrumb: "Defined On Child" }
     * ]
     */
    private parseRouteData;
    /**
     * get empty children of a module or Component. Empty child is the one with path: ''
     * When parent and it's children (that has empty route path) define data merge them both with child taking precedence
     */
    private mergeWithBaseChildData;
    /**
     * Update breadcrumb dynamically
     *
     * key can be a path | alias
     *
     * 1) Using complete route path. route can be passed the same way you define angular routes
     * - path can be passed as 'exact path(routeLink)' or 'path with params(routeRegex)'
     * - update label Ex: set('/mentor', 'Mentor'), set('/mentor/:id', 'Mentor Details')
     * - change visibility Ex: set('/mentor/:id/edit', { skip: true })
     * ------------------------------------------ OR ------------------------------------------
     * 2) Using route alias (prefixed with '@'). alias should be unique for a route
     * - update label Ex: set('@mentor', 'Enabler')
     * - change visibility Ex: set('@mentorEdit', { skip: true })
     *
     *
     * value can be string | BreadcrumbObject | BreadcrumbFunction
     */
    set(key: string, breadcrumb: string | BreadcrumbObject): void;
    /**
     * Update the store to reuse for dynamic declarations
     * If the store already has this route definition update it, else add
     */
    private updateStore;
    /**
     * If breadcrumb is present in current breadcrumbs update it and emit new stream
     */
    private updateCurrentBreadcrumbs;
    /**
     * For a route with path param, we create regex dynamically from angular route syntax
     * '/mentor/:id' becomes '/mentor/[^/]',
     * breadcrumbService.set('/mentor/:id', 'Uday') should update 'Uday' as label for '/mentor/2' OR 'mentor/ada'
     */
    private buildRegex;
    private ensureLeadingSlash;
    /**
     * In App's RouteConfig, breadcrumb can be defined as a string OR a function OR an object
     *
     * string: simple static breadcrumb label for a path
     * function: callback that gets invoked with resolved path param
     * object: additional data defined along with breadcrumb label that gets passed to *xngBreadcrumbItem directive
     */
    private extractLabel;
    private extractObject;
    static ɵfac: i0.ɵɵFactoryDeclaration<BreadcrumbService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<BreadcrumbService>;
}
