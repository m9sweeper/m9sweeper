import { HttpClient , HttpParams} from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import {ImagesAndCount, IImage, IScanResult, IImageScanData} from '../entities/IImage';
import { IServerResponse } from '../entities/IServerResponse';
import {MatSort} from '@angular/material/sort';
import { map, retry, share, switchMap, takeUntil } from 'rxjs/operators';
import { FormatDate } from '../../modules/shared/format-date/format-date';
import {ICountOfVulnerabilities} from "../entities/ICountOfVulnerabilities";

@Injectable({
  providedIn: 'root'
})
export class ImageService implements OnDestroy{
  private stopPolling = new Subject();
  constructor(private httpClient: HttpClient) {}

  getAllCurrentImagesByPodName(
    podName: string, clusterId: number, namespace: string,
    limit = 10, page = 10,
  ): Observable<IServerResponse<ImagesAndCount>> {
    return this.httpClient.get(`/api/clusters/${clusterId}/images/by-pod`, {
      params: new HttpParams()
        .set('namespace', namespace)
        .set('podName', podName)
        .set('limit', limit.toString())
        .set('page', page.toString()),
    });
  }

  getImagesByPodNameAndSelectedDate(
    podName: string, clusterId: number, namespace: string,
    startTime: number, endTime: number,
    sort: MatSort,
    limit = 10, page = 10
  ): Observable<IServerResponse<ImagesAndCount>> {
    const {active, direction} = sort;
    const formattedStartTime =  FormatDate.formatLastScannedDate(startTime).split(' ')[0];
    const formattedEndTime =  FormatDate.formatLastScannedDate(endTime).split(' ')[0];
    return this.httpClient.get(`/api/clusters/${clusterId}/images/by-pod/history`,
      {params: new HttpParams()
          .set('namespace', namespace).set('podName', podName)
          .set('startTime', formattedStartTime).set('endTime', formattedEndTime)
          .set('limit', limit.toString()).set('page', page.toString())
          .set('sort[field]', active).set('sort[direction]', direction)
      }
    );
  }

  getImage(clusterId: number, imageId: number): Observable<IServerResponse<IImage>> {
    return this.httpClient.get(`api/clusters/${clusterId}/image/${imageId}`);
  }

  getImageModuleByClusterId(clusterId: number): Observable<IServerResponse<ImagesAndCount>> {
    return this.httpClient.get(`/api/clusters/${clusterId}/images`);
  }

  postImageModule(clusterId: number, image: any): Observable<any>{
    return this.httpClient.post(`/api/clusters/${clusterId}/images`, image);
  }

  searchImageUnderClusterId(clusterId: number, searchTerm: string, cve = '', running = false,
                            page: number, limit: number, sort: MatSort):
    Observable<IServerResponse<{totalCount: number, list: IImage[]}>>{
    const  url = `/api/clusters/${clusterId}/images/search`;
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('cve', cve)
      .set('running', String(running))
      .set(`page`, String(page))
      .set(`limit`, String(limit))
      .set(`sort[field]`, sort.active)
      .set(`sort[direction]`, sort.direction);
    return this.httpClient.get(url, {params});
  }

  getImageByImageId(clusterId: number, imageId: number): Observable<IServerResponse<IImage>>{
    return this.httpClient.get(`/api/clusters/${clusterId}/images/${imageId}`);
  }

  updateImageModuleInfo(clusterId: number, image: any): Observable<any>{
    return this.httpClient.put(`/api/clusters/${clusterId}/images`, image);
  }

  deleteImageModule(clusterId: number, imageId: number): Observable<any>{
    return this.httpClient.delete(`/api/clusters/${clusterId}/images/${imageId}`);
  }

  scanImageModule(clusterId: number, imageScanIds: any): Observable<any>{
    return this.httpClient.post(`/api/clusters/${clusterId}/images/scan`, imageScanIds);
  }

  getImageDetails(clusterId: number, imageId: number): Observable<IServerResponse<IImage>>{
    return this.httpClient.get(`/api/clusters/${clusterId}/images/${imageId}`);
  }

