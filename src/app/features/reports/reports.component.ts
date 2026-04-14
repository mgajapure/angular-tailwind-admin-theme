import {
  ChangeDetectionStrategy, Component, OnInit, inject, signal
} from '@angular/core';
import { CurrencyPipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import {
  LucideZap, LucideDownload, LucideClock, LucideEye, LucideCalendar, LucideRefreshCw, LucideFileText,
  LucideDollarSign, LucideShoppingCart, LucideUsers, LucideTrendingUp,
  LucideArrowUpRight, LucideArrowDownRight, LucideBarChart2, LucideActivity,
  LucideDynamicIcon, provideLucideIcons,
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProgressComponent } from '../../shared/components/progress/progress.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideLucideIcons(
      LucideDollarSign, LucideShoppingCart, LucideUsers, LucideTrendingUp,
      LucideArrowUpRight, LucideArrowDownRight, LucideBarChart2, LucideActivity, LucideFileText
    ),
  ],
  imports: [
    CurrencyPipe, DecimalPipe, TitleCasePipe,
    ButtonComponent, BadgeComponent, ProgressComponent, SkeletonComponent,
    LucideZap, LucideDownload, LucideClock, LucideEye, LucideCalendar, LucideRefreshCw, LucideFileText,
    LucideDynamicIcon,
  ],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Reports</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Generate and download business reports</p>
      </div>
      <div class="flex items-center gap-2">
        <select class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                       bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20">
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>Last 12 months</option>
          <option>Custom range</option>
        </select>
        <ui-button variant="primary" (click)="generateReport()">
          <svg lucideZap prefix [size]="14" color="currentColor" />
          Generate Report
        </ui-button>
      </div>
    </div>

    <!-- Summary KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      @for (kpi of kpis; track kpi.label) {
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{{ kpi.label }}</div>
            <div class="w-8 h-8 rounded-[var(--radius)] flex items-center justify-center" [class]="kpi.iconBg">
              <svg [lucideIcon]="kpi.icon" [size]="14" color="currentColor" [class]="kpi.iconColor" />
            </div>
          </div>
          <div class="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{{ kpi.value }}</div>
          <div class="flex items-center gap-1 text-xs" [class]="kpi.trend > 0 ? 'text-emerald-600' : 'text-red-500'">
            <svg [lucideIcon]="kpi.trend > 0 ? 'arrow-up-right' : 'arrow-down-right'" [size]="12" color="currentColor" />
            <span>{{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%</span>
            <span class="text-[var(--color-text-muted)]">vs last period</span>
          </div>
        </div>
      }
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

      <!-- Revenue Chart (sparkline bars) -->
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-base font-semibold text-[var(--color-text-primary)]">Revenue Over Time</h3>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Daily revenue for the last 30 days</p>
          </div>
          <ui-button variant="ghost" size="sm" (click)="downloadChart('revenue')">
            <svg lucideDownload prefix [size]="12" color="currentColor" />
            Export
          </ui-button>
        </div>
        <!-- Mini bar chart -->
        <div class="flex items-end gap-1 h-32">
          @for (bar of revenueData; track $index) {
            <div class="flex-1 flex flex-col items-center gap-0.5 group cursor-pointer" [title]="'Day ' + ($index + 1) + ': $' + bar">
              <div class="w-full rounded-t-sm transition-all duration-300 group-hover:opacity-80"
                   [class]="$index === revenueData.length - 1 ? 'bg-[var(--color-primary-600)]' : 'bg-[var(--color-primary-200)] dark:bg-[var(--color-primary-800)]'"
                   [style.height.%]="(bar / maxRevenue) * 100">
              </div>
            </div>
          }
        </div>
        <div class="flex items-center justify-between mt-2 text-xs text-[var(--color-text-muted)]">
          <span>Nov 14</span><span>Nov 21</span><span>Nov 28</span><span>Dec 5</span><span>Dec 13</span>
        </div>
      </div>

      <!-- Top channels -->
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
        <h3 class="text-base font-semibold text-[var(--color-text-primary)] mb-1">Sales Channels</h3>
        <p class="text-xs text-[var(--color-text-muted)] mb-5">Revenue by channel</p>
        <div class="space-y-4">
          @for (ch of channels; track ch.name) {
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm text-[var(--color-text-secondary)]">{{ ch.name }}</span>
                <span class="text-sm font-semibold text-[var(--color-text-primary)]">{{ ch.pct }}%</span>
              </div>
              <ui-progress [value]="ch.pct" [variant]="ch.variant" size="sm" />
              <div class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ ch.revenue | currency }}</div>
            </div>
          }
        </div>
      </div>

    </div>

    <!-- Report Cards Grid -->
    <h2 class="text-base font-semibold text-[var(--color-text-primary)] mb-4">Available Reports</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
      @for (report of reportTypes; track report.id) {
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]
                    hover:shadow-[var(--shadow-elevated)] transition-all group cursor-pointer p-5"
             (click)="viewReport(report)">
          <div class="flex items-start justify-between mb-4">
            <div class="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center" [class]="report.iconBg">
              <svg [lucideIcon]="report.icon" [size]="20" color="currentColor" [class]="report.iconColor" />
            </div>
            <ui-badge [variant]="report.status === 'ready' ? 'success' : report.status === 'scheduled' ? 'info' : 'neutral'" size="sm">
              {{ report.status | titlecase }}
            </ui-badge>
          </div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{{ report.title }}</h3>
          <p class="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-2">{{ report.description }}</p>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <svg lucideClock [size]="11" color="currentColor" />
              <span>{{ report.lastRun }}</span>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <ui-button variant="ghost" size="xs" (click)="viewReport(report); $event.stopPropagation()">
                <svg lucideEye [size]="12" color="currentColor" />
              </ui-button>
              <ui-button variant="ghost" size="xs" (click)="downloadReport(report); $event.stopPropagation()">
                <svg lucideDownload [size]="12" color="currentColor" />
              </ui-button>
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Scheduled Reports -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="text-base font-semibold text-[var(--color-text-primary)]">Scheduled Reports</h3>
          <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Automated report delivery via email</p>
        </div>
        <ui-button variant="outline" size="sm" (click)="addSchedule()">
          <svg lucideCalendar prefix [size]="12" color="currentColor" />
          Schedule New
        </ui-button>
      </div>
      <div class="space-y-3">
        @for (sched of scheduledReports; track sched.id) {
          <div class="flex items-center justify-between p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)]
                      hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-[var(--radius)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 flex items-center justify-center">
                <svg lucideFileText [size]="14" color="currentColor" class="text-[var(--color-primary-600)]" />
              </div>
              <div>
                <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ sched.name }}</div>
                <div class="text-xs text-[var(--color-text-muted)]">{{ sched.frequency }} · {{ sched.recipients }} recipients</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="text-xs text-[var(--color-text-muted)]">Next run</div>
                <div class="text-xs font-medium text-[var(--color-text-primary)]">{{ sched.nextRun }}</div>
              </div>
              <ui-badge variant="success" size="sm" [dot]="true">Active</ui-badge>
              <ui-button variant="ghost" size="xs" (click)="toggleSchedule(sched)">
                <svg lucideRefreshCw [size]="12" color="currentColor" />
              </ui-button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private layout = inject(LayoutService);
  private toast = inject(ToastService);

  kpis = [
    { label: 'Total Revenue', value: '$84,529', trend: 12.5, icon: 'dollar-sign', iconBg: 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20', iconColor: 'text-[var(--color-primary-600)]' },
    { label: 'Total Orders', value: '1,284', trend: 8.2, icon: 'shopping-cart', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600' },
    { label: 'New Customers', value: '342', trend: 5.7, icon: 'users', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600' },
    { label: 'Avg Order Value', value: '$65.83', trend: -1.4, icon: 'trending-up', iconBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600' },
  ];

  revenueData = [1200, 1800, 900, 2100, 1600, 2400, 2800, 1900, 3100, 2600, 3400, 2900, 3800, 3200, 2700, 4100, 3500, 2800, 3900, 4200, 3600, 4800, 4100, 3700, 5100, 4600, 3900, 5400, 4900, 5800];
  maxRevenue = 6000;

  channels: Array<{ name: string; pct: number; revenue: number; variant: 'primary' | 'success' | 'warning' | 'danger' }> = [
    { name: 'Direct', pct: 38, revenue: 32121, variant: 'primary' },
    { name: 'Organic Search', pct: 28, revenue: 23668, variant: 'success' },
    { name: 'Email', pct: 21, revenue: 17751, variant: 'warning' },
    { name: 'Referral', pct: 13, revenue: 10989, variant: 'danger' },
  ];

  reportTypes = [
    { id: 1, title: 'Sales Summary', description: 'Comprehensive overview of revenue, orders, and conversion rates across all channels.', icon: 'dollar-sign', iconBg: 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20', iconColor: 'text-[var(--color-primary-600)]', status: 'ready', lastRun: '2 hours ago' },
    { id: 2, title: 'Customer Acquisition', description: 'New vs returning customers, acquisition channels, LTV, and churn analysis.', icon: 'users', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', status: 'ready', lastRun: '1 day ago' },
    { id: 3, title: 'Product Performance', description: 'Top sellers, slow movers, inventory turnover, and category breakdown.', icon: 'bar-chart-2', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600', status: 'ready', lastRun: '6 hours ago' },
    { id: 4, title: 'Traffic & SEO', description: 'Page views, sessions, bounce rate, keyword rankings, and organic growth.', icon: 'activity', iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600', status: 'scheduled', lastRun: 'Tomorrow 9am' },
    { id: 5, title: 'Financial Statement', description: 'P&L, gross margin, operating costs, tax summary, and reconciliation.', icon: 'file-text', iconBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600', status: 'ready', lastRun: '3 days ago' },
    { id: 6, title: 'Inventory Report', description: 'Stock levels, reorder alerts, warehouse distribution, and shrinkage.', icon: 'trending-up', iconBg: 'bg-rose-50 dark:bg-rose-900/20', iconColor: 'text-rose-600', status: 'generating', lastRun: 'In progress...' },
  ];

  scheduledReports = [
    { id: 1, name: 'Weekly Sales Digest', frequency: 'Every Monday 8:00 AM', recipients: 4, nextRun: 'Mon Dec 16, 08:00' },
    { id: 2, name: 'Monthly P&L Statement', frequency: '1st of each month', recipients: 2, nextRun: 'Jan 1, 09:00' },
    { id: 3, name: 'Daily Order Summary', frequency: 'Every day at 6:00 PM', recipients: 6, nextRun: 'Today, 18:00' },
  ];

  ngOnInit() {
    this.layout.setPage('Reports', [{ label: 'Management' }, { label: 'Reports' }]);
  }

  generateReport() { this.toast.success('Report queued', 'Your report is being generated. You\'ll be notified when it\'s ready.'); }
  viewReport(r: { title: string }) { this.toast.info('Opening report', `Loading ${r.title}…`); }
  downloadReport(r: { title: string }) { this.toast.success('Download started', `${r.title} is downloading as PDF.`); }
  downloadChart(type: string) { this.toast.info('Export started', `Exporting ${type} chart as PNG.`); }
  addSchedule() { this.toast.info('Coming soon', 'Scheduled report builder will be available soon.'); }
  toggleSchedule(s: { name: string }) { this.toast.success('Schedule updated', `${s.name} schedule has been refreshed.`); }
}
