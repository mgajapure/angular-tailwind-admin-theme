import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent],
  template: `
    <div class="min-h-screen bg-[var(--color-bg-base)] flex flex-col items-center justify-center p-8 text-center">
      <div class="max-w-md">
        <div class="text-8xl font-black text-[var(--color-primary-600)] opacity-20 leading-none mb-2 select-none">404</div>
        <h1 class="text-3xl font-bold text-[var(--color-text-primary)] mb-3">Page not found</h1>
        <p class="text-[var(--color-text-secondary)] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div class="flex items-center justify-center gap-3">
          <ui-button variant="primary" routerLink="/dashboard">Go to Dashboard</ui-button>
          <ui-button variant="outline" onclick="history.back()">Go Back</ui-button>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
