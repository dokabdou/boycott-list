import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  searchTerm: WritableSignal<string> = signal('');

  setSearchTerm(term: string) {
    this.searchTerm.set(term.trim().toLowerCase());
  }

  clearSearch() {
    this.searchTerm.set('');
  }
}
