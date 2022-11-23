import { URL, URLSearchParams } from '../src';

/**
 * @see https://raw.githubusercontent.com/Financial-Times/polyfill-library/master/polyfills/URL/tests.js
 */

it('URL IDL', () => {
	const url = new URL('http://example.com:8080/foo/bar?a=1&b=2#p1');
	expect(typeof url.protocol).toBe('string');
	expect(typeof url.host).toBe('string');
	expect(typeof url.hostname).toBe('string');
	expect(typeof url.port).toBe('string');
	expect(typeof url.pathname).toBe('string');
	expect(typeof url.search).toBe('string');
	expect(typeof url.hash).toBe('string');
	expect(typeof url.origin).toBe('string');
	expect(typeof url.href).toBe('string');
});

it('URL Stringifying', function() {
	expect(String(new URL('http://example.com'))).toBe('http://example.com/');
	expect(String(new URL('http://example.com:8080'))).toBe('http://example.com:8080/');
});

it('URL Parsing', () => {
	const url = new URL('http://example.com:8080/foo/bar?a=1&b=2#p1');

	expect(url.protocol).toBe('http:');
	expect(url.hostname).toBe('example.com');
	expect(url.port).toBe('8080');
	expect(url.host).toBe('example.com:8080');
	expect(url.pathname).toBe('/foo/bar');
	expect(url.search).toBe('?a=1&b=2');
	expect(url.hash).toBe('#p1');
	expect(url.origin).toBe('http://example.com:8080');
	expect(url.href).toBe('http://example.com:8080/foo/bar?a=1&b=2#p1');
});

describe('URL Mutation', () => {
	it('should react to `protocol` updates', () => {
		const foo = new URL('http://example.com');

		expect(foo.href).toBe('http://example.com/');
		expect(foo.origin).toBe('http://example.com');
		expect(foo.host).toBe('example.com');

		foo.protocol = 'ftp';
		expect(foo.protocol).toBe('ftp:');
		expect(foo.href).toBe('ftp://example.com/');

		// Fails in native IE13 (Edge)
		// Probable bug in IE.  https://twitter.com/patrickkettner/status/768726160070934529
		expect(foo.origin).toBe('ftp://example.com');

		expect(foo.host).toBe('example.com');

		foo.protocol = 'http';
		expect(foo.protocol).toBe('http:');
		expect(foo.href).toBe('http://example.com/');
		expect(foo.origin).toBe('http://example.com');
		expect(foo.host).toBe('example.com');
	});

	it('should react to `hostname` updates', () => {
		const foo = new URL('http://example.com');

		foo.hostname = 'example.org';
		expect(foo.href).toBe('http://example.org/');
		expect(foo.origin).toBe('http://example.org');
		expect(foo.host).toBe('example.org');

		foo.hostname = 'example.com';
		expect(foo.href).toBe('http://example.com/');
		expect(foo.origin).toBe('http://example.com');
		expect(foo.host).toBe('example.com');
	});

	it('should react to `port` updates', () => {
		const foo = new URL('http://example.com');

		foo.port = 8080;
		expect(foo.href).toBe('http://example.com:8080/');
		expect(foo.origin).toBe('http://example.com:8080');
		expect(foo.host).toBe('example.com:8080');

		foo.port = 80;
		expect(foo.href).toBe('http://example.com/');
		expect(foo.origin).toBe('http://example.com');
		expect(foo.host).toBe('example.com');
	});

	it('should react to `pathname` updates', () => {
		const foo = new URL('http://example.com');

		foo.pathname = 'foo';
		expect(foo.href).toBe('http://example.com/foo');
		expect(foo.origin).toBe('http://example.com');

		foo.pathname = 'foo/bar';
		expect(foo.href).toBe('http://example.com/foo/bar');
		expect(foo.origin).toBe('http://example.com');

		foo.pathname = '';
		expect(foo.href).toBe('http://example.com/');
		expect(foo.origin).toBe('http://example.com');
	});

	it('should react to `search` updates', () => {
		const foo = new URL('http://example.com');

		foo.search = 'a=1&b=2';
		expect(foo.href).toBe('http://example.com/?a=1&b=2');
		expect(foo.origin).toBe('http://example.com');

		foo.search = '';
		expect(foo.href).toBe('http://example.com/');
		expect(foo.origin).toBe('http://example.com');
	});

	it('should react to `hash` updates', () => {
		const foo = new URL('http://example.com');

		foo.hash = 'p1';
		expect(foo.href).toBe('http://example.com/#p1');
		expect(foo.origin).toBe('http://example.com');

		foo.hash = '';
		expect(foo.href).toBe('http://example.com/');
		expect(foo.origin).toBe('http://example.com');
	});
});

