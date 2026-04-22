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
import { OrdersComponent } from './orders/orders.component';
import { DeliveryComponent } from './delivery/delivery.component';
import { CreateRestaurantComponent } from './create-restaurant/create-restaurant.component';

// ✅ ROUTES (OPTIMIZED)
const routes: Routes = [

  // Splash screen first
  { path: '', component: SplashScreenComponent },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },

  // Main App
  { path: 'restaurants', component: RestaurantsComponent, canActivate: [AuthGuard] },
  { 
    path: 'create-restaurant', 
    component: CreateRestaurantComponent, 
    canActivate: [AuthGuard],
    data: { role: 'RESTAURANT' }
  },

  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard] },
  { path: 'menu/:id', component: MenuComponent, canActivate: [AuthGuard] },

  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },

  { path: 'dashboard', component: OrdersComponent, canActivate: [AuthGuard] },

  { path: 'delivery', component: DeliveryComponent, canActivate: [AuthGuard] },

  // Profile (standalone)
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },

  // ✅ BEST PRACTICE: Manage Menu with Restaurant ID (standalone lazy load)
  {
    path: 'manage-menu/:restaurantId',
    loadComponent: () =>
      import('./manage-menu/manage-menu.component').then(m => m.ManageMenuComponent),
    canActivate: [AuthGuard]
  }

];

@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    LoginComponent,
    RegistrationComponent,
    RestaurantsComponent,
    MenuComponent,
    OrdersComponent,
    DeliveryComponent,
    CreateRestaurantComponent
    // ❌ DO NOT ADD standalone components here
  ],

  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    RouterModule.forRoot(routes)
  ],

  providers: [AuthGuard],
  bootstrap: [AppComponent]
})

export class AppModule { }