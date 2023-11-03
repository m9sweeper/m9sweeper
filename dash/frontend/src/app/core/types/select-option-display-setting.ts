/** A generic interface to use in looping over elements for a mat-select */
export interface SelectOptionDisplaySetting<T = any> {
  displayName: string;
  value: T;
}
