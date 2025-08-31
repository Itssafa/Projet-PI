// src/app/core/notification.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  show(message: string): void {
    // Replace with Angular Material Snackbar, Toastr, etc.
    // Example using window.alert (simple) — swap with your UI component.
    // e.g. this.snackBar.open(message, 'Close', { duration: 5000 });
    console.warn('Notification:', message);
    // fallback:
    // window.alert(message);
  }
}