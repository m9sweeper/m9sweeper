# Skip breadcrumb

You can skip a route from displaying in breadcrumbs in two ways

1. add **skip: true** in route config `breadcrumb: { skip: true }`
2. dynamically skip using `set(<myPathOrAlias>, { skip:true })`;

## Skip breadcrumb via route config

```javascript
  {
    path: 'edit',
    component: MentorEditComponent,
    data: { breadcrumb: { skip: true } }
  }
```

## Skip breadcrumb dynamically

```javascript
// skip from appearing in breadcrumb list
breadcrumbService.set('mentor/:id/edit', { skip: true });
breadcrumbService.set('@mentorName', { skip: true }); // using alias '@mentorName'

// make a hidden breadcrumb visible.
breadcrumbService.set('mentor/:id/edit', { skip: false });
breadcrumbService.set('@mentorName', { skip: false }); // using alias '@mentorName'
```
