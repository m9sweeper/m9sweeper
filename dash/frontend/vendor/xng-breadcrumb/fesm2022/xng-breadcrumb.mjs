import * as i0 from '@angular/core';
import { Directive, Injectable, TemplateRef, Component, ViewEncapsulation, ContentChild, Input, NgModule } from '@angular/core';
import * as i1 from '@angular/router';
import { GuardsCheckEnd, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import * as i3 from '@angular/common';
import { CommonModule } from '@angular/common';

/**
 * This directive is used to customize the breadcrumb label behavior
 * *xngBreadcrumbItem directive can be used in the child element of xng-breadcrumb
 * Usage: refer to the demo - app.component.html
 */
class BreadcrumbItemDirective {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbItemDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0", type: BreadcrumbItemDirective, selector: "[xngBreadcrumbItem]", ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbItemDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[xngBreadcrumbItem]',
                }]
        }] });

const PATH_PARAM = {
    PREFIX: ':',
    REGEX_IDENTIFIER: '/:[^/]+',
    REGEX_REPLACER: '/[^/]+',
};
const ALIAS_PREFIX = '@';
const isNonEmpty = (obj) => {
    return obj && Object.keys(obj).length > 0;
};
class BreadcrumbService {
    constructor(activatedRoute, router) {
        this.activatedRoute = activatedRoute;
        this.router = router;
        this.baseHref = '/';
        /**
         * dynamicBreadcrumbStore holds information about dynamically updated breadcrumbs.
         * Breadcrumbs can be set from anywhere (component, service) in the app.
         * On every breadcrumb update check this store and use the info if available.
         */
        this.dynamicBreadcrumbStore = [];
        /**
         * breadcrumbList for the current route
         * When breadcrumb info is changed dynamically, check if the currentBreadcrumbs is effected
         * If effected, update the change and emit a new stream
         */
        this.currentBreadcrumbs = [];
        this.previousBreadcrumbs = [];
        /**
         * Breadcrumbs observable to be subscribed by BreadcrumbComponent
         * Emits on every route change OR dynamic update of breadcrumb
         */
        this.breadcrumbs = new BehaviorSubject([]);
        this.breadcrumbs$ = this.breadcrumbs.asObservable();
        this.detectRouteChanges();
    }
    /**
     * Whenever route changes build breadcrumb list again
     */
    detectRouteChanges() {
        // Special case where breadcrumb service & component instantiates after a route is navigated.
        // Ex: put breadcrumbs within *ngIf and this.router.events would be empty
        // This check is also required where  { initialNavigation: 'enabledBlocking' } is applied to routes
        this.setupBreadcrumbs(this.activatedRoute.snapshot);
        this.router.events
            .pipe(filter((event) => event instanceof GuardsCheckEnd))
            .subscribe((event) => {
            // activatedRoute doesn't carry data when shouldReuseRoute returns false
            // use the event data with GuardsCheckEnd as workaround
            // Check for shouldActivate in case where the authGuard returns false the breadcrumbs shouldn't be changed
            if (event.shouldActivate) {
                this.setupBreadcrumbs(event.state.root);
            }
        });
    }
    setupBreadcrumbs(activatedRouteSnapshot) {
        this.previousBreadcrumbs = this.currentBreadcrumbs;
        // breadcrumb label for base OR root path. Usually, this can be set as 'Home'
        const rootBreadcrumb = this.getRootBreadcrumb();
        this.currentBreadcrumbs = rootBreadcrumb ? [rootBreadcrumb] : [];
        this.prepareBreadcrumbList(activatedRouteSnapshot, this.baseHref);
    }
    getRootBreadcrumb() {
        const rootConfig = this.router.config.find((config) => config.path === '');
        const rootBreadcrumb = this.extractObject(rootConfig?.data?.['breadcrumb']);
        const storeItem = this.getFromStore(rootBreadcrumb.alias, '/');
        if (isNonEmpty(rootBreadcrumb) || isNonEmpty(storeItem)) {
            return {
                ...storeItem,
                ...rootBreadcrumb,
                routeLink: this.baseHref,
                ...this.getQueryParamsFromPreviousList('/'),
            };
        }
    }
    prepareBreadcrumbItem(activatedRouteSnapshot, routeLinkPrefix) {
        const { path, breadcrumb } = this.parseRouteData(activatedRouteSnapshot.routeConfig);
        const resolvedSegment = this.resolvePathSegment(path, activatedRouteSnapshot);
        const routeLink = `${routeLinkPrefix}${resolvedSegment}`;
        const storeItem = this.getFromStore(breadcrumb.alias, routeLink);
        const label = this.extractLabel(storeItem?.label || breadcrumb?.label, resolvedSegment);
        let isAutoGeneratedLabel = false;
        let autoGeneratedLabel = '';
        if (!label) {
            isAutoGeneratedLabel = true;
            autoGeneratedLabel = resolvedSegment;
        }
        return {
            ...storeItem,
            ...breadcrumb,
            label: isAutoGeneratedLabel ? autoGeneratedLabel : label,
            routeLink,
            isAutoGeneratedLabel,
            ...this.getQueryParamsFromPreviousList(routeLink),
        };
    }
    prepareBreadcrumbList(activatedRouteSnapshot, routeLinkPrefix) {
        if (activatedRouteSnapshot.routeConfig?.path) {
            const breadcrumbItem = this.prepareBreadcrumbItem(activatedRouteSnapshot, routeLinkPrefix);
            this.currentBreadcrumbs.push(breadcrumbItem);
            if (activatedRouteSnapshot.firstChild) {
                return this.prepareBreadcrumbList(activatedRouteSnapshot.firstChild, breadcrumbItem.routeLink + '/');
            }
        }
        else if (activatedRouteSnapshot.firstChild) {
            return this.prepareBreadcrumbList(activatedRouteSnapshot.firstChild, routeLinkPrefix);
        }
        const lastCrumb = this.currentBreadcrumbs[this.currentBreadcrumbs.length - 1];
        this.setQueryParamsForActiveBreadcrumb(lastCrumb, activatedRouteSnapshot);
        // remove breadcrumb items that needs to be hidden
        const breadcrumbsToShow = this.currentBreadcrumbs.filter((item) => !item.skip);
        this.breadcrumbs.next(breadcrumbsToShow);
    }
    getFromStore(alias, routeLink) {
        return this.dynamicBreadcrumbStore.find((item) => {
            return ((alias && alias === item.alias) ||
                (routeLink && routeLink === item.routeLink) ||
                this.matchRegex(routeLink, item.routeRegex));
        });
    }
    /**
     * use exact match instead of regexp.test
     * for /mentor/[^/]+ we should match '/mentor/12' but not '/mentor/12/abc'
     */
    matchRegex(routeLink, routeRegex) {
        const match = routeLink.match(new RegExp(routeRegex));
        return match?.[0] === routeLink;
    }
    /**
     * if the path segment has route params, read the param value from url
     * for each segment of route this gets called
     *
     * for mentor/:id/view - it gets called with mentor, :id, view 3 times
     */
    resolvePathSegment(segment, activatedRouteSnapshot) {
        //quirk -segment can be defined as view/:id in route config in which case you need to make it view/<resolved-param>
        if (segment.includes(PATH_PARAM.PREFIX)) {
            Object.entries(activatedRouteSnapshot.params).forEach(([key, value]) => {
                segment = segment.replace(`:${key}`, `${value}`);
            });
        }
        return segment;
    }
    /**
     * queryParams & fragments for previous breadcrumb path are copied over to new list
     */
    getQueryParamsFromPreviousList(routeLink) {
        const { queryParams, fragment } = this.previousBreadcrumbs.find((item) => item.routeLink === routeLink) ||
            {};
        return { queryParams, fragment };
    }
    /**
     * set current activated route query params to the last breadcrumb item
     */
    setQueryParamsForActiveBreadcrumb(lastItem, activatedRouteSnapshot) {
        if (lastItem) {
            const { queryParams, fragment } = activatedRouteSnapshot;
            lastItem.queryParams = queryParams ? { ...queryParams } : undefined;
            lastItem.fragment = fragment;
        }
    }
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
    parseRouteData(routeConfig) {
        const { path, data } = routeConfig;
        const breadcrumb = this.mergeWithBaseChildData(routeConfig, data?.breadcrumb);
        return { path, breadcrumb };
    }
    /**
     * get empty children of a module or Component. Empty child is the one with path: ''
     * When parent and it's children (that has empty route path) define data merge them both with child taking precedence
     */
    mergeWithBaseChildData(routeConfig, config) {
        if (!routeConfig) {
            return this.extractObject(config);
        }
        let baseChild;
        if (routeConfig.loadChildren) {
            // To handle a module with empty child route
            baseChild = routeConfig._loadedRoutes.find((route) => route.path === '');
        }
        else if (routeConfig.children) {
            // To handle a component with empty child route
            baseChild = routeConfig.children.find((route) => route.path === '');
        }
        const childConfig = baseChild?.data?.breadcrumb;
        return childConfig
            ? this.mergeWithBaseChildData(baseChild, {
                ...this.extractObject(config),
                ...this.extractObject(childConfig),
            })
            : this.extractObject(config);
    }
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
    set(key, breadcrumb) {
        const breadcrumbObject = this.extractObject(breadcrumb);
        let updateArgs;
        if (key.startsWith(ALIAS_PREFIX)) {
            updateArgs = ['alias', { ...breadcrumbObject, alias: key.slice(1) }];
        }
        else if (key.includes(PATH_PARAM.PREFIX)) {
            updateArgs = [
                'routeRegex',
                { ...breadcrumbObject, routeRegex: this.buildRegex(key) },
            ];
        }
        else {
            updateArgs = [
                'routeLink',
                { ...breadcrumbObject, routeLink: this.ensureLeadingSlash(key) },
            ];
        }
        // For this route if previously a breadcrumb is not defined that sets isAutoGeneratedLabel: true
        // change it to false since this is user supplied value
        updateArgs[1].isAutoGeneratedLabel = false;
        this.updateStore(...updateArgs);
        this.updateCurrentBreadcrumbs(...updateArgs);
    }
    /**
     * Update the store to reuse for dynamic declarations
     * If the store already has this route definition update it, else add
     */
    updateStore(key, breadcrumb) {
        const storeItemIndex = this.dynamicBreadcrumbStore.findIndex((item) => {
            return breadcrumb[key] === item[key];
        });
        if (storeItemIndex > -1) {
            this.dynamicBreadcrumbStore[storeItemIndex] = {
                ...this.dynamicBreadcrumbStore[storeItemIndex],
                ...breadcrumb,
            };
        }
        else {
            this.dynamicBreadcrumbStore.push({ ...breadcrumb });
        }
    }
    /**
     * If breadcrumb is present in current breadcrumbs update it and emit new stream
     */
    updateCurrentBreadcrumbs(key, breadcrumb) {
        const itemIndex = this.currentBreadcrumbs.findIndex((item) => {
            return key === 'routeRegex'
                ? this.matchRegex(item.routeLink, breadcrumb[key])
                : breadcrumb[key] === item[key];
        });
        if (itemIndex > -1) {
            this.currentBreadcrumbs[itemIndex] = {
                ...this.currentBreadcrumbs[itemIndex],
                ...breadcrumb,
            };
            const breadcrumbsToShow = this.currentBreadcrumbs.filter((item) => !item.skip);
            this.breadcrumbs.next([...breadcrumbsToShow]);
        }
    }
    /**
     * For a route with path param, we create regex dynamically from angular route syntax
     * '/mentor/:id' becomes '/mentor/[^/]',
     * breadcrumbService.set('/mentor/:id', 'Uday') should update 'Uday' as label for '/mentor/2' OR 'mentor/ada'
     */
    buildRegex(path) {
        return this.ensureLeadingSlash(path).replace(new RegExp(PATH_PARAM.REGEX_IDENTIFIER, 'g'), PATH_PARAM.REGEX_REPLACER);
    }
    ensureLeadingSlash(path) {
        return path.startsWith('/') ? path : `/${path}`;
    }
    /**
     * In App's RouteConfig, breadcrumb can be defined as a string OR a function OR an object
     *
     * string: simple static breadcrumb label for a path
     * function: callback that gets invoked with resolved path param
     * object: additional data defined along with breadcrumb label that gets passed to *xngBreadcrumbItem directive
     */
    extractLabel(config, resolvedParam) {
        const label = typeof config === 'object' ? config.label : config;
        if (typeof label === 'function') {
            return label(resolvedParam);
        }
        return label;
    }
    extractObject(config) {
        // don't include {label} if config is undefined. This is important since we merge the configs
        if (config &&
            (typeof config === 'string' || typeof config === 'function')) {
            return { label: config };
        }
        return config || {};
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbService, deps: [{ token: i1.ActivatedRoute }, { token: i1.Router }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: i1.ActivatedRoute }, { type: i1.Router }]; } });

