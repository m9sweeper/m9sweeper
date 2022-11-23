import * as lib from '../src';
import { compare, parse, toErrors } from './utils';

describe('exports', () => {
	it('should export an object', () => {
		expect(typeof lib).toBe('object');
	});

	it('should export "URL" function', () => {
		expect(typeof lib.URL).toBe('function');
	});

	it('should export "URLSearchParams" function', () => {
		expect(typeof lib.URLSearchParams).toBe('function');
	});
});

describe('URL', () => {
	describe('TypeErrors', () => {
		it('should throw when `base` is invalid', () => {
			const [local, native] = toErrors('URL', '', 'foobar');
			expect(local).toStrictEqual(native);
		});

		it('should throw when `url` is invalid w/o `base` present', () => {
			const [local, native] = toErrors('URL', 'foobar');
			expect(local).toStrictEqual(native);
		});

		it('should throw when `url` is an empty string', () => {
			const [local, native] = toErrors('URL', '');
			expect(local).toStrictEqual(native);
		});

		it('should throw when no arguments passed', () => {
			const [local, native] = toErrors('URL');
			expect(local).toStrictEqual(native);
		});
	});

	describe('Instance', () => {
		it('should return an instance of `URL` class', () => {
			const local = new lib.URL('http:/foo.com');
			expect(local instanceof lib.URL).toBe(true);
		});
	});

	describe('Matches `URL` from Node.js', () => {
		it('file:///C:/demo', () => {
			const [local, native] = compare('URL', 'file:///C:/demo');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'file:///C:/demo',
				origin: 'null',
				protocol: 'file:',
				username: '',
				password: '',
				host: '',
				hostname: '',
				port: '',
				pathname: '/C:/demo',
				search: '',
				hash: ''
			});
		});

		it('webpack:///C:/demo', () => {
			const [local, native] = compare('URL', 'webpack:///C:/demo');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'webpack:///C:/demo',
				origin: 'null',
				protocol: 'webpack:',
				username: '',
				password: '',
				host: '',
				hostname: '',
				port: '',
				pathname: '/C:/demo',
				search: '',
				hash: ''
			});
		});

		it('git://github.com/lukeed/url-shim', () => {
			const [local, native] = compare('URL', 'git://github.com/lukeed/url-shim');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'git://github.com/lukeed/url-shim',
				origin: 'null',
				protocol: 'git:',
				username: '',
				password: '',
				host: 'github.com',
				hostname: 'github.com',
				port: '',
				pathname: '/lukeed/url-shim',
				search: '',
				hash: ''
			});
		});

		it('./hello/world :: http://example.com', () => {
			const [local, native] = compare('URL', './hello/world', 'http://example.com');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/hello/world',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/hello/world',
				search: '',
				hash: ''
			});
		});

		it('../hello/world :: http://example.com', () => {
			const [local, native] = compare('URL', '../hello/world', 'http://example.com');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/hello/world',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/hello/world',
				search: '',
				hash: ''
			});
		});

		it('/hello/world :: http://example.com', () => {
			const [local, native] = compare('URL', '/hello/world', 'http://example.com');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/hello/world',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/hello/world',
				search: '',
				hash: ''
			});
		});

		it('./hello/world :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', './hello/world', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/foo/hello/world',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/foo/hello/world',
				search: '',
				hash: ''
			});
		});

		it('../hello/world :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', '../hello/world', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/hello/world',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/hello/world',
				search: '',
				hash: ''
			});
		});

		it('/hello/world :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', '/hello/world', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/hello/world',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/hello/world',
				search: '',
				hash: ''
			});
		});

		it('/ :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', '/', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/',
				search: '',
				hash: ''
			});
		});

		it('/ :: http://example.com/', () => {
			const [local, native] = compare('URL', '/', 'http://example.com/');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/',
				search: '',
				hash: ''
			});
		});

		it('/ :: http://example.com', () => {
			const [local, native] = compare('URL', '/', 'http://example.com');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/',
				search: '',
				hash: ''
			});
		});

		it('"" :: http://example.com/foo/bar', () => {
			const [local, native] = compare('URL', '', 'http://example.com/foo/bar');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/foo/bar',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/foo/bar',
				search: '',
				hash: ''
			});
		});

		it('"" :: http://example.com/', () => {
			const [local, native] = compare('URL', '', 'http://example.com/');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/',
				search: '',
				hash: ''
			});
		});

		it('"" :: http://example.com', () => {
			const [local, native] = compare('URL', '', 'http://example.com');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'http://example.com/',
				origin: 'http://example.com',
				protocol: 'http:',
				username: '',
				password: '',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/',
				search: '',
				hash: ''
			});
		});

		it('https://abc:xyz@example.com', () => {
			const local = new lib.URL('https://abc:xyz@example.com');
			const native = new URL('https://abc:xyz@example.com');

			const local_foo = parse(local);
			const native_foo = parse(native);
			expect(local_foo).toStrictEqual(native_foo);

			// direct copy from Node.js – insurance
			expect(local_foo).toStrictEqual({
				href: 'https://abc:xyz@example.com/',
				origin: 'https://example.com',
				protocol: 'https:',
				username: 'abc',
				password: 'xyz',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/',
				search: '',
				hash: ''
			});

			local.password = '123';
			native.password = '123';

			const local_bar = parse(local);
			const native_bar = parse(native);
			expect(local_bar).toStrictEqual(native_bar);

			// direct copy from Node.js – insurance
			expect(local_bar).toStrictEqual({
				href: 'https://abc:123@example.com/',
				origin: 'https://example.com',
				protocol: 'https:',
				username: 'abc',
				password: '123',
				host: 'example.com',
				hostname: 'example.com',
				port: '',
				pathname: '/',
				search: '',
				hash: ''
			});
		});

		it('/foo/bar :: https://測試', () => {
			const [local, native] = compare('URL', '/foo/bar', 'https://測試');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'https://xn--g6w251d/foo/bar',
				origin: 'https://xn--g6w251d',
				protocol: 'https:',
				username: '',
				password: '',
				host: 'xn--g6w251d',
				hostname: 'xn--g6w251d',
				port: '',
				pathname: '/foo/bar',
				search: '',
				hash: ''
			});
		});

		it('https://測試', () => {
			const [local, native] = compare('URL', 'https://測試');
			expect(local).toStrictEqual(native);
			// direct copy from Node.js – insurance
			expect(local).toStrictEqual({
				href: 'https://xn--g6w251d/',
				origin: 'https://xn--g6w251d',
				protocol: 'https:',
				username: '',
				password: '',
				host: 'xn--g6w251d',
				hostname: 'xn--g6w251d',
				port: '',
				pathname: '/',
				search: '',
				hash: ''
			});
		});
	});
});