  getScanImageScannerDetails(clusterId: number, imageId: number, scannerId: number): Observable<IServerResponse<IScanResult>>{
    return this.httpClient.get(`/api/clusters/${clusterId}/images/${imageId}/scanners/${scannerId}`);
  }

  getImageScanDataByImageId(imageId: number, scanDate: number, limit: number, page: number, sort: MatSort): Observable<IServerResponse<{totalCount: number, list: IImageScanData[]}>> {
    let active: string;
    let direction: string;
    if (sort) {
      active = sort.active;
      direction = sort.direction;
    }
    else {
      active = 'policy';
      direction = 'asc';
    }
    const url = `/api/clusters/images/${imageId}/trawler/scan/results?scanDate=${scanDate}&page=${page}&limit=${limit}&sort[field]=${active}&sort[direction]=${direction}`;
    return this.httpClient.get(url);
  }

  getCountOfImageScanData(imageId: number): Observable<IServerResponse<number>> {
    return this.httpClient.get(`/api/clusters/images/${imageId}/trawler/scan/results/count`);
  }

  getCountOfFilteredImages(filterBy: {clusterId: number, runningInCluster?: boolean}): Observable<IServerResponse<any>>{
    let params = new HttpParams();
    Object.keys(filterBy).forEach(key => {
      let value = filterBy[key];
      if (key === 'runningInCluster') {
        value = +filterBy[key];
      }
      params = params.set(`filters[${key}]`, value);
    });
    return this.httpClient.get(`/api/clusters/images/summary`, {params});
  }

  getTotalVulnerabilities(clusterId: number, filterBy: { startDate?: string; endDate?: string; }): Observable<IServerResponse<number>> {
    let params = new HttpParams();
    Object.keys(filterBy).forEach(key => {
      const value = filterBy[key];
      params = params.set(`filters[${key}]`, value);
    });
    return this.httpClient.get(`/api/clusters/${clusterId}/summary/vulnerabilities`, {params});
  }

  getPolicyViolationCount(clusterId: number): Observable<IServerResponse<number>> {
    return this.httpClient.get(`/api/clusters/${clusterId}/summary/policy-violations`);
  }

  getCountOfImageScan(clusterId: Array<number>): Observable<IServerResponse<any>> {
    let params = new HttpParams();
    clusterId.forEach((value, key) => {
      params = params.set(`clusterIds[clusterId][${key}]`, String(value));
    });
    return this.httpClient.get(`/api/clusters/image-scan/count`,
      {params});
  }

  getCountOfVulnerabilities(filters: any, groupBy: string): Observable<IServerResponse<ICountOfVulnerabilities[]>> {
    let params = new HttpParams();
    params = params.set(`group_by`, String(groupBy));
    Object.keys(filters).forEach((filterKey) => {
      if (filterKey === 'clusterIds') {
        filters[filterKey].forEach((value, key) => {
          params = params.set(`filters[clusterId][${key}]`, String(value));
        });
      } else if (filterKey === 'namespace') {
        filters[filterKey].forEach((value, key) => {
          params = params.set(`filters[namespace][${key}]`, String(value));
        });
      } else {
        params = params.set(`filters[${filterKey}]`, String(filters[filterKey]));
      }
    });

    return this.httpClient.get(`/api/clusters/images/summary/vulnerabilities`,
      {params});
  }

  getImageScanDates(imageId: number): Observable<IServerResponse<{created_at: number}[]>> {
    let params = new HttpParams();
    params = params.set('imageId', String(imageId));
    return this.httpClient.get(`api/clusters/images/image-scan-dates`, {params});
  }

  getNamespaceByImageHash(imageHash: string): Observable<IServerResponse<{namespace: string }[]>> {
    return this.httpClient.get(`api/clusters/namespace/by/${imageHash}`);
  }

  getImageScanQueueStatus(imageId: number): Observable<boolean> {
    return timer(1, 15000)
      .pipe(
        switchMap(() => this.httpClient.get<IServerResponse<boolean>>(`api/clusters/images/${imageId}/scan-queue-status`)),
        map(response => response.data),
        retry(),
        // tap(console.log),
        share(),
        takeUntil(this.stopPolling)
      );
  }

  ngOnDestroy() {
    this.stopPolling.next();
  }
}
