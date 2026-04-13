import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (type() === 'text') {
      <div class="space-y-2">
        @for (i of rows(); track $index) {
          <div class="animate-shimmer rounded h-4"
               [style.width]="$last ? '60%' : '100%'"></div>
        }
      </div>
    } @else if (type() === 'card') {
      <div class="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 space-y-4">
        <div class="animate-shimmer rounded h-4 w-1/3"></div>
        <div class="animate-shimmer rounded h-8 w-1/2"></div>
        <div class="animate-shimmer rounded h-3 w-2/3"></div>
      </div>
    } @else if (type() === 'chart') {
      <div class="animate-shimmer rounded-[var(--radius)] w-full" [style.height]="height()"></div>
    } @else if (type() === 'row') {
      <div class="flex items-center gap-3 p-3">
        <div class="animate-shimmer rounded-full w-10 h-10 shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="animate-shimmer rounded h-3 w-1/3"></div>
          <div class="animate-shimmer rounded h-3 w-1/2"></div>
        </div>
        <div class="animate-shimmer rounded h-6 w-16"></div>
      </div>
    } @else if (type() === 'avatar') {
      <div class="animate-shimmer rounded-full" [style.width]="height()" [style.height]="height()"></div>
    } @else {
      <div class="animate-shimmer rounded" [style.height]="height()"></div>
    }
  `
})
export class SkeletonComponent {
  type = input<'text' | 'card' | 'chart' | 'row' | 'avatar' | 'block'>('block');
  rows = input([1, 2, 3]);
  height = input('2.5rem');
}
