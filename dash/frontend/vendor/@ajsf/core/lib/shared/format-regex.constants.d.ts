export declare const jsonSchemaFormatTests: {
    date: RegExp;
    time: RegExp;
    'date-time': RegExp;
    email: RegExp;
    hostname: RegExp;
    ipv4: RegExp;
    ipv6: RegExp;
    uri: RegExp;
    'uri-reference': RegExp;
    'uri-template': RegExp;
    url: RegExp;
    uuid: RegExp;
    color: RegExp;
    'json-pointer': RegExp;
    'relative-json-pointer': RegExp;
    regex: (str: any) => boolean;
};
export declare type JsonSchemaFormatNames = 'date' | 'time' | 'date-time' | 'email' | 'hostname' | 'ipv4' | 'ipv6' | 'uri' | 'uri-reference' | 'uri-template' | 'url' | 'uuid' | 'color' | 'json-pointer' | 'relative-json-pointer' | 'regex';
