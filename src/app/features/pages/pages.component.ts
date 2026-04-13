import {
  ChangeDetectionStrategy, Component, OnInit, computed, inject, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {DecimalPipe, TitleCasePipe} from '@angular/common';
import {
  LucidePlus, LucideSearch, LucideEdit2, LucideTrash2, LucideEye, LucideGlobe,
  LucideFileText, LucideClock, LucideCalendar, LucideCheckCircle, LucideAlertCircle, LucideCopy, LucideMoreHorizontal
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputComponent } from '../../shared/components/form/input/input.component';
import { ToggleComponent } from '../../shared/components/form/toggle/toggle.component';

interface Page {
  id: number;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled' | 'archived' | string;
  author: string;
  template: string;
  views: number;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  featured: boolean;
}

@Component({
  selector: 'app-pages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, DecimalPipe,
    BadgeComponent, ButtonComponent, AvatarComponent,
    SkeletonComponent, EmptyStateComponent, PaginationComponent, ModalComponent,
    InputComponent, ToggleComponent,
    LucidePlus, LucideSearch, LucideEdit2, LucideTrash2, LucideEye, LucideGlobe,
    LucideFileText, LucideClock, LucideCalendar, LucideCheckCircle, LucideAlertCircle, LucideCopy, LucideMoreHorizontal, TitleCasePipe,
  ],
  template: `
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Pages</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Manage your website's content pages</p>
      </div>
      <ui-button variant="primary" (click)="openModal()">
        <svg lucidePlus prefix [size]="14" color="currentColor" />
        New Page
      </ui-button>
    </div>

    <!-- Stats strip -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      @for (stat of pageStats; track stat.label) {
        <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 text-center">
          <div class="text-xl font-bold text-[var(--color-text-primary)]">{{ stat.value }}</div>
          <div class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ stat.label }}</div>
        </div>
      }
    </div>

    <!-- Filters -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-4 mb-5">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-52">
          <svg lucideSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" [size]="14" color="currentColor" />
          <input [(ngModel)]="searchQuery" placeholder="Search pages…"
            class="w-full pl-9 pr-4 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                   bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]" />
        </div>
        <select [(ngModel)]="statusFilter"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>
        <select [(ngModel)]="templateFilter"
          class="px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                 bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20">
          <option value="">All Templates</option>
          <option value="Default">Default</option>
          <option value="Landing">Landing Page</option>
          <option value="Full-width">Full Width</option>
          <option value="Blog">Blog Post</option>
        </select>
        @if (searchQuery || statusFilter || templateFilter) {
          <ui-button variant="ghost" size="sm" (click)="clearFilters()">Clear</ui-button>
        }
        <div class="ml-auto text-sm text-[var(--color-text-muted)]">{{ filtered().length }} pages</div>
      </div>
    </div>

    <!-- Pages table -->
    <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden">
      @if (loading()) {
        <div class="p-4 space-y-1">
          @for (i of [1,2,3,4,5]; track i) { <ui-skeleton type="row" /> }
        </div>
      } @else if (paged().length === 0) {
        <ui-empty-state title="No pages found" description="Create your first page or adjust filters" actionLabel="New Page" (action)="openModal()" />
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-[var(--color-neutral-50)] dark:bg-[var(--color-bg-elevated)]">
              <tr>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Page</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Status</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Author</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Template</th>
                <th class="text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Views</th>
                <th class="text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-6 py-3">Last Updated</th>
                <th class="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              @for (page of paged(); track page.id) {
                <tr class="hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-[var(--radius)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0">
                        <svg lucideFileText [size]="14" color="currentColor" class="text-[var(--color-text-muted)]" />
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ page.title }}</span>
                          @if (page.featured) {
                            <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">Featured</span>
                          }
                        </div>
                        <div class="text-xs text-[var(--color-text-muted)] font-mono">/{{ page.slug }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div>
                      <ui-badge [variant]="statusVariant(page.status)" size="sm" [dot]="true">{{ page.status | titlecase }}</ui-badge>
                      @if (page.scheduledAt) {
                        <div class="text-[10px] text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1">
                          <svg lucideCalendar [size]="9" color="currentColor" />
                          {{ page.scheduledAt }}
                        </div>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <ui-avatar [name]="page.author" size="sm" />
                      <span class="text-sm text-[var(--color-text-secondary)]">{{ page.author }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-[var(--color-text-secondary)]">{{ page.template }}</span>
                  </td>
                  <td class="px-6 py-4 text-right text-sm text-[var(--color-text-muted)]">{{ page.views | number }}</td>
                  <td class="px-6 py-4 text-sm text-[var(--color-text-muted)]">{{ page.updatedAt }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ui-button variant="ghost" size="xs" (click)="previewPage(page)" title="Preview">
                        <svg lucideEye [size]="12" color="currentColor" />
                      </ui-button>
                      <ui-button variant="ghost" size="xs" (click)="duplicatePage(page)" title="Duplicate">
                        <svg lucideCopy [size]="12" color="currentColor" />
                      </ui-button>
                      <ui-button variant="ghost" size="xs" (click)="editPage(page)" title="Edit">
                        <svg lucideEdit2 [size]="12" color="currentColor" />
                      </ui-button>
                      <ui-button variant="ghost" size="xs" (click)="deletePage(page)" title="Delete">
                        <svg lucideTrash2 [size]="12" color="currentColor" class="text-red-500" />
                      </ui-button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-[var(--color-border)]">
          <ui-pagination [page]="currentPage()" [pageSize]="pageSize" [total]="filtered().length" (pageChange)="currentPage.set($event)" />
        </div>
      }
    </div>

    <!-- New Page Modal -->
    @if (showModal()) {
      <ui-modal title="Create New Page" subtitle="Set up your page before opening the editor" size="md" (close)="showModal.set(false)">
        <div class="space-y-4">
          <ui-input label="Page Title" placeholder="e.g. About Us" [(value)]="newPage.title" [required]="true" />
          <ui-input label="Slug" placeholder="auto-generated-from-title" [(value)]="newPage.slug" />
          <div>
            <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Template</label>
            <select [(ngModel)]="newPage.template"
              class="w-full px-3 py-2 text-sm rounded-[var(--radius)] border border-[var(--color-border)]
                     bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]">
              <option value="Default">Default</option>
              <option value="Landing">Landing Page</option>
              <option value="Full-width">Full Width</option>
              <option value="Blog">Blog Post</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium text-[var(--color-text-primary)] block mb-1.5">Initial Status</label>
            <div class="grid grid-cols-2 gap-2">
              @for (opt of ['draft', 'published']; track opt) {
                <label class="flex items-center gap-2.5 p-3 rounded-[var(--radius)] border cursor-pointer transition-colors"
                       [class.border-[var(--color-primary-300)]]="newPage.status === opt"
                       [class.bg-[var(--color-primary-50)]]="newPage.status === opt"
                       [class.dark:bg-[var(--color-primary-900)]/10]="newPage.status === opt"
                       [class.border-[var(--color-border)]]="newPage.status !== opt"
                       [class.hover:bg-[var(--color-neutral-50)]]="newPage.status !== opt">
                  <input type="radio" name="new-status" [value]="opt" [(ngModel)]="newPage.status" class="accent-[var(--color-primary-600)]" />
                  <div>
                    <div class="text-sm font-medium text-[var(--color-text-primary)] capitalize">{{ opt }}</div>
                    <div class="text-xs text-[var(--color-text-muted)]">{{ opt === 'draft' ? 'Not visible to visitors' : 'Live immediately' }}</div>
                  </div>
                </label>
              }
            </div>
          </div>
          <ui-toggle label="Mark as featured page" [(value)]="newPage.featured" />
        </div>
        <div modal-footer>
          <ui-button variant="outline" (click)="showModal.set(false)">Cancel</ui-button>
          <ui-button variant="primary" (click)="createPage()">Create & Open Editor</ui-button>
        </div>
      </ui-modal>
    }
  `
})
export class PagesComponent implements OnInit {
  private layout = inject(LayoutService);
  private toast = inject(ToastService);

