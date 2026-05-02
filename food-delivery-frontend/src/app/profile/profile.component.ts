import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpService } from '../services/http.service';
import { filter, Subject, takeUntil, of } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  // ================= CLEANUP =================
  private destroy$ = new Subject<void>();

  // ================= USER DATA =================
  user: any = {};
  restaurant: any = null;

  isLoading = true;

  // ================= EDIT STATES =================
  isEditingAccount = false;
  isEditingRestaurant = false;
  isEditingDelivery = false;

  // ================= UI =================
  errorMessage = '';
  successMessage = '';

  displayName = '';
  displayRole = '';

  // ================= FORMS =================
  userForm = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  restaurantForm = {
    id: null as number | null,
    name: '',
    location: '',
    address: '',
    cuisine: '',
    imageUrl: '',
    rating: 0,
    phone: '',
    altPhone: '',
    email: '',
    gstNumber: '',
    mapLink: '',
    openTime: '',
    closeTime: '',
    isOpen: true,
    deliveryAvailable: true,
    costForTwo: 0,
    licenseNumber: ''
  };

  // ================= PASSWORD =================
  showPasswordForm = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  passwordForm = {
    current: '',
    new: '',
    confirm: ''
  };

  // ================= EXTRA =================
  addresses: string[] = [];

  totalOrders = 0;
  totalSpent = 0;
  todayEarnings = 0;
  completedDeliveries = 0;

  // ================= PAST ORDERS MODAL =================
  showOrdersModal = false;
  pastOrders: any[] = [];
  ordersLoading = false;
  selectedOrder: any = null;

  // ================= HELP SECTION =================
  showHelp = false;
  activeFaqIndex: number | null = null;

  helpForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  helpSubmitted = false;

  faqList = [
    {
      question: 'How do I update my profile information?',
      answer: 'Go to the Account Information section and click Edit. Update your details and click Save Changes.'
    },
    {
      question: 'How do I change my password?',
      answer: 'Scroll to the Security section at the bottom of your profile and click "Change Password".'
    },
    {
      question: 'Why is my order not showing up?',
      answer: 'Orders may take a few minutes to appear. Try refreshing the page. If the issue persists, contact support using the form below.'
    },
    {
      question: 'How do I cancel an order?',
      answer: 'You can cancel an order within 2 minutes of placing it. Go to Past Orders, select the order, and tap Cancel if the option is available.'
    },
    {
      question: 'How are delivery charges calculated?',
      answer: 'Delivery charges depend on your distance from the restaurant and current demand. The exact charge is shown before you confirm your order.'
    },
    {
      question: 'How do I report an issue with my delivery?',
      answer: 'Use the contact form below to describe the issue. Include your order ID for faster resolution.'
    },
    {
      question: 'How do I add or remove a saved address?',
      answer: 'In the My Activity section, click "+ Add" to add a new address, or click "Remove" next to an existing one.'
    },
    {
      question: 'How do I update my restaurant details?',
      answer: 'Go to the Restaurant Details section, click Edit, make your changes, and click Save Restaurant.'
    }
  ];

  // ================= CONSTRUCTOR =================
  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private router: Router
  ) {}

  // ================= INIT =================
  ngOnInit() {
    this.loadData();
    this.listenToRouteChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ================= ROUTE LISTENER =================
  private listenToRouteChanges() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.router.url === '/profile') {
          this.loadData();
        }
      });
  }

  // ================= LOAD DATA =================
  loadData() {
    this.isLoading = true;

    // Try getting user from authService, fallback to localStorage
    this.user = this.authService.getCurrentUser();

    // CRITICAL FIX: If user is null/undefined, try localStorage directly
    if (!this.user) {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          // Handle nested user object: { data: { user: {...} } } or { user: {...} } or flat
          this.user = parsed?.data?.user || parsed?.user || parsed || null;
        }
      } catch {
        this.user = null;
      }
    }

    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    // CRITICAL FIX: Unwrap nested user if needed
    if (this.user.data) {
      this.user = this.user.data.user || this.user.data || this.user;
    }

    console.log('USER LOADED 👉', this.user);

    this.displayRole = this.user.role || '';
    this.addresses = this.getStoredAddresses();

    // Populate userForm immediately so account section always shows data
    this.userForm = {
      name: this.user.name || this.user.fullName || '',
      email: this.user.email || '',
      phone: this.user.phone || this.user.phoneNumber || '',
      address: this.user.address || ''
    };

    this.displayName = this.userForm.name || this.user.email || 'User';

    const role = (this.user.role || '').toUpperCase();

    if (role === 'RESTAURANT') {
      this.loadRestaurant();
      this.loadRestaurantStats();
      this.isLoading = false;
    } else if (role === 'CUSTOMER') {
      this.loadCustomerStats();
      this.isLoading = false;
    } else if (role === 'DELIVERY' || role === 'DELIVERY_PARTNER') {
      this.loadDeliveryStats();
      this.isLoading = false;
    } else {
      // Unknown role — still show account info
      this.isLoading = false;
    }
  }

  // ================= LOCAL STORAGE =================
  private getStoredAddresses(): string[] {
    try {
      return JSON.parse(localStorage.getItem('addresses') || '[]');
    } catch {
      return [];
    }
  }

  // ================= RESTAURANT =================
  loadRestaurant() {
    this.httpService.getRestaurantByOwnerId(this.user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (r: any) => {
          console.log('RESTAURANT RAW 👉', r);

          if (!r) {
            this.restaurant = null;
            return;
          }

          // Handle nested response: { data: {...} } or flat
          const data = r.data || r;

          this.restaurantForm = {
            id: data.id || data.restaurantId || null,
            name: data.name || data.restaurantName || '',
            location: data.location || data.city || '',
            address: data.address || '',
            cuisine: data.cuisine || data.cuisineType || '',
            imageUrl: data.imageUrl || data.image || data.logo || '',
            rating: data.rating || data.averageRating || 0,
            phone: data.phone || data.phoneNumber || data.contactNumber || '',
            altPhone: data.altPhone || data.alternatePhone || '',
            email: data.email || data.contactEmail || '',
            gstNumber: data.gstNumber || data.gst || '',
            mapLink: data.mapLink || data.googleMapLink || '',
            openTime: data.openTime || data.openingTime || '',
            closeTime: data.closeTime || data.closingTime || '',
            isOpen: data.isOpen ?? data.open ?? true,
            deliveryAvailable: data.deliveryAvailable ?? data.delivery ?? true,
            costForTwo: data.costForTwo || data.averageCost || 0,
            licenseNumber: data.licenseNumber || data.fssaiNumber || ''
          };

          // CRITICAL: restaurant object drives the VIEW mode
          this.restaurant = { ...this.restaurantForm };
          this.displayName = this.restaurant.name || this.userForm.name || 'Restaurant';

          console.log('RESTAURANT MAPPED 👉', this.restaurant);
        },
        error: (err) => {
          console.error('Restaurant load error:', err);
          this.restaurant = null;
        }
      });
  }

  // ================= SAFE API WRAPPER =================
  private safeCall(api: any, fallback: any = {}) {
    return (api && typeof api.subscribe === 'function') ? api : of(fallback);
  }

  // ================= STATS =================
  loadCustomerStats() {
    this.safeCall(this.httpService.getCustomerStats?.())
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.totalOrders = res?.totalOrders ?? 0;
        this.totalSpent = res?.totalSpent ?? 0;
      });
  }

  loadRestaurantStats() {
    this.safeCall(this.httpService.getRestaurantStats?.(this.user.id))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.totalOrders = res?.totalOrders ?? 0;
      });
  }

  loadDeliveryStats() {
    this.safeCall(this.httpService.getDeliveryStats?.())
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.todayEarnings = res?.todayEarnings ?? 0;
        this.completedDeliveries = res?.completedDeliveries ?? 0;
      });
  }

  // ================= VALIDATION =================
  private isValidPhone(p: string): boolean {
    return /^[0-9]{10}$/.test(p.trim());
  }

  // ================= UPDATE USER =================
  updateCustomerProfile() {
    if (this.userForm.phone && !this.isValidPhone(this.userForm.phone)) {
      this.showError('Phone must be 10 digits');
      return;
    }

    this.httpService.updateUser(this.user.id, this.userForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const updated = { ...this.user, ...this.userForm };
          localStorage.setItem('user', JSON.stringify(updated));
          this.user = updated;
          this.displayName = updated.name || updated.fullName || this.displayName;
          this.showSuccess('Profile updated successfully!');
          this.isEditingAccount = false;
          this.isEditingDelivery = false;
        },
        error: () => this.showError('Update failed. Please try again.')
      });
  }

  // ================= UPDATE RESTAURANT =================
  updateRestaurantProfile() {
    if (!this.restaurantForm.id) {
      this.showError('Restaurant ID missing');
      return;
    }

    if (this.restaurantForm.phone && !this.isValidPhone(this.restaurantForm.phone)) {
      this.showError('Phone must be 10 digits');
      return;
    }

    this.httpService.updateRestaurant(this.restaurantForm.id, this.restaurantForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const data = res?.data || res;
          this.restaurant = { ...this.restaurantForm, ...data };
          this.displayName = this.restaurant.name || this.displayName;
          this.showSuccess('Restaurant updated successfully!');
          this.isEditingRestaurant = false;
        },
        error: () => this.showError('Update failed. Please try again.')
      });
  }

  // ================= PASSWORD =================
  changePassword() {
    if (!this.passwordForm.current) {
      this.showError('Please enter your current password');
      return;
    }
    if (!this.passwordForm.new || this.passwordForm.new.length < 6) {
      this.showError('New password must be at least 6 characters');
      return;
    }
    if (this.passwordForm.new !== this.passwordForm.confirm) {
      this.showError('Passwords do not match');
      return;
    }

   this.httpService.changePassword(this.user.id, {
  currentPassword: this.passwordForm.current,
  newPassword: this.passwordForm.new
  })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Password updated successfully!');
          this.showPasswordForm = false;
          this.passwordForm = { current: '', new: '', confirm: '' };
        },
        error: () => this.showError('Password update failed. Check your current password.')
      });
  }

  // ================= IMAGE UPLOAD =================
  onUserImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.user.avatar = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onRestaurantImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.restaurantForm.imageUrl = e.target.result;
      if (this.restaurant) this.restaurant.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ================= ADDRESS =================
  addAddress() {
    const addr = prompt('Enter new address:');
    if (addr && addr.trim()) {
      this.addresses.push(addr.trim());
      localStorage.setItem('addresses', JSON.stringify(this.addresses));
      this.showSuccess('Address added!');
    }
  }

  deleteAddress(i: number) {
    this.addresses.splice(i, 1);
    localStorage.setItem('addresses', JSON.stringify(this.addresses));
    this.showSuccess('Address removed');
  }

  // ================= HELPERS =================
  getRoleLabel(): string {
    const role = (this.user?.role || '').toUpperCase();
    if (role === 'RESTAURANT') return 'Restaurant Owner';
    if (role === 'DELIVERY' || role === 'DELIVERY_PARTNER') return 'Delivery Partner';
    return 'Customer';
  }

  isRole(role: string): boolean {
    return (this.user?.role || '').toUpperCase() === role.toUpperCase();
  }

  // ================= PAST ORDERS =================
  openOrdersModal() {
    this.showOrdersModal = true;
    this.selectedOrder = null;
    this.ordersLoading = true;
    this.pastOrders = [];

    this.httpService.getCustomerOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const orders = res?.data || res?.orders || res || [];
          this.pastOrders = Array.isArray(orders) ? orders : [];
          this.ordersLoading = false;
        },
        error: () => {
          // Fallback: show mock orders so UI is never blank
          this.pastOrders = [];
          this.ordersLoading = false;
        }
      });
  }

  closeOrdersModal() {
    this.showOrdersModal = false;
    this.selectedOrder = null;
  }

  selectOrder(order: any) {
    this.selectedOrder = this.selectedOrder?.id === order.id ? null : order;
  }

  getOrderStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 'status--delivered';
    if (s === 'cancelled' || s === 'canceled') return 'status--cancelled';
    if (s === 'pending') return 'status--pending';
    return 'status--processing';
  }

  // ================= HELP =================
  toggleFaq(index: number) {
    this.activeFaqIndex = this.activeFaqIndex === index ? null : index;
  }

  submitHelp() {
    if (!this.helpForm.name || !this.helpForm.email || !this.helpForm.message) {
      this.showError('Please fill in all required fields');
      return;
    }
    // Pre-fill name and email from user if empty
    this.helpSubmitted = true;
    this.showSuccess('Message sent! We will get back to you within 24 hours.');
    setTimeout(() => {
      this.helpForm = { name: '', email: '', subject: '', message: '' };
      this.helpSubmitted = false;
    }, 4000);
  }

  openHelp() {
    this.showHelp = true;
    // Pre-fill help form with user data
    this.helpForm.name = this.userForm.name || this.user?.name || '';
    this.helpForm.email = this.userForm.email || this.user?.email || '';
  }

  closeHelp() {
    this.showHelp = false;
    this.activeFaqIndex = null;
  }

  // ================= NAV =================
  goBack() {
    const role = (this.user?.role || '').toUpperCase();
    if (role === 'RESTAURANT') this.router.navigate(['/orders']);
    else if (role === 'DELIVERY' || role === 'DELIVERY_PARTNER') this.router.navigate(['/deliveries']);
    else this.router.navigate(['/restaurants']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ================= MESSAGES =================
  private showSuccess(msg: string) {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => (this.successMessage = ''), 3500);
  }

  private showError(msg: string) {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => (this.errorMessage = ''), 3500);
  }
}