it('Parameter Mutation', () => {
	const foo = new URL('http://example.com');

	expect(foo.href).toStrictEqual('http://example.com/');
	expect(foo.search).toStrictEqual('');
	expect(foo.searchParams.get('a')).toStrictEqual(null);
	expect(foo.searchParams.get('b')).toStrictEqual(null);

	foo.searchParams.append('a', '1');
	expect(foo.searchParams.get('a')).toStrictEqual('1');
	expect(foo.searchParams.getAll('a')).toStrictEqual(['1']);
	expect(foo.search).toStrictEqual('?a=1');
	expect(foo.href).toStrictEqual('http://example.com/?a=1');

	foo.searchParams.append('b', '2');
	expect(foo.searchParams.get('b')).toStrictEqual('2');
	expect(foo.searchParams.getAll('b')).toStrictEqual(['2']);
	expect(foo.search).toStrictEqual('?a=1&b=2');
	expect(foo.href).toStrictEqual('http://example.com/?a=1&b=2');

	foo.searchParams.append('a', '3');
	expect(foo.searchParams.get('a')).toStrictEqual('1');
	expect(foo.searchParams.getAll('a')).toStrictEqual(['1', '3']);
	expect(foo.search).toStrictEqual('?a=1&b=2&a=3');
	expect(foo.href).toStrictEqual('http://example.com/?a=1&b=2&a=3');

	foo.searchParams.delete('a');
	expect(foo.search).toStrictEqual('?b=2');
	expect(foo.searchParams.getAll('a')).toStrictEqual([]);
	expect(foo.href).toStrictEqual('http://example.com/?b=2');

	foo.searchParams.delete('b');
	expect(foo.searchParams.getAll('b')).toStrictEqual([]);
	expect(foo.href).toStrictEqual('http://example.com/');

	foo.href = 'http://example.com?m=9&n=3';
	expect(foo.searchParams.has('a')).toStrictEqual(false);
	expect(foo.searchParams.has('b')).toStrictEqual(false);
	expect(foo.searchParams.get('m')).toStrictEqual('9'); //~> FIXED: Cannot be number
	expect(foo.searchParams.get('n')).toStrictEqual('3'); //~> FIXED: Cannot be number

	foo.href = 'http://example.com';
	foo.searchParams.set('a', '1');
	expect(foo.searchParams.getAll('a')).toStrictEqual(['1']);

	foo.search = 'a=1&b=1&b=2&c=1';
	foo.searchParams.set('b', '3');
	expect(foo.searchParams.getAll('b')).toStrictEqual(['3']);
	expect(foo.href).toStrictEqual('http://example.com/?a=1&b=3&c=1');
});