  loading = signal(true);
  currentPage = signal(1);
  pageSize = 10;
  searchQuery = '';
  statusFilter = '';
  templateFilter = '';
  showModal = signal(false);
  newPage = { title: '', slug: '', template: 'Default', status: 'draft', featured: false };

  allPages = signal<Page[]>([
    { id: 1, title: 'Home', slug: '', status: 'published', author: 'Alex Johnson', template: 'Landing', views: 48200, updatedAt: 'Dec 12, 2024', publishedAt: 'Jan 1, 2024', featured: true },
    { id: 2, title: 'About Us', slug: 'about', status: 'published', author: 'Alex Johnson', template: 'Default', views: 12400, updatedAt: 'Nov 28, 2024', publishedAt: 'Jan 15, 2024', featured: false },
    { id: 3, title: 'Pricing', slug: 'pricing', status: 'published', author: 'Sarah Williams', template: 'Full-width', views: 24800, updatedAt: 'Dec 5, 2024', publishedAt: 'Feb 1, 2024', featured: true },
    { id: 4, title: 'Blog', slug: 'blog', status: 'published', author: 'Lisa Martinez', template: 'Blog', views: 18900, updatedAt: 'Dec 13, 2024', publishedAt: 'Mar 1, 2024', featured: false },
    { id: 5, title: 'Documentation', slug: 'docs', status: 'published', author: 'Michael Chen', template: 'Full-width', views: 15200, updatedAt: 'Dec 11, 2024', publishedAt: 'Apr 1, 2024', featured: false },
    { id: 6, title: 'Contact', slug: 'contact', status: 'published', author: 'Alex Johnson', template: 'Default', views: 8900, updatedAt: 'Oct 22, 2024', publishedAt: 'Jan 1, 2024', featured: false },
    { id: 7, title: 'Privacy Policy', slug: 'privacy', status: 'published', author: 'Alex Johnson', template: 'Default', views: 3200, updatedAt: 'Sep 14, 2024', publishedAt: 'Jan 1, 2024', featured: false },
    { id: 8, title: 'Terms of Service', slug: 'terms', status: 'published', author: 'Alex Johnson', template: 'Default', views: 2800, updatedAt: 'Sep 14, 2024', publishedAt: 'Jan 1, 2024', featured: false },
    { id: 9, title: 'Q1 2025 Roadmap', slug: 'roadmap-q1-2025', status: 'draft', author: 'Sarah Williams', template: 'Default', views: 0, updatedAt: 'Dec 10, 2024', featured: false },
    { id: 10, title: 'New Year Promotion', slug: 'promo-2025', status: 'scheduled', author: 'Lisa Martinez', template: 'Landing', views: 0, updatedAt: 'Dec 13, 2024', scheduledAt: 'Jan 1, 2025 00:00', featured: false },
    { id: 11, title: 'Case Studies', slug: 'case-studies', status: 'draft', author: 'Michael Chen', template: 'Default', views: 0, updatedAt: 'Dec 8, 2024', featured: false },
    { id: 12, title: 'Old Landing Page', slug: 'old-landing', status: 'archived', author: 'Alex Johnson', template: 'Landing', views: 5400, updatedAt: 'Jun 1, 2024', featured: false },
  ]);