class BreadcrumbComponent {
    /**
     * separator between breadcrumbs, defaults to '/'.
     * User can customize separator either by passing a String or Template
     *
     * String --> Ex: <xng-breadcrumb separator="-"> </xng-breadcrumb>
     *
     * Template --> Ex: <xng-breadcrumb [separator]="separatorTemplate"> </xng-breadcrumb>
     * <ng-template #separatorTemplate><mat-icon>arrow_right</mat-icon></ng-template>
     */
    set separator(value) {
        if (value instanceof TemplateRef) {
            this.separatorTemplate = value;
            this._separator = undefined;
        }
        else {
            this.separatorTemplate = undefined;
            this._separator = value || '/';
        }
    }
    get separator() {
        return this._separator;
    }
    constructor(breadcrumbService, activateRoute) {
        this.breadcrumbService = breadcrumbService;
        this._separator = '/';
        /**
         * If true, breadcrumb is auto generated even without any mapping label
         * Default label is same as route segment
         */
        this.autoGenerate = true;
        /**
         * By default query params will be preserved with breadcrumbs
         */
        this.preserveQueryParams = true;
        /**
         * By default query fragments will be preserved with breadcrumbs
         */
        this.preserveFragment = true;
        /**
         * custom class provided by consumer to increase specificity
         * This will benefit to override styles that are conflicting
         */
        this.class = '';
        this.setupMessage = 'not set up yet';
        this.someParameterValue = null;
        // breadcrumb inside ngIf works only this way
        activateRoute.params.subscribe((params) => {
            this.setupComponent(params['someParam']);
        });
    }
    setupComponent(someParam) {
        this.setupMessage = 'set up at ' + new Date();
        this.someParameterValue = someParam;
    }
    ngOnInit() {
        this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$.pipe(map((breadcrumbs) => {
            return breadcrumbs
                .filter((breadcrumb) => {
                // Usually, breadcrumb list can contain a combination of auto generated and user specified labels
                // this filters autogenerated labels in case of "[autoGenerate]: false"
                if (this.autoGenerate) {
                    return true;
                }
                return !breadcrumb.isAutoGeneratedLabel;
            })
                .map((breadcrumb) => {
                // Do not mutate breadcrumb as its source of truth.
                // There can be scenarios where we can have multiple xng-breadcrumb instances in page
                const { routeInterceptor, routeLink } = breadcrumb;
                return {
                    ...breadcrumb,
                    routeLink: routeInterceptor?.(routeLink, breadcrumb) || routeLink,
                };
            });
        }));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbComponent, deps: [{ token: BreadcrumbService }, { token: i1.ActivatedRoute }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.0.0", type: BreadcrumbComponent, selector: "xng-breadcrumb", inputs: { autoGenerate: "autoGenerate", preserveQueryParams: "preserveQueryParams", preserveFragment: "preserveFragment", class: "class", anchorTarget: "anchorTarget", separator: "separator" }, queries: [{ propertyName: "itemTemplate", first: true, predicate: BreadcrumbItemDirective, descendants: true, read: TemplateRef }], ngImport: i0, template: "<nav aria-label=\"breadcrumb\" class=\"xng-breadcrumb-root\" [ngClass]=\"class\">\n  <ol class=\"xng-breadcrumb-list\">\n    <ng-container\n      *ngFor=\"\n        let breadcrumb of breadcrumbs$ | async;\n        last as isLast;\n        first as isFirst;\n        index as index;\n        count as count\n      \"\n    >\n      <li class=\"xng-breadcrumb-item\">\n        <a\n          *ngIf=\"!isLast\"\n          class=\"xng-breadcrumb-link\"\n          [ngClass]=\"{ 'xng-breadcrumb-link-disabled': breadcrumb.disable }\"\n          [attr.aria-disabled]=\"breadcrumb.disable\"\n          [attr.tabIndex]=\"breadcrumb.disable ? -1 : 0\"\n          rel=\"noopener noreferrer\"\n          [routerLink]=\"\n            breadcrumb.routeInterceptor\n              ? breadcrumb.routeInterceptor(breadcrumb.routeLink, breadcrumb)\n              : breadcrumb.routeLink\n          \"\n          [queryParams]=\"\n            preserveQueryParams ? breadcrumb.queryParams : undefined\n          \"\n          [fragment]=\"preserveFragment ? breadcrumb.fragment : undefined\"\n          [target]=\"anchorTarget ? anchorTarget : '_self'\"\n        >\n          <ng-container\n            *ngTemplateOutlet=\"\n              itemTemplate;\n              context: {\n                $implicit: breadcrumb.label,\n                info: breadcrumb.info,\n                last: isLast,\n                first: isFirst,\n                index: index,\n                count: count\n              }\n            \"\n          ></ng-container>\n          <ng-container *ngIf=\"!itemTemplate\">{{\n            breadcrumb.label\n          }}</ng-container>\n        </a>\n\n        <label *ngIf=\"isLast\" class=\"xng-breadcrumb-trail\">\n          <ng-container\n            *ngTemplateOutlet=\"\n              itemTemplate;\n              context: {\n                $implicit: breadcrumb.label,\n                info: breadcrumb.info,\n                last: isLast,\n                first: isFirst,\n                index: index,\n                count: count\n              }\n            \"\n          ></ng-container>\n          <ng-container *ngIf=\"!itemTemplate\">{{\n            breadcrumb.label\n          }}</ng-container>\n        </label>\n      </li>\n\n      <li *ngIf=\"!isLast\" class=\"xng-breadcrumb-separator\" aria-hidden=\"true\">\n        <ng-container *ngTemplateOutlet=\"separatorTemplate\"></ng-container>\n        <ng-container *ngIf=\"!separatorTemplate\">{{ separator }}</ng-container>\n      </li>\n    </ng-container>\n  </ol>\n</nav>\n", styles: [".xng-breadcrumb-root{margin:0}.xng-breadcrumb-list{display:flex;align-items:center;flex-wrap:wrap;margin:0;padding:0}.xng-breadcrumb-item{list-style:none}.xng-breadcrumb-trail{display:flex;align-items:center}.xng-breadcrumb-link{display:flex;align-items:center;white-space:nowrap;color:inherit;text-decoration:none;transition:-webkit-text-decoration .3s;transition:text-decoration .3s;transition:text-decoration .3s,-webkit-text-decoration .3s;cursor:pointer}.xng-breadcrumb-link:hover{text-decoration:underline}.xng-breadcrumb-link-disabled{pointer-events:none;cursor:disabled}.xng-breadcrumb-separator{display:flex;-webkit-user-select:none;user-select:none;margin-left:8px;margin-right:8px}\n"], dependencies: [{ kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i3.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i3.NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: i1.RouterLink, selector: "[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }, { kind: "pipe", type: i3.AsyncPipe, name: "async" }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbComponent, decorators: [{
            type: Component,
            args: [{ selector: 'xng-breadcrumb', encapsulation: ViewEncapsulation.None, template: "<nav aria-label=\"breadcrumb\" class=\"xng-breadcrumb-root\" [ngClass]=\"class\">\n  <ol class=\"xng-breadcrumb-list\">\n    <ng-container\n      *ngFor=\"\n        let breadcrumb of breadcrumbs$ | async;\n        last as isLast;\n        first as isFirst;\n        index as index;\n        count as count\n      \"\n    >\n      <li class=\"xng-breadcrumb-item\">\n        <a\n          *ngIf=\"!isLast\"\n          class=\"xng-breadcrumb-link\"\n          [ngClass]=\"{ 'xng-breadcrumb-link-disabled': breadcrumb.disable }\"\n          [attr.aria-disabled]=\"breadcrumb.disable\"\n          [attr.tabIndex]=\"breadcrumb.disable ? -1 : 0\"\n          rel=\"noopener noreferrer\"\n          [routerLink]=\"\n            breadcrumb.routeInterceptor\n              ? breadcrumb.routeInterceptor(breadcrumb.routeLink, breadcrumb)\n              : breadcrumb.routeLink\n          \"\n          [queryParams]=\"\n            preserveQueryParams ? breadcrumb.queryParams : undefined\n          \"\n          [fragment]=\"preserveFragment ? breadcrumb.fragment : undefined\"\n          [target]=\"anchorTarget ? anchorTarget : '_self'\"\n        >\n          <ng-container\n            *ngTemplateOutlet=\"\n              itemTemplate;\n              context: {\n                $implicit: breadcrumb.label,\n                info: breadcrumb.info,\n                last: isLast,\n                first: isFirst,\n                index: index,\n                count: count\n              }\n            \"\n          ></ng-container>\n          <ng-container *ngIf=\"!itemTemplate\">{{\n            breadcrumb.label\n          }}</ng-container>\n        </a>\n\n        <label *ngIf=\"isLast\" class=\"xng-breadcrumb-trail\">\n          <ng-container\n            *ngTemplateOutlet=\"\n              itemTemplate;\n              context: {\n                $implicit: breadcrumb.label,\n                info: breadcrumb.info,\n                last: isLast,\n                first: isFirst,\n                index: index,\n                count: count\n              }\n            \"\n          ></ng-container>\n          <ng-container *ngIf=\"!itemTemplate\">{{\n            breadcrumb.label\n          }}</ng-container>\n        </label>\n      </li>\n\n      <li *ngIf=\"!isLast\" class=\"xng-breadcrumb-separator\" aria-hidden=\"true\">\n        <ng-container *ngTemplateOutlet=\"separatorTemplate\"></ng-container>\n        <ng-container *ngIf=\"!separatorTemplate\">{{ separator }}</ng-container>\n      </li>\n    </ng-container>\n  </ol>\n</nav>\n", styles: [".xng-breadcrumb-root{margin:0}.xng-breadcrumb-list{display:flex;align-items:center;flex-wrap:wrap;margin:0;padding:0}.xng-breadcrumb-item{list-style:none}.xng-breadcrumb-trail{display:flex;align-items:center}.xng-breadcrumb-link{display:flex;align-items:center;white-space:nowrap;color:inherit;text-decoration:none;transition:-webkit-text-decoration .3s;transition:text-decoration .3s;transition:text-decoration .3s,-webkit-text-decoration .3s;cursor:pointer}.xng-breadcrumb-link:hover{text-decoration:underline}.xng-breadcrumb-link-disabled{pointer-events:none;cursor:disabled}.xng-breadcrumb-separator{display:flex;-webkit-user-select:none;user-select:none;margin-left:8px;margin-right:8px}\n"] }]
        }], ctorParameters: function () { return [{ type: BreadcrumbService }, { type: i1.ActivatedRoute }]; }, propDecorators: { itemTemplate: [{
                type: ContentChild,
                args: [BreadcrumbItemDirective, { static: false, read: TemplateRef }]
            }], autoGenerate: [{
                type: Input
            }], preserveQueryParams: [{
                type: Input
            }], preserveFragment: [{
                type: Input
            }], class: [{
                type: Input
            }], anchorTarget: [{
                type: Input
            }], separator: [{
                type: Input
            }] } });

class BreadcrumbModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbModule, declarations: [BreadcrumbComponent, BreadcrumbItemDirective], imports: [CommonModule, RouterModule], exports: [BreadcrumbComponent, BreadcrumbItemDirective] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbModule, imports: [CommonModule, RouterModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0", ngImport: i0, type: BreadcrumbModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [BreadcrumbComponent, BreadcrumbItemDirective],
                    imports: [CommonModule, RouterModule],
                    exports: [BreadcrumbComponent, BreadcrumbItemDirective],
                }]
        }] });

/*
 * Public API Surface of xng-breadcrumb
 */

/**
 * Generated bundle index. Do not edit.
 */

export { BreadcrumbComponent, BreadcrumbItemDirective, BreadcrumbModule, BreadcrumbService };
//# sourceMappingURL=xng-breadcrumb.mjs.map
