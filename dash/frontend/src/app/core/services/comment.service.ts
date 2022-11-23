import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { IServerResponse } from '../entities/IServerResponse';
import { IComment } from '../entities/IComment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private httpClient: HttpClient) { }

  getAllComments(exceptionId: number): Observable<IComment[]> {
    return this.httpClient.get<IServerResponse<IComment[]>>(`/api/comments/exception/${exceptionId}`)
      .pipe(
        map(response => response.data),
        shareReplay<IComment[]>()
      );
  }

  createComment(comment: IComment): Observable<{ id: number }[]> {
    return this.httpClient.post<IServerResponse<{ id: number }[]>>('/api/comments', comment)
      .pipe(
        map(response => response.data),
        shareReplay()
      );
  }

  deleteComment(commentId: number): Observable<{ id: number }> {
    return this.httpClient.delete<IServerResponse<{ id: number }>>(`/api/comments/${commentId}`)
      .pipe(
        map(response => response.data)
      );
  }
}
