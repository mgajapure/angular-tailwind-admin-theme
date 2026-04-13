import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
      @for (item of items(); track item.id) {
        <div>
          <button
            (click)="toggle(item.id)"
            [disabled]="item.disabled"
            [attr.aria-expanded]="isOpen(item.id)"
            [attr.aria-controls]="item.id + '-content'"
            class="w-full flex items-center justify-between px-5 py-4 text-left
                   bg-[var(--color-bg-surface)] hover:bg-[var(--color-neutral-50)]
                   dark:hover:bg-[var(--color-bg-elevated)] transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ item.title }}</span>
            <svg
              class="w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 shrink-0"
              [class.rotate-180]="isOpen(item.id)"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          @if (isOpen(item.id)) {
            <div
              [id]="item.id + '-content'"
              class="px-5 py-4 text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)]
                     border-t border-[var(--color-border)] leading-relaxed animate-fade-in">
              {{ item.content }}
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AccordionComponent {
  items = input.required<AccordionItem[]>();
  multiple = input(false);

  private openIds = signal<Set<string>>(new Set());

  isOpen(id: string) { return this.openIds().has(id); }

  toggle(id: string) {
    this.openIds.update(set => {
      const next = new Set(this.multiple() ? set : new Set<string>());
      if (set.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
}
