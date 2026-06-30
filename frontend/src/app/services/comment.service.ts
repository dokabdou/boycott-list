import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private publicUrl = '/api/public';

  constructor(private http: HttpClient) {}

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.publicUrl}/posts/${postId}/comments`);
  }

  addComment(
    postId: string,
    comment: { author: string; content: string; parentId: string | null },
  ): Observable<Comment> {
    return this.http.post<Comment>(`${this.publicUrl}/posts/${postId}/comments`, comment);
  }

  updateComment(id: string, content: string): Observable<Comment> {
    return this.http.put<Comment>(`/api/admin/comments/${id}`, { content });
  }

  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`/api/admin/comments/${id}`);
  }
}
