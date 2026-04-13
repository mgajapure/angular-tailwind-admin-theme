import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  LucideDownload, LucidePlus, LucideDollarSign, LucideShoppingCart,
  LucideUsers, LucideActivity, LucideChevronRight
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProgressComponent } from '../../shared/components/progress/progress.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    StatCardComponent, SkeletonComponent, BadgeComponent,
    ButtonComponent, ProgressComponent, AvatarComponent,
    LucideDownload, LucidePlus, LucideDollarSign, LucideShoppingCart,
    LucideUsers, LucideActivity, LucideChevronRight,
  ],
  template: `
    <!-- Page header -->
    <div class="flex items-start justify-between mb-8 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">
          Good morning, {{ getFirstName() }} 👋
        </h1>
        <p class="text-[var(--color-text-secondary)] mt-1 text-sm">
          Here's what's happening with your store today.
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <ui-button variant="outline">
          <svg lucideDownload prefix [size]="14" color="currentColor" />
          Export
        </ui-button>
        <ui-button variant="primary" (click)="onNewReport()">
          <svg lucidePlus prefix [size]="14" color="currentColor" />
          New Report
        </ui-button>
      </div>
    </div>

    <!-- KPI Cards -->
    @if (loading()) {
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        @for (i of [1,2,3,4]; track i) {
          <ui-skeleton type="card" />
        }
      </div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <ui-stat-card label="Total Revenue" [value]="84529" prefix="$" [trend]="12.5" [sparkline]="[30,45,28,60,52,75,68,82]" color="primary">
          <svg lucideDollarSign stat-icon [size]="18" color="currentColor" />
        </ui-stat-card>
        <ui-stat-card label="New Orders" [value]="1284" [trend]="8.2" [sparkline]="[20,35,25,50,45,60,55,70]" color="success">
          <svg lucideShoppingCart stat-icon [size]="18" color="currentColor" />
        </ui-stat-card>
        <ui-stat-card label="Active Users" [value]="9742" [trend]="-2.4" [sparkline]="[65,55,70,48,60,52,58,50]" color="warning">
          <svg lucideUsers stat-icon [size]="18" color="currentColor" />
        </ui-stat-card>
        <ui-stat-card label="Conversion Rate" [value]="3.6" suffix="%" [trend]="1.1" [sparkline]="[2.8,3.1,2.9,3.4,3.2,3.5,3.4,3.6]" color="info">
          <svg lucideActivity stat-icon [size]="18" color="currentColor" />
        </ui-stat-card>
      </div>
    }

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

      <!-- Revenue chart (inline SVG chart) -->
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                  shadow-[var(--shadow-card)] p-6 lg:col-span-2">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-base font-semibold text-[var(--color-text-primary)]">Revenue Overview</h3>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Monthly revenue for 2024</p>
          </div>
          <div class="flex gap-1">
            @for (p of ['6M','1Y','All']; track p) {
              <button
                (click)="activePeriod.set(p)"
                [class]="activePeriod() === p
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-bg-elevated)]'"
                class="px-3 py-1 text-xs font-medium rounded-[var(--radius-sm)] transition-colors">
                {{ p }}
              </button>
            }
          </div>
        </div>
        <!-- SVG bar chart -->
        <div class="flex items-end gap-2 h-48">
          @for (bar of chartData; track bar.month) {
            <div class="flex-1 flex flex-col items-center gap-1.5 group">
              <div
                class="w-full rounded-t-sm transition-all duration-500 cursor-pointer"
                [class]="bar.isCurrentMonth
                  ? 'bg-[var(--color-primary-600)]'
                  : 'bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] group-hover:bg-[var(--color-primary-300)]'"
                [style.height.%]="(bar.value / maxChartValue) * 100"
                [title]="bar.month + ': $' + bar.value.toLocaleString()">
              </div>
              <span class="text-[10px] text-[var(--color-text-muted)]">{{ bar.month }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Donut / Traffic sources -->
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                  shadow-[var(--shadow-card)] p-6">
        <h3 class="text-base font-semibold text-[var(--color-text-primary)] mb-1">Traffic Sources</h3>
        <p class="text-xs text-[var(--color-text-muted)] mb-6">Last 30 days</p>

        <!-- Simple donut representation -->
        <div class="flex items-center justify-center mb-6">
          <div class="relative w-36 h-36">
            <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-neutral-100)" stroke-width="3.5" class="dark:stroke-[var(--color-bg-elevated)]"/>
              @for (seg of donutSegments; track seg.label; let i = $index) {
                <circle cx="18" cy="18" r="15.915" fill="none"
                        [attr.stroke]="seg.color"
                        stroke-width="3.5"
                        [attr.stroke-dasharray]="seg.dash + ' ' + (100 - seg.dash)"
                        [attr.stroke-dashoffset]="seg.offset"
                        class="transition-all duration-700"/>
              }
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-bold text-[var(--color-text-primary)]">{{ totalTraffic | number }}</span>
              <span class="text-[10px] text-[var(--color-text-muted)]">visitors</span>
            </div>
          </div>
        </div>

        <div class="space-y-2.5">
          @for (src of trafficSources; track src.label) {
            <div class="flex items-center gap-3">
              <div class="w-2.5 h-2.5 rounded-full shrink-0" [style.background]="src.color"></div>
              <span class="flex-1 text-sm text-[var(--color-text-secondary)]">{{ src.label }}</span>
              <span class="text-sm font-semibold text-[var(--color-text-primary)]">{{ src.pct }}%</span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Bottom section -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">

      <!-- Recent transactions table -->
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                  shadow-[var(--shadow-card)] p-6 lg:col-span-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-[var(--color-text-primary)]">Recent Transactions</h3>
          <ui-button variant="ghost" size="sm">
            View all
            <svg lucideChevronRight suffix [size]="12" color="currentColor" />
          </ui-button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-[var(--color-border)]">
                @for (h of ['Customer', 'Amount', 'Status', 'Date']; track h) {
                  <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider pb-3 pr-4">{{ h }}</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              @for (tx of transactions; track tx.id) {
                <tr class="hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
                  <td class="py-3 pr-4">
                    <div class="flex items-center gap-2.5">
                      <ui-avatar [name]="tx.customer" size="sm" />
                      <div>
                        <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ tx.customer }}</div>
                        <div class="text-xs text-[var(--color-text-muted)]">{{ tx.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 pr-4 text-sm font-semibold text-[var(--color-text-primary)]">{{ tx.amount }}</td>
                  <td class="py-3 pr-4">
                    <ui-badge [variant]="tx.statusVariant" size="sm" [dot]="true">{{ tx.status }}</ui-badge>
                  </td>
                  <td class="py-3 text-sm text-[var(--color-text-muted)]">{{ tx.date }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top products + progress -->
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                  shadow-[var(--shadow-card)] p-6 lg:col-span-2">
        <h3 class="text-base font-semibold text-[var(--color-text-primary)] mb-4">Top Products</h3>
        <div class="space-y-4">
          @for (p of topProducts; track p.name) {
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ p.name }}</span>
                <span class="text-sm text-[var(--color-text-secondary)]">{{ p.pct }}%</span>
              </div>
              <ui-progress [value]="p.pct" [variant]="getVariant(p)" size="sm" />
              <div class="text-xs text-[var(--color-text-muted)] mt-1">{{ p.sales }} sales · {{ p.revenue }}</div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private layout = inject(LayoutService);
  private toast = inject(ToastService);

  loading = signal(true);
  activePeriod = signal('1Y');

  ngOnInit() {
    this.layout.setPage('Dashboard', [{ label: 'Dashboard' }]);
    setTimeout(() => this.loading.set(false), 600);
  }

  onNewReport() {
    this.toast.success('Report created', 'Your new report is being generated.');
  }

  chartData = [
    { month: 'Jan', value: 42000, isCurrentMonth: false },
    { month: 'Feb', value: 38000, isCurrentMonth: false },
    { month: 'Mar', value: 55000, isCurrentMonth: false },
    { month: 'Apr', value: 48000, isCurrentMonth: false },
    { month: 'May', value: 62000, isCurrentMonth: false },
    { month: 'Jun', value: 71000, isCurrentMonth: false },
    { month: 'Jul', value: 65000, isCurrentMonth: false },
    { month: 'Aug', value: 78000, isCurrentMonth: false },
    { month: 'Sep', value: 69000, isCurrentMonth: false },
    { month: 'Oct', value: 84000, isCurrentMonth: false },
    { month: 'Nov', value: 77000, isCurrentMonth: false },
    { month: 'Dec', value: 84529, isCurrentMonth: true },
  ];
  maxChartValue = 90000;

  trafficSources = [
    { label: 'Organic Search', pct: 42, color: '#4f46e5' },
    { label: 'Direct', pct: 28, color: '#10b981' },
    { label: 'Social Media', pct: 18, color: '#f59e0b' },
    { label: 'Referral', pct: 12, color: '#3b82f6' },
  ];

  totalTraffic = 24831;

  donutSegments = (() => {
    let offset = 25;
    return this.trafficSources.map(s => {
      const dash = s.pct;
      const seg = { label: s.label, color: s.color, dash, offset };
      offset -= dash;
      return seg;
    });
  })();

  transactions = [
    { id: 1, customer: 'Sarah Johnson', email: 'sarah@example.com', amount: '$240.00', status: 'Completed', statusVariant: 'success' as const, date: 'Dec 12' },
    { id: 2, customer: 'Michael Chen', email: 'mike@example.com', amount: '$1,200.00', status: 'Pending', statusVariant: 'warning' as const, date: 'Dec 12' },
    { id: 3, customer: 'Emma Wilson', email: 'emma@example.com', amount: '$89.99', status: 'Completed', statusVariant: 'success' as const, date: 'Dec 11' },
    { id: 4, customer: 'James Brown', email: 'james@example.com', amount: '$350.00', status: 'Failed', statusVariant: 'danger' as const, date: 'Dec 11' },
    { id: 5, customer: 'Lisa Martinez', email: 'lisa@example.com', amount: '$680.00', status: 'Completed', statusVariant: 'success' as const, date: 'Dec 10' },
  ];

  topProducts: Array<{ name: string; pct: number; sales: number; revenue: string; variant: 'primary' | 'success' | 'warning' | 'danger' }> = [
    { name: 'Pro Plan', pct: 87, sales: 1284, revenue: '$42,180', variant: 'primary' },
    { name: 'Enterprise Suite', pct: 64, sales: 382, revenue: '$28,650', variant: 'success' },
    { name: 'Starter Pack', pct: 49, sales: 2140, revenue: '$10,700', variant: 'warning' },
    { name: 'Add-ons Bundle', pct: 32, sales: 891, revenue: '$8,910', variant: 'danger' },
  ];

  getVariant(p: { variant: 'primary' | 'success' | 'warning' | 'danger' }): 'primary' | 'success' | 'warning' | 'danger' {
    return p.variant;
  }

  getFirstName(){
    return this.auth.user()?.name?.split(' ')[0]
  }
}
