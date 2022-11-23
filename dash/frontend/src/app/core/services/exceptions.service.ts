import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ExceptionCreateDto} from '../../../../../backend/src/modules/exceptions/dto/exceptioncreateDto';

@Injectable({
  providedIn: 'root'
})

export class ExceptionsService {
  constructor(private httpClient: HttpClient) {}

  createException(data: ExceptionCreateDto): Observable<any>{
    console.log('Creating Exception', data);
    return this.httpClient.post('/api/exceptions/create', data);
  }
  getAllExceptions(): Observable<any>{
    return this.httpClient.get('/api/exceptions');
  }
  getExceptionById(id: number): Observable<any>{
    return this.httpClient.get(`/api/exceptions/${id}`);
  }
  deleteExceptionById(id: number): Observable<any>{
    return this.httpClient.delete(`api/exceptions/${id}`);
  }
  updateExceptionById(data: ExceptionCreateDto, id: number): Observable<any> {
    return this.httpClient.put(`api/exceptions/${id}`, data);
  }
}
