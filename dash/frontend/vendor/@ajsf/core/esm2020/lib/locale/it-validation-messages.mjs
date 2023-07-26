export const itValidationMessages = {
    required: 'Il campo è obbligatorio',
    minLength: 'Deve inserire almeno {{minimumLength}} caratteri (lunghezza corrente: {{currentLength}})',
    maxLength: 'Il numero massimo di caratteri consentito è {{maximumLength}} (lunghezza corrente: {{currentLength}})',
    pattern: 'Devi rispettare il pattern : {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return 'Deve essere una data, come "31-12-2000"';
            case 'time':
                return 'Deve essere un orario, come "16:20" o "03:14:15.9265"';
            case 'date-time':
                return 'Deve essere data-orario, come "14-03-2000T01:59" or "14-03-2000T01:59:26.535Z"';
            case 'email':
                return 'Deve essere un indirzzo email, come "name@example.com"';
            case 'hostname':
                return 'Deve essere un hostname, come "example.com"';
            case 'ipv4':
                return 'Deve essere un indirizzo IPv4, come "127.0.0.1"';
            case 'ipv6':
                return 'Deve essere un indirizzo IPv6, come "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
            // case 'uri': case 'uri-reference': case 'uri-template':
            case 'url':
                return 'Deve essere un url, come "http://www.example.com/page.html"';
            case 'uuid':
                return 'Deve essere un uuid, come "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
                return 'Deve essere un colore, come "#FFFFFF" o "rgb(255, 255, 255)"';
            case 'json-pointer':
                return 'Deve essere un JSON Pointer, come "/pointer/to/something"';
            case 'relative-json-pointer':
                return 'Deve essere un JSON Pointer relativo, come "2/pointer/to/something"';
            case 'regex':
                return 'Deve essere una regular expression, come "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
                return 'Deve essere formattato correttamente ' + error.requiredFormat;
        }
    },
    minimum: 'Deve essere {{minimumValue}} o più',
    exclusiveMinimum: 'Deve essere più di {{exclusiveMinimumValue}}',
    maximum: 'Deve essere {{maximumValue}} o meno',
    exclusiveMaximum: 'Deve essere minore di {{exclusiveMaximumValue}}',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `Deve avere ${decimals} o meno decimali.`;
        }
        else {
            return `Deve essere multiplo di ${error.multipleOfValue}.`;
        }
    },
    minProperties: 'Deve avere {{minimumProperties}} o più elementi (elementi correnti: {{currentProperties}})',
    maxProperties: 'Deve avere {{maximumProperties}} o meno elementi (elementi correnti: {{currentProperties}})',
    minItems: 'Deve avere {{minimumItems}} o più elementi (elementi correnti: {{currentItems}})',
    maxItems: 'Deve avere {{maximumItems}} o meno elementi (elementi correnti: {{currentItems}})',
    uniqueItems: 'Tutti gli elementi devono essere unici',
    // Note: No default error messages for 'type', 'const', 'enum', or 'dependencies'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXQtdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvbGliL2xvY2FsZS9pdC12YWxpZGF0aW9uLW1lc3NhZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFRO0lBQ3ZDLFFBQVEsRUFBRSx5QkFBeUI7SUFDbkMsU0FBUyxFQUFFLDBGQUEwRjtJQUNyRyxTQUFTLEVBQUUsdUdBQXVHO0lBQ2xILE9BQU8sRUFBRSxrREFBa0Q7SUFDM0QsTUFBTSxFQUFFLFVBQVUsS0FBSztRQUNyQixRQUFRLEtBQUssQ0FBQyxjQUFjLEVBQUU7WUFDNUIsS0FBSyxNQUFNO2dCQUNULE9BQU8seUNBQXlDLENBQUM7WUFDbkQsS0FBSyxNQUFNO2dCQUNULE9BQU8sdURBQXVELENBQUM7WUFDakUsS0FBSyxXQUFXO2dCQUNkLE9BQU8sZ0ZBQWdGLENBQUM7WUFDMUYsS0FBSyxPQUFPO2dCQUNWLE9BQU8sd0RBQXdELENBQUM7WUFDbEUsS0FBSyxVQUFVO2dCQUNiLE9BQU8sNkNBQTZDLENBQUM7WUFDdkQsS0FBSyxNQUFNO2dCQUNULE9BQU8saURBQWlELENBQUM7WUFDM0QsS0FBSyxNQUFNO2dCQUNULE9BQU8sK0VBQStFLENBQUM7WUFDekYsb0VBQW9FO1lBQ3BFLHlEQUF5RDtZQUN6RCxLQUFLLEtBQUs7Z0JBQ1IsT0FBTyw2REFBNkQsQ0FBQztZQUN2RSxLQUFLLE1BQU07Z0JBQ1QsT0FBTyxrRUFBa0UsQ0FBQztZQUM1RSxLQUFLLE9BQU87Z0JBQ1YsT0FBTyw4REFBOEQsQ0FBQztZQUN4RSxLQUFLLGNBQWM7Z0JBQ2pCLE9BQU8sMkRBQTJELENBQUM7WUFDckUsS0FBSyx1QkFBdUI7Z0JBQzFCLE9BQU8scUVBQXFFLENBQUM7WUFDL0UsS0FBSyxPQUFPO2dCQUNWLE9BQU8sc0VBQXNFLENBQUM7WUFDaEY7Z0JBQ0UsT0FBTyx1Q0FBdUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO1NBQ3pFO0lBQ0gsQ0FBQztJQUNELE9BQU8sRUFBRSxvQ0FBb0M7SUFDN0MsZ0JBQWdCLEVBQUUsOENBQThDO0lBQ2hFLE9BQU8sRUFBRSxxQ0FBcUM7SUFDOUMsZ0JBQWdCLEVBQUUsaURBQWlEO0lBQ25FLFVBQVUsRUFBRSxVQUFVLEtBQUs7UUFDekIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRTtZQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdkQsT0FBTyxjQUFjLFFBQVEsbUJBQW1CLENBQUM7U0FDbEQ7YUFBTTtZQUNMLE9BQU8sMkJBQTJCLEtBQUssQ0FBQyxlQUFlLEdBQUcsQ0FBQztTQUM1RDtJQUNILENBQUM7SUFDRCxhQUFhLEVBQUUsNEZBQTRGO0lBQzNHLGFBQWEsRUFBRSw2RkFBNkY7SUFDNUcsUUFBUSxFQUFFLGtGQUFrRjtJQUM1RixRQUFRLEVBQUUsbUZBQW1GO0lBQzdGLFdBQVcsRUFBRSx3Q0FBd0M7SUFDckQsaUZBQWlGO0NBQ2xGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgaXRWYWxpZGF0aW9uTWVzc2FnZXM6IGFueSA9IHsgLy8gRGVmYXVsdCBJdGFsaWFuIGVycm9yIG1lc3NhZ2VzXG4gIHJlcXVpcmVkOiAnSWwgY2FtcG8gw6ggb2JibGlnYXRvcmlvJyxcbiAgbWluTGVuZ3RoOiAnRGV2ZSBpbnNlcmlyZSBhbG1lbm8ge3ttaW5pbXVtTGVuZ3RofX0gY2FyYXR0ZXJpIChsdW5naGV6emEgY29ycmVudGU6IHt7Y3VycmVudExlbmd0aH19KScsXG4gIG1heExlbmd0aDogJ0lsIG51bWVybyBtYXNzaW1vIGRpIGNhcmF0dGVyaSBjb25zZW50aXRvIMOoIHt7bWF4aW11bUxlbmd0aH19IChsdW5naGV6emEgY29ycmVudGU6IHt7Y3VycmVudExlbmd0aH19KScsXG4gIHBhdHRlcm46ICdEZXZpIHJpc3BldHRhcmUgaWwgcGF0dGVybiA6IHt7cmVxdWlyZWRQYXR0ZXJufX0nLFxuICBmb3JtYXQ6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHN3aXRjaCAoZXJyb3IucmVxdWlyZWRGb3JtYXQpIHtcbiAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIHVuYSBkYXRhLCBjb21lIFwiMzEtMTItMjAwMFwiJztcbiAgICAgIGNhc2UgJ3RpbWUnOlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIHVuIG9yYXJpbywgY29tZSBcIjE2OjIwXCIgbyBcIjAzOjE0OjE1LjkyNjVcIic7XG4gICAgICBjYXNlICdkYXRlLXRpbWUnOlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIGRhdGEtb3JhcmlvLCBjb21lIFwiMTQtMDMtMjAwMFQwMTo1OVwiIG9yIFwiMTQtMDMtMjAwMFQwMTo1OToyNi41MzVaXCInO1xuICAgICAgY2FzZSAnZW1haWwnOlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIHVuIGluZGlyenpvIGVtYWlsLCBjb21lIFwibmFtZUBleGFtcGxlLmNvbVwiJztcbiAgICAgIGNhc2UgJ2hvc3RuYW1lJzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSB1biBob3N0bmFtZSwgY29tZSBcImV4YW1wbGUuY29tXCInO1xuICAgICAgY2FzZSAnaXB2NCc6XG4gICAgICAgIHJldHVybiAnRGV2ZSBlc3NlcmUgdW4gaW5kaXJpenpvIElQdjQsIGNvbWUgXCIxMjcuMC4wLjFcIic7XG4gICAgICBjYXNlICdpcHY2JzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSB1biBpbmRpcml6em8gSVB2NiwgY29tZSBcIjEyMzQ6NTY3ODo5QUJDOkRFRjA6MTIzNDo1Njc4OjlBQkM6REVGMFwiJztcbiAgICAgIC8vIFRPRE86IGFkZCBleGFtcGxlcyBmb3IgJ3VyaScsICd1cmktcmVmZXJlbmNlJywgYW5kICd1cmktdGVtcGxhdGUnXG4gICAgICAvLyBjYXNlICd1cmknOiBjYXNlICd1cmktcmVmZXJlbmNlJzogY2FzZSAndXJpLXRlbXBsYXRlJzpcbiAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgIHJldHVybiAnRGV2ZSBlc3NlcmUgdW4gdXJsLCBjb21lIFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9wYWdlLmh0bWxcIic7XG4gICAgICBjYXNlICd1dWlkJzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSB1biB1dWlkLCBjb21lIFwiMTIzNDU2NzgtOUFCQy1ERUYwLTEyMzQtNTY3ODlBQkNERUYwXCInO1xuICAgICAgY2FzZSAnY29sb3InOlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIHVuIGNvbG9yZSwgY29tZSBcIiNGRkZGRkZcIiBvIFwicmdiKDI1NSwgMjU1LCAyNTUpXCInO1xuICAgICAgY2FzZSAnanNvbi1wb2ludGVyJzpcbiAgICAgICAgcmV0dXJuICdEZXZlIGVzc2VyZSB1biBKU09OIFBvaW50ZXIsIGNvbWUgXCIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWxhdGl2ZS1qc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIHVuIEpTT04gUG9pbnRlciByZWxhdGl2bywgY29tZSBcIjIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWdleCc6XG4gICAgICAgIHJldHVybiAnRGV2ZSBlc3NlcmUgdW5hIHJlZ3VsYXIgZXhwcmVzc2lvbiwgY29tZSBcIigxLSk/XFxcXGR7M30tXFxcXGR7M30tXFxcXGR7NH1cIic7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ0RldmUgZXNzZXJlIGZvcm1hdHRhdG8gY29ycmV0dGFtZW50ZSAnICsgZXJyb3IucmVxdWlyZWRGb3JtYXQ7XG4gICAgfVxuICB9LFxuICBtaW5pbXVtOiAnRGV2ZSBlc3NlcmUge3ttaW5pbXVtVmFsdWV9fSBvIHBpw7knLFxuICBleGNsdXNpdmVNaW5pbXVtOiAnRGV2ZSBlc3NlcmUgcGnDuSBkaSB7e2V4Y2x1c2l2ZU1pbmltdW1WYWx1ZX19JyxcbiAgbWF4aW11bTogJ0RldmUgZXNzZXJlIHt7bWF4aW11bVZhbHVlfX0gbyBtZW5vJyxcbiAgZXhjbHVzaXZlTWF4aW11bTogJ0RldmUgZXNzZXJlIG1pbm9yZSBkaSB7e2V4Y2x1c2l2ZU1heGltdW1WYWx1ZX19JyxcbiAgbXVsdGlwbGVPZjogZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgaWYgKCgxIC8gZXJyb3IubXVsdGlwbGVPZlZhbHVlKSAlIDEwID09PSAwKSB7XG4gICAgICBjb25zdCBkZWNpbWFscyA9IE1hdGgubG9nMTAoMSAvIGVycm9yLm11bHRpcGxlT2ZWYWx1ZSk7XG4gICAgICByZXR1cm4gYERldmUgYXZlcmUgJHtkZWNpbWFsc30gbyBtZW5vIGRlY2ltYWxpLmA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgRGV2ZSBlc3NlcmUgbXVsdGlwbG8gZGkgJHtlcnJvci5tdWx0aXBsZU9mVmFsdWV9LmA7XG4gICAgfVxuICB9LFxuICBtaW5Qcm9wZXJ0aWVzOiAnRGV2ZSBhdmVyZSB7e21pbmltdW1Qcm9wZXJ0aWVzfX0gbyBwacO5IGVsZW1lbnRpIChlbGVtZW50aSBjb3JyZW50aToge3tjdXJyZW50UHJvcGVydGllc319KScsXG4gIG1heFByb3BlcnRpZXM6ICdEZXZlIGF2ZXJlIHt7bWF4aW11bVByb3BlcnRpZXN9fSBvIG1lbm8gZWxlbWVudGkgKGVsZW1lbnRpIGNvcnJlbnRpOiB7e2N1cnJlbnRQcm9wZXJ0aWVzfX0pJyxcbiAgbWluSXRlbXM6ICdEZXZlIGF2ZXJlIHt7bWluaW11bUl0ZW1zfX0gbyBwacO5IGVsZW1lbnRpIChlbGVtZW50aSBjb3JyZW50aToge3tjdXJyZW50SXRlbXN9fSknLFxuICBtYXhJdGVtczogJ0RldmUgYXZlcmUge3ttYXhpbXVtSXRlbXN9fSBvIG1lbm8gZWxlbWVudGkgKGVsZW1lbnRpIGNvcnJlbnRpOiB7e2N1cnJlbnRJdGVtc319KScsXG4gIHVuaXF1ZUl0ZW1zOiAnVHV0dGkgZ2xpIGVsZW1lbnRpIGRldm9ubyBlc3NlcmUgdW5pY2knLFxuICAvLyBOb3RlOiBObyBkZWZhdWx0IGVycm9yIG1lc3NhZ2VzIGZvciAndHlwZScsICdjb25zdCcsICdlbnVtJywgb3IgJ2RlcGVuZGVuY2llcydcbn07XG4iXX0=
