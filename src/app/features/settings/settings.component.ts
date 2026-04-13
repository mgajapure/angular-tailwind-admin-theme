import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { InputComponent } from '../../shared/components/form/input/input.component';
import { ToggleComponent } from '../../shared/components/form/toggle/toggle.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AccordionComponent, AccordionItem } from '../../shared/components/accordion/accordion.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputComponent, ToggleComponent, ButtonComponent, AvatarComponent, AccordionComponent],
  template: `
    <div class="max-w-3xl">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-[var(--color-text-primary)]">Settings</h1>
        <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">Manage your account and preferences.</p>
      </div>

      <!-- Profile section -->
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                  shadow-[var(--shadow-card)] p-6 mb-5">
        <h2 class="text-base font-semibold text-[var(--color-text-primary)] mb-5">Profile Information</h2>
        <div class="flex items-center gap-5 mb-6 pb-6 border-b border-[var(--color-border)]">
          <ui-avatar [name]="auth.user()?.name || 'User'" size="xl" />
          <div>
            <ui-button variant="outline" size="sm">Change Photo</ui-button>
            <p class="text-xs text-[var(--color-text-muted)] mt-1.5">JPG, GIF or PNG. Max 2MB.</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <ui-input label="First Name" [value]="firstName()" (valueChange)="firstName.set($event)" placeholder="First name" />
          <ui-input label="Last Name" [value]="lastName()" (valueChange)="lastName.set($event)" placeholder="Last name" />
        </div>
        <div class="mb-4">
          <ui-input label="Email Address" type="email" [value]="email()" (valueChange)="email.set($event)" />
        </div>
        <div class="mb-6">
          <ui-input label="Bio" [value]="bio()" (valueChange)="bio.set($event)" placeholder="A short bio about yourself" />
        </div>
        <div class="flex justify-end">
          <ui-button variant="primary" (click)="saveProfile()" [loading]="saving()">Save Changes</ui-button>
        </div>
      </div>

      <!-- Notifications -->
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                  shadow-[var(--shadow-card)] p-6 mb-5">
        <h2 class="text-base font-semibold text-[var(--color-text-primary)] mb-5">Notifications</h2>
        <div class="space-y-4">
          @for (n of notifSettings; track n.key) {
            <div class="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
              <div>
                <div class="text-sm font-medium text-[var(--color-text-primary)]">{{ n.label }}</div>
                <div class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ n.description }}</div>
              </div>
              <ui-toggle [value]="n.value" (change)="n.value = $event" />
            </div>
          }
        </div>
      </div>

      <!-- Security FAQ -->
      <div class="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)]
                  shadow-[var(--shadow-card)] p-6 mb-5">
        <h2 class="text-base font-semibold text-[var(--color-text-primary)] mb-5">Security FAQ</h2>
        <ui-accordion [items]="faqItems" [multiple]="true" />
      </div>

      <!-- Danger zone -->
      <div class="bg-[var(--color-bg-surface)] border border-red-200 dark:border-red-900/30 rounded-[var(--radius-lg)]
                  shadow-[var(--shadow-card)] p-6">
        <h2 class="text-base font-semibold text-red-600 mb-1">Danger Zone</h2>
        <p class="text-sm text-[var(--color-text-muted)] mb-4">These actions are irreversible. Please be certain.</p>
        <div class="flex flex-wrap gap-3">
          <ui-button variant="outline" (click)="toast.warning('Account suspended', 'Your account has been suspended.')">
            Suspend Account
          </ui-button>
          <ui-button variant="danger" (click)="toast.error('Action required', 'Please confirm this action via email.')">
            Delete Account
          </ui-button>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private layout = inject(LayoutService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  saving = signal(false);
  firstName = signal(this.auth.user()?.name?.split(' ')[0] || '');
  lastName = signal(this.auth.user()?.name?.split(' ')[1] || '');
  email = signal(this.auth.user()?.email || '');
  bio = signal('Building awesome products with Angular.');

  notifSettings = [
    { key: 'email_orders', label: 'New Orders', description: 'Receive email notifications for new orders', value: true },
    { key: 'email_users', label: 'User Signups', description: 'Get notified when new users register', value: true },
    { key: 'email_security', label: 'Security Alerts', description: 'Alerts for suspicious login attempts', value: true },
    { key: 'email_reports', label: 'Weekly Reports', description: 'Receive a weekly performance digest', value: false },
    { key: 'push_all', label: 'Push Notifications', description: 'Enable browser push notifications', value: false },
  ];

  faqItems: AccordionItem[] = [
    { id: 'mfa', title: 'How do I enable two-factor authentication?', content: 'Go to Security Settings > Two-Factor Authentication and follow the setup wizard. You can use an authenticator app like Google Authenticator or Authy.' },
    { id: 'password', title: 'How often should I change my password?', content: 'We recommend changing your password every 90 days. Use a strong, unique password with a mix of letters, numbers, and symbols.' },
    { id: 'sessions', title: 'How do I manage active sessions?', content: 'You can view and revoke active sessions from Security Settings > Active Sessions. We recommend revoking any sessions from unrecognized devices.' },
    { id: 'api', title: 'How do I manage API keys?', content: 'API keys can be created and managed from Developer Settings > API Keys. Always keep your keys secret and rotate them periodically.' },
  ];

  ngOnInit() {
    this.layout.setPage('Settings', [{ label: 'Settings' }]);
  }

  async saveProfile() {
    this.saving.set(true);
    await new Promise(r => setTimeout(r, 800));
    this.saving.set(false);
    this.toast.success('Profile saved', 'Your profile has been updated successfully.');
  }
}
