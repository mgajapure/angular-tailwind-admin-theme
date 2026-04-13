import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideMenu, LucideSearch, LucideSun, LucideMoon, LucideBell, LucideChevronDown, LucideSettings
} from '@lucide/angular';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AvatarComponent, BreadcrumbComponent, LucideMenu, LucideSearch, LucideSun, LucideMoon, LucideBell, LucideChevronDown, LucideSettings],
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
        <svg lucideMenu [size]="18" color="currentColor" />
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
        (click)="openCommandPalette()">
        <svg lucideSearch [size]="14" color="currentColor" />
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
          <svg lucideSun [size]="18" color="currentColor" />
        } @else {
          <svg lucideMoon [size]="18" color="currentColor" />
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
          <svg lucideBell [size]="18" color="currentColor" />
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
          <svg lucideChevronDown [size]="14" color="currentColor" class="text-[var(--color-text-muted)]" />
        </button>

        @if (userMenuOpen()) {
          <div class="absolute right-0 top-full mt-2 w-56 bg-[var(--color-bg-surface)] rounded-[var(--radius-lg)]
                      border border-[var(--color-border)] shadow-[var(--shadow-modal)] animate-scale-in z-50 py-1">
            <div class="px-4 py-3 border-b border-[var(--color-border)]">
              <p class="text-sm font-semibold text-[var(--color-text-primary)]">{{ auth.user()?.name }}</p>
              <p class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ auth.user()?.email }}</p>
            </div>
            @for (item of userMenuItems; track $index) {
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
        <svg lucideSettings [size]="18" color="currentColor" />
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

  userMenuItems: Array<{ label?: string; action?: () => void; danger?: boolean; separator?: boolean }> = [
    { label: 'My Profile', action: () => {} },
    { label: 'Account Settings', action: () => {} },
    { label: 'Keyboard Shortcuts', action: () => {} },
    { separator: true },
    { label: 'Sign Out', danger: true, action: () => { this.auth.logout(); this.toast.info('Signed out', 'See you next time!'); } },
  ];

  openCommandPalette() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  }

  getFirstName(){
    return this.auth.user()?.name?.split(' ')[0];
  }
}
