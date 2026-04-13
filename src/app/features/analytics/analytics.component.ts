import { ChangeDetectionStrategy, Component, OnInit, inject, model } from '@angular/core';
import { LucideAngularModule, Eye, Home, Clock, Activity } from 'lucide-angular';
import { LayoutService } from '../../core/services/layout.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProgressComponent } from '../../shared/components/progress/progress.component';
import { TabsComponent, Tab } from '../../shared/components/tabs/tabs.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatCardComponent, BadgeComponent, ProgressComponent, TabsComponent, LucideAngularModule.pick({ Eye, Home, Clock, Activity })],
  template: `
    <div class="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Detailed insights into your performance.</p>
      </div>
      <div class="flex items-center gap-2">
        <select class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                       bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20">
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>Last year</option>
        </select>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      <ui-stat-card label="Page Views" [value]="248300" [trend]="18.3" [sparkline]="[40,55,45,70,60,80,72,90]" color="primary">
        <lucide-angular stat-icon name="eye" [size]="18" color="currentColor" />
      </ui-stat-card>
      <ui-stat-card label="Bounce Rate" [value]="34" suffix="%" [trend]="-5.2" trendLabel="improvement" [sparkline]="[55,50,48,42,45,38,36,34]" color="success">
        <lucide-angular stat-icon name="home" [size]="18" color="currentColor" />
      </ui-stat-card>
      <ui-stat-card label="Avg. Session" [value]="4" suffix="m 32s" [trend]="12.1" [sparkline]="[2.1,2.8,3.2,3.5,3.8,4.1,4.3,4.5]" color="warning">
        <lucide-angular stat-icon name="clock" [size]="18" color="currentColor" />
      </ui-stat-card>
      <ui-stat-card label="Goal Completion" [value]="68" suffix="%" [trend]="4.7" [sparkline]="[52,55,58,60,62,64,66,68]" color="info">
        <lucide-angular stat-icon name="activity" [size]="18" color="currentColor" />
      </ui-stat-card>
    </div>

    <!-- Tabs section -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                shadow-[var(--shadow-card)] p-6 mb-6">
      <ui-tabs [tabs]="tabs" [(activeTab)]="activeTab" [style]="'pill'" />

      @if (activeTab() === 'traffic') {
        <div class="mt-6 space-y-4">
          @for (src of trafficData; track src.source) {
            <div class="flex items-center gap-4">
              <div class="w-32 text-sm text-[var(--color-text-secondary)] shrink-0">{{ src.source }}</div>
              <div class="flex-1">
                <ui-progress [value]="src.pct" [variant]="getVariant(src)" size="sm" />
              </div>
              <div class="w-24 text-right">
                <span class="text-sm font-semibold text-[var(--color-text-primary)]">{{ src.visits.toLocaleString() }}</span>
                <span class="text-xs text-[var(--color-text-muted)] ml-1">({{ src.pct }}%)</span>
              </div>
            </div>
          }
        </div>
      }

      @if (activeTab() === 'pages') {
        <div class="mt-6 overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-[var(--color-border)]">
                @for (h of ['Page', 'Views', 'Unique', 'Avg Time', 'Bounce']; track h) {
                  <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider pb-3 pr-6">{{ h }}</th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              @for (page of topPages; track page.url) {
                <tr class="hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
                  <td class="py-3 pr-6">
                    <div class="text-sm font-medium text-[var(--color-primary-600)]">{{ page.url }}</div>
                    <div class="text-xs text-[var(--color-text-muted)]">{{ page.title }}</div>
                  </td>
                  <td class="py-3 pr-6 text-sm text-[var(--color-text-primary)]">{{ page.views.toLocaleString() }}</td>
                  <td class="py-3 pr-6 text-sm text-[var(--color-text-secondary)]">{{ page.unique.toLocaleString() }}</td>
                  <td class="py-3 pr-6 text-sm text-[var(--color-text-secondary)]">{{ page.avgTime }}</td>
                  <td class="py-3">
                    <ui-badge [variant]="page.bounce > 50 ? 'warning' : 'success'" size="sm">{{ page.bounce }}%</ui-badge>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (activeTab() === 'devices') {
        <div class="mt-6 grid grid-cols-3 gap-6">
          @for (d of deviceData; track d.name) {
            <div class="text-center p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
              <div class="text-3xl mb-3">{{ d.emoji }}</div>
              <div class="text-2xl font-bold text-[var(--color-text-primary)]">{{ d.pct }}%</div>
              <div class="text-sm text-[var(--color-text-secondary)] mt-0.5">{{ d.name }}</div>
              <div class="mt-3"><ui-progress [value]="d.pct" size="xs" [variant]="d.variant" /></div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  private layout = inject(LayoutService);

  activeTab = model('traffic');
  tabs: Tab[] = [
    { id: 'traffic', label: 'Traffic Sources' },
    { id: 'pages', label: 'Top Pages' },
    { id: 'devices', label: 'Devices' },
  ];

  ngOnInit() {
    this.layout.setPage('Analytics', [{ label: 'Analytics' }]);
  }

  trafficData: Array<{ source: string; visits: number; pct: number; variant: 'primary' | 'success' | 'warning' | 'danger' }> = [
    { source: 'Organic Search', visits: 102400, pct: 41, variant: 'primary' },
    { source: 'Direct', visits: 68300, pct: 27, variant: 'success' },
    { source: 'Social Media', visits: 45200, pct: 18, variant: 'warning' },
    { source: 'Email', visits: 22500, pct: 9, variant: 'primary' },
    { source: 'Referral', visits: 12400, pct: 5, variant: 'danger' },
  ];

  topPages = [
    { url: '/', title: 'Home', views: 48200, unique: 31200, avgTime: '3m 12s', bounce: 32 },
    { url: '/products', title: 'Products', views: 32100, unique: 24500, avgTime: '4m 45s', bounce: 28 },
    { url: '/pricing', title: 'Pricing', views: 24800, unique: 18300, avgTime: '2m 58s', bounce: 44 },
    { url: '/blog', title: 'Blog', views: 18900, unique: 15600, avgTime: '5m 20s', bounce: 38 },
    { url: '/docs', title: 'Documentation', views: 15200, unique: 12100, avgTime: '7m 10s', bounce: 22 },
  ];

  deviceData = [
    { name: 'Mobile', emoji: '📱', pct: 58, variant: 'primary' as const },
    { name: 'Desktop', emoji: '💻', pct: 34, variant: 'success' as const },
    { name: 'Tablet', emoji: '📟', pct: 8, variant: 'warning' as const },
  ];

  getVariant(src: { variant: 'primary' | 'success' | 'warning' | 'danger' }): 'primary' | 'success' | 'warning' | 'danger' {
    return src.variant;
  }
}
