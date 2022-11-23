function toErr(msg, code, err) {
	err = new TypeError(msg);
	err.code = code;
	throw err;
}

function invalid(str) {
	toErr('Invalid URL: ' + str, 'ERR_INVALID_URL');
}

function args(both, len, x, y) {
	x = 'The "name" ';
	y = 'argument';

	if (both) {
		x += 'and "value" ';
		y += 's';
	}

	if (len < ++both) {
		toErr(x + y + ' must be specified', 'ERR_MISSING_ARGS');
	}
}

function toIter(arr, supported) {
	var val, j=0, iter = {
		next: function () {
			val = arr[j++];
			return {
				value: val,
				done: j > arr.length
			}
		}
	};

	if (supported) {
		iter[Symbol.iterator] = function () {
			return iter;
		};
	}

	return iter;
}

export function URLSearchParams(init, ref) {
	var k, i, x, supp, tmp, $=this, list=[];

	try {
		supp = !!Symbol.iterator;
	} catch (e) {
		supp = false;
	}

	if (init) {
		if (!!init.keys && !!init.getAll) {
			init.forEach(function (v, k) {
				toAppend(k, v);
			});
		} else if (!!init.pop) {
			for (i=0; i < init.length; i++) {
				toAppend.apply(0, init[i]);
			}
		} else if (typeof init == 'object') {
			for (k in init) toSet(k, init[k]);
		} else if (typeof init == 'string') {
			if (init[0] == '?') init = init.substring(1);
			x = decodeURIComponent(init).split('&');
			while (k = x.shift()) {
				i = k.indexOf('=');
				if (!~i) i = k.length;
				toAppend(
					k.substring(0, i),
					k.substring(++i)
				);
			}
		}
	}

	function toSet(key, val) {
		args(1, arguments.length);
		val = String(val);
		x = false; // found?
		for (i=list.length; i--;) {
			tmp = list[i];
			if (tmp[0] == key) {
				if (x) {
					list.splice(i, 1);
				} else {
					tmp[1] = val;
					x = true;
				}
			}
		}
		x || list.push([key, val]);
		cascade();
	}

	function toAppend(key, val) {
		args(1, arguments.length);
		list.push([key, String(val)]);
		cascade();
	}

	function toStr() {
		tmp = '';
		for (i=0; i < list.length; i++) {
			if (tmp) tmp += '&';
			tmp += encodeURIComponent(list[i][0]) + '=' + encodeURIComponent(list[i][1]);
		}
		return tmp.replace(/%20/g, '+');
	}

	function cascade() {
		if (ref) ref.search = list.length ? ('?' + toStr().replace(/=$/, '')) : '';
	}

	$.append = toAppend;
	$.delete = function (key) {
		args(0, arguments.length);
		for (i=list.length; i--;) {
			if (list[i][0] == key) list.splice(i, 1);
		}
		cascade();
	};
	$.entries = function () {
		return toIter(list, supp);
	};
	$.forEach = function (fn) {
		if (typeof fn != 'function') {
			toErr('Callback must be a function', 'ERR_INVALID_CALLBACK');
		}
		for (i=0; i < list.length; i++) {
			fn(list[i][1], list[i][0]); // (val,key)
		}
	};
	$.get = function (key) {
		args(0, arguments.length);
		for (i=0; i < list.length; i++) {
			if (list[i][0] == key) return list[i][1];
		}
		return null;
	};
	$.getAll = function (key) {
		args(0, arguments.length);
		tmp = [];
		for (i=0; i < list.length; i++) {
			if (list[i][0] == key) {
				tmp.push(list[i][1]);
			}
		}
		return tmp;
	};
	$.has = function (key) {
		args(0, arguments.length);
		for (i=0; i < list.length; i++) {
			if (list[i][0] == key) return true;
		}
		return false;
	};
	$.keys = function () {
		tmp = [];
		for (i=0; i < list.length; i++) {
			tmp.push(list[i][0]);
		}
		return toIter(tmp, supp);
	},
	$.set = toSet;
	$.sort = function () {
		x = []; tmp = [];
		for (i=0; i < list.length; x.push(list[i++][0]));
		for (x.sort(); k = x.shift();) {
			for (i=0; i < list.length; i++) {
				if (list[i][0] == k) {
					tmp.push(list.splice(i, 1).shift());
					break;
				}
			}
		}
		list = tmp;
		cascade();
	};
	$.toString = toStr;
	$.values = function () {
		tmp = [];
		for (i=0; i < list.length; i++) {
			tmp.push(list[i][1]);
		}
		return toIter(tmp, supp);
	};

	if (supp) {
		$[Symbol.iterator] = $.entries;
	}

	return $;
}

export function URL(url, base) {
	var tmp = document.createElement('a');
	var link = document.createElement('a');
	var input = document.createElement('input');
	var segs, usp, $=this, rgx=/(blob|ftp|wss?|https?):/;

	input.type = 'url';
	base = String(base || '').trim();
	if ((input.value = base) && !input.checkValidity()) return invalid(base);

	url = String(url).trim();
	input.value = url || 0;

	if (input.checkValidity()) {
		link.href = url; // full
	} else if (base) {
		link.href = base;
		if (url) { // non-empty string
			usp = url.match(/^\/+/);
			if (usp && usp[0].length == 2) {
				link.href = link.protocol + url;
			} else if (/[?#]/.test(url[0])) {
				link.href += url;
			} else if (url[0] == '/' || link.pathname == '/') {
				link.href = link.origin + '/' + url.replace(/^\/+/, '');
			} else {
				segs = link.pathname.split('/');
				base = url.replace(/^(\.\/)?/, '').split('../');
				link.href = link.origin + segs.slice(0, Math.max(1, segs.length - base.length)).concat(base.pop()).join('/')
			}
		}
	} else {
		return invalid(url);
	}

	function proxy(key) {
		tmp.href=link.href; tmp.protocol='http:';
		if (key == 'protocol' || key == 'href' || rgx.test(link.protocol)) return link[key];
		// @see https://url.spec.whatwg.org/#concept-url-origin
		if (key == 'origin') return rgx.test(link.protocol) ? link[key] : 'null';
		return tmp[key];
	}

	function block(key, readonly, getter, out) {
		out = { enumerable: true };
		if (!readonly) {
			out.set = function (val) {
				if (val != null) {
					link[key] = String(val);
					if (key == 'href' || key == 'search') {
						usp = new URLSearchParams(link.search, link);
					}
				}
			}
		}
		out.get = getter || function () {
			return proxy(key);
		};
		return out;
	}

	usp = new URLSearchParams(link.search, link);

	$.toString = $.toJSON = link.toString.bind(link);

	return Object.defineProperties($, {
		href: block('href'),
		protocol: block('protocol'),
		username: block('username'),
		password: block('password'),
		hostname: block('hostname'),
		host: block('host'),
		port: block('port'),
		search: block('search'),
		hash: block('hash'),
		pathname: block('pathname'),
		origin: block('origin', 1),
		searchParams: block('searchParams', 1, function () {
			return usp;
		})
	});
}
