import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { navigation } from '../../config/navigation.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, AvatarComponent, BadgeComponent],
  template: `
    <!-- Mobile overlay backdrop -->
    @if (layout.isMobile() && layout.isMobileOpen()) {
      <div class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
           (click)="layout.closeMobile()"></div>
    }

    <aside
      class="fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--color-sidebar-bg)]
             border-r border-[var(--color-sidebar-border)] transition-all duration-300 ease-out"
      [class.translate-x-0]="!layout.isMobile() || layout.isMobileOpen()"
      [class.-translate-x-full]="layout.isMobile() && !layout.isMobileOpen()"
      [style.width]="sidebarWidth()">

      <!-- Logo / Brand -->
      <div class="flex items-center gap-3 h-[var(--topbar-height)] px-4 shrink-0
                  border-b border-[var(--color-sidebar-border)]">
        <div class="w-8 h-8 rounded-[var(--radius)] bg-[var(--color-primary-600)]
                    flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        @if (!layout.isMini()) {
          <div class="overflow-hidden">
            <span class="font-bold text-white text-lg tracking-tight whitespace-nowrap">
              {{ branding().appName }}
            </span>
          </div>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5" aria-label="Main navigation">
        @for (group of navGroups; track group.label) {
          <div class="mb-3">
            @if (!layout.isMini()) {
              <div class="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-sidebar-text)] opacity-50">
                {{ group.label }}
              </div>
            } @else {
              <div class="px-2 my-1 border-t border-[var(--color-sidebar-border)] opacity-30"></div>
            }

            @for (item of group.items; track item.id) {
              @if (!item.children?.length) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="sidebar-item-active"
                  [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                  (click)="layout.isMobile() && layout.closeMobile()"
                  [title]="layout.isMini() ? item.label : ''"
                  class="sidebar-item group">
                  <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path [attr.d]="getIconPath(item.icon)" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  @if (!layout.isMini()) {
                    <span class="flex-1 text-sm font-medium truncate">{{ item.label }}</span>
                    @if (item.badge) {
                      <span [class]="badgeClass(item.badge.variant)"
                            class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full leading-none shrink-0">
                        {{ item.badge.text }}
                      </span>
                    }
                  }
                </a>
              } @else {
                <!-- Item with children -->
                <div>
                  <button
                    (click)="toggleGroup(item.id)"
                    [title]="layout.isMini() ? item.label : ''"
                    class="sidebar-item w-full group">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                      <path [attr.d]="getIconPath(item.icon)" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    @if (!layout.isMini()) {
                      <span class="flex-1 text-sm font-medium text-left truncate">{{ item.label }}</span>
                      <svg
                        class="w-3.5 h-3.5 text-[var(--color-sidebar-text)] transition-transform duration-200 shrink-0"
                        [class.rotate-180]="expandedGroups().has(item.id)"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    }
                  </button>

                  @if (expandedGroups().has(item.id) && !layout.isMini()) {
                    <div class="ml-4 mt-0.5 pl-3 border-l border-[var(--color-sidebar-border)] space-y-0.5">
                      @for (child of item.children; track child.id) {
                        <a
                          [routerLink]="child.route"
                          routerLinkActive="sidebar-item-active"
                          (click)="layout.isMobile() && layout.closeMobile()"
                          class="sidebar-item py-2">
                          <span class="text-sm font-medium truncate">{{ child.label }}</span>
                        </a>
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        }
      </nav>

      <!-- User card -->
      <div class="p-3 border-t border-[var(--color-sidebar-border)] shrink-0">
        <div class="flex items-center gap-3 px-2 py-2 rounded-[var(--radius)] hover:bg-white/5 transition-colors cursor-pointer">
          <ui-avatar [name]="auth.user()?.name || 'User'" size="sm" status="online" />
          @if (!layout.isMini()) {
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">{{ auth.user()?.name }}</div>
              <div class="text-xs text-[var(--color-sidebar-text)] truncate">{{ auth.user()?.email }}</div>
            </div>
            <svg class="w-3.5 h-3.5 text-[var(--color-sidebar-text)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>
            </svg>
          }
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.625rem;
      border-radius: var(--radius);
      color: var(--color-sidebar-text);
      transition: all 150ms ease;
      text-decoration: none;
    }
    .sidebar-item:hover {
      background-color: rgba(255,255,255,0.06);
      color: white;
    }
    .sidebar-item-active {
      background-color: var(--color-sidebar-item-active) !important;
      color: white !important;
    }
    .sidebar-icon {
      width: 1.125rem;
      height: 1.125rem;
      flex-shrink: 0;
    }
  `]
})
export class SidebarComponent {
  layout = inject(LayoutService);
  auth = inject(AuthService);
  private config = inject(ConfigService);
  branding = this.config.branding;
  navGroups = navigation;
  expandedGroups = signal<Set<string>>(new Set(['products']));

  sidebarWidth() {
    return this.layout.isMini() ? 'var(--sidebar-mini-width)' : 'var(--sidebar-width)';
  }

  toggleGroup(id: string) {
    this.expandedGroups.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  badgeClass(variant: string) {
    const map: Record<string, string> = {
      primary: 'bg-[var(--color-primary-600)] text-white',
      success: 'bg-emerald-600 text-white',
      danger: 'bg-red-600 text-white',
      warning: 'bg-amber-500 text-white',
    };
    return map[variant] || map['primary'];
  }

  // Returns a single SVG path 'd' attribute string for [attr.d] binding
  getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      'layout-dashboard': 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
      'bar-chart-3': 'M3 3v18h18M18 17V9M13 17V5M8 17v-3',
      'users': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6 0a3 3 0 0 1 0 5.83M22 21v-2a4 4 0 0 0-3-3.87',
      'package': 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
      'shopping-cart': 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
      'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1v5h5M16 13H8M16 17H8M10 9H8',
      'file': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1v5h5',
      'image': 'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm10 8H5l4.5-5.5 3 3.5 2.5-3 4 5z',
      'settings': 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zm-2 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0z',
      'help-circle': 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01',
      'list': 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
      'plus': 'M12 5v14M5 12h14',
      'tag': 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
    };
    return icons[icon] || 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0';
  }
}
