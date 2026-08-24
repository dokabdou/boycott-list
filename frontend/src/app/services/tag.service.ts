import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Tag } from '../models/tag.model';

@Injectable({ providedIn: 'root' })
export class TagService {
	private publicUrl = '/api/public/tags';
	private adminUrl = '/api/admin/tags';

	constructor(private http: HttpClient) {}

	// --- Public

	getTags(): Observable<string[]> {
		const response = this.http
			.get<Tag[]>(`${this.publicUrl}/approved`)
			.pipe(map((tags) => tags.map((tag) => tag.name)));
		//console.log('Tags:', response);
		return response;
	}

	// --- Admin
	createTag(name: string): Observable<Tag> {
		const tag: Tag = { name, approved: true };
		const response = this.http.post<Tag>(`${this.adminUrl}/create`, tag);
		//console.log('Tag created:', response);
		return response;
	}

	createMultipleTags(names: string[]): Observable<Tag[]> {
		const tags: Tag[] = names.map((name) => ({ name, approved: true }));
		const response = this.http.post<Tag[]>(`${this.adminUrl}/create-multiple`, { tags });
		//console.log('Multiple tags created:', response);
		return response;
	}

	getAdminTags(): Observable<Tag[]> {
		return this.http.get<Tag[]>(`${this.publicUrl}/approved`);
	}

	editTag(id: string, newName: string): Observable<Tag> {
		/* const response = this.http.put<Tag>(`${this.adminUrl}/${id}`, { name: newName });
    console.log('Tag edited:', response);
    return response; */
		return this.http.put<Tag>(`${this.adminUrl}/${id}`, newName, {
			headers: { 'Content-Type': 'text/plain' },
		});
	}

	deleteTag(id: string): Observable<void> {
		const response = this.http.delete<void>(`${this.adminUrl}/${id}`);
		//console.log('Tag deleted:', response);
		return response;
	}

	deleteMultipleTags(ids: string[]): Observable<void> {
		const tags: Tag[] = ids.map((id) => ({ id, name: '', approved: true }));
		const response = this.http.post<void>(`${this.adminUrl}/deleteSelected`, { tags });
		//console.log('Multiple tags deleted:', response);
		return response;
	}

	deleteAllTags(): Observable<void> {
		const response = this.http.delete<void>(`${this.adminUrl}/deleteAll`);
		//console.log('All tags deleted:', response);
		return response;
	}
}
