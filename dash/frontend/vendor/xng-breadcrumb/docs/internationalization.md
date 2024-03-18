# Internationalization - i18n

- Internationalization is achieved in Angular using libraries like `ngx-translate` or `transloco`.
- These libraries provide a pipe to change text while language is changed.
- For example, if you are using `ngx-translate` you can change the language for breadcrumb text as shown below.

```html
<xng-breadcrumb>
  <ng-container *xngBreadcrumbItem="let breadcrumb">
    <ng-container>{{ breadcrumb | translate }}</ng-container>
  </ng-container>
</xng-breadcrumb>
```
