import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@ajsf/core";
import * as i2 from "@angular/common";
import * as i3 from "@angular/material/button";
export class MaterialAddReferenceComponent {
    constructor(jsf) {
        this.jsf = jsf;
    }
    ngOnInit() {
        this.options = this.layoutNode.options || {};
    }
    get showAddButton() {
        return !this.layoutNode.arrayItem ||
            this.layoutIndex[this.layoutIndex.length - 1] < this.options.maxItems;
    }
    addItem(event) {
        event.preventDefault();
        this.jsf.addItem(this);
    }
    get buttonText() {
        const parent = {
            dataIndex: this.dataIndex.slice(0, -1),
            layoutIndex: this.layoutIndex.slice(0, -1),
            layoutNode: this.jsf.getParentNode(this),
        };
        return parent.layoutNode.add ||
            this.jsf.setArrayItemTitle(parent, this.layoutNode, this.itemCount);
    }
}
MaterialAddReferenceComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialAddReferenceComponent, deps: [{ token: i1.JsonSchemaFormService }], target: i0.ɵɵFactoryTarget.Component });
MaterialAddReferenceComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.9", type: MaterialAddReferenceComponent, selector: "material-add-reference-widget", inputs: { layoutNode: "layoutNode", layoutIndex: "layoutIndex", dataIndex: "dataIndex" }, ngImport: i0, template: `
    <section [class]="options?.htmlClass || ''" align="end">
      <button mat-raised-button *ngIf="showAddButton"
        [color]="options?.color || 'accent'"
        [disabled]="options?.readonly"
        (click)="addItem($event)">
        <span *ngIf="options?.icon" [class]="options?.icon"></span>
        <span *ngIf="options?.title" [innerHTML]="buttonText"></span>
      </button>
    </section>`, isInline: true, dependencies: [{ kind: "directive", type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i3.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }], changeDetection: i0.ChangeDetectionStrategy.Default });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: MaterialAddReferenceComponent, decorators: [{
            type: Component,
            args: [{
                    // tslint:disable-next-line:component-selector
                    selector: 'material-add-reference-widget',
                    template: `
    <section [class]="options?.htmlClass || ''" align="end">
      <button mat-raised-button *ngIf="showAddButton"
        [color]="options?.color || 'accent'"
        [disabled]="options?.readonly"
        (click)="addItem($event)">
        <span *ngIf="options?.icon" [class]="options?.icon"></span>
        <span *ngIf="options?.title" [innerHTML]="buttonText"></span>
      </button>
    </section>`,
                    changeDetection: ChangeDetectionStrategy.Default,
                }]
        }], ctorParameters: function () { return [{ type: i1.JsonSchemaFormService }]; }, propDecorators: { layoutNode: [{
                type: Input
            }], layoutIndex: [{
                type: Input
            }], dataIndex: [{
                type: Input
            }] } });
//# sourceMappingURL=eventLog:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0ZXJpYWwtYWRkLXJlZmVyZW5jZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hanNmLW1hdGVyaWFsL3NyYy9saWIvd2lkZ2V0cy9tYXRlcmlhbC1hZGQtcmVmZXJlbmNlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQzs7Ozs7QUFtQmxGLE1BQU0sT0FBTyw2QkFBNkI7SUFTeEMsWUFDVSxHQUEwQjtRQUExQixRQUFHLEdBQUgsR0FBRyxDQUF1QjtJQUNoQyxDQUFDO0lBRUwsUUFBUTtRQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDZixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTO1lBQy9CLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7SUFDMUUsQ0FBQztJQUVELE9BQU8sQ0FBQyxLQUFLO1FBQ1gsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDWixNQUFNLE1BQU0sR0FBUTtZQUNsQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztTQUN6QyxDQUFDO1FBQ0YsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUc7WUFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEUsQ0FBQzs7MEhBbkNVLDZCQUE2Qjs4R0FBN0IsNkJBQTZCLCtKQVo5Qjs7Ozs7Ozs7O2VBU0c7MkZBR0YsNkJBQTZCO2tCQWZ6QyxTQUFTO21CQUFDO29CQUNULDhDQUE4QztvQkFDOUMsUUFBUSxFQUFFLCtCQUErQjtvQkFDekMsUUFBUSxFQUFFOzs7Ozs7Ozs7ZUFTRztvQkFDYixlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztpQkFDakQ7NEdBTVUsVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ29tcG9uZW50LCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBKc29uU2NoZW1hRm9ybVNlcnZpY2UgfSBmcm9tICdAYWpzZi9jb3JlJztcblxuXG5AQ29tcG9uZW50KHtcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNvbXBvbmVudC1zZWxlY3RvclxuICBzZWxlY3RvcjogJ21hdGVyaWFsLWFkZC1yZWZlcmVuY2Utd2lkZ2V0JyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8c2VjdGlvbiBbY2xhc3NdPVwib3B0aW9ucz8uaHRtbENsYXNzIHx8ICcnXCIgYWxpZ249XCJlbmRcIj5cbiAgICAgIDxidXR0b24gbWF0LXJhaXNlZC1idXR0b24gKm5nSWY9XCJzaG93QWRkQnV0dG9uXCJcbiAgICAgICAgW2NvbG9yXT1cIm9wdGlvbnM/LmNvbG9yIHx8ICdhY2NlbnQnXCJcbiAgICAgICAgW2Rpc2FibGVkXT1cIm9wdGlvbnM/LnJlYWRvbmx5XCJcbiAgICAgICAgKGNsaWNrKT1cImFkZEl0ZW0oJGV2ZW50KVwiPlxuICAgICAgICA8c3BhbiAqbmdJZj1cIm9wdGlvbnM/Lmljb25cIiBbY2xhc3NdPVwib3B0aW9ucz8uaWNvblwiPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gKm5nSWY9XCJvcHRpb25zPy50aXRsZVwiIFtpbm5lckhUTUxdPVwiYnV0dG9uVGV4dFwiPjwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvc2VjdGlvbj5gLFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG59KVxuZXhwb3J0IGNsYXNzIE1hdGVyaWFsQWRkUmVmZXJlbmNlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgb3B0aW9uczogYW55O1xuICBpdGVtQ291bnQ6IG51bWJlcjtcbiAgcHJldmlvdXNMYXlvdXRJbmRleDogbnVtYmVyW107XG4gIHByZXZpb3VzRGF0YUluZGV4OiBudW1iZXJbXTtcbiAgQElucHV0KCkgbGF5b3V0Tm9kZTogYW55O1xuICBASW5wdXQoKSBsYXlvdXRJbmRleDogbnVtYmVyW107XG4gIEBJbnB1dCgpIGRhdGFJbmRleDogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBqc2Y6IEpzb25TY2hlbWFGb3JtU2VydmljZVxuICApIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMub3B0aW9ucyA9IHRoaXMubGF5b3V0Tm9kZS5vcHRpb25zIHx8IHt9O1xuICB9XG5cbiAgZ2V0IHNob3dBZGRCdXR0b24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLmxheW91dE5vZGUuYXJyYXlJdGVtIHx8XG4gICAgICB0aGlzLmxheW91dEluZGV4W3RoaXMubGF5b3V0SW5kZXgubGVuZ3RoIC0gMV0gPCB0aGlzLm9wdGlvbnMubWF4SXRlbXM7XG4gIH1cblxuICBhZGRJdGVtKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmpzZi5hZGRJdGVtKHRoaXMpO1xuICB9XG5cbiAgZ2V0IGJ1dHRvblRleHQoKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJlbnQ6IGFueSA9IHtcbiAgICAgIGRhdGFJbmRleDogdGhpcy5kYXRhSW5kZXguc2xpY2UoMCwgLTEpLFxuICAgICAgbGF5b3V0SW5kZXg6IHRoaXMubGF5b3V0SW5kZXguc2xpY2UoMCwgLTEpLFxuICAgICAgbGF5b3V0Tm9kZTogdGhpcy5qc2YuZ2V0UGFyZW50Tm9kZSh0aGlzKSxcbiAgICB9O1xuICAgIHJldHVybiBwYXJlbnQubGF5b3V0Tm9kZS5hZGQgfHxcbiAgICAgIHRoaXMuanNmLnNldEFycmF5SXRlbVRpdGxlKHBhcmVudCwgdGhpcy5sYXlvdXROb2RlLCB0aGlzLml0ZW1Db3VudCk7XG4gIH1cbn1cbiJdfQ==
