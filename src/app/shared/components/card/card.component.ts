import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="cardClass()">
      @if (title()) {
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-[var(--color-text-primary)]">{{ title() }}</h3>
          <ng-content select="[card-actions]" />
        </div>
      }
      <ng-content />
    </div>
  `
})
export class CardComponent {
  title = input('');
  padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  shadow = input(true);
  bordered = input(true);
  hover = input(false);

  cardClass = computed(() => {
    const pads = { none: 'p-0', sm: 'p-4', md: 'p-6', lg: 'p-8' };
    return [
      'bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)]',
      pads[this.padding()],
      this.bordered() ? 'border border-[var(--color-border)]' : '',
      this.shadow() ? 'shadow-[var(--shadow-card)]' : '',
      this.hover() ? 'transition-shadow hover:shadow-[var(--shadow-elevated)] cursor-pointer' : '',
    ].filter(Boolean).join(' ');
  });
}
