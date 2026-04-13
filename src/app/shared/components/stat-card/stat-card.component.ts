import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown } from 'lucide-angular';

@Component({
  selector: 'ui-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, LucideAngularModule.pick({ TrendingUp, TrendingDown })],
  template: `
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                shadow-[var(--shadow-card)] p-5 hover:shadow-[var(--shadow-elevated)] transition-shadow group">

      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-[var(--color-text-secondary)]">{{ label() }}</span>
        <div [class]="iconBgClass()"
             class="w-9 h-9 rounded-[var(--radius)] flex items-center justify-center shrink-0">
          <ng-content select="[stat-icon]" />
        </div>
      </div>

      <!-- Value -->
      <div class="text-2xl font-bold text-[var(--color-text-primary)] tabular-nums tracking-tight">
        {{ prefix() }}{{ value() | number }}{{ suffix() }}
      </div>

      <!-- Trend -->
      @if (trend() !== 0) {
        <div class="flex items-center gap-1.5 mt-2">
          @if (trend() >= 0) {
            <lucide-angular name="trending-up" [size]="14" color="currentColor" class="text-emerald-500" [strokeWidth]="2.5" />
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+{{ trend() }}%</span>
          } @else {
            <lucide-angular name="trending-down" [size]="14" color="currentColor" class="text-red-500" [strokeWidth]="2.5" />
            <span class="text-xs font-semibold text-red-600 dark:text-red-400">{{ trend() }}%</span>
          }
          <span class="text-xs text-[var(--color-text-muted)]">{{ trendLabel() }}</span>
        </div>
      }

      <!-- Sparkline bars -->
      @if (sparkline().length) {
        <div class="flex items-end gap-0.5 mt-4 h-10">
          @for (val of sparkline(); track $index) {
            <div
              class="flex-1 rounded-sm transition-all duration-500 group-hover:opacity-100 opacity-70"
              [class]="barColorClass()"
              [style.height.%]="(val / maxSparkline()) * 100">
            </div>
          }
        </div>
      }
    </div>
  `
})
export class StatCardComponent {
  label = input('');
  value = input(0);
  prefix = input('');
  suffix = input('');
  trend = input(0);
  trendLabel = input('vs last period');
  sparkline = input<number[]>([]);
  color = input<'primary' | 'success' | 'warning' | 'danger' | 'info'>('primary');

  maxSparkline = computed(() => Math.max(...this.sparkline(), 1));

  iconBgClass = computed(() => {
    const colors = {
      primary: 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)]/20',
      success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
      warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
      danger: 'bg-red-50 text-red-600 dark:bg-red-900/20',
      info: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
    };
    return colors[this.color()];
  });

  barColorClass = computed(() => {
    const colors = {
      primary: 'bg-[var(--color-primary-400)]',
      success: 'bg-emerald-400',
      warning: 'bg-amber-400',
      danger: 'bg-red-400',
      info: 'bg-blue-400',
    };
    return colors[this.color()];
  });
}
