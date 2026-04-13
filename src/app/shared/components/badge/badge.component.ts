import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="badgeClass()">
      @if (dot()) {
        <span class="w-1.5 h-1.5 rounded-full bg-current opacity-70 inline-block"></span>
      }
      <ng-content />
      @if (dismissible()) {
        <button
          (click)="dismiss.emit()"
          class="ml-0.5 -mr-0.5 rounded-full hover:bg-black/10 p-0.5 transition-colors"
          aria-label="Dismiss">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      }
    </span>
  `
})
export class BadgeComponent {
  variant = input<BadgeVariant>('neutral');
  size = input<BadgeSize>('md');
  dot = input(false);
  dismissible = input(false);
  dismiss = output<void>();

  badgeClass = computed(() => {
    const base = 'inline-flex items-center gap-1 font-medium rounded-full';

    const sizes: Record<BadgeSize, string> = {
      sm: 'px-1.5 py-0.5 text-[10px]',
      md: 'px-2 py-0.5 text-xs',
      lg: 'px-2.5 py-1 text-sm',
    };

    const variants: Record<BadgeVariant, string> = {
      primary: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-200)]',
      success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      neutral: 'bg-[var(--color-neutral-100)] text-[var(--color-text-secondary)] dark:bg-[var(--color-bg-elevated)] dark:text-[var(--color-text-secondary)]',
    };

    return [base, sizes[this.size()], variants[this.variant()]].join(' ');
  });
}
