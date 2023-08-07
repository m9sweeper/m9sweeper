export interface BreadcrumbInfo {
  place: number;  // location in the list
  link?: string[];  // the routerLink array (if it should be a link)
  text: string | null;  // text might be null until after routing finishes
}
