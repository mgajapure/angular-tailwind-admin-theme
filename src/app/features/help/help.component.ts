import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, Search, BookOpen, Video, MessageCircle,
  HelpCircle, Zap, Settings, Users, CreditCard, Shield, BarChart2,
  ChevronRight, ExternalLink, ThumbsUp, ThumbsDown, Star, Mail,
  Phone, Clock, CheckCircle, ArrowRight, Globe, FileText
} from 'lucide-angular';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { InputComponent } from '../../shared/components/form/input/input.component';

@Component({
  selector: 'app-help',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonComponent, BadgeComponent, InputComponent,
    LucideAngularModule.pick({ Search, BookOpen, Video, MessageCircle, HelpCircle, Zap, Settings, Users, CreditCard, Shield, BarChart2, ChevronRight, ExternalLink, ThumbsUp, ThumbsDown, Star, Mail, Phone, Clock, CheckCircle, ArrowRight, Globe, FileText }),
  ],
  template: `
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Help & Documentation</h1>
      <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Find answers, guides, and get support</p>
    </div>

    <!-- Hero search -->
    <div class="bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-700)] rounded-[var(--radius-xl)] p-8 mb-8 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white blur-3xl"></div>
      </div>
      <div class="relative max-w-xl mx-auto text-center">
        <h2 class="text-2xl font-bold text-white mb-2">How can we help you?</h2>
        <p class="text-sm text-white/70 mb-6">Search our knowledge base or browse topics below</p>
        <div class="relative">
          <lucide-angular name="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" [size]="16" color="currentColor" />
          <input [(ngModel)]="searchQuery" placeholder="Search documentation… e.g. 'reset password', 'API keys'"
            class="w-full pl-11 pr-4 py-3 text-sm rounded-[var(--radius-lg)] border-0
                   bg-white text-gray-900 placeholder:text-gray-400 shadow-lg
                   focus:outline-none focus:ring-2 focus:ring-white/50" />
        </div>
        @if (searchQuery) {
          <div class="mt-3 text-sm text-white/70">
            {{ searchResults().length }} results for "{{ searchQuery }}"
          </div>
        }
      </div>
    </div>

    <!-- Search results -->
    @if (searchQuery && searchResults().length > 0) {
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 mb-8">
        <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Search Results</h3>
        <div class="space-y-3">
          @for (result of searchResults(); track result.id) {
            <div class="flex items-start gap-3 p-3 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                 (click)="openArticle(result)">
              <div class="w-8 h-8 rounded-[var(--radius)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 flex items-center justify-center shrink-0 mt-0.5">
                <lucide-angular name="file-text" [size]="14" color="currentColor" class="text-[var(--color-primary-600)]" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ result.title }}</div>
                <div class="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">{{ result.excerpt }}</div>
                <div class="text-[10px] text-[var(--color-primary-600)] mt-1">{{ result.category }}</div>
              </div>
              <lucide-angular name="arrow-right" [size]="14" color="currentColor" class="text-[var(--color-text-muted)] shrink-0 mt-1" />
            </div>
          }
        </div>
      </div>
    }

    <!-- Category cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      @for (cat of categories; track cat.id) {
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]
                    hover:shadow-[var(--shadow-elevated)] hover:border-[var(--color-primary-200)] dark:hover:border-[var(--color-primary-800)]
                    transition-all p-5 cursor-pointer group"
             (click)="openCategory(cat)">
          <div class="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center mb-4" [class]="cat.iconBg">
            <lucide-angular [name]="cat.icon" [size]="20" color="currentColor" [class]="cat.iconColor" />
          </div>
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{{ cat.title }}</h3>
          <p class="text-xs text-[var(--color-text-muted)] mb-3">{{ cat.description }}</p>
          <div class="flex items-center justify-between">
            <span class="text-xs text-[var(--color-text-muted)]">{{ cat.articleCount }} articles</span>
            <lucide-angular name="chevron-right" [size]="14" color="currentColor" class="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-600)] transition-colors" />
          </div>
        </div>
      }
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Popular articles -->
      <div class="lg:col-span-2">
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6 mb-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-base font-semibold text-[var(--color-text-primary)]">Popular Articles</h3>
            <ui-button variant="ghost" size="sm" (click)="viewAllArticles()">View all</ui-button>
          </div>
          <div class="space-y-1">
            @for (article of popularArticles; track article.id) {
              <div class="flex items-center justify-between p-3 rounded-[var(--radius-lg)] hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer group"
                   (click)="openArticle(article)">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-6 h-6 rounded-full bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0 text-xs font-bold text-[var(--color-text-muted)]">
                    {{ $index + 1 }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary-600)] transition-colors">
                      {{ article.title }}
                    </div>
                    <div class="flex items-center gap-3 mt-0.5">
                      <span class="text-[10px] text-[var(--color-primary-600)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 px-1.5 py-0.5 rounded-full">{{ article.category }}</span>
                      <span class="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                        <lucide-angular name="clock" [size]="10" color="currentColor" />
                        {{ article.readTime }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3 shrink-0 ml-3">
                  <div class="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <lucide-angular name="thumbs-up" [size]="10" color="currentColor" />
                    {{ article.helpful }}%
                  </div>
                  <lucide-angular name="chevron-right" [size]="14" color="currentColor" class="text-[var(--color-text-muted)]" />
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Recent updates -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-6">
          <h3 class="text-base font-semibold text-[var(--color-text-primary)] mb-5">Recently Updated</h3>
          <div class="space-y-3">
            @for (article of recentUpdates; track article.id) {
              <div class="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity" (click)="openArticle(article)">
                <div class="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-600)] mt-2 shrink-0"></div>
                <div>
                  <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ article.title }}</div>
                  <div class="text-xs text-[var(--color-text-muted)] mt-0.5">Updated {{ article.updatedAt }} · {{ article.category }}</div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="space-y-5">

        <!-- Quick links -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-5">
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Quick Links</h3>
          <div class="space-y-2">
            @for (link of quickLinks; track link.label) {
              <a class="flex items-center gap-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] transition-colors cursor-pointer group"
                 (click)="openLink(link)">
                <lucide-angular [name]="link.icon" [size]="14" color="currentColor" class="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-600)] transition-colors shrink-0" />
                <span>{{ link.label }}</span>
                <lucide-angular name="external-link" [size]="10" color="currentColor" class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            }
          </div>
        </div>

        <!-- Status page -->
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">System Status</h3>
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span class="text-xs text-emerald-600 font-medium">All systems operational</span>
            </div>
          </div>
          <div class="space-y-2">
            @for (service of systemStatus; track service.name) {
              <div class="flex items-center justify-between">
                <span class="text-xs text-[var(--color-text-secondary)]">{{ service.name }}</span>
                <div class="flex items-center gap-1.5">
                  <lucide-angular name="check-circle" [size]="12" color="currentColor" class="text-emerald-500" />
                  <span class="text-xs text-emerald-600">{{ service.uptime }}</span>
                </div>
              </div>
            }
          </div>
          <div class="mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
            Last checked: 2 minutes ago
          </div>
        </div>

        <!-- Contact support -->
        <div class="bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] dark:from-[var(--color-primary-900)]/20 dark:to-[var(--color-primary-900)]/10
                    border border-[var(--color-primary-200)] dark:border-[var(--color-primary-800)] rounded-[var(--radius-lg)] p-5">
          <h3 class="text-sm font-semibold text-[var(--color-text-primary)] mb-1">Need more help?</h3>
          <p class="text-xs text-[var(--color-text-muted)] mb-4">Our support team is available 24/7 to assist you.</p>
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <lucide-angular name="clock" [size]="12" color="currentColor" class="text-[var(--color-primary-600)]" />
              <span>Avg. response: <strong class="text-[var(--color-text-primary)]">under 2 hours</strong></span>
            </div>
            <div class="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <lucide-angular name="star" [size]="12" color="currentColor" class="text-amber-500" />
              <span>Customer satisfaction: <strong class="text-[var(--color-text-primary)]">98.4%</strong></span>
            </div>
          </div>
          <div class="space-y-2">
            <ui-button variant="primary" [fullWidth]="true" size="sm" (click)="contactSupport('chat')">
              <lucide-angular prefix name="message-circle" [size]="14" color="currentColor" />
              Live Chat
            </ui-button>
            <ui-button variant="outline" [fullWidth]="true" size="sm" (click)="contactSupport('email')">
              <lucide-angular prefix name="mail" [size]="14" color="currentColor" />
              Email Support
            </ui-button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class HelpComponent implements OnInit {
  private layout = inject(LayoutService);
  private toast = inject(ToastService);

  searchQuery = '';

  allArticles = [
    { id: 1, title: 'How to reset your password', category: 'Account', excerpt: 'Step-by-step guide to resetting your password via email or SMS verification.', readTime: '2 min read', helpful: 97, updatedAt: '2 days ago' },
    { id: 2, title: 'Getting started with the API', category: 'Developer', excerpt: 'Learn how to authenticate and make your first API request using our REST API.', readTime: '8 min read', helpful: 94, updatedAt: '1 week ago' },
    { id: 3, title: 'Managing user roles and permissions', category: 'Users', excerpt: 'Understand the difference between Admin, Editor, and Viewer roles.', readTime: '5 min read', helpful: 91, updatedAt: '3 days ago' },
    { id: 4, title: 'Setting up two-factor authentication', category: 'Security', excerpt: 'Enable 2FA to add an extra layer of security to your account.', readTime: '3 min read', helpful: 99, updatedAt: '5 days ago' },
    { id: 5, title: 'Upgrading your subscription plan', category: 'Billing', excerpt: 'How to upgrade, downgrade, or change your billing cycle.', readTime: '4 min read', helpful: 88, updatedAt: '1 week ago' },
    { id: 6, title: 'Customizing your dashboard layout', category: 'Dashboard', excerpt: 'Learn how to rearrange widgets and personalise your admin dashboard.', readTime: '6 min read', helpful: 85, updatedAt: '2 weeks ago' },
    { id: 7, title: 'Exporting data to CSV or Excel', category: 'Data', excerpt: 'Download and export your reports, orders, and user data.', readTime: '3 min read', helpful: 92, updatedAt: '4 days ago' },
    { id: 8, title: 'Integrating with Stripe for payments', category: 'Integrations', excerpt: 'Connect your Stripe account to process payments through the dashboard.', readTime: '10 min read', helpful: 96, updatedAt: '1 week ago' },
  ];

  popularArticles = this.allArticles.slice(0, 5);
  recentUpdates = this.allArticles.slice(0, 5).map((a, i) => ({ ...a, updatedAt: ['2 hours ago', 'Yesterday', '2 days ago', '3 days ago', '4 days ago'][i] }));

  searchResults = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return [];
    return this.allArticles.filter(a => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  });

  categories = [
    { id: 1, title: 'Getting Started', description: 'Quickstart guides and onboarding', icon: 'zap', iconBg: 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20', iconColor: 'text-[var(--color-primary-600)]', articleCount: 12 },
    { id: 2, title: 'Account & Settings', description: 'Profile, security, and preferences', icon: 'settings', iconBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600', articleCount: 18 },
    { id: 3, title: 'Users & Teams', description: 'Managing roles and permissions', icon: 'users', iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600', articleCount: 9 },
    { id: 4, title: 'Billing & Payments', description: 'Subscriptions, invoices, refunds', icon: 'credit-card', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', articleCount: 14 },
    { id: 5, title: 'Security', description: '2FA, sessions, and access control', icon: 'shield', iconBg: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-600', articleCount: 7 },
    { id: 6, title: 'Analytics & Reports', description: 'Understanding your metrics', icon: 'bar-chart-2', iconBg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600', articleCount: 11 },
    { id: 7, title: 'API & Integrations', description: 'REST API, webhooks, and SDKs', icon: 'globe', iconBg: 'bg-cyan-50 dark:bg-cyan-900/20', iconColor: 'text-cyan-600', articleCount: 22 },
    { id: 8, title: 'Video Tutorials', description: 'Step-by-step video walkthroughs', icon: 'video', iconBg: 'bg-pink-50 dark:bg-pink-900/20', iconColor: 'text-pink-600', articleCount: 8 },
  ];

  quickLinks = [
    { label: 'API Reference', icon: 'book-open' },
    { label: 'Release Notes', icon: 'file-text' },
    { label: 'Community Forum', icon: 'message-circle' },
    { label: 'Status Page', icon: 'check-circle' },
    { label: 'Developer Blog', icon: 'globe' },
    { label: 'Feature Requests', icon: 'star' },
  ];

  systemStatus = [
    { name: 'API Gateway', uptime: '99.99%' },
    { name: 'Dashboard', uptime: '100%' },
    { name: 'Database', uptime: '99.98%' },
    { name: 'CDN / Assets', uptime: '100%' },
    { name: 'Email Service', uptime: '99.95%' },
  ];

  ngOnInit() {
    this.layout.setPage('Help & Docs', [{ label: 'System' }, { label: 'Help' }]);
  }

  openArticle(article: { title: string }) { this.toast.info('Opening article', `Loading "${article.title}"…`); }
  openCategory(cat: { title: string }) { this.toast.info('Category', `Browsing ${cat.title} articles…`); }
  viewAllArticles() { this.toast.info('Articles', 'Loading full article library…'); }
  openLink(link: { label: string }) { this.toast.info('Opening', `Navigating to ${link.label}…`); }
  contactSupport(method: string) { this.toast.success('Support', method === 'chat' ? 'Opening live chat…' : 'Opening email support form…'); }
}
