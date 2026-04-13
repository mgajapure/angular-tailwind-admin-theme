import { ChangeDetectionStrategy, Component, HostListener, computed, input, output } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="title()">

      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        (click)="onBackdropClick()">
      </div>

      <!-- Panel -->
      <div
        class="relative w-full bg-[var(--color-bg-surface)] rounded-[var(--radius-xl)]
               shadow-[var(--shadow-modal)] flex flex-col max-h-[90vh] animate-scale-in"
        [class]="panelWidth()">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">{{ title() }}</h2>
            @if (subtitle()) {
              <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">{{ subtitle() }}</p>
            }
          </div>
          @if (closeable()) {
            <button
              (click)="close.emit()"
              class="p-2 rounded-[var(--radius)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
                     hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors"
              aria-label="Close dialog">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          }
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-1 px-6 py-5">
          <ng-content />
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3 shrink-0">
          <ng-content select="[modal-footer]" />
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  title = input('');
  subtitle = input('');
  size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
  closeable = input(true);
  closeOnBackdrop = input(true);
  close = output<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.closeable()) this.close.emit();
  }

  onBackdropClick() {
    if (this.closeOnBackdrop() && this.closeable()) this.close.emit();
  }

  panelWidth = computed(() => {
    const widths = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[95vw]',
    };
    return widths[this.size()];
  });
}
