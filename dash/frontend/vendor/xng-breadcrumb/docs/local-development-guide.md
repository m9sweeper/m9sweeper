# Local development guide

This project was generated using [Nx](https://nx.dev).

If you wish to contribute to this repository, below are the steps for local development.

- Clone the repository `git clone https://github.com/udayvunnam/xng-breadcrumb.git`
- Run `yarn` to install the dependencies
- Run `yarn start` to build and watch both the library and the demo app. This opens the demo app at `http://localhost:4200/` automatically.

## Build

Run `yarn build` to build the library and demo app together. The build artifacts will be stored in the `dist/` directory.

This step is used by CircleCI to build both the library and the demo app.
After a successful build, the demo apps are deployed to Vercel.

## Publish to npm

Run `yarn release` on main branch if you wish to publish a new version of library to npm

This ingternally uses standard-version to

- bump the library version based on the commits
- generates changelog
- commit bump files and changelog
- create a new tag with the new version number

CircleCI gets notified on every new tag push and publishes the library if build and tests are success

## Tests

- Unit tests: `yarn test` to execute the unit tests via [Jest](https://www.xfive.co/blog/testing-angular-faster-jest/)
- e2e: `yarn e2e` to execute the e2e tests via [Cypress.io](https://docs.cypress.io/guides/overview/why-cypress.html)
