export const esValidationMessages = {
    required: 'Este campo está requerido.',
    minLength: 'Debe tener {{minimumLength}} caracteres o más longitud (longitud actual: {{currentLength}})',
    maxLength: 'Debe tener {{maximumLength}} caracteres o menos longitud (longitud actual: {{currentLength}})',
    pattern: 'Must match pattern: {{requiredPattern}}',
    format: function (error) {
        switch (error.requiredFormat) {
            case 'date':
                return 'Debe tener una fecha, ej "2000-12-31"';
            case 'time':
                return 'Debe tener una hora, ej "16:20" o "03:14:15.9265"';
            case 'date-time':
                return 'Debe tener fecha y hora, ej "2000-03-14T01:59" o "2000-03-14T01:59:26.535Z"';
            case 'email':
                return 'No hay dirección de correo electrónico válida, ej "name@example.com"';
            case 'hostname':
                return 'Debe ser un nombre de host válido, ej "example.com"';
            case 'ipv4':
                return 'Debe ser una dirección de IPv4, ej "127.0.0.1"';
            case 'ipv6':
                return 'Debe ser una dirección de IPv6, ej "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0"';
            case 'url':
                return 'Debe ser una URL, ej "http://www.example.com/page.html"';
            case 'uuid':
                return 'Debe ser un UUID, ej "12345678-9ABC-DEF0-1234-56789ABCDEF0"';
            case 'color':
                return 'Debe ser un color, ej "#FFFFFF" or "rgb(255, 255, 255)"';
            case 'json-pointer':
                return 'Debe ser un JSON Pointer, ej "/pointer/to/something"';
            case 'relative-json-pointer':
                return 'Debe ser un JSON Pointer relativo, ej "2/pointer/to/something"';
            case 'regex':
                return 'Debe ser una expresión regular, ej "(1-)?\\d{3}-\\d{3}-\\d{4}"';
            default:
                return 'Debe tener el formato correcto ' + error.requiredFormat;
        }
    },
    minimum: 'Debe ser {{minimumValue}} o más',
    exclusiveMinimum: 'Debe ser superior a {{exclusiveMinimumValue}}',
    maximum: 'Debe ser {{maximumValue}} o menos',
    exclusiveMaximum: 'Debe ser menor que {{exclusiveMaximumValue}}',
    multipleOf: function (error) {
        if ((1 / error.multipleOfValue) % 10 === 0) {
            const decimals = Math.log10(1 / error.multipleOfValue);
            return `Se permite un máximo de ${decimals} decimales`;
        }
        else {
            return `Debe ser múltiplo de ${error.multipleOfValue}.`;
        }
    },
    minProperties: 'Debe tener {{minimumProperties}} o más elementos (elementos actuales: {{currentProperties}})',
    maxProperties: 'Debe tener {{maximumProperties}} o menos elementos (elementos actuales: {{currentProperties}})',
    minItems: 'Debe tener {{minimumItems}} o más elementos (elementos actuales: {{currentItems}})',
    maxItems: 'Debe tener {{maximumItems}} o menos elementos (elementos actuales: {{currentItems}})',
    uniqueItems: 'Todos los elementos deben ser únicos',
};
//# sourceMappingURL=eventLog:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXMtdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvbGliL2xvY2FsZS9lcy12YWxpZGF0aW9uLW1lc3NhZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFRO0lBQ3ZDLFFBQVEsRUFBRSw0QkFBNEI7SUFDdEMsU0FBUyxFQUFFLDZGQUE2RjtJQUN4RyxTQUFTLEVBQUUsK0ZBQStGO0lBQzFHLE9BQU8sRUFBRSx5Q0FBeUM7SUFDbEQsTUFBTSxFQUFFLFVBQVUsS0FBSztRQUNyQixRQUFRLEtBQUssQ0FBQyxjQUFjLEVBQUU7WUFDNUIsS0FBSyxNQUFNO2dCQUNULE9BQU8sdUNBQXVDLENBQUM7WUFDakQsS0FBSyxNQUFNO2dCQUNULE9BQU8sbURBQW1ELENBQUM7WUFDN0QsS0FBSyxXQUFXO2dCQUNkLE9BQU8sNkVBQTZFLENBQUM7WUFDdkYsS0FBSyxPQUFPO2dCQUNWLE9BQU8sc0VBQXNFLENBQUM7WUFDaEYsS0FBSyxVQUFVO2dCQUNiLE9BQU8scURBQXFELENBQUM7WUFDL0QsS0FBSyxNQUFNO2dCQUNULE9BQU8sZ0RBQWdELENBQUM7WUFDMUQsS0FBSyxNQUFNO2dCQUNULE9BQU8sOEVBQThFLENBQUM7WUFDeEYsS0FBSyxLQUFLO2dCQUNSLE9BQU8seURBQXlELENBQUM7WUFDbkUsS0FBSyxNQUFNO2dCQUNULE9BQU8sNkRBQTZELENBQUM7WUFDdkUsS0FBSyxPQUFPO2dCQUNWLE9BQU8seURBQXlELENBQUM7WUFDbkUsS0FBSyxjQUFjO2dCQUNqQixPQUFPLHNEQUFzRCxDQUFDO1lBQ2hFLEtBQUssdUJBQXVCO2dCQUMxQixPQUFPLGdFQUFnRSxDQUFDO1lBQzFFLEtBQUssT0FBTztnQkFDVixPQUFPLGdFQUFnRSxDQUFDO1lBQzFFO2dCQUNFLE9BQU8saUNBQWlDLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQztTQUNuRTtJQUNILENBQUM7SUFDRCxPQUFPLEVBQUUsaUNBQWlDO0lBQzFDLGdCQUFnQixFQUFFLCtDQUErQztJQUNqRSxPQUFPLEVBQUUsbUNBQW1DO0lBQzVDLGdCQUFnQixFQUFFLDhDQUE4QztJQUNoRSxVQUFVLEVBQUUsVUFBVSxLQUFLO1FBQ3pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDMUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sMkJBQTJCLFFBQVEsWUFBWSxDQUFDO1NBQ3hEO2FBQU07WUFDTCxPQUFPLHdCQUF3QixLQUFLLENBQUMsZUFBZSxHQUFHLENBQUM7U0FDekQ7SUFDSCxDQUFDO0lBQ0QsYUFBYSxFQUFFLDhGQUE4RjtJQUM3RyxhQUFhLEVBQUUsZ0dBQWdHO0lBQy9HLFFBQVEsRUFBRSxvRkFBb0Y7SUFDOUYsUUFBUSxFQUFFLHNGQUFzRjtJQUNoRyxXQUFXLEVBQUUsc0NBQXNDO0NBQ3BELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZXNWYWxpZGF0aW9uTWVzc2FnZXM6IGFueSA9IHsgLy8gRGVmYXVsdCBTcGFuaXNoIGVycm9yIG1lc3NhZ2VzXG4gIHJlcXVpcmVkOiAnRXN0ZSBjYW1wbyBlc3TDoSByZXF1ZXJpZG8uJyxcbiAgbWluTGVuZ3RoOiAnRGViZSB0ZW5lciB7e21pbmltdW1MZW5ndGh9fSBjYXJhY3RlcmVzIG8gbcOhcyBsb25naXR1ZCAobG9uZ2l0dWQgYWN0dWFsOiB7e2N1cnJlbnRMZW5ndGh9fSknLFxuICBtYXhMZW5ndGg6ICdEZWJlIHRlbmVyIHt7bWF4aW11bUxlbmd0aH19IGNhcmFjdGVyZXMgbyBtZW5vcyBsb25naXR1ZCAobG9uZ2l0dWQgYWN0dWFsOiB7e2N1cnJlbnRMZW5ndGh9fSknLFxuICBwYXR0ZXJuOiAnTXVzdCBtYXRjaCBwYXR0ZXJuOiB7e3JlcXVpcmVkUGF0dGVybn19JyxcbiAgZm9ybWF0OiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBzd2l0Y2ggKGVycm9yLnJlcXVpcmVkRm9ybWF0KSB7XG4gICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgcmV0dXJuICdEZWJlIHRlbmVyIHVuYSBmZWNoYSwgZWogXCIyMDAwLTEyLTMxXCInO1xuICAgICAgY2FzZSAndGltZSc6XG4gICAgICAgIHJldHVybiAnRGViZSB0ZW5lciB1bmEgaG9yYSwgZWogXCIxNjoyMFwiIG8gXCIwMzoxNDoxNS45MjY1XCInO1xuICAgICAgY2FzZSAnZGF0ZS10aW1lJzpcbiAgICAgICAgcmV0dXJuICdEZWJlIHRlbmVyIGZlY2hhIHkgaG9yYSwgZWogXCIyMDAwLTAzLTE0VDAxOjU5XCIgbyBcIjIwMDAtMDMtMTRUMDE6NTk6MjYuNTM1WlwiJztcbiAgICAgIGNhc2UgJ2VtYWlsJzpcbiAgICAgICAgcmV0dXJuICdObyBoYXkgZGlyZWNjacOzbiBkZSBjb3JyZW8gZWxlY3Ryw7NuaWNvIHbDoWxpZGEsIGVqIFwibmFtZUBleGFtcGxlLmNvbVwiJztcbiAgICAgIGNhc2UgJ2hvc3RuYW1lJzpcbiAgICAgICAgcmV0dXJuICdEZWJlIHNlciB1biBub21icmUgZGUgaG9zdCB2w6FsaWRvLCBlaiBcImV4YW1wbGUuY29tXCInO1xuICAgICAgY2FzZSAnaXB2NCc6XG4gICAgICAgIHJldHVybiAnRGViZSBzZXIgdW5hIGRpcmVjY2nDs24gZGUgSVB2NCwgZWogXCIxMjcuMC4wLjFcIic7XG4gICAgICBjYXNlICdpcHY2JzpcbiAgICAgICAgcmV0dXJuICdEZWJlIHNlciB1bmEgZGlyZWNjacOzbiBkZSBJUHY2LCBlaiBcIjEyMzQ6NTY3ODo5QUJDOkRFRjA6MTIzNDo1Njc4OjlBQkM6REVGMFwiJztcbiAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgIHJldHVybiAnRGViZSBzZXIgdW5hIFVSTCwgZWogXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tL3BhZ2UuaHRtbFwiJztcbiAgICAgIGNhc2UgJ3V1aWQnOlxuICAgICAgICByZXR1cm4gJ0RlYmUgc2VyIHVuIFVVSUQsIGVqIFwiMTIzNDU2NzgtOUFCQy1ERUYwLTEyMzQtNTY3ODlBQkNERUYwXCInO1xuICAgICAgY2FzZSAnY29sb3InOlxuICAgICAgICByZXR1cm4gJ0RlYmUgc2VyIHVuIGNvbG9yLCBlaiBcIiNGRkZGRkZcIiBvciBcInJnYigyNTUsIDI1NSwgMjU1KVwiJztcbiAgICAgIGNhc2UgJ2pzb24tcG9pbnRlcic6XG4gICAgICAgIHJldHVybiAnRGViZSBzZXIgdW4gSlNPTiBQb2ludGVyLCBlaiBcIi9wb2ludGVyL3RvL3NvbWV0aGluZ1wiJztcbiAgICAgIGNhc2UgJ3JlbGF0aXZlLWpzb24tcG9pbnRlcic6XG4gICAgICAgIHJldHVybiAnRGViZSBzZXIgdW4gSlNPTiBQb2ludGVyIHJlbGF0aXZvLCBlaiBcIjIvcG9pbnRlci90by9zb21ldGhpbmdcIic7XG4gICAgICBjYXNlICdyZWdleCc6XG4gICAgICAgIHJldHVybiAnRGViZSBzZXIgdW5hIGV4cHJlc2nDs24gcmVndWxhciwgZWogXCIoMS0pP1xcXFxkezN9LVxcXFxkezN9LVxcXFxkezR9XCInO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdEZWJlIHRlbmVyIGVsIGZvcm1hdG8gY29ycmVjdG8gJyArIGVycm9yLnJlcXVpcmVkRm9ybWF0O1xuICAgIH1cbiAgfSxcbiAgbWluaW11bTogJ0RlYmUgc2VyIHt7bWluaW11bVZhbHVlfX0gbyBtw6FzJyxcbiAgZXhjbHVzaXZlTWluaW11bTogJ0RlYmUgc2VyIHN1cGVyaW9yIGEge3tleGNsdXNpdmVNaW5pbXVtVmFsdWV9fScsXG4gIG1heGltdW06ICdEZWJlIHNlciB7e21heGltdW1WYWx1ZX19IG8gbWVub3MnLFxuICBleGNsdXNpdmVNYXhpbXVtOiAnRGViZSBzZXIgbWVub3IgcXVlIHt7ZXhjbHVzaXZlTWF4aW11bVZhbHVlfX0nLFxuICBtdWx0aXBsZU9mOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBpZiAoKDEgLyBlcnJvci5tdWx0aXBsZU9mVmFsdWUpICUgMTAgPT09IDApIHtcbiAgICAgIGNvbnN0IGRlY2ltYWxzID0gTWF0aC5sb2cxMCgxIC8gZXJyb3IubXVsdGlwbGVPZlZhbHVlKTtcbiAgICAgIHJldHVybiBgU2UgcGVybWl0ZSB1biBtw6F4aW1vIGRlICR7ZGVjaW1hbHN9IGRlY2ltYWxlc2A7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBgRGViZSBzZXIgbcO6bHRpcGxvIGRlICR7ZXJyb3IubXVsdGlwbGVPZlZhbHVlfS5gO1xuICAgIH1cbiAgfSxcbiAgbWluUHJvcGVydGllczogJ0RlYmUgdGVuZXIge3ttaW5pbXVtUHJvcGVydGllc319IG8gbcOhcyBlbGVtZW50b3MgKGVsZW1lbnRvcyBhY3R1YWxlczoge3tjdXJyZW50UHJvcGVydGllc319KScsXG4gIG1heFByb3BlcnRpZXM6ICdEZWJlIHRlbmVyIHt7bWF4aW11bVByb3BlcnRpZXN9fSBvIG1lbm9zIGVsZW1lbnRvcyAoZWxlbWVudG9zIGFjdHVhbGVzOiB7e2N1cnJlbnRQcm9wZXJ0aWVzfX0pJyxcbiAgbWluSXRlbXM6ICdEZWJlIHRlbmVyIHt7bWluaW11bUl0ZW1zfX0gbyBtw6FzIGVsZW1lbnRvcyAoZWxlbWVudG9zIGFjdHVhbGVzOiB7e2N1cnJlbnRJdGVtc319KScsXG4gIG1heEl0ZW1zOiAnRGViZSB0ZW5lciB7e21heGltdW1JdGVtc319IG8gbWVub3MgZWxlbWVudG9zIChlbGVtZW50b3MgYWN0dWFsZXM6IHt7Y3VycmVudEl0ZW1zfX0pJyxcbiAgdW5pcXVlSXRlbXM6ICdUb2RvcyBsb3MgZWxlbWVudG9zIGRlYmVuIHNlciDDum5pY29zJyxcbn07XG4iXX0=
