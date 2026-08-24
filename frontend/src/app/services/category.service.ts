import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
	private adminUrl = '/api/admin/categories';
	private publicUrl = '/api/public/categories';

	constructor(private http: HttpClient) {}

	// ----- Public

	getCategories(): Observable<string[]> {
		const categories = this.http
			.get<Category[]>(`${this.publicUrl}`)
			.pipe(map((cats) => cats.map((c) => c.name)));
		//console.log('Categories:', categories);
		return categories;
	}

	// ----- Admin

	createCategory(name: string): Observable<Category> {
		const cat: Category = { name, approved: true };
		const category = this.http.post<Category>(`${this.adminUrl}/create`, cat);
		//console.log('Category created:', category);
		return category;
	}

	createMultipleCategories(names: string[]): Observable<void> {
		const categories: Category[] = names.map((name) => ({ name, approved: true }));
		const response = this.http.post<void>(`${this.adminUrl}/create-multiple`, { categories });
		//console.log('Multiple categories created:', response);
		return response;
	}

	editCategory(id: string, newName: string): Observable<Category> {
		/* const category = this.http.put<Category>(`${this.adminUrl}/${id}`, { name: newName });
    console.log('Category edited:', category);
    return category; */
		return this.http.put<Category>(`${this.adminUrl}/${id}`, newName, {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	getAdminCategories(): Observable<Category[]> {
		return this.http.get<Category[]>(this.publicUrl);
	}

	deleteCategory(id: string): Observable<void> {
		const response = this.http.delete<void>(`${this.adminUrl}/${id}`);
		//console.log('Category deleted:', response);
		return response;
	}

	deleteMultipleCategories(ids: string[]): Observable<void> {
		const categories: Category[] = ids.map((id) => ({ id, name: '', approved: true }));
		const response = this.http.post<void>(`${this.adminUrl}/deleteSelected`, { categories });
		//console.log('Multiple categories deleted:', response);
		return response;
	}

	deleteAllCategories(): Observable<void> {
		const categories = this.http.delete<void>(`${this.adminUrl}/deleteAll`);
		//console.log('All categories deleted:', categories);
		return categories;
	}
}