  pageStats = [
    { label: 'Published', value: computed(() => this.allPages().filter(p => p.status === 'published').length) },
    { label: 'Drafts', value: computed(() => this.allPages().filter(p => p.status === 'draft').length) },
    { label: 'Scheduled', value: computed(() => this.allPages().filter(p => p.status === 'scheduled').length) },
    { label: 'Total Views', value: computed(() => this.allPages().reduce((s, p) => s + p.views, 0).toLocaleString()) },
  ];

  filtered = computed(() => {
    const q = this.searchQuery.toLowerCase();
    return this.allPages().filter(p =>
      (!q || p.title.toLowerCase().includes(q) || p.slug.includes(q)) &&
      (!this.statusFilter || p.status === this.statusFilter) &&
      (!this.templateFilter || p.template === this.templateFilter)
    );
  });

  paged = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.layout.setPage('Pages', [{ label: 'Content' }, { label: 'Pages' }]);
    setTimeout(() => this.loading.set(false), 400);
  }

  statusVariant(status: string): BadgeVariant {
    return ({ published: 'success', draft: 'neutral', scheduled: 'info', archived: 'warning' } as Record<string, BadgeVariant>)[status] ?? 'neutral';
  }

  clearFilters() { this.searchQuery = ''; this.statusFilter = ''; this.templateFilter = ''; this.currentPage.set(1); }

  openModal() { this.newPage = { title: '', slug: '', template: 'Default', status: 'draft', featured: false }; this.showModal.set(true); }

  createPage() {
    if (!this.newPage.title) { this.toast.error('Validation error', 'Page title is required.'); return; }
    const slug = this.newPage.slug || this.newPage.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const page: Page = { id: Date.now(), ...this.newPage, slug, views: 0, updatedAt: 'Just now', author: 'Alex Johnson', featured: this.newPage.featured };
    this.allPages.update(pages => [page, ...pages]);
    this.showModal.set(false);
    this.toast.success('Page created', `"${this.newPage.title}" is ready to edit.`);
  }

  previewPage(page: Page) { this.toast.info('Preview', `Opening /${page.slug || ''} in a new tab.`); }
  editPage(page: Page) { this.toast.info('Editor', `Opening editor for "${page.title}".`); }
  duplicatePage(page: Page) {
    const copy: Page = { ...page, id: Date.now(), title: page.title + ' (Copy)', slug: page.slug + '-copy', status: 'draft', views: 0, updatedAt: 'Just now' };
    this.allPages.update(pages => [copy, ...pages]);
    this.toast.success('Page duplicated', `"${copy.title}" has been created as a draft.`);
  }
  deletePage(page: Page) {
    this.allPages.update(pages => pages.filter(p => p.id !== page.id));
    this.toast.success('Page deleted', `"${page.title}" has been removed.`);
  }
}
