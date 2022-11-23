import { URL } from '../src';

/**
 * @see https://github.com/jsdom/whatwg-url/blob/master/test/mdn.js
 */

it('should pass all MDN examples', () => {
	const a = new URL('/', 'https://developer.mozilla.org');
	expect(a.href).toBe('https://developer.mozilla.org/');

	const b = new URL('https://developer.mozilla.org');
	expect(b.href).toBe('https://developer.mozilla.org/');

	const c = new URL('en-US/docs', b);
	expect(c.href).toBe('https://developer.mozilla.org/en-US/docs');

	const d = new URL('/en-US/docs', b);
	expect(d.href).toBe('https://developer.mozilla.org/en-US/docs');

	const f = new URL('/en-US/docs', d);
	expect(f.href).toBe('https://developer.mozilla.org/en-US/docs');

	const g = new URL('/en-US/docs', 'https://developer.mozilla.org/fr-FR/toto');
	expect(g.href).toBe('https://developer.mozilla.org/en-US/docs');

	const h = new URL('/en-US/docs', a);
	expect(h.href).toBe('https://developer.mozilla.org/en-US/docs');

	expect(() => new URL('/en-US/docs', '')).toThrow('Invalid URL:');
	expect(() => new URL('/', 'https://')).toThrow('Invalid URL:');
	expect(() => new URL('/en-US/docs')).toThrow('Invalid URL:');

	const k = new URL('http://www.example.com', 'https://developers.mozilla.com');
	expect(k.href).toBe('http://www.example.com/');

	const l = new URL('http://www.example.com', b);
	expect(l.href).toBe("http://www.example.com/");
});
