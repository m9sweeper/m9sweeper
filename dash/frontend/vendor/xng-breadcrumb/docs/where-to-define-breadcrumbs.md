# Where to define breadcrumbs, if Routes path have same route specificity

- For the same route path, you can define breadcrumbs either on _parent_ or _any descendant with empty path_.
- If both are defined, the children take the precedence.

## With Component and its Children

```javascript
  // defining breadcrumb on Component Route
  {
    path: ':userId',
    data: { breadcrumb: 'Declared on Parent Component' },
    children: [
      { path: '', component: ShowUserComponent }
    ]
  }
  // defining breadcrumb on children with empty path
  {
    path: ':userId',
    children: [
      { path: '', component: ShowUserComponent, data: { breadcrumb: 'Declaraed on child with empty path' }
    ]
  }
```

## With Module and its Children

```javascript
  // defining breadcrumb on Module route
  { path: 'home', loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule), data: { breadcrumb: 'Declaraed on Parent Module' } }

  // Within HomeModule Routes -
  { path: '', pathMatch: 'full', component: HomeComponent, data: { breadcrumb: 'Declaraed on child with empty path' }}

```
