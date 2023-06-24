<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app for development

Configure app locally by creating a .env file and then editing its postgresql settings to match yours:

    cp .env.sample .env

Then install npm dependencies: 

    npm install

Then run it: 

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Setting Up First User
### In your .env file:
SUPER_ADMIN_EMAIL=email@intelletive.com  
SUPER_ADMIN_PASSWORD=password  
TRAWLER_API_KEY=123456
* `npm run build:local`
* `npm run cli users:init`

## Seeing raw SQL Queries

Just add this environment variable to see all raw SQL queries (very helpful when debugging queries). 

    DEBUG=knex:query

## Build and Run for Production

```bash
$ npm run prebuild
$ npm run build:prod
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Note on Knexnest
We have pulled in and updated knexnest as a vendor package.
Running it locally functions differently than building it for k8s,
and line 3 in `backend/vendor/knexnest/knexnest.js` must be changed to reflect that.

running in k8s:
```javascript
var NestHydrationJS = require('nesthydrationjs')();
```

running locally:
```javascript
var NestHydrationJS = require('nesthydrationjs');
```
_note the removal of `()` in the latter_

In order to prevent yourself from accidentally check in this change,
you can run `git update-index --assume-unchanged backend/vendor/knexnest/knexnest.js`
from the repo root to tell git to ignore your changes to that file.

To tell git to watch the file again, you can run `git update-index --no-assume-unchanged backend/vendor/knexnest/knexnest.js`

### Logger suggestion
We have overridden some of console functions like log, info, error
```
log method must use 2 params instead of regular usage.
 
Param1: Log message as string or an object which contain two params named label and data 
Param2: Context of log

console.log('Hello Test console.log','CONSOLE_OVERRIDE_CONTEXT');
console.log({label: 'Error Message', data: {param1: '', param2: ''}},'CONSOLE_OVERRIDE_CONTEXT');

console.info('Hello Test console.log','CONSOLE_OVERRIDE_CONTEXT');
console.info({label: 'Error Message', data: {param1: '', param2: ''}},'CONSOLE_OVERRIDE_CONTEXT');
``` 

```
error method must use 3 params instead of regular usage.
 
Param1: Error message as string or an object which contain two params named label and data 
Param2: Instance of Error or Exception
Param3: Context of log

console.error('Error Message', new Error('Dummy exception!!!!'),'CONSOLE_OVERRIDE_CONTEXT');
console.error({label: 'Error Message', data: {userId: 2}}, new Error('Dummy exception!!!!'),'CONSOLE_OVERRIDE_CONTEXT');
``` 

### OpenAPI 3 documentation (Swagger-UI)
Documentation URL for all rest endpoints
```
http://host:port/doc
ex. http://localhost:3200/doc
```
Documentation URL for trawler rest endpoints
```
http://host:port/trawler-doc
ex. http://localhost:3200/trawler-doc
```

 
