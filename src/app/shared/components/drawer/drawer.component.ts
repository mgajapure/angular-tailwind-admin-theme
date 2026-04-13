import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { LucideX } from '@lucide/angular';

@Component({
  selector: 'ui-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideX],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[90] flex" [class]="positionClass()">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          (click)="close.emit()">
        </div>

        <!-- Panel -->
        <div
          class="relative bg-[var(--color-bg-surface)] flex flex-col shadow-[var(--shadow-modal)]"
          [class]="panelClass()">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
            <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">{{ title() }}</h2>
            <button
              (click)="close.emit()"
              class="p-2 rounded-[var(--radius)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
                     hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors"
              aria-label="Close panel">
              <svg lucideX [size]="16" color="currentColor" [strokeWidth]="2.5" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <ng-content />
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-[var(--color-border)] shrink-0">
            <ng-content select="[drawer-footer]" />
          </div>
        </div>
      </div>
    }
  `
})
export class DrawerComponent {
  open = input(false);
  title = input('');
  position = input<'left' | 'right'>('right');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  close = output<void>();

  @HostListener('document:keydown.escape')
  onEscape() { this.close.emit(); }

  positionClass() {
    return this.position() === 'right' ? 'justify-end' : 'justify-start';
  }

  panelClass() {
    const widths = { sm: 'w-80', md: 'w-96', lg: 'w-[480px]', xl: 'w-[640px]' };
    const anim = this.position() === 'right' ? 'animate-slide-right' : 'animate-slide-left';
    return [widths[this.size()], anim, 'h-full'].join(' ');
  }
}
