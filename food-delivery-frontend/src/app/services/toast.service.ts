import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    constructor() { }

    showSuccess(message: string) {
        alert("✅ " + message);
    }

    showError(message: string) {
        alert("❌ " + message);
    }

    showWarning(message: string) {
        alert("⚠️ " + message);
    }

    showInfo(message: string) {
        alert("ℹ️ " + message);
    }
}