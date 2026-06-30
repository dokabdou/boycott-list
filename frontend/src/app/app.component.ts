import { Component, inject, HostListener, OnInit, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { SearchService } from './services/search.service';
import { CommonModule } from '@angular/common';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private searchService = inject(SearchService);

  // Reactive login state – updates automatically
  isLoggedIn = toSignal(this.authService.loggedIn$, { initialValue: false });

  // Search term for the navbar search bar
  searchTerm = '';

  // Scroll‑to‑top button visibility (signal for zoneless reactivity)
  showScrollBtn = signal(false);

  // Toast message logic (keep if you use it)
  toastMessage: string | null = null;
  private timeoutRef: any;

  constructor() {}

  ngOnInit() {
    this.authService.initAuth();
  }

  /* @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollBtn.set(window.scrollY > 0);
  } */

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Search methods
  onSearchInput(term: string) {
    this.searchService.setSearchTerm(term);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchService.clearSearch();
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
    this.timeoutRef = setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }

  closeToast() {
    this.toastMessage = null;
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
