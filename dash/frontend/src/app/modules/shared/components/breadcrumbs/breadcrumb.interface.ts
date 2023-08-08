/**
 * Interface that defines fields used to build each breadcrumb
 * @property place location in the list
 * @property link the routerLink array (if it should be a link)
 * @property text text might be null until after routing finishes
 */
export interface Breadcrumb {
  place: number;
  link?: string[];
  text: string | null;
}
