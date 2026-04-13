import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { SettingsPanelComponent } from '../settings-panel/settings-panel.component';
import { ToastStackComponent } from '../../shared/components/notification/toast-stack.component';
import { CommandPaletteComponent } from '../../shared/components/command-palette/command-palette.component';
import { LayoutService } from '../../core/services/layout.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TopbarComponent,
    SettingsPanelComponent,
    ToastStackComponent,
    CommandPaletteComponent,
  ],
  template: `
    <div class="flex h-screen bg-[var(--color-bg-base)] overflow-hidden">

      <!-- Sidebar -->
      <app-sidebar />

      <!-- Main area -->
      <div
        class="flex flex-col flex-1 min-w-0 transition-all duration-300"
        [style.margin-left]="layout.sidebarWidth()">

        <!-- Topbar (fixed, offset handled via left CSS in topbar) -->
        <div class="h-[var(--topbar-height)] shrink-0"></div>
        <app-topbar />

        <!-- Page content -->
        <main
          id="main-content"
          role="main"
          class="flex-1 overflow-y-auto">
          <div class="p-6 lg:p-8 animate-fade-in">
            <router-outlet />
          </div>
        </main>

        <!-- Footer -->
        @if (config.layout().footerVisible) {
          <footer class="shrink-0 px-6 py-3 border-t border-[var(--color-border)]
                          text-xs text-[var(--color-text-muted)] flex items-center justify-between">
            <span>© {{ currentYear }} AdminKit. Built with Angular v21 + Tailwind CSS v4.</span>
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              All systems operational
            </span>
          </footer>
        }
      </div>
    </div>

    <!-- Global overlays -->
    <app-settings-panel />
    <app-command-palette />
    <app-toast-stack />
  `
})
export class AdminLayoutComponent implements OnInit {
  layout = inject(LayoutService);
  config = inject(ConfigService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentYear = new Date().getFullYear();

  ngOnInit() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      let child = this.route.firstChild;
      while (child?.firstChild) child = child.firstChild;
      const data = child?.snapshot.data;
      if (data?.['title']) this.layout.setPage(data['title'], data['breadcrumbs'] || []);
    });
  }
}
