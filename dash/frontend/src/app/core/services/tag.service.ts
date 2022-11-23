import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {IServerResponse} from '../entities/IServerResponse';
import {ITag} from '../entities/ITag';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private httpClient: HttpClient) { }

  getAllTags(): Observable<IServerResponse<ITag[]>> {
    return this.httpClient.get('/api/tags');
  }
  createTag(tag: any): Observable<any> {
    return this.httpClient.post('/api/tags', tag);
  }
  deleteTag(id: number, clusterId: number) {
    console.log('Tag id for DEL: ', id);
    return this.httpClient.delete(`/api/tags/${id}/${clusterId}`);
  }
}
