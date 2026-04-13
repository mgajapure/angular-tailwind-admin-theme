import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, LucideAngularModule.pick({ Loader2 })],
  template: `
    <button
      [ngClass]="buttonClass()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading()"
      [attr.aria-label]="ariaLabel()"
      [attr.type]="type()">

      @if (loading()) {
        <lucide-angular name="loader-2" class="animate-spin" [size]="iconSize()" color="currentColor" aria-hidden="true" />
      }

      @if (!loading()) {
        <ng-content select="[prefix]" />
      }

      <span [class.sr-only]="iconOnly()">
        <ng-content />
      </span>

      @if (!loading()) {
        <ng-content select="[suffix]" />
      }
    </button>
  `
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  loading = input(false);
  disabled = input(false);
  iconOnly = input(false);
  ariaLabel = input<string | undefined>(undefined);
  type = input<'button' | 'submit' | 'reset'>('button');
  fullWidth = input(false);

  iconSize = computed(() => ({ xs: 12, sm: 14, md: 16, lg: 18 }[this.size()]));

  buttonClass = computed(() => {
    const base = [
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'select-none cursor-pointer',
    ];

    const sizes: Record<ButtonSize, string> = {
      xs: 'px-2.5 py-1 text-xs rounded-[var(--radius-sm)]',
      sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-sm)]',
      md: 'px-4 py-2 text-sm rounded-[var(--radius)]',
      lg: 'px-5 py-2.5 text-base rounded-[var(--radius)]',
    };

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] active:scale-[0.98] focus-visible:ring-[var(--color-primary-500)]',
      secondary: 'bg-[var(--color-neutral-100)] text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-200)] active:scale-[0.98] focus-visible:ring-[var(--color-neutral-400)] dark:bg-[var(--color-bg-elevated)] dark:hover:bg-[var(--color-neutral-700)]',
      ghost: 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--color-text-primary)] active:scale-[0.98] focus-visible:ring-[var(--color-neutral-400)] dark:hover:bg-[var(--color-bg-elevated)]',
      outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-50)] active:scale-[0.98] focus-visible:ring-[var(--color-neutral-400)] dark:hover:bg-[var(--color-bg-elevated)]',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] focus-visible:ring-red-500',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] focus-visible:ring-emerald-500',
    };

    const iconOnlyPadding = this.iconOnly() ? {
      xs: '!p-1', sm: '!p-1.5', md: '!p-2', lg: '!p-2.5'
    }[this.size()] : '';

    return [
      ...base,
      sizes[this.size()],
      variants[this.variant()],
      iconOnlyPadding,
      this.fullWidth() ? 'w-full' : '',
    ].filter(Boolean).join(' ');
  });
}
