import { Breadcrumb } from './breadcrumb';
/**
 * Breadcrumb config provided as part of App Route Config
 */
export interface BreadcrumbObject {
    /**
     * breadcrumb label for a route
     */
    label?: string | BreadcrumbFunction;
    /**
     * unique alias name for a route path that can be used to dynamically update a route's breadcrumb label via breadcrumbService.set()
     */
    alias?: string;
    /**
     * hide or show the breadcrumb item
     */
    skip?: boolean;
    /**
     * disable a certain breadcrumb in the list. Not clickable.
     * It may be needed when the routing has the path, but navigating to that path is of no use
     */
    disable?: boolean;
    /**
     * custom data for each breadcrumb that is passed back to ng-template
     */
    info?: unknown;
    /**
     * Interceptor for breadcrumb click action that returns the dynamic path
     * Consumers can change the breadcrumb routing dynamically with this approach
     */
    routeInterceptor?: (routeLink: string, breadcrumb: Breadcrumb) => string;
}
export type BreadcrumbFunction = (resolvedLabel?: string) => string;