describe('URLSearchParams', () => {
	describe('Matches `URLSearchParams` from Node.js', () => {
		it('?foo=bar', () => {
			const [local, native] = compare('URLSearchParams', '?foo=bar');
			expect(local).toStrictEqual(native);
		});

		it('foo=bar', () => {
			const [local, native] = compare('URLSearchParams', 'foo=bar');
			expect(local).toStrictEqual(native);
		});

		it('?foo=bar&bar&baz#123', () => {
			const [local, native] = compare('URLSearchParams', '?foo=bar&bar&baz#123');
			expect(local).toStrictEqual(native);
		});

		it('[[foo,1]]', () => {
			const [local, native] = compare('URLSearchParams', [['foo', 1]]);
			expect(local).toStrictEqual(native);
		});

		it('[[foo, null]]', () => {
			const [local, native] = compare('URLSearchParams', [['foo', null]]);
			expect(local).toStrictEqual(native);
		});

		it('[[foo, undefined]]', () => {
			const [local, native] = compare('URLSearchParams', [['foo', undefined]]);
			expect(local).toStrictEqual(native);
		});

		it('[[foo,1],[foo,2]]', () => {
			const [local, native] = compare('URLSearchParams', [['foo', 1], ['foo', '2']]);
			expect(local).toStrictEqual(native);
		});

		it('[[foo,1],[bar,abc],[foo,2]]', () => {
			const [local, native] = compare('URLSearchParams', [
				['foo', 1], ['bar', 'abc'], ['foo', '2']
			]);
			expect(local).toStrictEqual(native);
		});

		it('{ foo: 1 }', () => {
			const [local, native] = compare('URLSearchParams', {
				foo: 1
			});
			expect(local).toStrictEqual(native);
		});

		it('{ foo: [1,2] }', () => {
			const [local, native] = compare('URLSearchParams', {
				foo: [1, 2]
			});
			expect(local).toStrictEqual(native);
		});

		it('{ foo: 1, bar: 2 }', () => {
			const [local, native] = compare('URLSearchParams', {
				foo: 1,
				bar: 2,
			});
			expect(local).toStrictEqual(native);
		});

		it('{ foo: null }', () => {
			const [local, native] = compare('URLSearchParams', {
				foo: null
			});
			expect(local).toStrictEqual(native);
		});

		it('{ foo: undefined }', () => {
			const [local, native] = compare('URLSearchParams', {
				foo: undefined
			});
			expect(local).toStrictEqual(native);
		});

		it('{ foo: 1, bar: <nested> }', () => {
			const [local, native] = compare('URLSearchParams', {
				foo: 1,
				bar: {
					a: 1,
					c: {
						d: 999
					},
					b: 2
				}
			});
			expect(local).toStrictEqual(native);
		});
	});

	describe('$.append', () => {
		it('should throw TypeError if no params', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.append();
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_MISSING_ARGS');
				expect(err.message).toBe('The "name" and "value" arguments must be specified');
			}
		});

		it('should throw TypeError if no value param', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.append('foo');
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_MISSING_ARGS');
				expect(err.message).toBe('The "name" and "value" arguments must be specified');
			}
		});

		it('should respect order; values', () => {
			const local = new lib.URLSearchParams();
			const native = new URLSearchParams();

			local.append('a', 1); local.append('a', 2);
			native.append('a', 1); native.append('a', 2);

			expect(String(local)).toStrictEqual(String(native));
		});

		it('should respect order; keys', () => {
			const local = new lib.URLSearchParams();
			const native = new URLSearchParams();

			local.append('a', 1); local.append('b', 9); local.append('a', 2);
			native.append('a', 1); native.append('b', 9); native.append('a', 2);

			expect(String(local)).toStrictEqual(String(native));
		});

		it('should propagate to bound URL instance', () => {
			const foo = new lib.URL('http://foo.com');
			const bar = new lib.URLSearchParams('?hello=world', foo);

			expect(foo.href).toBe('http://foo.com/?hello=world');

			bar.append('foo', 1);
			bar.append('bar', 2);
			bar.append('foo', 3);

			expect(foo.href).toBe('http://foo.com/?hello=world&foo=1&bar=2&foo=3');
		});
	});

	describe('$.delete', () => {
		it('should throw TypeError if no params', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.delete();
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_MISSING_ARGS');
				expect(err.message).toBe('The "name" argument must be specified');
			}
		});

		it('should delete the key', () => {
			const local = new lib.URLSearchParams('a=1');
			const native = new URLSearchParams('a=1');

			local.delete('a');
			native.delete('a');

			expect(String(local)).toStrictEqual(String(native));
		});

		it('should delete all values for key', () => {
			const local = new lib.URLSearchParams('a=1&a=2&a=3');
			const native = new URLSearchParams('a=1&a=2&a=3');

			local.delete('a');
			native.delete('a');

			expect(String(local)).toStrictEqual(String(native));
		});

		it('should respect order; keys', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			local.delete('a');
			native.delete('a');

			expect(String(local)).toStrictEqual(String(native));
		});

		it('should propagate to bound URL instance', () => {
			const foo = new lib.URL('http://foo.com');
			const bar = new lib.URLSearchParams('?a=1&b=2&c=3', foo);

			expect(foo.href).toBe('http://foo.com/?a=1&b=2&c=3');

			bar.delete('b');

			expect(foo.href).toBe('http://foo.com/?a=1&c=3');
		});
	});

	describe('$.entries', () => {
		it('should return an iterator', () => {
			const local = new lib.URLSearchParams('a=1');
			expect(typeof local.entries().next).toBe('function');
		});

		it('should return all value pairs', () => {
			const local = new lib.URLSearchParams('a=1&a=2&a=3');
			const native = new URLSearchParams('a=1&a=2&a=3');

			const foo = JSON.stringify([...local.entries()]);
			const bar = JSON.stringify([...native.entries()]);

			expect(foo).toBe(bar);
		});

		it('should equivalent to iterating the instance', () => {
			const local = new lib.URLSearchParams('a=1&a=2&a=3');
			const native = new URLSearchParams('a=1&a=2&a=3');

			const foo = JSON.stringify([...local]);
			const bar = JSON.stringify([...native]);

			expect(foo).toBe(bar);
		});

		it('should respect order; keys', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const foo = JSON.stringify([...local.entries()]);
			const bar = JSON.stringify([...native.entries()]);

			expect(foo).toBe(bar);
		});
	});

	describe('$.forEach', () => {
		it('should throw TypeError if no params', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.forEach();
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_INVALID_CALLBACK');
				expect(err.message).toBe('Callback must be a function');
			}
		});

		it('should throw TypeError if param not a function', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.forEach(123);
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_INVALID_CALLBACK');
				expect(err.message).toBe('Callback must be a function');
			}
		});

		it('should loop value pairs in order', () => {
			const local_k = [], local_v = [];
			const native_k = [], native_v = [];

			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			local.forEach((v, k) => {
				local_k.push(k);
				local_v.push(v);
			});

			native.forEach((v, k) => {
				native_k.push(k);
				native_v.push(v);
			});

			expect(local_k).toStrictEqual(['a', 'b', 'c', 'a', 'd', 'a', 'e']);
			expect(local_v).toStrictEqual(['1', '2', '3', '4', '5', '6', '7']);

			expect(local_k).toStrictEqual(native_k);
			expect(local_v).toStrictEqual(native_v);
		});
	});

	describe('$.get', () => {
		it('should throw TypeError if no params', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.get();
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_MISSING_ARGS');
				expect(err.message).toBe('The "name" argument must be specified');
			}
		});

		it('should get the first value for a key', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const local_foo = local.get('a');
			const native_foo = native.get('a');

			const local_bar = local.get('e');
			const native_bar = native.get('e');

			expect(local_foo).toBe('1');
			expect(local_foo).toBe(native_foo);

			expect(local_bar).toBe('7');
			expect(local_bar).toBe(native_bar);
		});

		it('should return `null` if not found', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const local_foo = local.get('foobar');
			const native_foo = native.get('foobar');

			expect(local_foo).toBe(null);
			expect(local_foo).toBe(native_foo);
		});
	});

	describe('$.getAll', () => {
		it('should throw TypeError if no params', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.getAll();
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_MISSING_ARGS');
				expect(err.message).toBe('The "name" argument must be specified');
			}
		});

		it('should get the all values for a key', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const local_foo = JSON.stringify(local.getAll('a'));
			const native_foo = JSON.stringify(native.getAll('a'));
			const expected_foo = JSON.stringify(['1', '4', '6']);

			const local_bar = JSON.stringify(local.getAll('e'));
			const native_bar = JSON.stringify(native.getAll('e'));
			const expected_bar = JSON.stringify(['7']);

			expect(local_foo).toBe(expected_foo);
			expect(local_foo).toBe(native_foo);

			expect(local_bar).toBe(expected_bar);
			expect(local_bar).toBe(native_bar);
		});

		it('should return empty array if not found', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const local_foo = JSON.stringify(local.getAll('foobar'));
			const native_foo = JSON.stringify(native.getAll('foobar'));

			expect(local_foo).toStrictEqual('[]');
			expect(native_foo).toStrictEqual('[]');
		});

		it('should return Array; not iterator', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const local_foo = local.getAll('a');
			const native_foo = native.getAll('a');

			expect(local_foo.next).toBeUndefined();
			expect(native_foo.next).toBeUndefined();

			expect(Array.isArray(local_foo)).toBe(true);
			expect(Array.isArray(native_foo)).toBe(true);
		});
	});

	describe('$.has', () => {
		it('should throw TypeError if no params', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.get();
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_MISSING_ARGS');
				expect(err.message).toBe('The "name" argument must be specified');
			}
		});

		it('should return `true` if found', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const local_foo = local.has('a');
			const native_foo = native.has('a');

			expect(local_foo).toBe(true);
			expect(local_foo).toBe(native_foo);
		});

		it('should return `false` if not found', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const local_foo = local.has('foobar');
			const native_foo = native.has('foobar');

			expect(local_foo).toBe(false);
			expect(local_foo).toBe(native_foo);
		});
	});

	describe('$.keys', () => {
		it('should return an iterator', () => {
			const local = new lib.URLSearchParams('a=1');
			expect(typeof local.keys().next).toBe('function');
		});

		it('should return all keys', () => {
			const local = new lib.URLSearchParams('a=1&a=2&a=3');
			const native = new URLSearchParams('a=1&a=2&a=3');

			const foo = JSON.stringify([...local.keys()]);
			const bar = JSON.stringify([...native.keys()]);

			expect(foo).toBe(bar);
		});

		it('should respect key order', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const foo = JSON.stringify([...local.keys()]);
			const bar = JSON.stringify([...native.keys()]);

			expect(foo).toBe(bar);
		});
	});

	describe('$.values', () => {
		it('should return an iterator', () => {
			const local = new lib.URLSearchParams('a=1');
			expect(typeof local.values().next).toBe('function');
		});

		it('should return all values', () => {
			const local = new lib.URLSearchParams('a=1&a=2&a=3');
			const native = new URLSearchParams('a=1&a=2&a=3');

			const foo = JSON.stringify([...local.values()]);
			const bar = JSON.stringify([...native.values()]);

			expect(foo).toBe(bar);
		});

		it('should respect key order', () => {
			const local = new lib.URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');
			const native = new URLSearchParams('a=1&b=2&c=3&a=4&d=5&a=6&e=7');

			const foo = JSON.stringify([...local.values()]);
			const bar = JSON.stringify([...native.values()]);

			expect(foo).toBe(bar);
		});
	});

	describe('$.sort', () => {
		it('should sort key order', () => {
			const local = new lib.URLSearchParams('a=4&d=5&a=6&e=7&a=1&b=2&c=3');
			const native = new URLSearchParams('a=4&d=5&a=6&e=7&a=1&b=2&c=3');

			const local_old = JSON.stringify([...local.keys()]);
			const native_old = JSON.stringify([...native.keys()]);
			const expected_old = JSON.stringify(['a', 'd', 'a', 'e', 'a', 'b', 'c']);

			expect(local_old).toBe(expected_old);
			expect(local_old).toBe(native_old);

			local.sort();
			native.sort();

			const local_nxt_k = JSON.stringify([...local.keys()]);
			const native_nxt_k = JSON.stringify([...native.keys()]);
			const expected_nxt_k = JSON.stringify(['a', 'a', 'a', 'b', 'c', 'd', 'e']);
			expect(local_nxt_k).toBe(expected_nxt_k);
			expect(local_nxt_k).toBe(native_nxt_k);

			const local_nxt_v = JSON.stringify([...local.values()]);
			const native_nxt_v = JSON.stringify([...native.values()]);
			const expected_nxt_v = JSON.stringify(['4', '6', '1', '2', '3', '5', '7']);
			expect(local_nxt_v).toBe(expected_nxt_v);
			expect(local_nxt_v).toBe(native_nxt_v);
		});
	});

	describe('$.set', () => {
		it('should throw TypeError if no params', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.set();
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_MISSING_ARGS');
				expect(err.message).toBe('The "name" and "value" arguments must be specified');
			}
		});

		it('should throw TypeError if no value param', () => {
			const foo = new lib.URLSearchParams();

			try {
				foo.set('foo');
			} catch (err) {
				expect(err instanceof TypeError).toBe(true);
				expect(err.code).toBe('ERR_MISSING_ARGS');
				expect(err.message).toBe('The "name" and "value" arguments must be specified');
			}
		});

		it('should overwrite existing keys', () => {
			const local = new lib.URLSearchParams();
			const native = new URLSearchParams();

			local.set('a', 1); local.set('a', 2);
			native.set('a', 1); native.set('a', 2);

			expect(String(local)).toStrictEqual(String(native));
		});

		it('should respect order; keys', () => {
			const local = new lib.URLSearchParams();
			const native = new URLSearchParams();

			local.set('a', 1); local.set('b', 9); local.set('a', 2);
			native.set('a', 1); native.set('b', 9); native.set('a', 2);

			expect(String(local)).toStrictEqual(String(native));
		});

		it('should propagate to bound URL instance', () => {
			const foo = new lib.URL('http://foo.com');
			const bar = new lib.URLSearchParams('?hello=world', foo);

			expect(foo.href).toBe('http://foo.com/?hello=world');

			bar.set('foo', 1);
			bar.set('bar', 2);
			bar.set('foo', 3);

			expect(foo.href).toBe('http://foo.com/?hello=world&foo=3&bar=2');
		});
	});
});
