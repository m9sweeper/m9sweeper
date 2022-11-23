import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { IServerResponse } from '../entities/IServerResponse';
import { IDockerRegistries } from '../entities/IDockerRegistries';
import {MatSort} from '@angular/material/sort';

@Injectable({
  providedIn: 'root'
})
export class DockerRegistriesService {

  constructor(private httpClient: HttpClient) { }
  readonly baseUrl = '/api/docker-registries';

  getAllDockerRegistries(page?: number, limit?: number, sort?: MatSort):
    Observable<IServerResponse<{totalCount: number, list: IDockerRegistries[]}>> {
    let params = new HttpParams();
    if (page) { params = params.set('page', page); }
    if (limit) { params = params.set('limit', limit); }
    if (sort) {
      const {active, direction} = sort;
      params = params.set('sort-field', active);
      params = params.set('sort-direction', direction);
    }
    return this.httpClient.get(this.baseUrl, {params});
  }

  createDockerRegistry(dockerRegistries: any): Observable<any> {
    return this.httpClient.post(this.baseUrl, dockerRegistries);
  }

  updateDockerRegistry(dockerRegistries: any, id: number): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/${id}`, dockerRegistries);
  }

  getDockerRegistryById(id: number): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/${id}`);
  }

  deleteDockerRegistryId(id: number){
    return this.httpClient.delete(`${this.baseUrl}/${id}`);
  }
}
