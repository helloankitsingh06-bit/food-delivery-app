package com.edutech.fooddeliverysystem.dto;

import java.util.List;

public class OrderRequestDto {
    private List<ItemDto> items;
    private double totalPrice;
    private String paymentMethod;
    private String upiApp;

    public static class ItemDto {
        private String name;
        private double price;
        private int quantity;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    // Getters and setters for main fields
    public List<ItemDto> getItems() { return items; }
    public void setItems(List<ItemDto> items) { this.items = items; }
    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getUpiApp() { return upiApp; }
    public void setUpiApp(String upiApp) { this.upiApp = upiApp; }
}