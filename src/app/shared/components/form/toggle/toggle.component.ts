import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

@Component({
  selector: 'ui-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="inline-flex items-center gap-3 cursor-pointer select-none"
           [class.opacity-50]="disabled()"
           [class.cursor-not-allowed]="disabled()">

      <button
        role="switch"
        [attr.aria-checked]="value()"
        [attr.aria-label]="label()"
        [disabled]="disabled()"
        (click)="toggle()"
        [class]="trackClass()">
        <span [class]="thumbClass()"></span>
      </button>

      @if (label()) {
        <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ label() }}</span>
      }
      @if (description()) {
        <span class="text-xs text-[var(--color-text-muted)]">{{ description() }}</span>
      }
    </label>
  `
})
export class ToggleComponent {
  value = model(false);
  label = input('');
  description = input('');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input(false);
  change = output<boolean>();

  toggle() {
    if (!this.disabled()) {
      this.value.update(v => !v);
      this.change.emit(this.value());
    }
  }

  trackClass = computed(() => {
    const sizes = { sm: 'w-8 h-4', md: 'w-10 h-5', lg: 'w-12 h-6' };
    return [
      'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2',
      sizes[this.size()],
      this.value()
        ? 'bg-[var(--color-primary-600)]'
        : 'bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)]',
    ].join(' ');
  });

  thumbClass = computed(() => {
    const sizes = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' };
    const translated = {
      sm: this.value() ? 'translate-x-4' : 'translate-x-0.5',
      md: this.value() ? 'translate-x-[1.375rem]' : 'translate-x-0.5',
      lg: this.value() ? 'translate-x-[1.625rem]' : 'translate-x-0.5',
    };
    return [
      'inline-block rounded-full bg-white shadow-sm transition-transform duration-200',
      sizes[this.size()],
      translated[this.size()],
    ].join(' ');
  });
}
