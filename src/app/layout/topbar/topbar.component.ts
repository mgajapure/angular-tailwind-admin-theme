import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ConfigService } from '../../core/services/config.service';

// @ts-ignore
@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AvatarComponent, BreadcrumbComponent],
  template: `
    <header class="fixed top-0 right-0 z-30 flex items-center h-[var(--topbar-height)]
                   bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]
                   px-4 gap-3 transition-all duration-300"
            [style.left]="leftOffset()">

      <!-- Sidebar toggle -->
      <button
        (click)="layout.toggleMini()"
        class="p-2 rounded-[var(--radius)] text-[var(--color-text-muted)]
               hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)]
               dark:hover:bg-[var(--color-bg-elevated)] transition-colors"
        aria-label="Toggle sidebar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <!-- Breadcrumbs -->
      <div class="hidden md:block flex-1 min-w-0">
        @if (layout.breadcrumbs().length > 0) {
          <ui-breadcrumb [items]="layout.breadcrumbs()" />
        } @else {
          <span class="text-sm font-semibold text-[var(--color-text-primary)]">
            {{ layout.pageTitle() }}
          </span>
        }
      </div>

      <!-- Mobile: page title -->
      <div class="md:hidden flex-1 min-w-0">
        <span class="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {{ layout.pageTitle() }}
        </span>
      </div>

      <!-- Search trigger (⌘K) -->
      <button
        class="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm
               text-[var(--color-text-muted)] border border-[var(--color-border)]
               rounded-[var(--radius)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-bg-elevated)]
               hover:border-[var(--color-primary-400)] transition-colors w-52"
        onclick="document.dispatchEvent(new KeyboardEvent('keydown', {key:'k', metaKey:true, bubbles:true}))">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span class="flex-1 text-left">Search…</span>
        <kbd class="text-[10px] font-medium opacity-60">⌘K</kbd>
      </button>

      <!-- Dark mode toggle -->
      <button
        (click)="theme.toggleDark()"
        class="p-2 rounded-[var(--radius)] text-[var(--color-text-muted)]
               hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)]
               dark:hover:bg-[var(--color-bg-elevated)] transition-colors"
        aria-label="Toggle dark mode">
        @if (isDark()) {
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        } @else {
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        }
      </button>

      <!-- Notifications -->
      <div class="relative">
        <button
          (click)="notifOpen.update(v => !v)"
          class="relative p-2 rounded-[var(--radius)] text-[var(--color-text-muted)]
                 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)]
                 dark:hover:bg-[var(--color-bg-elevated)] transition-colors"
          aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[var(--color-bg-surface)]"></span>
        </button>

        @if (notifOpen()) {
          <div class="absolute right-0 top-full mt-2 w-80 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)]
                      border border-[var(--color-border)] shadow-[var(--shadow-modal)] animate-scale-in z-50">
            <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <span class="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</span>
              <button class="text-xs text-[var(--color-primary-600)] hover:underline">Mark all read</button>
            </div>
            @for (n of notifications; track n.id) {
              <div class="flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
                <div [class]="n.iconBg" class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm">
                  {{ n.emoji }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-[var(--color-text-primary)] font-medium">{{ n.title }}</p>
                  <p class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ n.time }}</p>
                </div>
                @if (n.unread) {
                  <div class="w-2 h-2 rounded-full bg-[var(--color-primary-600)] shrink-0 mt-1.5"></div>
                }
              </div>
            }
            <div class="px-4 py-3 border-t border-[var(--color-border)] text-center">
              <a routerLink="/notifications" class="text-sm text-[var(--color-primary-600)] hover:underline">
                View all notifications
              </a>
            </div>
          </div>
        }
      </div>

      <!-- User menu -->
      <div class="relative">
        <button
          (click)="userMenuOpen.update(v => !v)"
          class="flex items-center gap-2 pl-1 pr-2 py-1 rounded-[var(--radius)]
                 hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
          <ui-avatar [name]="auth.user()?.name || 'User'" size="sm" status="online" />
          <span class="hidden lg:block text-sm font-medium text-[var(--color-text-primary)]">
            {{ getFirstName() }}
          </span>
          <svg class="w-3.5 h-3.5 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>

        @if (userMenuOpen()) {
          <div class="absolute right-0 top-full mt-2 w-56 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)]
                      border border-[var(--color-border)] shadow-[var(--shadow-modal)] animate-scale-in z-50 py-1">
            <div class="px-4 py-3 border-b border-[var(--color-border)]">
              <p class="text-sm font-semibold text-[var(--color-text-primary)]">{{ auth.user()?.name }}</p>
              <p class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ auth.user()?.email }}</p>
            </div>
            @for (item of userMenuItems; track item.label) {
              @if (item.separator) {
                <div class="my-1 border-t border-[var(--color-border)]"></div>
              } @else {
                <button
                  (click)="item.action && item.action(); userMenuOpen.set(false)"
                  [class]="item.danger ? 'text-red-600' : 'text-[var(--color-text-secondary)]'"
                  class="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-[var(--color-neutral-50)]
                         dark:hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors text-left">
                  {{ item.label }}
                </button>
              }
            }
          </div>
        }
      </div>

      <!-- Settings trigger -->
      <button
        (click)="layout.openSettings()"
        class="p-2 rounded-[var(--radius)] text-[var(--color-text-muted)]
               hover:text-[var(--color-text-primary)] hover:bg-[var(--color-neutral-100)]
               dark:hover:bg-[var(--color-bg-elevated)] transition-colors"
        aria-label="Theme settings">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    </header>
  `
})
export class TopbarComponent {
  layout = inject(LayoutService);
  theme = inject(ThemeService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  private config = inject(ConfigService);

  notifOpen = signal(false);
  userMenuOpen = signal(false);

  isDark = computed(() => {
    const mode = this.config.theme().mode;
    return mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  leftOffset() {
    if (this.layout.isMobile()) return '0px';
    return this.layout.isMini() ? 'var(--sidebar-mini-width)' : 'var(--sidebar-width)';
  }

  notifications = [
    { id: 1, emoji: '🎉', title: 'New user registered', time: '2 min ago', unread: true, iconBg: 'bg-emerald-100' },
    { id: 2, emoji: '📦', title: 'Order #1234 shipped', time: '15 min ago', unread: true, iconBg: 'bg-blue-100' },
    { id: 3, emoji: '⚠️', title: 'Server CPU at 85%', time: '1 hour ago', unread: false, iconBg: 'bg-amber-100' },
    { id: 4, emoji: '💬', title: 'New comment on your post', time: '3 hours ago', unread: false, iconBg: 'bg-purple-100' },
  ];

  userMenuItems = [
    { label: 'My Profile', action: () => {} },
    { label: 'Account Settings', action: () => {} },
    { label: 'Keyboard Shortcuts', action: () => {} },
    { separator: true },
    { label: 'Sign Out', danger: true, action: () => { this.auth.logout(); this.toast.info('Signed out', 'See you next time!'); } },
  ];

  getFirstName(){
    return this.auth.user()?.name?.split(' ')[0];
  }
}
