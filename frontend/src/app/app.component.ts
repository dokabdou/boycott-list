import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Reactive login state – updates automatically
  isLoggedIn = toSignal(this.authService.loggedIn$, { initialValue: false });

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
