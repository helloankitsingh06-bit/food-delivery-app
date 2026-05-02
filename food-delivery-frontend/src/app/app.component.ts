import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { routeAnimations } from './route-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [routeAnimations]
})
export class AppComponent {

  showNavbar = true;
  isLoggedIn = false;

  constructor(private router: Router) {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

        const url = event.urlAfterRedirects;

        // 🔥 HIDE NAVBAR ON AUTH + PROFILE PAGES
        this.showNavbar =
          !(url.includes('login') ||
            url.includes('register') ||
            url.includes('profile'));

        // 🔥 CHECK LOGIN STATE
        this.isLoggedIn = !!localStorage.getItem('token');
      }
    });

  }

  // 🎬 ROUTE ANIMATION (SAFE)
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] || '';
  }

}