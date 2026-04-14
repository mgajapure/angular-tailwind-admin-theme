import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Horizontal rule between groups of items inside a <ui-dropdown>. */
@Component({
  selector: 'ui-dropdown-separator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator', class: 'block' },
  template: `<div class="my-1 border-t border-[var(--color-border)]"></div>`
})
export class DropdownSeparatorComponent {}
