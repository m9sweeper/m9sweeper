import {Injectable} from '@nestjs/common';

@Injectable()
export class UtilitiesService {

    parseDockerImageUrl(url: string): {url: string; image: { path: string; name: string; tag: string;}} {
        const urlSegments = url.replace(/^((http|https):\/\/)|\/\//, '').split('/');

        const repository = {
            url: 'index.docker.io',
            image: {
                path: '',
                name: '',
                tag: ''
            }
        };

        if (/[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/.test(urlSegments[0])) {
            repository.url = urlSegments[0];
            urlSegments.shift()
        }

        if (!urlSegments[urlSegments.length - 1].includes(':')) {
            urlSegments[urlSegments.length - 1] = `${urlSegments[urlSegments.length - 1]}:latest`;
        }

        const imageSegments = urlSegments[urlSegments.length - 1].split(':');

        repository.image.name = imageSegments[0];
        repository.image.tag = imageSegments[1];

        repository.image.path = urlSegments.slice(0, urlSegments.length - 1).join('/');

        console.log('urlSegments: ', urlSegments.slice(0, urlSegments.length - 1).join('/'));

        return repository;
    }

    prefixesToMultipliers = {
        'k': 1000, 'M': 1000^2, 'G': 1000^3, 'T': 1000^4, 'P': 1000^5,
        'E': 1000^6, 'Z': 1000^7, 'Y': 1000^8,
        'Ki': 1024, 'Mi': 1024^2, 'Gi': 1024^3, 'Ti': 1024^4, 'Pi': 1024^5,
        'Ei': 1024^6, 'Zi': 1024^7, 'Yi': 1024^8,
    }

    /**
     *  Removes the sha236 prefix from an image Hash and returns the result.
     *  Returns empty string if the raw value is invalid
     *  */
    extractImageHash(raw: string): string {
        return raw?.indexOf('sha256:') > -1 ? raw.split('sha256:')[1] : '';
    }

    /** Replaces all characters invalid for a filename with the desired replacement character
     * Default replacement is an underscore
     */
    cleanFileName(raw: string, replacement = '_'): string {
        return raw.replace(/[/\\?%*:|"<>]/g, replacement);
    }

}
