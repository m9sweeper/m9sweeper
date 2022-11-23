import {Injectable} from '@nestjs/common';

@Injectable()
export class CsvService {

    /** Build a CSV line from an array of column entries, escaping them as needed. Entries
     * that represent an array of values should be joined as a comma-separated string beforehand */
    buildLine(fields: Array<string>): string {
        return fields
            .map((field) => this.escapeString(field))
            .join(',');
    }

    /** Takes a string meant for a single column and escapes special characters if necessary */
    escapeString(field: string): string {
        if (/[,"]/gm.test(field)) {
            const retstring = field.replace(/"/g, '""');
            return `"${retstring}"`
        } else {
            return field;
        }
    }
}
