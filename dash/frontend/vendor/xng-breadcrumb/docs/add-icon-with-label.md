# Add icon with label

Define 'info' associated with breadcrumb in route config. 'info' has type <any>. you can pass string or object as you need.

```javascript
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
    data: {
      breadcrumb: {
        label: 'app home',
        info: 'home'
      }
    }
  }
```

`info` is available in the context of `*xngBreadcrumbItem`. Additionally `first`, `last` and `index` are passed to identify the respective items.

```html
<xng-breadcrumb>
  <ng-container
    *xngBreadcrumbItem="let breadcrumb; let info = info; let first = first"
  >
    <mat-icon *ngIf="info">{{ info }}</mat-icon>
    <ng-container *ngIf="!first">{{ breadcrumb }}</ng-container>
  </ng-container>
</xng-breadcrumb>
```
