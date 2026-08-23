import {
  Component,
  inject,
  HostListener,
  OnInit,
  signal,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { SearchService } from './services/search.service';
import { CommonModule } from '@angular/common';

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

  isLoggedIn = this.authService.isLoggedIn;
  // Search term for the navbar search bar
  searchTerm = '';

  // Scroll‑to‑top button visibility (signal for zoneless reactivity)
  showScrollBtn = signal(false);

  toastMessage: string | null = null;
  private timeoutRef: any;

  // Button size (matches CSS width/height)
  private readonly BUTTON_SIZE = 48;

  // ----- Draggable Scroll‑to‑Top Button -----
  // Safe defaults for SSR
  btnX = signal(0);
  btnY = signal(0);
  isDragging = signal(false);
  private dragStartX = 0;
  private dragStartY = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /* toggleTheme() {
    this.themeService.toggle();
  } */

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.btnX.set(window.innerWidth - this.BUTTON_SIZE - 20);
      this.btnY.set(window.innerHeight - this.BUTTON_SIZE - 20);
    }
  }

  private clampPosition(value: number, max: number): number {
    return Math.min(Math.max(value, 0), max - this.BUTTON_SIZE);
  }

  // Prevent text selection while dragging
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (this.isDragging()) {
      e.preventDefault();
      let newX = e.clientX - this.dragStartX;
      let newY = e.clientY - this.dragStartY;
      // Clamp inside viewport
      newX = this.clampPosition(newX, window.innerWidth);
      newY = this.clampPosition(newY, window.innerHeight);
      this.btnX.set(newX);
      this.btnY.set(newY);
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.isDragging.set(false);
    document.body.style.userSelect = '';
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(e: TouchEvent) {
    if (this.isDragging()) {
      const touch = e.touches[0];
      let newX = touch.clientX - this.dragStartX;
      let newY = touch.clientY - this.dragStartY;
      // Clamp inside viewport
      newX = this.clampPosition(newX, window.innerWidth);
      newY = this.clampPosition(newY, window.innerHeight);
      this.btnX.set(newX);
      this.btnY.set(newY);
    }
  }

  @HostListener('window:touchend')
  onTouchEnd() {
    this.isDragging.set(false);
    document.body.style.userSelect = '';
  }

  @HostListener('window:resize')
  onResize() {
    if (!isPlatformBrowser(this.platformId)) return;
    // Re‑clamp current positions after resize
    this.btnX.set(this.clampPosition(this.btnX(), window.innerWidth));
    this.btnY.set(this.clampPosition(this.btnY(), window.innerHeight));
  }

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    this.dragStartX = clientX - this.btnX();
    this.dragStartY = clientY - this.btnY();
    this.isDragging.set(true);
    document.body.style.userSelect = 'none';
  }

  scrollToTop() {
    if (!this.isDragging()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollBtn.set(window.scrollY > 0);
  } */

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
    this.authService.logout().subscribe({
      next: () => {
        // Signal automatically set to false by the service
        this.router.navigate(['/']);
      },
      error: () => {
        // Still navigate even on error (cookie might be stale)
        this.router.navigate(['/']);
      },
    });
  }
}
