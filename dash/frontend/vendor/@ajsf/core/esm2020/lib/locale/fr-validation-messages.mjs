export const frValidationMessages = {
    required: 'Est obligatoire.',
    minLength: 'Doit avoir minimum {{minimumLength}} caractères (actuellement: {{currentLength}})',
    maxLength: 'Doit avoir maximum {{maximumLength}} caractères (actuellement: {{currentLength}})',
    pattern: 'Doit respecter: {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return 'Doit être une date, tel que "2000-12-31"';
            case 'time':
                return 'Doit être une heure, tel que "16:20" ou "03:14:15.9265"';
            case 'date-time':
                return 'Doit être une date et une heure, tel que "2000-03-14T01:59" ou "2000-03-14T01:59:26.535Z"';
            case 'email':
                return 'Doit être une adresse e-mail, tel que "name@example.com"';
            case 'hostname':
                return 'Doit être un nom de domaine, tel que "example.com"';
            case 'ipv4':
                return 'Doit être une adresse IPv4, tel que "127.0.0.1"';
            case 'ipv6':
                return 'Doit être une adresse IPv6, tel que "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
            // case 'uri': case 'uri-reference': case 'uri-template':
            case 'url':
                return 'Doit être une URL, tel que "http://www.example.com/page.html"';
            case 'uuid':
                return 'Doit être un UUID, tel que "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
                return 'Doit être une couleur, tel que "#FFFFFF" or "rgb(255, 255, 255)"';
            case 'json-pointer':
                return 'Doit être un JSON Pointer, tel que "/pointer/to/something"';
            case 'relative-json-pointer':
                return 'Doit être un relative JSON Pointer, tel que "2/pointer/to/something"';
            case 'regex':
                return 'Doit être une expression régulière, tel que "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
                return 'Doit être avoir le format correct: ' + error.requiredFormat;
        }
    },
    minimum: 'Doit être supérieur à {{minimumValue}}',
    exclusiveMinimum: 'Doit avoir minimum {{exclusiveMinimumValue}} charactères',
    maximum: 'Doit être inférieur à {{maximumValue}}',
    exclusiveMaximum: 'Doit avoir maximum {{exclusiveMaximumValue}} charactères',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `Doit comporter ${decimals} ou moins de decimales.`;
        }
        else {
            return `Doit être un multiple de ${error.multipleOfValue}.`;
        }
    },
    minProperties: 'Doit comporter au minimum {{minimumProperties}} éléments',
    maxProperties: 'Doit comporter au maximum {{maximumProperties}} éléments',
    minItems: 'Doit comporter au minimum {{minimumItems}} éléments',
    maxItems: 'Doit comporter au maximum {{minimumItems}} éléments',
    uniqueItems: 'Tous les éléments doivent être uniques',
    // Note: No default error messages for 'type', 'const', 'enum', or 'dependencies'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnItdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvbGliL2xvY2FsZS9mci12YWxpZGF0aW9uLW1lc3NhZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFRO0lBQ3ZDLFFBQVEsRUFBRSxrQkFBa0I7SUFDNUIsU0FBUyxFQUFFLG1GQUFtRjtJQUM5RixTQUFTLEVBQUUsbUZBQW1GO0lBQzlGLE9BQU8sRUFBRSxxQ0FBcUM7SUFDOUMsTUFBTSxFQUFFLFVBQVUsS0FBSztRQUNyQixRQUFRLEtBQUssQ0FBQyxjQUFjLEVBQUU7WUFDNUIsS0FBSyxNQUFNO2dCQUNULE9BQU8sMENBQTBDLENBQUM7WUFDcEQsS0FBSyxNQUFNO2dCQUNULE9BQU8seURBQXlELENBQUM7WUFDbkUsS0FBSyxXQUFXO2dCQUNkLE9BQU8sMkZBQTJGLENBQUM7WUFDckcsS0FBSyxPQUFPO2dCQUNWLE9BQU8sMERBQTBELENBQUM7WUFDcEUsS0FBSyxVQUFVO2dCQUNiLE9BQU8sb0RBQW9ELENBQUM7WUFDOUQsS0FBSyxNQUFNO2dCQUNULE9BQU8saURBQWlELENBQUM7WUFDM0QsS0FBSyxNQUFNO2dCQUNULE9BQU8sK0VBQStFLENBQUM7WUFDekYsb0VBQW9FO1lBQ3BFLHlEQUF5RDtZQUN6RCxLQUFLLEtBQUs7Z0JBQ1IsT0FBTywrREFBK0QsQ0FBQztZQUN6RSxLQUFLLE1BQU07Z0JBQ1QsT0FBTyxtRUFBbUUsQ0FBQztZQUM3RSxLQUFLLE9BQU87Z0JBQ1YsT0FBTyxrRUFBa0UsQ0FBQztZQUM1RSxLQUFLLGNBQWM7Z0JBQ2pCLE9BQU8sNERBQTRELENBQUM7WUFDdEUsS0FBSyx1QkFBdUI7Z0JBQzFCLE9BQU8sc0VBQXNFLENBQUM7WUFDaEYsS0FBSyxPQUFPO2dCQUNWLE9BQU8seUVBQXlFLENBQUM7WUFDbkY7Z0JBQ0UsT0FBTyxxQ0FBcUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO1NBQ3ZFO0lBQ0gsQ0FBQztJQUNELE9BQU8sRUFBRSx3Q0FBd0M7SUFDakQsZ0JBQWdCLEVBQUUsMERBQTBEO0lBQzVFLE9BQU8sRUFBRSx3Q0FBd0M7SUFDakQsZ0JBQWdCLEVBQUUsMERBQTBEO0lBQzVFLFVBQVUsRUFBRSxVQUFVLEtBQUs7UUFDekIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRTtZQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdkQsT0FBTyxrQkFBa0IsUUFBUSx5QkFBeUIsQ0FBQztTQUM1RDthQUFNO1lBQ0wsT0FBTyw0QkFBNEIsS0FBSyxDQUFDLGVBQWUsR0FBRyxDQUFDO1NBQzdEO0lBQ0gsQ0FBQztJQUNELGFBQWEsRUFBRSwwREFBMEQ7SUFDekUsYUFBYSxFQUFFLDBEQUEwRDtJQUN6RSxRQUFRLEVBQUUscURBQXFEO0lBQy9ELFFBQVEsRUFBRSxxREFBcUQ7SUFDL0QsV0FBVyxFQUFFLHdDQUF3QztJQUNyRCxpRkFBaUY7Q0FDbEYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBmclZhbGlkYXRpb25NZXNzYWdlczogYW55ID0geyAvLyBGcmVuY2ggZXJyb3IgbWVzc2FnZXNcbiAgcmVxdWlyZWQ6ICdFc3Qgb2JsaWdhdG9pcmUuJyxcbiAgbWluTGVuZ3RoOiAnRG9pdCBhdm9pciBtaW5pbXVtIHt7bWluaW11bUxlbmd0aH19IGNhcmFjdMOocmVzIChhY3R1ZWxsZW1lbnQ6IHt7Y3VycmVudExlbmd0aH19KScsXG4gIG1heExlbmd0aDogJ0RvaXQgYXZvaXIgbWF4aW11bSB7e21heGltdW1MZW5ndGh9fSBjYXJhY3TDqHJlcyAoYWN0dWVsbGVtZW50OiB7e2N1cnJlbnRMZW5ndGh9fSknLFxuICBwYXR0ZXJuOiAnRG9pdCByZXNwZWN0ZXI6IHt7cmVxdWlyZWRQYXR0ZXJufX0nLFxuICBmb3JtYXQ6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHN3aXRjaCAoZXJyb3IucmVxdWlyZWRGb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW5lIGRhdGUsIHRlbCBxdWUgXCIyMDAwLTEyLTMxXCInO1xuICAgICAgY2FzZSAndGltZSc6XG4gICAgICAgIHJldHVybiAnRG9pdCDDqnRyZSB1bmUgaGV1cmUsIHRlbCBxdWUgXCIxNjoyMFwiIG91IFwiMDM6MTQ6MTUuOTI2NVwiJztcbiAgICAgIGNhc2UgJ2RhdGUtdGltZSc6XG4gICAgICAgIHJldHVybiAnRG9pdCDDqnRyZSB1bmUgZGF0ZSBldCB1bmUgaGV1cmUsIHRlbCBxdWUgXCIyMDAwLTAzLTE0VDAxOjU5XCIgb3UgXCIyMDAwLTAzLTE0VDAxOjU5OjI2LjUzNVpcIic7XG4gICAgICBjYXNlICdlbWFpbCc6XG4gICAgICAgIHJldHVybiAnRG9pdCDDqnRyZSB1bmUgYWRyZXNzZSBlLW1haWwsIHRlbCBxdWUgXCJuYW1lQGV4YW1wbGUuY29tXCInO1xuICAgICAgY2FzZSAnaG9zdG5hbWUnOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW4gbm9tIGRlIGRvbWFpbmUsIHRlbCBxdWUgXCJleGFtcGxlLmNvbVwiJztcbiAgICAgIGNhc2UgJ2lwdjQnOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW5lIGFkcmVzc2UgSVB2NCwgdGVsIHF1ZSBcIjEyNy4wLjAuMVwiJztcbiAgICAgIGNhc2UgJ2lwdjYnOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW5lIGFkcmVzc2UgSVB2NiwgdGVsIHF1ZSBcIjEyMzQ6NTY3ODo5QUJDOkRFRjA6MTIzNDo1Njc4OjlBQkM6REVGMFwiJztcbiAgICAgIC8vIFRPRE86IGFkZCBleGFtcGxlcyBmb3IgJ3VyaScsICd1cmktcmVmZXJlbmNlJywgYW5kICd1cmktdGVtcGxhdGUnXG4gICAgICAvLyBjYXNlICd1cmknOiBjYXNlICd1cmktcmVmZXJlbmNlJzogY2FzZSAndXJpLXRlbXBsYXRlJzpcbiAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgIHJldHVybiAnRG9pdCDDqnRyZSB1bmUgVVJMLCB0ZWwgcXVlIFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9wYWdlLmh0bWxcIic7XG4gICAgICBjYXNlICd1dWlkJzpcbiAgICAgICAgcmV0dXJuICdEb2l0IMOqdHJlIHVuIFVVSUQsIHRlbCBxdWUgXCIxMjM0NTY3OC05QUJDLURFRjAtMTIzNC01Njc4OUFCQ0RFRjBcIic7XG4gICAgICBjYXNlICdjb2xvcic6XG4gICAgICAgIHJldHVybiAnRG9pdCDDqnRyZSB1bmUgY291bGV1ciwgdGVsIHF1ZSBcIiNGRkZGRkZcIiBvciBcInJnYigyNTUsIDI1NSwgMjU1KVwiJztcbiAgICAgIGNhc2UgJ2pzb24tcG9pbnRlcic6XG4gICAgICAgIHJldHVybiAnRG9pdCDDqnRyZSB1biBKU09OIFBvaW50ZXIsIHRlbCBxdWUgXCIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWxhdGl2ZS1qc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ0RvaXQgw6p0cmUgdW4gcmVsYXRpdmUgSlNPTiBQb2ludGVyLCB0ZWwgcXVlIFwiMi9wb2ludGVyL3RvL3NvbWV0aGluZ1wiJztcbiAgICAgIGNhc2UgJ3JlZ2V4JzpcbiAgICAgICAgcmV0dXJuICdEb2l0IMOqdHJlIHVuZSBleHByZXNzaW9uIHLDqWd1bGnDqHJlLCB0ZWwgcXVlIFwiKDEtKT9cXFxcZHszfS1cXFxcZHszfS1cXFxcZHs0fVwiJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnRG9pdCDDqnRyZSBhdm9pciBsZSBmb3JtYXQgY29ycmVjdDogJyArIGVycm9yLnJlcXVpcmVkRm9ybWF0O1xuICAgIH1cbiAgfSxcbiAgbWluaW11bTogJ0RvaXQgw6p0cmUgc3Vww6lyaWV1ciDDoCB7e21pbmltdW1WYWx1ZX19JyxcbiAgZXhjbHVzaXZlTWluaW11bTogJ0RvaXQgYXZvaXIgbWluaW11bSB7e2V4Y2x1c2l2ZU1pbmltdW1WYWx1ZX19IGNoYXJhY3TDqHJlcycsXG4gIG1heGltdW06ICdEb2l0IMOqdHJlIGluZsOpcmlldXIgw6Age3ttYXhpbXVtVmFsdWV9fScsXG4gIGV4Y2x1c2l2ZU1heGltdW06ICdEb2l0IGF2b2lyIG1heGltdW0ge3tleGNsdXNpdmVNYXhpbXVtVmFsdWV9fSBjaGFyYWN0w6hyZXMnLFxuICBtdWx0aXBsZU9mOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBpZiAoKDEgLyBlcnJvci5tdWx0aXBsZU9mVmFsdWUpICUgMTAgPT09IDApIHtcbiAgICAgIGNvbnN0IGRlY2ltYWxzID0gTWF0aC5sb2cxMCgxIC8gZXJyb3IubXVsdGlwbGVPZlZhbHVlKTtcbiAgICAgIHJldHVybiBgRG9pdCBjb21wb3J0ZXIgJHtkZWNpbWFsc30gb3UgbW9pbnMgZGUgZGVjaW1hbGVzLmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgRG9pdCDDqnRyZSB1biBtdWx0aXBsZSBkZSAke2Vycm9yLm11bHRpcGxlT2ZWYWx1ZX0uYDtcbiAgICB9XG4gIH0sXG4gIG1pblByb3BlcnRpZXM6ICdEb2l0IGNvbXBvcnRlciBhdSBtaW5pbXVtIHt7bWluaW11bVByb3BlcnRpZXN9fSDDqWzDqW1lbnRzJyxcbiAgbWF4UHJvcGVydGllczogJ0RvaXQgY29tcG9ydGVyIGF1IG1heGltdW0ge3ttYXhpbXVtUHJvcGVydGllc319IMOpbMOpbWVudHMnLFxuICBtaW5JdGVtczogJ0RvaXQgY29tcG9ydGVyIGF1IG1pbmltdW0ge3ttaW5pbXVtSXRlbXN9fSDDqWzDqW1lbnRzJyxcbiAgbWF4SXRlbXM6ICdEb2l0IGNvbXBvcnRlciBhdSBtYXhpbXVtIHt7bWluaW11bUl0ZW1zfX0gw6lsw6ltZW50cycsXG4gIHVuaXF1ZUl0ZW1zOiAnVG91cyBsZXMgw6lsw6ltZW50cyBkb2l2ZW50IMOqdHJlIHVuaXF1ZXMnLFxuICAvLyBOb3RlOiBObyBkZWZhdWx0IGVycm9yIG1lc3NhZ2VzIGZvciAndHlwZScsICdjb25zdCcsICdlbnVtJywgb3IgJ2RlcGVuZGVuY2llcydcbn07XG4iXX0=