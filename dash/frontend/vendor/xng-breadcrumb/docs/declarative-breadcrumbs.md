# Declarative breadcrumbs

We can define breadcrumbs as part of routing module configuration for any path. Just add `breadcrumb` property in `data` object during route declaration

`breadcrumb` can be defined as a **string** OR **object** OR **function**.

## defining breadcrumb as a string

define **breadcrumb as a string** if you are know the breadcrumb text value for a route upfront

```javascript
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    data: { breadcrumb: 'Home' }
  },
  {
    path: 'add',
    component: MentorAddComponent,
    data: { breadcrumb: 'New' }
  }
```

## defining breadcrumb as an object

- Use **breadcrumb as an object** if you are providing additional properties like `alias`, `skip`, `disable`.
- If you define breadcrumb as an object, **label** property denotes breadcrumb text.
- Use `info` property to pass arbitrary data associated with a route which you can use in breadcrumb selector. [See usage](add-icon-with-label.md)

```javascript
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    data: {
      breadcrumb: {
        label: 'Home',
        info: { myData: { icon: 'home', iconType: 'material' } }
      }
    }
  },
  {
    path: 'add',
    component: MentorAddComponent,
    data: { breadcrumb: { skip: true, alias: 'mentorAdd' } }
  }
```

## defining breadcrumb as a function

Breadcrumb as a function gives you more power :)
Use **breadcrumb as a function** if you want to alter the auto-generated label in more granular way.

```javascript
{
  path: '/orders',
  children: [{
    ':id',
    data: {
      breadcrumb: (resolvedId: string) => `Viewing ${resolvedId} now`
    }
  }]
}
```
