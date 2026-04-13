import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full">
      @if (label()) {
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ label() }}</span>
          @if (showValue()) {
            <span class="text-sm text-[var(--color-text-secondary)]">{{ value() }}%</span>
          }
        </div>
      }
      <div
        class="w-full overflow-hidden bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] rounded-full"
        [class]="trackClass()"
        role="progressbar"
        [attr.aria-valuenow]="value()"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="max()"
        [attr.aria-label]="label() || 'Progress'">
        <div
          class="rounded-full transition-all duration-500 ease-out"
          [class]="barClass()"
          [style.width.%]="clampedValue()">
        </div>
      </div>
    </div>
  `
})
export class ProgressComponent {
  value = input(0);
  max = input(100);
  label = input('');
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');
  variant = input<'primary' | 'success' | 'warning' | 'danger'>('primary');
  animated = input(false);
  showValue = input(false);

  clampedValue = computed(() => Math.min(100, Math.max(0, (this.value() / this.max()) * 100)));

  trackClass = computed(() => ({
    xs: 'h-1', sm: 'h-1.5', md: 'h-2', lg: 'h-3'
  }[this.size()]));

  barClass = computed(() => {
    const variants = {
      primary: 'bg-[var(--color-primary-600)]',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
    };
    return [
      'h-full',
      variants[this.variant()],
      this.animated() ? 'bg-[length:1rem_1rem] animate-[shimmer_1s_linear_infinite]' : '',
    ].filter(Boolean).join(' ');
  });
}
