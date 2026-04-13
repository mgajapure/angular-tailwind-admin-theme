import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { LucideAngularModule, Check, X, AlertTriangle, Info } from 'lucide-angular';

@Component({
  selector: 'app-toast-stack',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule.pick({ Check, X, AlertTriangle, Info })],
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
            @switch (toast.type) {
              @case ('success') {
                <lucide-angular name="check" [size]="14" color="currentColor" [strokeWidth]="2.5" />
              }
              @case ('error') {
                <lucide-angular name="x" [size]="14" color="currentColor" [strokeWidth]="2.5" />
              }
              @case ('warning') {
                <lucide-angular name="alert-triangle" [size]="14" color="currentColor" [strokeWidth]="2.5" />
              }
              @default {
                <lucide-angular name="info" [size]="14" color="currentColor" [strokeWidth]="2.5" />
              }
            }
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
            <lucide-angular name="x" [size]="12" color="currentColor" [strokeWidth]="3" />
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
