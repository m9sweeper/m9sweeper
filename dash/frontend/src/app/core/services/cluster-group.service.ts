import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import { IClusterGroupUpdate } from '../entities/IClusterGroup';

@Injectable({
  providedIn: 'root'
})
export class ClusterGroupService {
  private currentGroupId = new Subject<number>();
  private updatedClusterGroup = new BehaviorSubject<IClusterGroupUpdate>(null);

  constructor(private httpClient: HttpClient) { }

  getClusterGroupById(id: number): Observable<any> {
    return this.httpClient.get(`/api/cluster-groups/${id}`);
  }

  createClusterGroup(clusterGroup: any): Observable<any> {
    return this.httpClient.post('/api/cluster-groups', clusterGroup);
  }

  deleteClusterGroup(id): Observable<any> {
    return this.httpClient.delete(`api/cluster-groups/${id}`);
  }

  updateClusterGroup(clusterGroup: any, id: number): Observable<any> {
    return this.httpClient.put(`/api/cluster-groups/${id}`, clusterGroup);
  }

  getClusterGroups(): Observable<any> {
    return this.httpClient.get(`/api/cluster-groups`);
  }

  setCurrentGroupId(groupId: number) {
    this.currentGroupId.next(groupId);
  }
  getCurrentGroupId() {
    return this.currentGroupId.asObservable();
  }

  setCurrentGroup(updatedClusterGroup: IClusterGroupUpdate) {
    this.updatedClusterGroup.next(updatedClusterGroup);
  }
  getCurrentGroup() {
    return this.updatedClusterGroup.asObservable();
  }

}
