import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-16 h-16 rounded-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)]
                  flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4"/>
        </svg>
      </div>
      <h3 class="text-base font-semibold text-[var(--color-text-primary)] mb-1">{{ title() }}</h3>
      <p class="text-sm text-[var(--color-text-secondary)] max-w-sm">{{ description() }}</p>
      @if (actionLabel()) {
        <div class="mt-6">
          <ui-button variant="primary" (click)="action.emit()">{{ actionLabel() }}</ui-button>
        </div>
      }
    </div>
  `
})
export class EmptyStateComponent {
  title = input('Nothing here yet');
  description = input('Get started by creating your first item.');
  actionLabel = input('');
  action = output<void>();
}
