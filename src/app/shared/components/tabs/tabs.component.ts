import {ChangeDetectionStrategy, Component, computed, input, model, output} from '@angular/core';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-tabs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <!-- Tab list -->
      <div [class]="listClass()" role="tablist">
        @for (tab of tabs(); track tab.id) {
          <button
            role="tab"
            [attr.aria-selected]="activeTab() === tab.id"
            [attr.aria-controls]="tab.id + '-panel'"
            [disabled]="tab.disabled"
            (click)="selectTab(tab.id)"
            [class]="tabClass(tab.id, !!tab.disabled)">
            {{ tab.label }}
            @if (tab.badge) {
              <span class="ml-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full
                           bg-[var(--color-primary-100)] text-[var(--color-primary-700)]">
                {{ tab.badge }}
              </span>
            }
          </button>
        }
      </div>

      <!-- Tab panels -->
      <div class="mt-4">
        <ng-content />
      </div>
    </div>
  `
})
export class TabsComponent {
  tabs = input.required<Tab[]>();
  activeTab = model('');
  style = input<'line' | 'pill' | 'card'>('line');
  tabChange = output<string>();

  selectTab(id: string) {
    this.activeTab.set(id);
    this.tabChange.emit(id);
  }

  listClass = computed(() => {
    const base = 'flex';
    const styles = {
      line: 'border-b border-[var(--color-border)] gap-1',
      pill: 'gap-1 bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] p-1 rounded-[var(--radius-lg)]',
      card: 'gap-1',
    };
    return [base, styles[this.style()]].join(' ');
  });

  tabClass(id: string, disabled: boolean): string {
    const base = 'inline-flex items-center gap-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]';
    const isActive = this.activeTab() === id;
    const styleClasses: Record<string, { active: string; inactive: string; wrapper: string }> = {
      line: {
        wrapper: 'px-4 py-2.5 -mb-px border-b-2 rounded-t-sm',
        active: 'border-[var(--color-primary-600)] text-[var(--color-primary-600)]',
        inactive: 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]',
      },
      pill: {
        wrapper: 'px-4 py-1.5 rounded-[var(--radius)]',
        active: 'bg-white dark:bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-card)]',
        inactive: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
      },
      card: {
        wrapper: 'px-4 py-2 rounded-t-[var(--radius)] border border-transparent',
        active: 'bg-[var(--color-bg-surface)] border-[var(--color-border)] border-b-[var(--color-bg-surface)] -mb-px text-[var(--color-text-primary)]',
        inactive: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
      },
    };
    const s = styleClasses[this.style()];
    return [base, s.wrapper, isActive ? s.active : s.inactive, disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'].join(' ');
  }
}
