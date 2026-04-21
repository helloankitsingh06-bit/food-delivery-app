import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-manage-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-menu.component.html',
  styleUrls: ['./manage-menu.component.css'] // ✅ ADDED THIS LINE
})
export class ManageMenuComponent implements OnInit {

  constructor(private http: HttpService) {}

  menuItem: any = {
    name: '',
    price: 0,
    description: '',
    quantity: 0,
    imageUrl: ''
  };

  selectedFile: File | null = null;
  menuList: any[] = [];

  restaurantId = 12; // 🔥 later make dynamic

  // ✅ EDIT STATE
  isEditing = false;
  editId: number | null = null;

  // ✅ LOAD DATA ON PAGE OPEN
  ngOnInit() {
    this.loadMenu();
  }

  // ✅ FETCH MENU FROM BACKEND
  loadMenu() {
    this.http.getMenuByRestaurant(this.restaurantId).subscribe({
      next: (res: any) => {
        this.menuList = res;
      },
      error: (err) => {
        console.error("Error loading menu", err);
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // ✅ EDIT ITEM (CLEAN)
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

  // ✅ ADD + UPDATE COMBINED
  addItem() {

    const payload = {
      ...this.menuItem,
      imageUrl: this.selectedFile
        ? this.selectedFile.name
        : this.menuItem.imageUrl
    };

    // 🔥 DEBUG FOR UPDATE FLOW
    if (this.isEditing) {
      console.log("UPDATING ITEM", this.editId, payload);
    }

    if (this.isEditing && this.editId !== null) {

      // 🔄 UPDATE
      this.http.updateMenuItem(this.editId, payload).subscribe({
        next: () => {
          alert("Updated ✅");
          this.loadMenu();
          this.isEditing = false;
          this.editId = null;
        },
        error: () => alert("Update failed ❌")
      });

    } else {

      // ➕ ADD
      this.http.addMenuItem(this.restaurantId, payload).subscribe({
        next: () => {
          alert("Added ✅");
          this.loadMenu();
        },
        error: () => alert("Add failed ❌")
      });
    }

    // 🔄 RESET FORM
    this.menuItem = {
      name: '',
      price: 0,
      description: '',
      quantity: 0,
      imageUrl: ''
    };

    this.selectedFile = null;
  }

  // ✅ DELETE MENU ITEM
  deleteItem(id: number) {
    this.http.deleteMenuItem(id).subscribe({
      next: () => {
        alert("Deleted ✅");
        this.loadMenu();
      },
      error: (err) => {
        console.error(err);
        alert("Delete failed ❌");
      }
    });
  }
}