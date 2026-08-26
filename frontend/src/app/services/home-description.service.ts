import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HomeDescriptionService {
	private publicUrl = '/api/public/home-description';
	private adminUrl = '/api/admin/home-description';

	constructor(private http: HttpClient) {}

	getHomeDescription(): Observable<{ content: string }> {
		return this.http.get<{ content: string }>(this.publicUrl);
	}

	updateHomeDescription(content: string): Observable<{ content: string }> {
		return this.http.put<{ content: string }>(this.adminUrl, { content });
	}
}
