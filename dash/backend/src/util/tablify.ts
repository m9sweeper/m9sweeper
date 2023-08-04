export function tablify(obj: any, depth = 0, maxdepth = 10) {
    if (depth >= maxdepth) {
        return 'max depth reached'; // too deep
    }

    // typeof(null) === 'object', so filter out the null values
    if (obj === null) {
        return 'null';
    }

    const type = typeof (obj);
    if (Array.isArray(obj)) {
        return '<table>' + obj.map(o => '<tr><td>' + tablify(o, depth + 1, maxdepth) + '</td></tr>').join('') + '</table>';
    }

    switch (type) {
        case 'object':
            return '<table>' +
                Object.entries(obj).map(o => '<tr><td>' + tablify(o[0], depth + 1, maxdepth) + '</td><td>' + tablify(o[1], depth + 1, maxdepth) + '</td></tr>').join('') +
                '</table>';
        case null:
            return 'null';
        case undefined:
            return 'undefined';
    }

    // anything else, just return it
    return escapeHtml(obj);

    function escapeHtml(unsafe: any) {
        if (typeof (unsafe) === 'string') {
            return unsafe
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        } else {
            return unsafe;
        }
    }
}

