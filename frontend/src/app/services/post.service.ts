import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private publicUrl = '/api/public';
  private adminUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  submitAnonymous(post: Post): Observable<Post> {
    console.log('Submitting anonymous post:', post);
    const postToSubmit = this.http.post<Post>(`${this.publicUrl}/submit`, post);
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

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.publicUrl}/categories`);
  }

  /**
   * Builds and submits a post.
   * @param formValue the raw form values (companyName, description, sourceLinks, category)
   * @param selectedTags extra tags selected by the user
   * @param highlightBoxes highlights array of arrays
   * @param isAdmin if true, the post is auto‑approved and sent to admin endpoint
   */
  submitPost(
    formValue: any,
    selectedTags: string[],
    highlightBoxes: string[][],
    isAdmin: boolean = false,
  ): Observable<Post> {
    const companyName = (formValue.companyName || '').trim();
    const category = (formValue.category || '').trim();
    const tagsFromInput = [...selectedTags];

    // Helper to add a unique tag (case‑insensitive)
    const addUnique = (tag: string) => {
      if (!tag) return;
      if (!tagsFromInput.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        tagsFromInput.push(tag);
      }
    };

    // Ensure company name is the first tag
    const existingIndex = tagsFromInput.findIndex(
      (t) => t.toLowerCase() === companyName.toLowerCase(),
    );
    if (existingIndex >= 0) {
      tagsFromInput.splice(existingIndex, 1);
    }
    tagsFromInput.unshift(companyName);

    // Add category as a tag (if not already present and not the company name)
    if (category && category.toLowerCase() !== companyName.toLowerCase()) {
      addUnique(category);
    }

    const post: Post = {
      companyName,
      category,
      description: formValue.description,
      sourceLinks: formValue.sourceLinks,
      tags: tagsFromInput,
      highlights: highlightBoxes.filter((box) => box.length > 0),
    };

    if (isAdmin) {
      return this.http.post<Post>(`${this.adminUrl}/posts`, post);
    }
    return this.http.post<Post>(`${this.publicUrl}/submit`, post);
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

  // editing
  buildEditPayload(formValue: any, postId: string): Post {
    const tags: string[] = formValue.tags
      ? formValue.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter((t: string) => t.length > 0)
      : [];

    const highlights: string[][] = formValue.highlights
      ? formValue.highlights
          .split('\n')
          .map((line: string) =>
            line
              .split('|')
              .map((item: string) => item.trim())
              .filter((item: string) => item.length > 0),
          )
          .filter((box: string[]) => box.length > 0)
      : [];

    return {
      id: postId,
      companyName: formValue.companyName || '',
      category: formValue.category || '',
      description: formValue.description || '',
      sourceLinks: formValue.sourceLinks || [],
      tags,
      highlights,
    };
  }
}
