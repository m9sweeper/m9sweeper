# Custom separator

- Breadcrumb uses '/' as the separator by default.
- To use custom separator pass **separator** as an input to `<xng-breadcrumb>`.
- You can either use a simple string(>>, -, -->) or a component (mat-icon, fa-icon) as a separator.

## String as separator

```html
<xng-breadcrumb separator=">"></xng-breadcrumb>
```

## Icon/Component as separator

```html
<xng-breadcrumb [separator]="iconTemplate"></xng-breadcrumb>

<ng-template #iconTemplate>
  <mat-icon>arrow_right</mat-icon>
</ng-template>
```
