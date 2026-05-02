import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-delivery-tracking',
  templateUrl: './delivery-tracking.component.html',
  styleUrls: ['./delivery-tracking.component.css']
})
export class DeliveryTrackingComponent implements OnInit, OnDestroy, AfterViewInit {

  orderId = 'FO' + Math.floor(Math.random() * 1000000);

  // Rider info
  rider = {
    name: 'Rajesh Kumar',
    phone: '+919876543210',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.8,
    vehicle: 'Yamaha Fascino (DL 01 AB 1234)'
  };

  // Coordinates (restaurant → customer)
  restaurant = { lat: 28.6139, lng: 77.2090 };   // Delhi
  customer = { lat: 28.5900, lng: 77.2200 };    // ~2.5 km away

  // Rider current position (moves)
  currentLat = this.restaurant.lat;
  currentLng = this.restaurant.lng;

  // Distance & ETA
  totalDistanceKm = 0;
  distanceLeft = 0;
  progressPercent = 0;

  etaMinutes = 18;
  etaSeconds = 0;
  remainingMinutes = 18;
  remainingSeconds = 0;

  // Countdown & movement intervals
  countdownInterval: any;
  moveInterval: any;

  // Map
  map: L.Map | null = null;
  riderMarker: L.Marker | null = null;
  routeLine: L.Polyline | null = null;

  // Timeline steps
  timelineSteps = [
    { label: 'Order Confirmed', time: 'Just now', completed: true, icon: 'fa-check-circle' },
    { label: 'Preparing', time: '~5 min', completed: true, icon: 'fa-utensils' },
    { label: 'Out for Delivery', time: '~15 min', completed: false, icon: 'fa-motorcycle' },
    { label: 'Delivered', time: '~20 min', completed: false, icon: 'fa-home' }
  ];

  constructor(private router: Router) {
    this.totalDistanceKm = this.haversineDistance(
      this.restaurant.lat, this.restaurant.lng,
      this.customer.lat, this.customer.lng
    );
    this.distanceLeft = this.totalDistanceKm;
  }

  ngOnInit(): void {
    this.startCountdown();
    this.startRiderMovement();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.moveInterval) clearInterval(this.moveInterval);
    if (this.map) this.map.remove();
  }

  // ------------------- HAVERSINE DISTANCE -------------------
  haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * Math.PI / 180;
  }

  // ------------------- MAP INIT -------------------
  initMap(): void {
    this.map = L.map('tracking-map').setView([this.restaurant.lat, this.restaurant.lng], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(this.map);

    // Restaurant marker
    L.marker([this.restaurant.lat, this.restaurant.lng], {
      icon: L.divIcon({ html: '🍽️', className: 'custom-marker', iconSize: [30, 30] })
    }).addTo(this.map).bindPopup('Restaurant');

    // Customer marker
    L.marker([this.customer.lat, this.customer.lng], {
      icon: L.divIcon({ html: '🏠', className: 'custom-marker', iconSize: [30, 30] })
    }).addTo(this.map).bindPopup('Your Location');

    // Route line
    this.routeLine = L.polyline([[this.restaurant.lat, this.restaurant.lng], [this.customer.lat, this.customer.lng]], {
      color: '#FFD700',
      weight: 4,
      opacity: 0.7,
      dashArray: '5, 10'
    }).addTo(this.map);

    // Rider marker (custom image)
    const riderIcon = L.divIcon({
      html: `<img src="${this.rider.photo}" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid gold; box-shadow: 0 0 8px rgba(0,0,0,0.5);">`,
      className: 'rider-marker',
      iconSize: [36, 36]
    });
    this.riderMarker = L.marker([this.currentLat, this.currentLng], { icon: riderIcon }).addTo(this.map);
  }

  // ------------------- RIDER MOVEMENT (LINEAR INTERPOLATION) -------------------
  startRiderMovement(): void {
    const steps = 100;          // total interpolation steps
    let step = 0;
    const latStep = (this.customer.lat - this.restaurant.lat) / steps;
    const lngStep = (this.customer.lng - this.restaurant.lng) / steps;

    this.moveInterval = setInterval(() => {
      if (step <= steps) {
        this.currentLat = this.restaurant.lat + latStep * step;
        this.currentLng = this.restaurant.lng + lngStep * step;
        this.progressPercent = (step / steps) * 100;
        this.distanceLeft = this.totalDistanceKm * (1 - step / steps);
        // Update marker position
        if (this.riderMarker && this.map) {
          this.riderMarker.setLatLng([this.currentLat, this.currentLng]);
          this.map.panTo([this.currentLat, this.currentLng]);
        }
        step++;
      } else {
        clearInterval(this.moveInterval);
        this.progressPercent = 100;
        this.distanceLeft = 0;
        // Mark timeline as delivered
        this.timelineSteps[2].completed = true;
        this.timelineSteps[3].completed = true;
        // Optional: show notification
        alert('Order delivered! Enjoy your meal.');
      }
    }, 200); // 100 steps * 200ms = 20 sec total (demo)
  }

  // ------------------- ETA COUNTDOWN -------------------
  startCountdown(): void {
    this.remainingMinutes = this.etaMinutes;
    this.remainingSeconds = this.etaSeconds;
    this.countdownInterval = setInterval(() => {
      if (this.remainingMinutes === 0 && this.remainingSeconds === 0) {
        clearInterval(this.countdownInterval);
      } else {
        if (this.remainingSeconds === 0) {
          this.remainingMinutes--;
          this.remainingSeconds = 59;
        } else {
          this.remainingSeconds--;
        }
      }
    }, 1000);
  }


  goBack(): void {
    this.router.navigate(['/restaurants']);
  }


  // ------------------- ACTIONS -------------------
  callRider(): void {
    window.location.href = `tel:${this.rider.phone.replace(/\D/g, '')}`;
  }

  messageRider(): void {
    // Simulate opening SMS/WhatsApp
    window.open(`https://wa.me/${this.rider.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(this.rider.name)}%2C%20I%20am%20tracking%20my%20order%20%23${this.orderId}`);
  }

  shareLiveLocation(): void {
    const text = `🍕 My order #${this.orderId} is on the way! Rider ${this.rider.name} is ${this.distanceLeft.toFixed(1)} km away. ETA: ${this.remainingMinutes}:${this.remainingSeconds < 10 ? '0' + this.remainingSeconds : this.remainingSeconds}`;
    if (navigator.share) {
      navigator.share({ title: 'Live Order Tracking', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Tracking info copied to clipboard!');
    }
  }
}