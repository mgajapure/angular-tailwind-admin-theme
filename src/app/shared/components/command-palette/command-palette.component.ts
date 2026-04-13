import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { navigation } from '../../../config/navigation.config';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  action: () => void;
  group: string;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[150] flex items-start justify-center pt-[15vh] px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
             (click)="close()"></div>

        <!-- Panel -->
        <div class="relative w-full max-w-xl bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)]
                    shadow-[var(--shadow-modal)] border border-[var(--color-border)] overflow-hidden
                    animate-scale-in">

          <!-- Search input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
            <svg class="w-4 h-4 text-[var(--color-text-muted)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              #searchInput
              [(ngModel)]="query"
              (ngModelChange)="onQuery($event)"
              placeholder="Search pages, actions…"
              class="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                     outline-none"
              autocomplete="off" />
            <kbd class="px-1.5 py-0.5 text-[10px] font-medium bg-[var(--color-neutral-100)]
                        dark:bg-[var(--color-bg-elevated)] rounded text-[var(--color-text-muted)]">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-80 overflow-y-auto py-2">
            @if (results().length === 0) {
              <div class="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                No results for "{{ query() }}"
              </div>
            }

            @for (group of groupedResults(); track group.name) {
              <div class="mb-1">
                <div class="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {{ group.name }}
                </div>
                @for (item of group.items; track item.id; let i = $index) {
                  <button
                    (click)="execute(item)"
                    (mouseenter)="selectedIndex.set(flatIndex(group.name, i))"
                    [class]="itemClass(flatIndex(group.name, i))"
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors">
                    <div class="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-neutral-100)]
                                dark:bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0">
                      <svg class="w-3.5 h-3.5 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9h18M3 15h18"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ item.label }}</div>
                      @if (item.description) {
                        <div class="text-xs text-[var(--color-text-muted)] truncate">{{ item.description }}</div>
                      }
                    </div>
                    <svg class="w-3 h-3 text-[var(--color-text-muted)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                }
              </div>
            }
          </div>

          <!-- Footer hint -->
          <div class="px-4 py-2.5 border-t border-[var(--color-border)] flex items-center gap-4 text-[10px] text-[var(--color-text-muted)]">
            <span><kbd class="px-1 py-0.5 bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] rounded font-medium">↑↓</kbd> navigate</span>
            <span><kbd class="px-1 py-0.5 bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] rounded font-medium">↵</kbd> select</span>
            <span><kbd class="px-1 py-0.5 bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] rounded font-medium">ESC</kbd> close</span>
          </div>
        </div>
      </div>
    }
  `
})
export class CommandPaletteComponent {
  private router = inject(Router);
  isOpen = signal(false);
  query = signal('');
  selectedIndex = signal(0);

  private allCommands = computed<CommandItem[]>(() => {
    const cmds: CommandItem[] = [];
    for (const group of navigation) {
      for (const item of group.items) {
        if (item.route) {
          cmds.push({ id: item.id, label: item.label, icon: item.icon, group: group.label, action: () => this.router.navigate([item.route]) });
        }
        if (item.children) {
          for (const child of item.children) {
            if (child.route) {
              cmds.push({ id: child.id, label: child.label, description: `Under ${item.label}`, icon: child.icon, group: group.label, action: () => this.router.navigate([child.route]) });
            }
          }
        }
      }
    }
    return cmds;
  });

  results = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.allCommands().slice(0, 8);
    return this.allCommands().filter(c => c.label.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
  });

  groupedResults = computed(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of this.results()) {
      const g = map.get(item.group) ?? [];
      g.push(item);
      map.set(item.group, g);
    }
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  });

  flatIndex(groupName: string, itemIndex: number): number {
    let idx = 0;
    for (const g of this.groupedResults()) {
      if (g.name === groupName) return idx + itemIndex;
      idx += g.items.length;
    }
    return 0;
  }

  onQuery(q: string) { this.query.set(q); this.selectedIndex.set(0); }

  itemClass(index: number) {
    return index === this.selectedIndex()
      ? 'bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)]'
      : 'hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)]';
  }

  execute(item: CommandItem) { item.action(); this.close(); }

  close() { this.isOpen.set(false); this.query.set(''); this.selectedIndex.set(0); }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); this.isOpen.update(v => !v); return; }
    if (!this.isOpen()) return;
    if (e.key === 'Escape') { this.close(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); this.selectedIndex.update(i => Math.min(i + 1, this.results().length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); this.selectedIndex.update(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      const flat = this.results()[this.selectedIndex()];
      if (flat) this.execute(flat);
    }
  }
}
