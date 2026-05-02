import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  cartItems: any[] = [];
  subtotal: number = 0;
  tax: number = 0;
  deliveryFee: number = 40;
  discount: number = 0;
  totalPrice: number = 0;

  selectedPaymentMethod: string = 'COD';
  selectedUPI: string = '';

  // New features
  promoCode: string = '';
  promoApplied: boolean = false;
  promoMessage: string = '';
  loyaltyPoints: number = 0;
  useLoyalty: boolean = false;
  loyaltyDiscount: number = 0;
  selectedTip: number = 0;
  customTip: number = 0;
  tipAmount: number = 0;

  deliveryAddress: string = 'Home - 123, Main Street, New Delhi';
  showAddressEditor: boolean = false;
  tempAddress: string = '';

  loading: boolean = false;

  constructor(
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.loadCartData();
    this.loadLoyaltyPoints();
    this.loadSavedAddress();
    this.recalculateTotal();
  }

  loadCartData(): void {
    const cartData = localStorage.getItem('checkout_cart');
    const totalData = localStorage.getItem('checkout_total');

    if (cartData) {
      this.cartItems = JSON.parse(cartData);
      // Calculate subtotal properly
      this.subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    if (totalData) {
      this.subtotal = JSON.parse(totalData);
    }
  }

  loadLoyaltyPoints(): void {
    // Simulate loyalty points from localStorage or API
    const points = localStorage.getItem('loyalty_points');
    this.loyaltyPoints = points ? JSON.parse(points) : 150; // default 150 points = ₹75 discount
  }

  loadSavedAddress(): void {
    const saved = localStorage.getItem('delivery_address');
    if (saved) this.deliveryAddress = saved;
    this.tempAddress = this.deliveryAddress;
  }

  saveAddress(): void {
    if (this.tempAddress.trim()) {
      this.deliveryAddress = this.tempAddress;
      localStorage.setItem('delivery_address', this.deliveryAddress);
    }
    this.showAddressEditor = false;
  }

  // Recalculate all totals
  recalculateTotal(): void {
    // Tax (10%)
    this.tax = this.subtotal * 0.1;
    
    // Delivery fee (free above ₹300)
    let delivery = this.deliveryFee;
    if (this.subtotal >= 300) delivery = 0;
    this.deliveryFee = delivery;

    // Tip
    if (this.selectedTip === 0) this.tipAmount = 0;
    else if (this.selectedTip === 1) this.tipAmount = this.subtotal * 0.1;
    else if (this.selectedTip === 2) this.tipAmount = this.subtotal * 0.15;
    else if (this.selectedTip === 3) this.tipAmount = this.subtotal * 0.2;
    else if (this.selectedTip === 4) this.tipAmount = this.customTip;
    
    // Loyalty discount (1 point = ₹0.5)
    let loyaltyDisc = 0;
    if (this.useLoyalty && this.loyaltyPoints > 0) {
      loyaltyDisc = Math.min(this.loyaltyPoints * 0.5, this.subtotal * 0.2); // max 20% of subtotal
      this.loyaltyDiscount = loyaltyDisc;
    } else {
      this.loyaltyDiscount = 0;
    }

    // Promo discount (simple 10% off code: PREMIUM10)
    let promoDisc = 0;
    if (this.promoApplied && this.promoCode === 'PREMIUM10') {
      promoDisc = this.subtotal * 0.1;
    }
    this.discount = promoDisc + loyaltyDisc;

    // Total
    let total = this.subtotal + this.tax + this.deliveryFee + this.tipAmount - this.discount;
    this.totalPrice = total > 0 ? total : 0;
  }

  applyPromoCode(): void {
    if (this.promoCode === 'PREMIUM10' && !this.promoApplied) {
      this.promoApplied = true;
      this.promoMessage = '✓ 10% discount applied!';
      this.recalculateTotal();
    } else if (this.promoApplied) {
      this.promoMessage = 'Already applied';
    } else {
      this.promoMessage = 'Invalid code. Try PREMIUM10';
    }
    setTimeout(() => this.promoMessage = '', 3000);
  }

  removePromo(): void {
    this.promoApplied = false;
    this.promoCode = '';
    this.promoMessage = '';
    this.recalculateTotal();
  }

  toggleLoyalty(): void {
    this.useLoyalty = !this.useLoyalty;
    this.recalculateTotal();
  }

  setTip(option: number): void {
    this.selectedTip = option;
    if (option !== 4) this.customTip = 0;
    this.recalculateTotal();
  }

  updateCustomTip(): void {
    if (this.selectedTip === 4) {
      this.recalculateTotal();
    }
  }

  getItemSubtotal(item: any): number {
    return item.price * item.quantity;
  }

  getItemImage(item: any): string {
    // Use item image if available, else placeholder
    return item.imageUrl ? `http://localhost:8080/images/${item.imageUrl}` : 'https://via.placeholder.com/60?text=Food';
  }

  placeFinalOrder(): void {
    if (this.cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (this.selectedPaymentMethod === 'UPI' && !this.selectedUPI) {
      alert('Please select a UPI app');
      return;
    }

    const orderData = {
      items: this.cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal: this.subtotal,
      tax: this.tax,
      deliveryFee: this.deliveryFee,
      tip: this.tipAmount,
      discount: this.discount,
      totalPrice: this.totalPrice,
      paymentMethod: this.selectedPaymentMethod,
      upiApp: this.selectedPaymentMethod === 'UPI' ? this.selectedUPI : null,
      deliveryAddress: this.deliveryAddress,
      promoCode: this.promoApplied ? this.promoCode : null,
      loyaltyPointsUsed: this.useLoyalty ? Math.floor(this.loyaltyDiscount / 0.5) : 0,
      status: 'PLACED'
    };

    this.loading = true;
    const restaurantId = Number(localStorage.getItem('checkout_restaurant_id')) || 1;

    this.httpService.placeOrder(restaurantId, orderData).subscribe({
      next: () => {
        // Deduct loyalty points if used
        if (this.useLoyalty && this.loyaltyDiscount > 0) {
          const pointsUsed = Math.floor(this.loyaltyDiscount / 0.5);
          const remaining = this.loyaltyPoints - pointsUsed;
          localStorage.setItem('loyalty_points', JSON.stringify(remaining));
        }
        alert('Order placed successfully!');
        localStorage.removeItem('checkout_cart');
        localStorage.removeItem('checkout_total');
        this.router.navigate(['/thank-you']);
      },
      error: (error) => {
        console.error(error);
        alert('Failed to place order. Please try again.');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}