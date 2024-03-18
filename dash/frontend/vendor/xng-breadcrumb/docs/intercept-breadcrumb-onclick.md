# Intercept breadcrumb onclick

When we have conditional routing in App components (Ex: for a certain role navigate to pathA vs pathB from a component), it might be useful to have conditional routing from breadcrumb too

## routeInterceptor with RouteConfig

Provide `routeInterceptor` callback in breadcrumb if you know the redirection logic upfront

```javascript
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
    data: {
      breadcrumb: {
        label: 'my home',
        info: 'home',
        routeInterceptor: (routeLink, breadcrumb)=> {
          return routeLink;
        }
      },
    },
  }
```

## routeInterceptor with Breadcrumb service

If you want to access Application context within the interceptor, use `breadcrumbService` that can be called from anywhere in the App

```javascript
const isDesigner = true;
breadcrumbService.set('home', {
  routeInterceptor: (routeLink, breadcrumb) =>
    isDesigner ? '/designer' : routeLink,
});
```
