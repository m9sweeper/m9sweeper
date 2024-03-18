# Quickstart

## Install via npm or yarn

```javascript
npm install --save xng-breadcrumb
//------------- OR --------------
yarn add xng-breadcrumb
```

## Import BreadcrumbModule in app.module.ts

```javascript
import {BreadcrumbModule} from 'xng-breadcrumb';

@NgModule({
  ...
  imports: [BreadcrumbModule],
  ...
})
export class AppModule { }
```

## Add xng-breadcrumb selector anywhere in the app

Usually it is added in app.component.html

```html
<xng-breadcrumb></xng-breadcrumb>
```

🎉🎉 That's it. You should see auto-generated breadcrumbs appearing for each route.

Note: XngBreadcrumb has a peer dependency on `@angular/router`. Include `RouterModule` in your app.module.ts imports, if you haven't already.