it('Parameter Encoding', () => {
	const foo = new URL('http://example.com');
	expect(foo.href).toBe('http://example.com/');
	expect(foo.search).toBe('');

	foo.searchParams.append('this\x00&that\x7f\xff', '1+2=3');
	expect(foo.searchParams.get('this\x00&that\x7f\xff')).toBe('1+2=3');


	// The following fail in FF (tested in 38) against native impl
	expect(foo.search).toBe('?this%00%26that%7F%C3%BF=1%2B2%3D3');
	expect(foo.href).toBe('http://example.com/?this%00%26that%7F%C3%BF=1%2B2%3D3');

	foo.search = '';
	foo.searchParams.append('a  b', 'a  b');
	expect(foo.search).toBe('?a++b=a++b');
	expect(foo.searchParams.get('a  b')).toBe('a  b');
});

it('Base URL', () => {
	// fully qualified URL
	expect(new URL('http://example.com', 'https://example.org').href).toBe('http://example.com/');
	expect(new URL('http://example.com/foo/bar', 'https://example.org').href).toBe('http://example.com/foo/bar');

	// protocol relative
	expect(new URL('//example.com', 'https://example.org').href).toBe('https://example.com/');

	// path relative
	expect(new URL('/foo/bar', 'https://example.org').href).toBe('https://example.org/foo/bar');
	expect(new URL('/foo/bar', 'https://example.org/baz/bat').href).toBe('https://example.org/foo/bar');
	expect(new URL('./bar', 'https://example.org').href).toBe('https://example.org/bar');
	expect(new URL('./bar', 'https://example.org/foo/').href).toBe('https://example.org/foo/bar');
	expect(new URL('bar', 'https://example.org/foo/').href).toBe('https://example.org/foo/bar');
	expect(new URL('../bar', 'https://example.org/foo/').href).toBe('https://example.org/bar');
	expect(new URL('../bar', 'https://example.org/foo/').href).toBe('https://example.org/bar');
	expect(new URL('../../bar', 'https://example.org/foo/baz/bat/').href).toBe('https://example.org/foo/bar');
	expect(new URL('../../bar', 'https://example.org/foo/baz/bat').href).toBe('https://example.org/bar');
	expect(new URL('../../bar', 'https://example.org/foo/baz/').href).toBe('https://example.org/bar');
	expect(new URL('../../bar', 'https://example.org/foo/').href).toBe('https://example.org/bar');
	expect(new URL('../../bar', 'https://example.org/foo/').href).toBe('https://example.org/bar');

	// search/hash relative
	expect(new URL('bar?ab#cd', 'https://example.org/foo/').href).toBe('https://example.org/foo/bar?ab#cd');
	expect(new URL('bar?ab#cd', 'https://example.org/foo').href).toBe('https://example.org/bar?ab#cd');
	expect(new URL('?ab#cd', 'https://example.org/foo').href).toBe('https://example.org/foo?ab#cd');
	expect(new URL('?ab', 'https://example.org/foo').href).toBe('https://example.org/foo?ab');
	expect(new URL('#cd', 'https://example.org/foo').href).toBe('https://example.org/foo#cd');
});

it('URLSearchParams', () => {
	const foo = new URL('http://example.com?a=1&b=2');
	expect(foo.searchParams instanceof URLSearchParams).toBe(true);

	expect(String(new URLSearchParams())).toBe('');
	expect(String(new URLSearchParams(''))).toBe('');
	expect(String(new URLSearchParams('a=1'))).toBe('a=1');
	expect(String(new URLSearchParams('a=1&b=1'))).toBe('a=1&b=1');
	expect(String(new URLSearchParams('a=1&b&a'))).toBe('a=1&b=&a=');

	// The following fail in FF (tested in 38) against native impl but FF38 passes the detect
	expect(String(new URLSearchParams('?'))).toBe('');
	expect(String(new URLSearchParams('?a=1'))).toBe('a=1');
	expect(String(new URLSearchParams('?a=1&b=1'))).toBe('a=1&b=1');
	expect(String(new URLSearchParams('?a=1&b&a'))).toBe('a=1&b=&a=');
	expect(String(new URLSearchParams(new URLSearchParams('?')))).toBe('');
	expect(String(new URLSearchParams(new URLSearchParams('?a=1')))).toBe('a=1');
	expect(String(new URLSearchParams(new URLSearchParams('?a=1&b=1')))).toBe('a=1&b=1');
	expect(String(new URLSearchParams(new URLSearchParams('?a=1&b&a')))).toBe('a=1&b=&a=');
});

