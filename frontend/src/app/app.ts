import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  showLandingPage = true;

  constructor(private router: Router, private authService: AuthService) {
    // Show landing page only for root route when not authenticated
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe(event => {
      this.showLandingPage = event.url === '/' || event.url === '';
    });

    // Hide landing page if user is authenticated and on root
    this.authService.currentUser$.subscribe(user => {
      if (user && (this.router.url === '/' || this.router.url === '')) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  openLogin() {
    this.router.navigate(['/login']);
  }

  openRegister() {
    this.router.navigate(['/register']);
  }
}
