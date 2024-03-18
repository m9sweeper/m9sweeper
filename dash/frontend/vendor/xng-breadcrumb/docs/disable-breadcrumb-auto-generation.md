# Disable breadcrumb auto generation

- xng-breadcrumb is integrated with Angular Router
- Breadcrumb labels are auto-generated when a label is not provided.
- Auto generated label is same as the route path segment.
- If you want to disable this behavior, set `[autoGenerate]=false`.

```html
<xng-breadcrumb [autoGenerate]="false"></xng-breadcrumb>
```
