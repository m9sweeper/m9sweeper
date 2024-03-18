# API

## App Route Config -> data -> breadcrumb

| property              | Description                                                      | Type                                   | Default     |
| --------------------- | ---------------------------------------------------------------- | -------------------------------------- | ----------- |
| breadcrumb            | Breadcrumb data provided in App route config                     | `string` or `Breadcrumb` or `Function` | `undefined` |
| breadcrumb: {alias}   | alias name for a route                                           | `string`                               | `undefined` |
| breadcrumb: {skip}    | skip a route from showing in breadcrumbs                         | `boolean`                              | `false`     |
| breadcrumb: {disable} | disable navigation for a breadcrumb item                         | `boolean`                              | `false`     |
| breadcrumb: {info}    | arbitrary info for a breadcrumb.                                 | `string` or `object`                   | `undefined` |
| breadcrumb: {label}   | same as breadcrumb. Use label if breadcrumb is defined as object | `string`                               | `undefined` |

## xng-breadcrumb component

| Input               | Description                                               | Type      | Default                    |
| ------------------- | --------------------------------------------------------- | --------- | -------------------------- |
| separator           | input: separator between breadcrumbs                      | `string`  | `TemplateRef<void>` or `/` |
| autoGenerate        | input:whether to auto generate breadcrumb labels          | `boolean` | `true`                     |
| \*xngBreadcrumbItem | directive: to read context in custom breadcrumb templates | NA        | NA                         |
| preserveQueryParams | preserve query params while navigating via breadcrumbs    | `boolean` | `true`                     |
| preserveFragment    | preserve fragment while navigating via breadcrumbs        | `boolean` | `true`                     |

## BreadcrumbService.set(pathOrAlias, breadcrumb)

| argument    | Description                                | Type                     |
| ----------- | ------------------------------------------ | ------------------------ |
| pathOrAlias | full route path or alias prefixed with '@' | `string`                 |
| breadcrumb  | breadcrumb data to update for a route      | `string` or `Breadcrumb` |
