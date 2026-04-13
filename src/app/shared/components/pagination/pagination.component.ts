import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule.pick({ ChevronLeft, ChevronRight })],
  template: `
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <p class="text-sm text-[var(--color-text-secondary)]">
        Showing <span class="font-medium text-[var(--color-text-primary)]">{{ start() }}</span>
        – <span class="font-medium text-[var(--color-text-primary)]">{{ end() }}</span>
        of <span class="font-medium text-[var(--color-text-primary)]">{{ total() }}</span> results
      </p>

      <div class="flex items-center gap-1">
        <!-- Prev -->
        <button [disabled]="page() === 1" (click)="go(page() - 1)" [class]="btnClass(false, page() === 1)" aria-label="Previous page">
          <lucide-angular name="chevron-left" [size]="14" color="currentColor" />
        </button>

        @for (p of pages(); track p) {
          @if (p === -1) {
            <span class="px-2 text-[var(--color-text-muted)]">…</span>
          } @else {
            <button (click)="go(p)" [class]="btnClass(p === page(), false)">{{ p }}</button>
          }
        }

        <!-- Next -->
        <button [disabled]="page() === totalPages()" (click)="go(page() + 1)" [class]="btnClass(false, page() === totalPages())" aria-label="Next page">
          <lucide-angular name="chevron-right" [size]="14" color="currentColor" />
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  page = input(1);
  pageSize = input(10);
  total = input(0);
  pageChange = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  start = computed(() => Math.min((this.page() - 1) * this.pageSize() + 1, this.total()));
  end = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  go(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.pageChange.emit(p);
  }

  pages = computed(() => {
    const cur = this.page(), total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (cur > 3) pages.push(-1);
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  btnClass(active: boolean, disabled: boolean) {
    return [
      'w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-sm font-medium transition-colors',
      active ? 'bg-[var(--color-primary-600)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
      disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
    ].join(' ');
  }
}