it('URLSearchParams mutation', () => {
	const foo = new URLSearchParams();
	expect(foo.get('a')).toBe(null);
	expect(foo.get('b')).toBe(null);

	foo.append('a', '1');
	expect(foo.get('a')).toBe('1');
	expect(foo.getAll('a')).toStrictEqual(['1']);
	expect(String(foo)).toBe('a=1');

	foo.append('b', '2');
	expect(foo.get('b')).toBe('2');
	expect(foo.getAll('b')).toStrictEqual(['2']);
	expect(String(foo)).toBe('a=1&b=2');

	foo.append('a', '3');
	expect(foo.get('a')).toBe('1');
	expect(foo.getAll('a')).toStrictEqual(['1', '3']);
	expect(String(foo)).toBe('a=1&b=2&a=3');

	foo.delete('a');
	expect(String(foo)).toBe('b=2');
	expect(foo.getAll('a')).toStrictEqual([]);

	foo.delete('b');
	expect(foo.getAll('b')).toStrictEqual([]);

	const bar = new URLSearchParams('m=9&n=3');
	expect(bar.has('a')).toBe(false);
	expect(bar.has('b')).toBe(false);
	expect(bar.get('m')).toBe('9'); // FIXED: Cannot be number
	expect(bar.get('n')).toBe('3'); // FIXED: Cannot be number

	const baz = new URLSearchParams();
	baz.set('a', '1');
	expect(baz.getAll('a')).toStrictEqual(['1']);

	const bat = new URLSearchParams('a=1&b=1&b=2&c=1');
	bat.set('b', '3');
	expect(bat.getAll('b')).toStrictEqual(['3']);
	expect(String(bat)).toBe('a=1&b=3&c=1');

	// Ensure copy constructor copies by value, not reference.
	const sp1 = new URLSearchParams('a=1');
	expect(String(sp1)).toBe('a=1');

	const sp2 = new URLSearchParams(sp1);
	expect(String(sp2)).toBe('a=1');
	sp1.append('b', '2');
	sp2.append('c', '3');
	expect(String(sp1)).toBe('a=1&b=2');
	expect(String(sp2)).toBe('a=1&c=3');
});

// The following fail in FF (tested in 38) against native impl but FF38 passes the detect
it('URLSearchParams serialization', () => {
	const foo = new URLSearchParams();
	foo.append('this\x00&that\x7f\xff', '1+2=3');
	expect(foo.get('this\x00&that\x7f\xff')).toBe('1+2=3');
	expect(String(foo)).toBe('this%00%26that%7F%C3%BF=1%2B2%3D3');

	const bar = new URLSearchParams();
	bar.append('a  b', 'a  b');
	expect(String(bar)).toBe('a++b=a++b');
	expect(bar.get('a  b')).toBe('a  b');
});

it('URLSearchParams iterable methods',() => {
	const params = new URLSearchParams('a=1&b=2');

	expect([...params.entries()]).toStrictEqual([
		['a', '1'],
		['b', '2']
	]);

	expect([...params[Symbol.iterator]()]).toStrictEqual([
		['a', '1'],
		['b', '2']
	]);

	expect([...params]).toStrictEqual([
		['a', '1'],
		['b', '2']
	]);

	expect([...params.keys()]).toStrictEqual(['a', 'b']);
	expect([...params.values()]).toStrictEqual(['1', '2']);
});

it('Regression tests', () => {
	// IE mangles the pathname when assigning to search with 'about:' URLs
	const p = new URL('about:blank').searchParams;
	p.append('a', 1);
	p.append('b', 2);
	expect(p.toString()).toBe('a=1&b=2');
});
