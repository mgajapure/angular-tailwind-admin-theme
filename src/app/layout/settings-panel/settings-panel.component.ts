import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';
import { LayoutService } from '../../core/services/layout.service';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { ToggleComponent } from '../../shared/components/form/toggle/toggle.component';
import { colorSchemes, BorderRadius } from '../../config/theme.config';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DrawerComponent, ToggleComponent],
  template: `
    <ui-drawer [open]="layout.isSettingsOpen()" title="Theme Settings" size="md" (close)="layout.closeSettings()">

      <div class="space-y-8">

        <!-- Color Scheme -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Color Scheme</h4>
          <div class="flex flex-wrap gap-2.5">
            @for (scheme of colorSchemes; track scheme.value) {
              <button
                (click)="setColorScheme(scheme.value)"
                [title]="scheme.label"
                class="flex flex-col items-center gap-1.5 group">
                <div
                  class="w-8 h-8 rounded-full ring-2 ring-offset-2 transition-all"
                  [style.background]="scheme.hex"
                  [class]="config.theme().colorScheme === scheme.value
                    ? 'ring-[var(--color-text-primary)] scale-110'
                    : 'ring-transparent group-hover:ring-[var(--color-border)]'">
                </div>
                <span class="text-[10px] text-[var(--color-text-muted)]">{{ scheme.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Dark Mode -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Appearance</h4>
          <div class="grid grid-cols-3 gap-2">
            @for (mode of ['light', 'dark', 'system']; track mode) {
              <button
                (click)="setMode(mode)"
                [class]="config.theme().mode === mode
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 text-[var(--color-primary-600)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)]'"
                class="flex flex-col items-center gap-2 p-3 rounded-[var(--radius)] border text-xs font-medium transition-all capitalize">
                @if (mode === 'light') {
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                  </svg>
                } @else if (mode === 'dark') {
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                } @else {
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                  </svg>
                }
                {{ mode }}
              </button>
            }
          </div>
        </div>

        <!-- Border Radius -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Border Radius</h4>
          <div class="grid grid-cols-5 gap-2">
            @for (r of radiusOptions; track r.value) {
              <button
                (click)="setRadius(r.value)"
                [class]="config.theme().borderRadius === r.value
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary-300)]'"
                class="flex flex-col items-center gap-1.5 p-2 border text-xs text-[var(--color-text-secondary)]
                       transition-all rounded-[var(--radius)]">
                <div class="w-8 h-5 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)]"
                     [style.border-radius]="r.preview"></div>
                {{ r.label }}
              </button>
            }
          </div>
        </div>

        <!-- Sidebar Layout -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Sidebar</h4>
          <div class="space-y-2">
            <ui-toggle
              [value]="config.layout().sidebarStyle === 'mini'"
              label="Mini Sidebar"
              description="Show icons only"
              (change)="setSidebarMini($event)" />
            <ui-toggle
              [value]="config.layout().footerVisible"
              label="Show Footer"
              (change)="setFooterVisible($event)" />
          </div>
        </div>

        <!-- Features -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Features</h4>
          <div class="space-y-2">
            <ui-toggle
              [value]="config.features().commandPalette"
              label="Command Palette"
              description="⌘K to open"
              (change)="toggleFeature('commandPalette', $event)" />
            <ui-toggle
              [value]="config.features().notifications"
              label="Notifications"
              (change)="toggleFeature('notifications', $event)" />
            <ui-toggle
              [value]="config.features().advancedAnalytics"
              label="Advanced Analytics"
              (change)="toggleFeature('advancedAnalytics', $event)" />
          </div>
        </div>

      </div>

      <div drawer-footer class="flex gap-2">
        <button
          (click)="reset()"
          class="flex-1 px-4 py-2 text-sm font-medium rounded-[var(--radius)] border border-[var(--color-border)]
                 text-[var(--color-text-secondary)] hover:bg-[var(--color-neutral-50)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors">
          Reset Defaults
        </button>
        <button
          (click)="layout.closeSettings()"
          class="flex-1 px-4 py-2 text-sm font-medium rounded-[var(--radius)]
                 bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] transition-colors">
          Done
        </button>
      </div>
    </ui-drawer>
  `
})
export class SettingsPanelComponent {
  config = inject(ConfigService);
  layout = inject(LayoutService);
  private toast = inject(ToastService);

  colorSchemes = colorSchemes;

  radiusOptions: { value: BorderRadius; label: string; preview: string }[] = [
    { value: 'none', label: 'None', preview: '0' },
    { value: 'sm', label: 'SM', preview: '4px' },
    { value: 'md', label: 'MD', preview: '8px' },
    { value: 'lg', label: 'LG', preview: '12px' },
    { value: 'xl', label: 'XL', preview: '16px' },
  ];

  setColorScheme(scheme: any) { this.config.update('theme', { colorScheme: scheme }); }
  setMode(mode: any) { this.config.update('theme', { mode }); }
  setRadius(r: any) { this.config.update('theme', { borderRadius: r }); }
  setSidebarMini(mini: boolean) { this.config.update('layout', { sidebarStyle: mini ? 'mini' : 'default' }); }
  setFooterVisible(v: boolean) { this.config.update('layout', { footerVisible: v }); }
  toggleFeature(key: any, value: boolean) { this.config.update('features', { [key]: value }); }

  reset() {
    this.config.reset();
    this.toast.success('Settings reset', 'All settings restored to defaults.');
  }
}
