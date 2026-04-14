import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideZap, LucideChevronDown, LucideChevronsUpDown,
  LucideDynamicIcon, provideLucideIcons,
  LucideLayoutDashboard, LucideBarChart3, LucideUsers, LucidePackage,
  LucideShoppingCart, LucideFileText, LucideFile, LucideImage,
  LucideSettings, LucideHelpCircle, LucideList, LucidePlus, LucideTag
} from '@lucide/angular';
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
  providers: [
    provideLucideIcons(
      LucideLayoutDashboard, LucideBarChart3, LucideUsers, LucidePackage,
      LucideShoppingCart, LucideFileText, LucideFile, LucideImage,
      LucideSettings, LucideHelpCircle, LucideList, LucidePlus, LucideTag
    )
  ],
  imports: [
    RouterLink, RouterLinkActive, AvatarComponent, BadgeComponent,
    LucideZap, LucideChevronDown, LucideChevronsUpDown, LucideDynamicIcon,
  ],
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
          <svg lucideZap [size]="16" color="currentColor" class="text-white" [strokeWidth]="2.5" />
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
                  <svg [lucideIcon]="item.icon" class="sidebar-icon" [size]="18" color="currentColor" [strokeWidth]="1.75" />
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
                    <svg [lucideIcon]="item.icon" class="sidebar-icon" [size]="18" color="currentColor" [strokeWidth]="1.75" />
                    @if (!layout.isMini()) {
                      <span class="flex-1 text-sm font-medium text-left truncate">{{ item.label }}</span>
                      <svg lucideChevronDown
                        class="text-[var(--color-sidebar-text)] transition-transform duration-200 shrink-0"
                        [class.rotate-180]="expandedGroups().has(item.id)"
                        [size]="14" color="currentColor" />
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
            <svg lucideChevronsUpDown [size]="14" color="currentColor" class="text-[var(--color-sidebar-text)] shrink-0" />
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

}
