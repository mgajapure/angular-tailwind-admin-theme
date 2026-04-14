import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { LucideInbox } from '@lucide/angular';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, LucideInbox],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-16 h-16 rounded-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)]
                  flex items-center justify-center mb-4">
        <svg lucideInbox [size]="32" color="currentColor" class="text-[var(--color-text-muted)]" [strokeWidth]="1.5" />
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
