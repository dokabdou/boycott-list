import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Suggestion } from '../models/suggestion.model';

@Injectable({ providedIn: 'root' })
export class SuggestionService {
	private publicUrl = '/api/public';

	constructor(private http: HttpClient) {}

	getAllSuggestions(): Observable<Suggestion[]> {
		return this.http.get<Suggestion[]>('/api/admin/suggestions');
	}

	getSuggestions(postId: string): Observable<Suggestion[]> {
		return this.http.get<Suggestion[]>(`${this.publicUrl}/posts/${postId}/suggestions`);
	}

	addSuggestion(postId: string, author: string, content: string): Observable<Suggestion> {
		return this.http.post<Suggestion>(`${this.publicUrl}/posts/${postId}/suggestions`, {
			author,
			content,
		});
	}

	updateSuggestion(id: string, content: string): Observable<Suggestion> {
		return this.http.put<Suggestion>(`/api/admin/suggestions/${id}`, { content });
	}

	deleteSuggestion(id: string): Observable<void> {
		return this.http.delete<void>(`/api/admin/suggestions/${id}`);
	}
}
