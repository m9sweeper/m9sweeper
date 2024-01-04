import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  constructor(
  ) {}

  downloadCsvFile(csvData: string, filename: string) {
    const payload = `data:text/csv;charset=utf-8,${csvData}`;
    const encoded = encodeURI(payload).replace(/#/g, '%23');
    const encodedFilename = encodeURI(filename);

    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', encodedFilename);
    link.setAttribute('hidden', '');

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
