import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthGuard } from './auth.guard';

import { AppComponent } from './app.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { MenuComponent } from './menu/menu.component';
import { DeliveryComponent } from './delivery/delivery.component';
import { CreateRestaurantComponent } from './create-restaurant/create-restaurant.component';
import { PaymentComponent } from './payment/payment.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { DeliveryTrackingComponent } from './delivery-tracking/delivery-tracking.component';
import { DeliveryPartnerRegistrationComponent } from './delivery-partner-registration/delivery-partner-registration.component';

import { NgChartsModule } from 'ng2-charts';

const routes: Routes = [
  { path: '', component: SplashScreenComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'restaurants', component: RestaurantsComponent, canActivate: [AuthGuard] },
  { 
    path: 'create-restaurant', 
    component: CreateRestaurantComponent, 
    canActivate: [AuthGuard],
    data: { role: 'RESTAURANT' }
  },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard] },
  { path: 'menu/:id', component: MenuComponent, canActivate: [AuthGuard] },
  { path: 'orders', loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent), canActivate: [AuthGuard] },
  { path: 'dashboard', loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent), canActivate: [AuthGuard] },
  { path: 'delivery', component: DeliveryComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
  { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  { path: 'manage-menu/:restaurantId', loadComponent: () => import('./manage-menu/manage-menu.component').then(m => m.ManageMenuComponent), canActivate: [AuthGuard] },
  { path: 'thank-you', component: ThankYouComponent },
  { path: 'delivery-tracking', component: DeliveryTrackingComponent },
  { path: 'analytics', loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent), canActivate: [AuthGuard] },
  { path: 'delivery-registration', component: DeliveryPartnerRegistrationComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    LoginComponent,
    RegistrationComponent,
    RestaurantsComponent,
    MenuComponent,
    DeliveryComponent,
    PaymentComponent,
    CreateRestaurantComponent,
    ThankYouComponent,
    DeliveryTrackingComponent,
    DeliveryPartnerRegistrationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    NgChartsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }