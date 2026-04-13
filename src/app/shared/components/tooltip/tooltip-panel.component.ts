import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

/**
 * Internal floating panel rendered into the CDK overlay.
 * Not meant to be used directly — use the [uiTooltip] directive instead.
 */
@Component({
  selector: 'ui-tooltip-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tooltip',
    class: 'block pointer-events-none',
  },
  template: `
    <div
      class="px-2.5 py-1.5 text-xs font-medium leading-snug
             bg-[var(--color-neutral-800)] text-white
             rounded-[var(--radius)] shadow-lg
             max-w-[220px] text-center break-words
             animate-fade-in select-none">
      {{ text() }}
    </div>
  `
})
export class TooltipPanelComponent {
  text = signal('');
}
