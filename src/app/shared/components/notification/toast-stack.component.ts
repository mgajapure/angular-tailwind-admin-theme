import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-stack',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]"
      role="region"
      aria-label="Notifications"
      aria-live="polite">

      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [class]="toastClass(toast)"
          role="alert"
          class="animate-toast-in flex items-start gap-3 p-4 rounded-[var(--radius-lg)]
                 shadow-[var(--shadow-modal)] border backdrop-blur-sm">

          <!-- Icon -->
          <div [class]="iconWrapperClass(toast)" class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              @switch (toast.type) {
                @case ('success') {
                  <path d="M20 6 9 17l-5-5"/>
                }
                @case ('error') {
                  <path d="M18 6 6 18M6 6l12 12"/>
                }
                @case ('warning') {
                  <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                }
                @default {
                  <path d="M12 16v-4m0-4h.01M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                }
              }
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[var(--color-text-primary)]">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">{{ toast.message }}</p>
            }
            @if (toast.action) {
              <button
                (click)="toast.action!.fn(); toastService.dismiss(toast.id)"
                class="mt-2 text-xs font-medium text-[var(--color-primary-600)] hover:underline">
                {{ toast.action.label }}
              </button>
            }
          </div>

          <!-- Dismiss -->
          <button
            (click)="toastService.dismiss(toast.id)"
            class="shrink-0 p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
                   hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastStackComponent {
  toastService = inject(ToastService);

  toastClass(toast: Toast): string {
    const base = 'bg-[var(--color-bg-surface)]';
    const borders: Record<Toast['type'], string> = {
      success: 'border-emerald-200 dark:border-emerald-900/50',
      error: 'border-red-200 dark:border-red-900/50',
      warning: 'border-amber-200 dark:border-amber-900/50',
      info: 'border-blue-200 dark:border-blue-900/50',
    };
    return [base, borders[toast.type]].join(' ');
  }

  iconWrapperClass(toast: Toast): string {
    const colors: Record<Toast['type'], string> = {
      success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
      error: 'bg-red-100 text-red-600 dark:bg-red-900/30',
      warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
      info: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
    };
    return colors[toast.type];
  }
}
