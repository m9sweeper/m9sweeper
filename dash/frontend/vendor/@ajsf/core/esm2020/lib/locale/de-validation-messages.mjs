export const deValidationMessages = {
  required: 'Darf nicht leer sein',
  minLength: 'Mindestens {{minimumLength}} Zeichen benötigt (aktuell: {{currentLength}})',
  maxLength: 'Maximal {{maximumLength}} Zeichen erlaubt (aktuell: {{currentLength}})',
  pattern: 'Entspricht nicht diesem regulären Ausdruck: {{requiredPattern}}',
  format: function (error) {
    switch (error.requiredFormat) {
      case 'date':
        return 'Muss ein Datum sein, z. B. "2000-12-31"';
      case 'time':
        return 'Muss eine Zeitangabe sein, z. B. "16:20" oder "03:14:15.9265"';
      case 'date-time':
        return 'Muss Datum mit Zeit beinhalten, z. B. "2000-03-14T01:59" oder "2000-03-14T01:59:26.535Z"';
      case 'email':
        return 'Keine gültige E-Mail-Adresse (z. B. "name@example.com")';
      case 'hostname':
        return 'Kein gültiger Hostname (z. B. "example.com")';
      case 'ipv4':
        return 'Keine gültige IPv4-Adresse (z. B. "127.0.0.1")';
      case 'ipv6':
        return 'Keine gültige IPv6-Adresse (z. B. "1234:5678:9ABC:DEF0:1234:5678:9ABC:DEF0")';
      // TODO: add examples for 'uri', 'uri-reference', and 'uri-template'
      // case 'uri': case 'uri-reference': case 'uri-template':
      case 'url':
        return 'Keine gültige URL (z. B. "http://www.example.com/page.html")';
      case 'uuid':
        return 'Keine gültige UUID (z. B. "12345678-9ABC-DEF0-1234-56789ABCDEF0")';
      case 'color':
        return 'Kein gültiger Farbwert (z. B. "#FFFFFF" oder "rgb(255, 255, 255)")';
      case 'json-pointer':
        return 'Kein gültiger JSON-Pointer (z. B. "/pointer/to/something")';
      case 'relative-json-pointer':
        return 'Kein gültiger relativer JSON-Pointer (z. B. "2/pointer/to/something")';
      case 'regex':
        return 'Kein gültiger regulärer Ausdruck (z. B. "(1-)?\\d{3}-\\d{3}-\\d{4}")';
      default:
        return 'Muss diesem Format entsprechen: ' + error.requiredFormat;
    }
  },
  minimum: 'Muss mindestens {{minimumValue}} sein',
  exclusiveMinimum: 'Muss größer als {{exclusiveMinimumValue}} sein',
  maximum: 'Darf maximal {{maximumValue}} sein',
  exclusiveMaximum: 'Muss kleiner als {{exclusiveMaximumValue}} sein',
  multipleOf: function (error) {
    if ((1 / error.multipleOfValue) % 10 === 0) {
      const decimals = Math.log10(1 / error.multipleOfValue);
      return `Maximal ${decimals} Dezimalstellen erlaubt`;
    }
    else {
      return `Muss ein Vielfaches von ${error.multipleOfValue} sein`;
    }
  },
  minProperties: 'Mindestens {{minimumProperties}} Attribute erforderlich (aktuell: {{currentProperties}})',
  maxProperties: 'Maximal {{maximumProperties}} Attribute erlaubt (aktuell: {{currentProperties}})',
  minItems: 'Mindestens {{minimumItems}} Werte erforderlich (aktuell: {{currentItems}})',
  maxItems: 'Maximal {{maximumItems}} Werte erlaubt (aktuell: {{currentItems}})',
  uniqueItems: 'Alle Werte müssen eindeutig sein',
  // Note: No default error messages for 'type', 'const', 'enum', or 'dependencies'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGUtdmFsaWRhdGlvbi1tZXNzYWdlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvbGliL2xvY2FsZS9kZS12YWxpZGF0aW9uLW1lc3NhZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFRO0lBQ3ZDLFFBQVEsRUFBRSxzQkFBc0I7SUFDaEMsU0FBUyxFQUFFLDRFQUE0RTtJQUN2RixTQUFTLEVBQUUsd0VBQXdFO0lBQ25GLE9BQU8sRUFBRSxpRUFBaUU7SUFDMUUsTUFBTSxFQUFFLFVBQVUsS0FBSztRQUNyQixRQUFRLEtBQUssQ0FBQyxjQUFjLEVBQUU7WUFDNUIsS0FBSyxNQUFNO2dCQUNULE9BQU8seUNBQXlDLENBQUM7WUFDbkQsS0FBSyxNQUFNO2dCQUNULE9BQU8sK0RBQStELENBQUM7WUFDekUsS0FBSyxXQUFXO2dCQUNkLE9BQU8sMEZBQTBGLENBQUM7WUFDcEcsS0FBSyxPQUFPO2dCQUNWLE9BQU8seURBQXlELENBQUM7WUFDbkUsS0FBSyxVQUFVO2dCQUNiLE9BQU8sOENBQThDLENBQUM7WUFDeEQsS0FBSyxNQUFNO2dCQUNULE9BQU8sZ0RBQWdELENBQUM7WUFDMUQsS0FBSyxNQUFNO2dCQUNULE9BQU8sOEVBQThFLENBQUM7WUFDeEYsb0VBQW9FO1lBQ3BFLHlEQUF5RDtZQUN6RCxLQUFLLEtBQUs7Z0JBQ1IsT0FBTyw4REFBOEQsQ0FBQztZQUN4RSxLQUFLLE1BQU07Z0JBQ1QsT0FBTyxtRUFBbUUsQ0FBQztZQUM3RSxLQUFLLE9BQU87Z0JBQ1YsT0FBTyxvRUFBb0UsQ0FBQztZQUM5RSxLQUFLLGNBQWM7Z0JBQ2pCLE9BQU8sNERBQTRELENBQUM7WUFDdEUsS0FBSyx1QkFBdUI7Z0JBQzFCLE9BQU8sdUVBQXVFLENBQUM7WUFDakYsS0FBSyxPQUFPO2dCQUNWLE9BQU8sc0VBQXNFLENBQUM7WUFDaEY7Z0JBQ0UsT0FBTyxrQ0FBa0MsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDO1NBQ3BFO0lBQ0gsQ0FBQztJQUNELE9BQU8sRUFBRSx1Q0FBdUM7SUFDaEQsZ0JBQWdCLEVBQUUsZ0RBQWdEO0lBQ2xFLE9BQU8sRUFBRSxvQ0FBb0M7SUFDN0MsZ0JBQWdCLEVBQUUsaURBQWlEO0lBQ25FLFVBQVUsRUFBRSxVQUFVLEtBQUs7UUFDekIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRTtZQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdkQsT0FBTyxXQUFXLFFBQVEseUJBQXlCLENBQUM7U0FDckQ7YUFBTTtZQUNMLE9BQU8sMkJBQTJCLEtBQUssQ0FBQyxlQUFlLE9BQU8sQ0FBQztTQUNoRTtJQUNILENBQUM7SUFDRCxhQUFhLEVBQUUsMEZBQTBGO0lBQ3pHLGFBQWEsRUFBRSxrRkFBa0Y7SUFDakcsUUFBUSxFQUFFLDRFQUE0RTtJQUN0RixRQUFRLEVBQUUsb0VBQW9FO0lBQzlFLFdBQVcsRUFBRSxrQ0FBa0M7SUFDL0MsaUZBQWlGO0NBQ2xGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZGVWYWxpZGF0aW9uTWVzc2FnZXM6IGFueSA9IHsgLy8gRGVmYXVsdCBHZXJtYW4gZXJyb3IgbWVzc2FnZXNcbiAgcmVxdWlyZWQ6ICdEYXJmIG5pY2h0IGxlZXIgc2VpbicsXG4gIG1pbkxlbmd0aDogJ01pbmRlc3RlbnMge3ttaW5pbXVtTGVuZ3RofX0gWmVpY2hlbiBiZW7DtnRpZ3QgKGFrdHVlbGw6IHt7Y3VycmVudExlbmd0aH19KScsXG4gIG1heExlbmd0aDogJ01heGltYWwge3ttYXhpbXVtTGVuZ3RofX0gWmVpY2hlbiBlcmxhdWJ0IChha3R1ZWxsOiB7e2N1cnJlbnRMZW5ndGh9fSknLFxuICBwYXR0ZXJuOiAnRW50c3ByaWNodCBuaWNodCBkaWVzZW0gcmVndWzDpHJlbiBBdXNkcnVjazoge3tyZXF1aXJlZFBhdHRlcm59fScsXG4gIGZvcm1hdDogZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgc3dpdGNoIChlcnJvci5yZXF1aXJlZEZvcm1hdCkge1xuICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgIHJldHVybiAnTXVzcyBlaW4gRGF0dW0gc2Vpbiwgei4gQi4gXCIyMDAwLTEyLTMxXCInO1xuICAgICAgY2FzZSAndGltZSc6XG4gICAgICAgIHJldHVybiAnTXVzcyBlaW5lIFplaXRhbmdhYmUgc2Vpbiwgei4gQi4gXCIxNjoyMFwiIG9kZXIgXCIwMzoxNDoxNS45MjY1XCInO1xuICAgICAgY2FzZSAnZGF0ZS10aW1lJzpcbiAgICAgICAgcmV0dXJuICdNdXNzIERhdHVtIG1pdCBaZWl0IGJlaW5oYWx0ZW4sIHouIEIuIFwiMjAwMC0wMy0xNFQwMTo1OVwiIG9kZXIgXCIyMDAwLTAzLTE0VDAxOjU5OjI2LjUzNVpcIic7XG4gICAgICBjYXNlICdlbWFpbCc6XG4gICAgICAgIHJldHVybiAnS2VpbmUgZ8O8bHRpZ2UgRS1NYWlsLUFkcmVzc2UgKHouIEIuIFwibmFtZUBleGFtcGxlLmNvbVwiKSc7XG4gICAgICBjYXNlICdob3N0bmFtZSc6XG4gICAgICAgIHJldHVybiAnS2VpbiBnw7xsdGlnZXIgSG9zdG5hbWUgKHouIEIuIFwiZXhhbXBsZS5jb21cIiknO1xuICAgICAgY2FzZSAnaXB2NCc6XG4gICAgICAgIHJldHVybiAnS2VpbmUgZ8O8bHRpZ2UgSVB2NC1BZHJlc3NlICh6LiBCLiBcIjEyNy4wLjAuMVwiKSc7XG4gICAgICBjYXNlICdpcHY2JzpcbiAgICAgICAgcmV0dXJuICdLZWluZSBnw7xsdGlnZSBJUHY2LUFkcmVzc2UgKHouIEIuIFwiMTIzNDo1Njc4OjlBQkM6REVGMDoxMjM0OjU2Nzg6OUFCQzpERUYwXCIpJztcbiAgICAgIC8vIFRPRE86IGFkZCBleGFtcGxlcyBmb3IgJ3VyaScsICd1cmktcmVmZXJlbmNlJywgYW5kICd1cmktdGVtcGxhdGUnXG4gICAgICAvLyBjYXNlICd1cmknOiBjYXNlICd1cmktcmVmZXJlbmNlJzogY2FzZSAndXJpLXRlbXBsYXRlJzpcbiAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgIHJldHVybiAnS2VpbmUgZ8O8bHRpZ2UgVVJMICh6LiBCLiBcImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vcGFnZS5odG1sXCIpJztcbiAgICAgIGNhc2UgJ3V1aWQnOlxuICAgICAgICByZXR1cm4gJ0tlaW5lIGfDvGx0aWdlIFVVSUQgKHouIEIuIFwiMTIzNDU2NzgtOUFCQy1ERUYwLTEyMzQtNTY3ODlBQkNERUYwXCIpJztcbiAgICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgICAgcmV0dXJuICdLZWluIGfDvGx0aWdlciBGYXJid2VydCAoei4gQi4gXCIjRkZGRkZGXCIgb2RlciBcInJnYigyNTUsIDI1NSwgMjU1KVwiKSc7XG4gICAgICBjYXNlICdqc29uLXBvaW50ZXInOlxuICAgICAgICByZXR1cm4gJ0tlaW4gZ8O8bHRpZ2VyIEpTT04tUG9pbnRlciAoei4gQi4gXCIvcG9pbnRlci90by9zb21ldGhpbmdcIiknO1xuICAgICAgY2FzZSAncmVsYXRpdmUtanNvbi1wb2ludGVyJzpcbiAgICAgICAgcmV0dXJuICdLZWluIGfDvGx0aWdlciByZWxhdGl2ZXIgSlNPTi1Qb2ludGVyICh6LiBCLiBcIjIvcG9pbnRlci90by9zb21ldGhpbmdcIiknO1xuICAgICAgY2FzZSAncmVnZXgnOlxuICAgICAgICByZXR1cm4gJ0tlaW4gZ8O8bHRpZ2VyIHJlZ3Vsw6RyZXIgQXVzZHJ1Y2sgKHouIEIuIFwiKDEtKT9cXFxcZHszfS1cXFxcZHszfS1cXFxcZHs0fVwiKSc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ011c3MgZGllc2VtIEZvcm1hdCBlbnRzcHJlY2hlbjogJyArIGVycm9yLnJlcXVpcmVkRm9ybWF0O1xuICAgIH1cbiAgfSxcbiAgbWluaW11bTogJ011c3MgbWluZGVzdGVucyB7e21pbmltdW1WYWx1ZX19IHNlaW4nLFxuICBleGNsdXNpdmVNaW5pbXVtOiAnTXVzcyBncsO2w59lciBhbHMge3tleGNsdXNpdmVNaW5pbXVtVmFsdWV9fSBzZWluJyxcbiAgbWF4aW11bTogJ0RhcmYgbWF4aW1hbCB7e21heGltdW1WYWx1ZX19IHNlaW4nLFxuICBleGNsdXNpdmVNYXhpbXVtOiAnTXVzcyBrbGVpbmVyIGFscyB7e2V4Y2x1c2l2ZU1heGltdW1WYWx1ZX19IHNlaW4nLFxuICBtdWx0aXBsZU9mOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBpZiAoKDEgLyBlcnJvci5tdWx0aXBsZU9mVmFsdWUpICUgMTAgPT09IDApIHtcbiAgICAgIGNvbnN0IGRlY2ltYWxzID0gTWF0aC5sb2cxMCgxIC8gZXJyb3IubXVsdGlwbGVPZlZhbHVlKTtcbiAgICAgIHJldHVybiBgTWF4aW1hbCAke2RlY2ltYWxzfSBEZXppbWFsc3RlbGxlbiBlcmxhdWJ0YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBNdXNzIGVpbiBWaWVsZmFjaGVzIHZvbiAke2Vycm9yLm11bHRpcGxlT2ZWYWx1ZX0gc2VpbmA7XG4gICAgfVxuICB9LFxuICBtaW5Qcm9wZXJ0aWVzOiAnTWluZGVzdGVucyB7e21pbmltdW1Qcm9wZXJ0aWVzfX0gQXR0cmlidXRlIGVyZm9yZGVybGljaCAoYWt0dWVsbDoge3tjdXJyZW50UHJvcGVydGllc319KScsXG4gIG1heFByb3BlcnRpZXM6ICdNYXhpbWFsIHt7bWF4aW11bVByb3BlcnRpZXN9fSBBdHRyaWJ1dGUgZXJsYXVidCAoYWt0dWVsbDoge3tjdXJyZW50UHJvcGVydGllc319KScsXG4gIG1pbkl0ZW1zOiAnTWluZGVzdGVucyB7e21pbmltdW1JdGVtc319IFdlcnRlIGVyZm9yZGVybGljaCAoYWt0dWVsbDoge3tjdXJyZW50SXRlbXN9fSknLFxuICBtYXhJdGVtczogJ01heGltYWwge3ttYXhpbXVtSXRlbXN9fSBXZXJ0ZSBlcmxhdWJ0IChha3R1ZWxsOiB7e2N1cnJlbnRJdGVtc319KScsXG4gIHVuaXF1ZUl0ZW1zOiAnQWxsZSBXZXJ0ZSBtw7xzc2VuIGVpbmRldXRpZyBzZWluJyxcbiAgLy8gTm90ZTogTm8gZGVmYXVsdCBlcnJvciBtZXNzYWdlcyBmb3IgJ3R5cGUnLCAnY29uc3QnLCAnZW51bScsIG9yICdkZXBlbmRlbmNpZXMnXG59O1xuIl19
