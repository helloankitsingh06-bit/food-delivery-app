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
  totalPrice: number = 0;

  selectedPaymentMethod: string = 'COD';
  selectedUPI: string = '';

  loading: boolean = false;

  constructor(
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.loadCartData();
  }

  // Load cart from localStorage
  loadCartData(): void {
    const cartData = localStorage.getItem('checkout_cart');
    const totalData = localStorage.getItem('checkout_total');

    if (cartData) {
      this.cartItems = JSON.parse(cartData);
    }

    if (totalData) {
      this.totalPrice = JSON.parse(totalData);
    }
  }

  // Final order placement
  placeFinalOrder(): void {

    if (this.cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }

    // Validate UPI selection
    if (this.selectedPaymentMethod === 'UPI' && !this.selectedUPI) {
      alert('Please select a UPI method');
      return;
    }

    const orderData = {
      items: this.cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: this.totalPrice,
      paymentMethod: this.selectedPaymentMethod,
      upiApp: this.selectedPaymentMethod === 'UPI' ? this.selectedUPI : null,
      status: 'PLACED'
    };

    this.loading = true;

    // 1. Get the restaurant ID from wherever you are storing it
    // Example: pulling it from localStorage
    const restaurantId = Number(localStorage.getItem('checkout_restaurant_id')) || 1; // fallback to 1 if testing

    // 2. Pass BOTH arguments to placeOrder
    this.httpService.placeOrder(restaurantId, orderData).subscribe({
      next: (response) => {

        alert('Order placed successfully!');

        // Clear cart
        localStorage.removeItem('checkout_cart');
        localStorage.removeItem('checkout_total');

        // Redirect to orders page
        this.router.navigate(['/orders']);
      },

      error: (error) => {
        console.error(error);
        alert('Failed to place order. Please try again.');
      },

      complete: () => {
        this.loading = false;
      }
    });
  }

  // Optional: calculate subtotal (if needed in UI)
  getItemSubtotal(item: any): number {
    return item.price * item.quantity;
  }

}