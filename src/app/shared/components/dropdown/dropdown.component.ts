import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener,
  computed, inject, input, signal
} from '@angular/core';

export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/**
 * A reusable, accessible dropdown container.
 *
 * Usage:
 *   <ui-dropdown placement="bottom-end" minWidth="180px">
 *     <button trigger ...>Open</button>
 *
 *     <div dropdown-header>Optional header</div>
 *
 *     <ui-dropdown-item (click)="doSomething()">Action</ui-dropdown-item>
 *     <ui-dropdown-separator />
 *     <ui-dropdown-item [danger]="true" (click)="deleteIt()">Delete</ui-dropdown-item>
 *
 *     <div dropdown-footer>Optional footer</div>
 *   </ui-dropdown>
 *
 * The panel closes automatically when:
 *  - Any item inside the panel is clicked (event bubbling)
 *  - Escape key is pressed
 *  - A click occurs outside the component
 */
@Component({
  selector: 'ui-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-flex">

      <!-- Trigger wrapper — click toggles the panel -->
      <div (click)="toggle($event)" class="inline-flex">
        <ng-content select="[trigger]" />
      </div>

      <!-- Panel -->
      @if (isOpen()) {
        <div
          role="menu"
          aria-orientation="vertical"
          (click)="close()"
          class="absolute z-50 bg-[var(--color-bg-surface)] border border-[var(--color-border)]
                 rounded-[var(--radius-lg)] shadow-[var(--shadow-modal)] animate-scale-in overflow-hidden"
          [class]="panelClass()"
          [style.min-width]="minWidth()">

          <!-- Optional header slot -->
          <ng-content select="[dropdown-header]" />

          <!-- Items -->
          <div class="py-1">
            <ng-content />
          </div>

          <!-- Optional footer slot -->
          <ng-content select="[dropdown-footer]" />
        </div>
      }

    </div>
  `
})
export class DropdownComponent {
  /** Which corner of the trigger to anchor the panel to. */
  placement = input<DropdownPlacement>('bottom-end');

  /** Minimum panel width. Pass a CSS value e.g. '200px' or 'auto'. */
  minWidth = input('160px');

  isOpen = signal(false);

  private el = inject(ElementRef);

  toggle(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  close() {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement) {
    if (!this.el.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.isOpen.set(false);
  }

  panelClass = computed(() => ({
    'bottom-start': 'top-full left-0 mt-1.5',
    'bottom-end':   'top-full right-0 mt-1.5',
    'top-start':    'bottom-full left-0 mb-1.5',
    'top-end':      'bottom-full right-0 mb-1.5',
  }[this.placement()]));
}
