import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-manage-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-menu.component.html',
  styleUrls: ['./manage-menu.component.css']
})
export class ManageMenuComponent implements OnInit {

  constructor(
    private http: HttpService,
    private authService: AuthService
  ) {}

  menuItem: any = {
    name: '',
    price: 0,
    description: '',
    quantity: 0,
    imageUrl: ''
  };

  selectedFile: File | null = null;
  menuList: any[] = [];

  restaurantId: number | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // EDIT STATE
  isEditing = false;
  editId: number | null = null;

  ngOnInit() {
    this.getRestaurantId();
  }

  // ✅ COMPLETE FIXED getRestaurantId() METHOD
  getRestaurantId() {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    
    console.log('Current user:', user); // DEBUG
    
    if (user && user.role === 'RESTAURANT') {
      // Use getMyRestaurant with userId parameter
      this.http.getMyRestaurant(user.id).subscribe({
        next: (restaurant: any) => {
          console.log('Restaurant API response:', restaurant);
          
          if (restaurant && restaurant.id) {
            this.restaurantId = restaurant.id;
            this.errorMessage = ''; // Clear any previous error
            this.loadMenu();
          } else {
            this.errorMessage = 'No restaurant found. Please create a restaurant first.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error getting restaurant:', err);
          
          if (err.status === 404) {
            this.errorMessage = 'Restaurant not found. Please create a restaurant first.';
          } else {
            this.errorMessage = 'Failed to load restaurant information.';
          }
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Unauthorized. Please login as restaurant owner.';
      this.isLoading = false;
    }
  }

  // FETCH MENU FROM BACKEND
  loadMenu() {
    if (!this.restaurantId) return;
    
    this.http.getMenuByRestaurant(this.restaurantId).subscribe({
      next: (res: any) => {
        this.menuList = res || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading menu", err);
        this.errorMessage = 'Failed to load menu items.';
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // EDIT ITEM
  editItem(item: any) {
    console.log("EDIT CLICKED", item);

    this.menuItem = {
      name: item.name,
      price: item.price,
      description: item.description,
      quantity: item.quantity,
      imageUrl: item.imageUrl
    };

    this.editId = item.id;
    this.isEditing = true;
  }

  // ADD + UPDATE COMBINED WITH IMAGE UPLOAD FIX
  addItem() {
    console.log("🔴 ADD ITEM BUTTON CLICKED!");
    
    // Validate form
    if (!this.menuItem.name || this.menuItem.name.trim() === '') {
      this.errorMessage = 'Please enter food name';
      this.clearMessagesAfterDelay();
      return;
    }
    
    if (!this.menuItem.price || this.menuItem.price <= 0) {
      this.errorMessage = 'Please enter a valid price';
      this.clearMessagesAfterDelay();
      return;
    }
    
    if (!this.restaurantId) {
      this.errorMessage = 'Restaurant ID not found';
      this.clearMessagesAfterDelay();
      return;
    }

    // ✅ CHECK IF WE HAVE AN IMAGE FILE
    if (this.selectedFile) {
      // UPLOAD WITH IMAGE - Use FormData
      const formData = new FormData();
      formData.append('name', this.menuItem.name);
      formData.append('price', this.menuItem.price.toString());
      formData.append('description', this.menuItem.description || '');
      formData.append('quantity', this.menuItem.quantity?.toString() || '0');
      formData.append('image', this.selectedFile);
      
      console.log('Uploading with image:', this.selectedFile.name);
      
      if (this.isEditing && this.editId !== null) {
        // UPDATE with image
        this.http.updateMenuItemWithImage(this.editId, formData).subscribe({
          next: (response: any) => {
            console.log('Update response:', response);
            this.successMessage = "Updated ✅";
            this.clearMessagesAfterDelay();
            this.loadMenu();
            this.resetForm();
          },
          error: (err) => {
            console.error('Update error:', err);
            this.errorMessage = err.error?.message || "Update failed ❌";
            this.clearMessagesAfterDelay();
          }
        });
      } else {
        // ADD with image
        this.http.addMenuItemWithImage(this.restaurantId, formData).subscribe({
          next: (response: any) => {
            console.log('Add response:', response);
            this.successMessage = "Added ✅";
            this.clearMessagesAfterDelay();
            this.loadMenu();
            this.resetForm();
          },
          error: (err) => {
            console.error('Add error:', err);
            this.errorMessage = err.error?.message || "Add failed ❌";
            this.clearMessagesAfterDelay();
          }
        });
      }
    } else {
      // NO IMAGE - Use JSON
      const payload = {
        name: this.menuItem.name,
        price: this.menuItem.price,
        description: this.menuItem.description,
        quantity: this.menuItem.quantity || 0,
        imageUrl: this.menuItem.imageUrl || ''
      };
      
      console.log('Sending payload without image:', payload);
      
      if (this.isEditing && this.editId !== null) {
        this.http.updateMenuItem(this.editId, payload).subscribe({
          next: (response: any) => {
            this.successMessage = "Updated ✅";
            this.clearMessagesAfterDelay();
            this.loadMenu();
            this.resetForm();
          },
          error: (err) => {
            this.errorMessage = err.error?.message || "Update failed ❌";
            this.clearMessagesAfterDelay();
          }
        });
      } else {
        this.http.addMenuItem(this.restaurantId, payload).subscribe({
          next: (response: any) => {
            this.successMessage = "Added ✅";
            this.clearMessagesAfterDelay();
            this.loadMenu();
            this.resetForm();
          },
          error: (err) => {
            this.errorMessage = err.error?.message || "Add failed ❌";
            this.clearMessagesAfterDelay();
          }
        });
      }
    }
  }

  resetForm() {
    this.menuItem = {
      name: '',
      price: 0,
      description: '',
      quantity: 0,
      imageUrl: ''
    };
    this.selectedFile = null;
    this.isEditing = false;
    this.editId = null;
  }

  clearMessagesAfterDelay() {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 3000);
  }

  // DELETE MENU ITEM
  deleteItem(id: number) {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.http.deleteMenuItem(id).subscribe({
        next: () => {
          this.successMessage = "Deleted ✅";
          this.clearMessagesAfterDelay();
          this.loadMenu();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = err.error?.message || "Delete failed ❌";
          this.clearMessagesAfterDelay();
        }
      });
    }
  }

  goBack() {
    window.history.back();
  }
}