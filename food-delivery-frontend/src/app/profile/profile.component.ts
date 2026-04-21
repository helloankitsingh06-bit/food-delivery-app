import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// 🔥 REQUIRED IMPORTS FOR STANDALONE
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any = {};

  activeTab: string = 'profile';

  orders: any[] = [];

  darkMode: boolean = false;
  notifications: boolean = true;

  // 🔥 EDIT PROFILE
  editMode: boolean = false;
  backupUser: any = {};

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // =========================
  // 🚀 INIT
  // =========================
  ngOnInit(): void {

    const storedUser = localStorage.getItem('user_data');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
    } else {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOrders();
    this.applySettings();
  }

  // =========================
  // 🔄 TAB SWITCH
  // =========================
  setTab(tab: string): void {
    this.activeTab = tab;
  }

  // =========================
  // 📦 LOAD ORDERS
  // =========================
  loadOrders(): void {
    this.orders = [
      { id: 101, total: 250, status: 'Delivered' },
      { id: 102, total: 180, status: 'On the way' }
    ];
  }

  // =========================
  // ⚙️ SETTINGS
  // =========================
  applySettings(): void {
    const savedDark = localStorage.getItem('darkMode');
    const savedNotif = localStorage.getItem('notifications');

    if (savedDark !== null) {
      this.darkMode = JSON.parse(savedDark);
    }

    if (savedNotif !== null) {
      this.notifications = JSON.parse(savedNotif);
    }

    this.updateDarkMode();
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
    this.updateDarkMode();
  }

  toggleNotifications(): void {
    this.notifications = !this.notifications;
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  updateDarkMode(): void {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  // =========================
  // ✏️ EDIT PROFILE
  // =========================
  enableEdit(): void {
    this.editMode = true;
    this.backupUser = { ...this.user };
  }

  cancelEdit(): void {
    this.user = { ...this.backupUser };
    this.editMode = false;
  }

  saveProfile(): void {
    localStorage.setItem('user_data', JSON.stringify(this.user));
    this.editMode = false;

    alert('Profile updated successfully ✅');
  }

  // =========================
  // 🆘 HELP BUTTON
  // =========================
  openHelp(): void {
    alert('📞 Support: +91 9876543210\n📧 Email: support@foodroyal.com');
  }

  // =========================
  // 🔙 BACK
  // =========================
  goBack(): void {
    window.history.back();
  }

  // =========================
  // 🚪 LOGOUT
  // =========================
  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}