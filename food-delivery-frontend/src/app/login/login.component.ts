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

  // 🔥 FORGOT PASSWORD MODAL
  showForgotModal = false;
  resetEmail = '';
  resetLoading = false;
  resetMessage = '';
  resetSuccess = false;

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
        console.log('Login response:', response);
        const user = response.user;
        const token = response.token;

        if (token) localStorage.setItem('token', token);
        
        // ✅ ADD phoneNumber to stored user data
        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          username: user.username,
          phoneNumber: user.phone || user.phoneNumber || ''   // FIX: includes phone
        };
        localStorage.setItem('user', JSON.stringify(userData));

        this.loginSuccess = true;
        setTimeout(() => this.loadSuccessAnimation(), 100);

        setTimeout(() => {
          if (user.role === 'RESTAURANT') {
            // ✅ CHANGED: Use getRestaurantByOwnerId instead of getRestaurantsByOwner
            this.http.getRestaurantByOwnerId(user.id).subscribe({
              next: (restaurant) => {
                // If we get a restaurant object → exists
                if (restaurant && restaurant.id) {
                  this.router.navigate(['/orders']);
                } else {
                  this.router.navigate(['/create-restaurant']);
                }
                this.loading = false;
              },
              error: (err) => {
                // 404 means no restaurant → go to creation form
                if (err.status === 404) {
                  this.router.navigate(['/create-restaurant']);
                } else {
                  this.errorMessage = 'Error checking restaurant. Please try again.';
                  this.router.navigate(['/create-restaurant']);
                }
                this.loading = false;
              }
            });
          } else if (user.role === 'CUSTOMER') {
            this.router.navigate(['/restaurants']);
            this.loading = false;
          } else if (user.role === 'DELIVERY') {
            this.router.navigate(['/delivery-registration']);
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
  // 🔁 FORGOT PASSWORD (with modal)
  // =========================
  openForgotModal(): void {
    this.showForgotModal = true;
    this.resetEmail = '';
    this.resetMessage = '';
    this.resetSuccess = false;
    this.resetLoading = false;
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
  }

  sendResetLink(): void {
    if (!this.resetEmail || !this.resetEmail.includes('@')) {
      this.resetMessage = 'Please enter a valid email address.';
      this.resetSuccess = false;
      return;
    }

    this.resetLoading = true;
    this.resetMessage = '';

    this.http.forgotPassword(this.resetEmail).subscribe({
      next: (response: any) => {
        this.resetLoading = false;
        this.resetSuccess = true;
        this.resetMessage = response.message || 'Reset link sent! Check your email.';
        setTimeout(() => this.closeForgotModal(), 3000);
      },
      error: (err) => {
        this.resetLoading = false;
        this.resetSuccess = false;
        this.resetMessage = err.error?.message || 'Failed to send reset link. Try again.';
      }
    });
  }

  // =========================
  // 🧹 CLEANUP
  // =========================
  ngOnDestroy(): void {
    if (this.mainAnimation) this.mainAnimation.destroy();
    if (this.successAnimation) this.successAnimation.destroy();
    const card = this.card?.nativeElement;
    if (card) {
      card.removeEventListener('mousemove', this.mouseMoveHandler);
      card.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
  }
}