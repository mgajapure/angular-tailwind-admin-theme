import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; fn: () => void };
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID();
    this.toasts.update(t => [...t, { ...toast, id }]);
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(title: string, message?: string) {
    return this.show({ type: 'success', title, message });
  }

  error(title: string, message?: string) {
    return this.show({ type: 'error', title, message, duration: 6000 });
  }

  warning(title: string, message?: string) {
    return this.show({ type: 'warning', title, message });
  }

  info(title: string, message?: string) {
    return this.show({ type: 'info', title, message });
  }

  dismiss(id: string) {
    this.toasts.update(t => t.filter(n => n.id !== id));
  }

  dismissAll() {
    this.toasts.set([]);
  }
}
