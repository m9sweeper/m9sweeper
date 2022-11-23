import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IServerResponse} from '../entities/IServerResponse';
import {IFile} from '../entities/IFile';

@Injectable({
  providedIn: 'root'
})
export class FileManagementService {

  constructor(private httpClient: HttpClient) { }

  upload(formData: FormData): Observable<IServerResponse<IFile[]>> {
    return this.httpClient.post('/common/file-management/upload', formData);
  }

}
