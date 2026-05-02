import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.css']
})
export class SplashScreenComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log("Premium Splash screen initialized...");

    // Set to 8 seconds (8000ms) as requested
    setTimeout(() => {
      console.log("Redirecting to login...");
      this.router.navigateByUrl('/login');
    }, 8000);
  }
}