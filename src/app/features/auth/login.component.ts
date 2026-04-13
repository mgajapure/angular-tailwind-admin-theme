import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/form/input/input.component';
import { ToggleComponent } from '../../shared/components/form/toggle/toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, InputComponent, ToggleComponent],
  template: `
    <div class="min-h-screen bg-[var(--color-bg-base)] flex">

      <!-- Left panel — branding -->
      <div class="hidden lg:flex lg:w-1/2 bg-[var(--color-sidebar-bg)] flex-col justify-between p-12 relative overflow-hidden">
        <!-- Background decoration -->
        <div class="absolute inset-0 opacity-5">
          <div class="absolute top-20 left-20 w-64 h-64 rounded-full bg-[var(--color-primary-500)] blur-3xl"></div>
          <div class="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-[var(--color-primary-700)] blur-3xl"></div>
        </div>

        <!-- Logo -->
        <div class="relative flex items-center gap-3">
          <div class="w-10 h-10 rounded-[var(--radius)] bg-[var(--color-primary-600)] flex items-center justify-center">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span class="text-xl font-bold text-white">AdminKit</span>
        </div>

        <!-- Testimonial -->
        <div class="relative">
          <div class="text-4xl text-[var(--color-primary-400)] mb-4 font-serif leading-none">"</div>
          <blockquote class="text-white text-lg font-medium leading-relaxed mb-6">
            AdminKit gave us the foundation to build our internal dashboard in record time. The components are beautiful and the DX is outstanding.
          </blockquote>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[var(--color-primary-600)] flex items-center justify-center text-white font-semibold text-sm">JW</div>
            <div>
              <div class="text-white font-medium text-sm">Jordan Wheeler</div>
              <div class="text-[var(--color-sidebar-text)] text-xs">CTO at TechCorp</div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="relative grid grid-cols-3 gap-6">
          @for (stat of stats; track stat.label) {
            <div>
              <div class="text-2xl font-bold text-white">{{ stat.value }}</div>
              <div class="text-xs text-[var(--color-sidebar-text)] mt-0.5">{{ stat.label }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Right panel — form -->
      <div class="flex-1 flex flex-col items-center justify-center p-8">
        <div class="w-full max-w-sm">

          <!-- Mobile logo -->
          <div class="lg:hidden flex items-center gap-3 mb-8">
            <div class="w-8 h-8 rounded-[var(--radius)] bg-[var(--color-primary-600)] flex items-center justify-center">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-[var(--color-text-primary)]">AdminKit</span>
          </div>

          <h1 class="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Welcome back</h1>
          <p class="text-sm text-[var(--color-text-secondary)] mb-8">Sign in to your admin account</p>

          @if (error()) {
            <div class="mb-5 p-3 rounded-[var(--radius)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40
                        text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="login()" class="space-y-4">
            <ui-input
              label="Email"
              type="email"
              placeholder="alex@adminkit.io"
              [(value)]="email"
              [required]="true" />

            <div>
              <ui-input
                label="Password"
                type="password"
                placeholder="••••••••"
                [(value)]="password"
                [required]="true" />
              <div class="flex justify-end mt-1.5">
                <a href="#" class="text-xs text-[var(--color-primary-600)] hover:underline">Forgot password?</a>
              </div>
            </div>

            <ui-toggle label="Remember me for 30 days" [(value)]="rememberMe" />

            <ui-button
              variant="primary"
              [fullWidth]="true"
              type="submit"
              [loading]="loading()">
              Sign in
            </ui-button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-xs text-[var(--color-text-muted)]">
              Demo credentials: any email + any password
            </p>
          </div>

          <div class="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
            <p class="text-sm text-[var(--color-text-muted)]">
              Don't have an account?
              <a href="#" class="text-[var(--color-primary-600)] font-medium hover:underline ml-1">Create one</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = 'alex@adminkit.io';
  password = 'password';
  rememberMe = model(false);
  loading = signal(false);
  error = signal('');

  stats = [
    { value: '50K+', label: 'Active users' },
    { value: '200+', label: 'Components' },
    { value: '99.9%', label: 'Uptime SLA' },
  ];

  async login() {
    this.loading.set(true);
    this.error.set('');
    try {
      const ok = await this.auth.login(this.email, this.password);
      if (ok) this.router.navigate(['/dashboard']);
      else this.error.set('Invalid email or password.');
    } catch {
      this.error.set('An error occurred. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
