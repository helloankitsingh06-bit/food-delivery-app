import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import lottie from 'lottie-web';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {

  // =========================
  // 🎯 VIEW REFERENCES
  // =========================
  @ViewChild('card') card!: ElementRef;
  @ViewChild('lottie') lottieEl!: ElementRef;
  @ViewChild('successLottie') successLottie!: ElementRef;

  // =========================
  // 📦 DATA
  // =========================
  credentials = {
    email: '',
    password: ''
  };

  loading = false;
  errorMessage = '';
  rememberMe = true; // 🔥 ALWAYS TRUE (important for token)
  showPassword = false;

  // 🔥 SUCCESS STATE
  loginSuccess = false;

  // =========================
  // 🧠 INTERNAL
  // =========================
  private mainAnimation: any;
  private successAnimation: any;
  private mouseMoveHandler: any;
  private mouseLeaveHandler: any;

  constructor(
    private http: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.loadMainAnimation();
    this.init3DTilt();
  }

  // =========================
  // 🎬 MAIN LOTTIE
  // =========================
  loadMainAnimation(): void {
    if (!this.lottieEl) return;

    this.mainAnimation = lottie.loadAnimation({
      container: this.lottieEl.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/login-animation.json'
    });
  }

  // =========================
  // 🎉 SUCCESS LOTTIE
  // =========================
  loadSuccessAnimation(): void {
    if (!this.successLottie) return;

    this.successAnimation = lottie.loadAnimation({
      container: this.successLottie.nativeElement,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: 'assets/success-animation.json'
    });
  }

  // =========================
  // 🎮 3D TILT EFFECT
  // =========================
  init3DTilt(): void {
    const card = this.card?.nativeElement;
    if (!card) return;

    this.mouseMoveHandler = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateX = -(y / rect.height - 0.5) * 10;
      const rotateY = (x / rect.width - 0.5) * 10;

      card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.02)
      `;
    };

    this.mouseLeaveHandler = () => {
      card.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        scale(1)
      `;
    };

    card.addEventListener('mousemove', this.mouseMoveHandler);
    card.addEventListener('mouseleave', this.mouseLeaveHandler);
  }

  // =========================
  // 🔐 LOGIN
  // =========================
  onSubmit(): void {

    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.login(this.credentials).subscribe({

      next: (response: any) => {
        console.log('Login response:', response); // DEBUG
        
        // ✅ FIX: Backend returns {user: {...}, token: '...'}
        const user = response.user;  // Get the user object from response
        const token = response.token;
        
        // Save token
        if (token) {
          localStorage.setItem('token', token);
        }
        
        // ✅ Save user data properly from response.user
        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          username: user.username
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Saved user data:', localStorage.getItem('user')); // DEBUG
        
        // 🎉 SHOW SUCCESS UI
        this.loginSuccess = true;

        setTimeout(() => this.loadSuccessAnimation(), 100);

        // 🚀 REDIRECT AFTER ANIMATION
        setTimeout(() => {

          // Redirect based on role
          if (user.role === 'RESTAURANT') {
            // Check if this restaurant already has a restaurant profile
            this.http.getRestaurantsByOwner(user.email).subscribe({
              next: (restaurants) => {
                if (restaurants && restaurants.length > 0) {
                  // Restaurant already exists → go to Orders page
                  this.router.navigate(['/orders']);
                } else {
                  // No restaurant found → go to Create Restaurant page
                  this.router.navigate(['/create-restaurant']);
                }
                this.loading = false;
              },
              error: () => {
                // If error (no restaurant found), go to create page
                this.router.navigate(['/create-restaurant']);
                this.loading = false;
              }
            });
          } else if (user.role === 'CUSTOMER') {
            this.router.navigate(['/restaurants']);
            this.loading = false;
          } else if (user.role === 'DELIVERY') {
            this.router.navigate(['/delivery']);
            this.loading = false;
          } else {
            this.router.navigate(['/restaurants']);
            this.loading = false;
          }

        }, 1800);

      },

      error: (error: any) => {
        console.error('Login error:', error);
        this.errorMessage = 'Login failed. Please check your credentials.';
        this.loading = false;
      }

    });
  }

  // =========================
  // 🔁 FORGOT PASSWORD
  // =========================
  forgotPassword(): void {
    alert('Forgot password feature coming soon');
  }

  // =========================
  // 🧹 CLEANUP
  // =========================
  ngOnDestroy(): void {

    if (this.mainAnimation) {
      this.mainAnimation.destroy();
    }

    if (this.successAnimation) {
      this.successAnimation.destroy();
    }

    const card = this.card?.nativeElement;

    if (card) {
      card.removeEventListener('mousemove', this.mouseMoveHandler);
      card.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
  }
}