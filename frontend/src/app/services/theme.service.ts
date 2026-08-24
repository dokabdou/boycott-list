/* import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Run browser‑only logic only if we are in the browser
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        this.setDark(true);
      } else if (saved === 'light') {
        this.setDark(false);
      } else {
        // Use system preference
        //const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        //this.setDark(prefersDark);
		this.setDark(false);
      }

      // Listen for OS changes (only in browser)
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === null) {
          this.setDark(e.matches);
        }
      });
    }
    // On server, isDark remains false (light theme default) – that’s fine.
  }

  toggle(): void {
    // Toggling works fine on both server and browser because setDark handles DOM only when safe.
    this.setDark(!this.isDark());
  }

  private setDark(dark: boolean): void {
    this.isDark.set(dark);
    // Manipulate DOM and localStorage only in the browser
    if (isPlatformBrowser(this.platformId)) {
      if (dark) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      }
    }
  }
}
 */
