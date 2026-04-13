import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A single item inside a <ui-dropdown> panel.
 *
 * The icon (if any) and label are placed via the default slot.
 * SVG icons placed directly inside will inherit the item's text colour.
 *
 * Usage:
 *   <ui-dropdown-item (click)="doSomething()">
 *     <svg lucideEdit2 [size]="14" color="currentColor" />
 *     Edit
 *   </ui-dropdown-item>
 *
 *   <ui-dropdown-item [danger]="true" (click)="deleteIt()">
 *     <svg lucideTrash2 [size]="14" color="currentColor" />
 *     Delete
 *   </ui-dropdown-item>
 */
@Component({
  selector: 'ui-dropdown-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'menuitem', class: 'block' },
  template: `
    <button
      type="button"
      [disabled]="disabled()"
      class="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm
             transition-colors duration-100 text-left select-none
             disabled:opacity-40 disabled:cursor-not-allowed"
      [class]="danger()
        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'
        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'">
      <ng-content />
    </button>
  `
})
export class DropdownItemComponent {
  /** Renders the item in red — use for destructive actions. */
  danger = input(false);

  /** Greys out and disables the item. */
  disabled = input(false);
}
