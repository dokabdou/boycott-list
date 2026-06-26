import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model'; // define interface

@Injectable({ providedIn: 'root' })
export class PostService {
  private publicUrl = '/api/public';
  private adminUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  submitAnonymous(post: Post): Observable<Post> {
	console.log('Submitting anonymous post:', post);
	const postToSubmit =  this.http.post<Post>(`${this.publicUrl}/submit`, post);
	console.log('Post submitted:', postToSubmit);
	return postToSubmit;
  }

  getApprovedPosts(): Observable<Post[]> {
	console.log('Fetching approved posts');
    const approvedPosts = this.http.get<Post[]>(`${this.publicUrl}/posts`);
	console.log('Approved posts:', approvedPosts);
    return approvedPosts;
  }

  getPendingPosts(): Observable<Post[]> {
    const pendingPosts = this.http.get<Post[]>(`${this.adminUrl}/pending`);
	console.log('Pending posts:', pendingPosts);
    return pendingPosts;
  }

  approvePost(id: string): Observable<Post> {
	console.log('Approving post with ID:', id);
	const postToApprove = this.http.put<Post>(`${this.adminUrl}/approve/${id}`, {});
	console.log('Post approved:', postToApprove);
    return postToApprove;
  }

  rejectPost(id: string): Observable<Post> {
	console.log('Rejecting post with ID:', id);
    const postToReject = this.http.put<Post>(`${this.adminUrl}/reject/${id}`, {});
	console.log('Post rejected:', postToReject);
    return postToReject;
  }

  submitAdminPost(post: Post): Observable<Post> {
	console.log('Submitting admin post:', post);
    return this.http.post<Post>(`${this.adminUrl}/posts`, post);
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.publicUrl}/posts/${id}`);
  }

  editPost(id: string, post: Post): Observable<Post> {
	console.log('Editing post with ID:', id, 'New data:', post);
	return this.http.put<Post>(`${this.adminUrl}/posts/${id}`, post);
  }

  deletePost(id: string): Observable<void> {
	console.log('Deleting post with ID:', id);
	return this.http.delete<void>(`${this.adminUrl}/posts/${id}`);
  }
}
