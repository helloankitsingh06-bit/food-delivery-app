import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

declare const confetti: any;

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent implements OnInit, OnDestroy, AfterViewInit {

  orderDetails = {
    orderId: 'FO' + Math.floor(Math.random() * 1000000),
    placedAt: new Date(),
    estimatedDeliveryMin: 25,
    estimatedDeliveryMax: 35,
    paymentStatus: 'Paid Successfully',
    total: 0,
    items: [] as any[],
    deliveryAddress: ''
  };

  timelineSteps = [
    { label: 'Order Confirmed', time: 'Just now', completed: true, icon: 'fa-check-circle' },
    { label: 'Preparing your meal', time: '~5 min', completed: false, icon: 'fa-utensils' },
    { label: 'Out for delivery', time: '~20 min', completed: false, icon: 'fa-motorcycle' },
    { label: 'Delivered', time: '~35 min', completed: false, icon: 'fa-home' }
  ];
  currentStep = 0;

  minutesLeft: number = 30;
  secondsLeft: number = 0;
  countdownInterval: any;
  timelineInterval: any;

  currentTime: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadOrderDetails();
    this.startCountdown();
    this.startTimelineSimulation();
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  ngAfterViewInit(): void {
    this.triggerConfetti();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.timelineInterval) clearInterval(this.timelineInterval);
  }

  loadOrderDetails(): void {
    const cart = localStorage.getItem('checkout_cart');
    const total = localStorage.getItem('checkout_total');
    if (cart) {
      this.orderDetails.items = JSON.parse(cart);
      this.orderDetails.total = total ? JSON.parse(total) : 0;
    }
    const savedAddr = localStorage.getItem('delivery_address');
    if (savedAddr) this.orderDetails.deliveryAddress = savedAddr;
  }

  startCountdown(): void {
    this.minutesLeft = this.orderDetails.estimatedDeliveryMin;
    this.secondsLeft = 0;
    this.countdownInterval = setInterval(() => {
      if (this.minutesLeft === 0 && this.secondsLeft === 0) {
        clearInterval(this.countdownInterval);
      } else {
        if (this.secondsLeft === 0) {
          this.minutesLeft--;
          this.secondsLeft = 59;
        } else {
          this.secondsLeft--;
        }
      }
    }, 1000);
  }

  startTimelineSimulation(): void {
    let step = 0;
    this.timelineInterval = setInterval(() => {
      if (step < 3) {
        step++;
        this.currentStep = step;
        this.timelineSteps[step].completed = true;
        if (step === 1) this.timelineSteps[step].time = '⏳ In progress';
        if (step === 2) this.timelineSteps[step].time = '🛵 On the way';
        if (step === 3) this.timelineSteps[step].time = '✅ Arrived';
      } else {
        clearInterval(this.timelineInterval);
      }
    }, 8000);
  }

  triggerConfetti(): void {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.7, x: 0.2 } }), 200);
      setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { y: 0.7, x: 0.8 } }), 400);
    } else {
      // fallback – load canvas-confetti on the fly
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1';
      script.onload = () => {
        (window as any).canvasConfetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      };
      document.head.appendChild(script);
    }
  }

  updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  shareOrder(): void {
    const text = `My order #${this.orderDetails.orderId} is on its way! Estimated delivery in ${this.minutesLeft} min. 🍕🚀`;
    if (navigator.share) {
      navigator.share({ title: 'Order Update', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Order details copied to clipboard!');
    }
  }

  downloadInvoice(): void {
    const invoice = `Order #${this.orderDetails.orderId}\nPlaced: ${this.orderDetails.placedAt.toLocaleString()}\nItems: ${this.orderDetails.items.map(i => `${i.name} x${i.quantity}`).join(', ')}\nTotal: ₹${this.orderDetails.total}\nAddress: ${this.orderDetails.deliveryAddress}`;
    const blob = new Blob([invoice], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invoice_${this.orderDetails.orderId}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  addToCalendar(): void {
    const start = new Date();
    start.setMinutes(start.getMinutes() + this.orderDetails.estimatedDeliveryMin);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 15);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Food+Delivery&details=Order+${this.orderDetails.orderId}&dates=${start.toISOString().replace(/-|:|\./g, '')}/${end.toISOString().replace(/-|:|\./g, '')}`;
    window.open(url, '_blank');
  }

  goToTracking(): void {
    this.router.navigate(['/delivery-tracking']);
  }
}