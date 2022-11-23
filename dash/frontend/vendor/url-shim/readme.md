# url-shim [![codecov](https://badgen.now.sh/codecov/c/github/lukeed/url-shim)](https://codecov.io/gh/lukeed/url-shim)

> A 1.53kB browser polyfill for the Node.js `URL` and `URLSearchParams` classes.

**Why?**

* All browser implementations *are not* 100% identical to the Node.js implementation.<br>
_For example, browsers have issue with custom protocols, which affects the `origin` and `pathname` parsing._

* Most polyfills match the browser implementations.<br>
_But what if you have a "universal app" and want to guarantee client/server uniformity?_

* Most polyfills immediately (albeit, conditionally) mutate global scope.<br>
_You can't declaratively import their implementations for standalone usage._

> **Note:** The only other library that satisfies these requirements is [`whatwg-url`](https://github.com/jsdom/whatwg-url), but it [weighs **87.6 kB (gzip)**](https://bundlephobia.com/result?p=whatwg-url@7.1.0)!

This module is available in three formats:

* **ES Module**: `dist/urlshim.mjs`
* **CommonJS**: `dist/urlshim.js`
* **UMD**: `dist/urlshim.min.js`


## Install

```
$ npm install --save url-shim
```


## Usage

```js
import { URL, URLSearchParams } from 'url-shim';

// composition
new URL('/foo', 'https://example.org/').href;
//=> "https://example.org/foo"

// unicode -> ASCII conversion
new URL('https://測試').href;
//=> "https://xn--g6w251d/"

// custom protocols w/ path
new URL('webpack:///src/bundle.js');
//=> { protocol: "webpack:", pathname: "/src/bundle.js", ... }

// custom protocols w/ hostname
new URL('git://github.com/lukeed/url-shim');
//=> { protocol: "git:", hostname: "github.com", pathname: "/lukeed/url-shim", ... }

new URL('http://foobar.com/123?a=1&b=2').searchParams instanceof URLSearchParams;
//=> true

const params = new URLSearchParams('foo=bar&xyz=baz');
for (const [name, value] of params) {
  console.log(name, value);
}
// Prints:
//   foo bar
//   xyz baz
```

## API

### URL(input, base?)
> **Size (gzip):** `1.53 kB`

See [Node.js documentation](https://nodejs.org/dist/latest-v12.x/docs/api/url.html#url_class_url) for info.

> **Important:** Requires a browser environment because `document.createElement` is used for URL parsing.

### URLSearchParams(input?)
> **Size (gzip):** `944 B`

See [Node.js documentation](https://nodejs.org/dist/latest-v12.x/docs/api/url.html#url_class_urlsearchparams) for info.


## License

MIT © [Luke Edwards](https://lukeed.com)
