# Dynamic breadcrumbs

We can update breadcrumbs from components and services dynamically. This is useful when resolving route **id** to a **name**. Ex: ProductId in URL need to show ProductName in breadcrumb

- Breadcrumb label can be updated based on _route path_ or _alias_
- For simple routes, _route path_ is enough. Ex: `breadcrumbService.set(<route path> , <breadcrumb label>)`
- For long deep routes, you can use _alias_ instead.
- Create an _alias_ for a route in route config. Prefix alias with '@' while using the set() method. Ex: `breadcrumbService.set(@<alias> , <breadcrumb label>)`

## using route path to update labels dynamically

```javascript
  {
    path: 'mentors',
    component: MentorListComponent,
    children: [
      {
        path: ':id',
        component: MentorDetailsComponent
      }
    ]
  }
```

```javascript
  import { BreadcrumbService } from 'xng-breadcrumb';
  constructor(private breadcrumbService: BreadcrumbService) {};
  // routepath can contain path params similar to how you define in routes
  breadcrumbService.set('mentors', 'Mentor View'); // path for MentorListComponent
  breadcrumbService.set('mentors/:id', 'Uday Vunnam'); // path for MentorDetailsComponent contains param (:id)
```

## using alias to update labels dynamically

```javascript
  {
    path: 'mentors',
    component: MentorListComponent,
    children: [
      {
        path: ':id',
          component: MentorDetailsComponent
          data: {
            breadcrumb: {
              alias: 'mentorName'
            }
          }
        }
    ]
  }
```

```javascript
  import { BreadcrumbService } from 'xng-breadcrumb';
  constructor(private breadcrumbService: BreadcrumbService) {};
  breadcrumbService.set('@mentorName', 'Uday Vunnam');

```
