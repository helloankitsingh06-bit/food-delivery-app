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

      next: (res: any) => {

        const token = res.token || res;

        // 🔐 ALWAYS STORE IN LOCALSTORAGE
        localStorage.setItem('token', token);

        // 👤 STORE USER
        if (res.user) {
          localStorage.setItem('user_data', JSON.stringify(res.user));
        }

        this.loading = false;

        // 🎉 SHOW SUCCESS UI
        this.loginSuccess = true;

        setTimeout(() => this.loadSuccessAnimation(), 100);

        // 🚀 REDIRECT AFTER ANIMATION
        setTimeout(() => {

          const role = res.user?.role;

          if (role === 'CUSTOMER') {
            this.router.navigate(['/restaurants']);
          } 
          else if (role === 'RESTAURANT') {
            this.router.navigate(['/orders']); // 🔥 FIXED
          } 
          else if (role === 'DELIVERY') {
            this.router.navigate(['/delivery']);
          } 
          else {
            this.router.navigate(['/restaurants']);
          }

        }, 1800);

      },

      error: (error: any) => {
        console.error(error);
        this.errorMessage = error.error?.message || 'Login failed';
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