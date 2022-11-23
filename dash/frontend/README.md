# m9sweeper (Frontend)

[[Intelletive Consulting](https://www.intelletive.com)]


### Packages/Libraries Used for Frontend
- [Angular 9.2.0](https://angular.io/)
- [Angular Material](https://material.angular.io/)

### Frontend File Structure

```
frontend
|__src
|   |__app
|   |__core
|   |  |_entities
|   |  |_services
|   |__modules
|   |__app.component.html
|   |__app.component.scss
|   |__app.component.spec.ts
|   |__app.component.theme.scss
|   |__app.component.ts
|   |__app.module.ts
|   |__app-routing.module.ts
|   |__assetes
|   |__environments
|   |  |__environment.prod.ts
|   |  |__environment.ts
|   |__app-loader.scss
|   |__favicon.ico
|   |__index.html
|   |__main.ts
|   |__polyfills.ts
|   |__styles.scss
|   |__test.ts
|__angular.json
|__package.json
|__README.md
|__tsconfig.app.json
|__tsconfig.json
|__tsconfig.spec.json
```
### Core

- Entity related files should be found in entites directory and service related files should be found in services directory

### Modules
We have two folders under modules directory: private and public. Public contents such as Login, Signup, About pages should be placed under public module. On the other hand, private modules such as dashboard, admin panel etc should be placed in private directory.

### Assets

All the asset files should go under assets directory. For instance, images.

### Environments

- environment.prod.ts: production environment variables (should not be pushed in repository).
- environment.ts: development environment variables

### Running the Frontend
<code>
* cd dash/frontend
* npm install
* npm start
</code>
