import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
	private publicUrl = '/api/public';
	private adminUrl = '/api/admin';

	constructor(private http: HttpClient) {}

	// -------- Helper to convert objects to strings ----------
	private mapPost(post: Post): Post {
		// Extract the name from category (if it’s an object) or keep the string
		const category = (post.category as any)?.name ?? post.category ?? '';
		// Extract the name from each tag (if they are objects) or keep the string
		const tags = (post.tags ?? []).map((t: any) => t.name ?? t);

		return { ...post, category, tags };
	}

	// -------- Public ----------
	submitAnonymous(post: Post): Observable<Post> {
		return this.http.post<Post>(`${this.publicUrl}/submit`, post);
	}

	getApprovedPosts(): Observable<Post[]> {
		return this.http
			.get<Post[]>(`${this.publicUrl}/posts`)
			.pipe(map((posts) => posts.map((p) => this.mapPost(p))));
	}

	getPostById(id: string): Observable<Post> {
		return this.http
			.get<Post>(`${this.publicUrl}/posts/${id}`)
			.pipe(map((p) => this.mapPost(p)));
	}

	submitPost(
		formValue: any,
		selectedTags: string[],
		highlightBoxes: string[][],
		isAdmin: boolean = false,
	): Observable<Post> {
		const companyName = (formValue.companyName || '').trim();
		const category = (formValue.category || '').trim();
		const tagsFromInput = [...selectedTags];

		const addUnique = (tag: string) => {
			if (!tag) return;
			if (!tagsFromInput.some((t) => t.toLowerCase() === tag.toLowerCase())) {
				tagsFromInput.push(tag);
			}
		};

		const existingIndex = tagsFromInput.findIndex(
			(t) => t.toLowerCase() === companyName.toLowerCase(),
		);
		if (existingIndex >= 0) tagsFromInput.splice(existingIndex, 1);
		tagsFromInput.unshift(companyName);

		if (category && category.toLowerCase() !== companyName.toLowerCase()) {
			addUnique(category);
		}

		const post: Post = {
			companyName,
			category, // still a string – the backend will deserialize it
			description: formValue.description,
			sourceLinks: formValue.sourceLinks,
			tags: tagsFromInput,
			highlights: highlightBoxes.filter((box) => box.length > 0),
		};

		const url = isAdmin ? `${this.adminUrl}/posts` : `${this.publicUrl}/submit`;
		return this.http.post<Post>(url, post);
	}

	// -------- Admin ----------
	getPendingPosts(): Observable<Post[]> {
		return this.http
			.get<Post[]>(`${this.adminUrl}/pending`)
			.pipe(map((posts) => posts.map((p) => this.mapPost(p))));
	}

	approvePost(id: string): Observable<Post> {
		return this.http.put<Post>(`${this.adminUrl}/approve/${id}`, {});
	}

	rejectPost(id: string): Observable<Post> {
		return this.http.put<Post>(`${this.adminUrl}/reject/${id}`, {});
	}

	editPost(id: string, post: Post): Observable<Post> {
		const result = this.http.put<Post>(`${this.adminUrl}/posts/${id}`, post).pipe(
			map((p) => this.mapPost(p)), // convert objects to strings
		);
		//console.log('url:', `${this.adminUrl}/posts/${id}`);
		//console.log('Edit Post Request:', { id, post, result });
		return result;
	}

	getAllPosts(): Observable<Post[]> {
		return this.http
			.get<Post[]>(`${this.adminUrl}/posts`)
			.pipe(map((posts) => posts.map((p) => this.mapPost(p))));
	}

	deletePost(id: string): Observable<void> {
		return this.http.delete<void>(`${this.adminUrl}/posts/${id}`);
	}

	deletePosts(ids: string[]): Observable<void> {
		return this.http.delete<void>(`${this.adminUrl}/posts/bulk`, { body: ids });
	}

	buildEditPayload(formValue: any, postId: string): Post {
		const tags: string[] = formValue.tags
			? formValue.tags
					.split(',')
					.map((t: string) => t.trim())
					.filter((t: string) => t)
			: [];

		const highlights: string[][] = formValue.highlights
			? formValue.highlights
					.split('\n')
					.map((line: string) =>
						line
							.split('|')
							.map((item: string) => item.trim())
							.filter((item) => item),
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

	// Import Export posts
	exportAllPosts(): Observable<Post[]> {
		return this.http.get<Post[]>(`${this.adminUrl}/export/posts`);
	}

	importSinglePost(post: Post): Observable<Post> {
		return this.http.post<Post>(`${this.adminUrl}/import/single`, post);
	}

	importBulkPosts(posts: Post[]): Observable<Post[]> {
		return this.http.post<Post[]>(`${this.adminUrl}/import/bulk`, posts);
	}
}
