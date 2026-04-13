import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';
import { Breadcrumb } from '../../../core/services/layout.service';

@Component({
  selector: 'ui-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule.pick({ ChevronRight })],
  template: `
    <nav aria-label="Breadcrumb">
      <ol class="flex items-center gap-1.5 text-sm">
        @for (crumb of items(); track crumb.label; let last = $last) {
          <li class="flex items-center gap-1.5">
            @if (!last) {
              @if (crumb.route) {
                <a [routerLink]="crumb.route"
                   class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                  {{ crumb.label }}
                </a>
              } @else {
                <span class="text-[var(--color-text-muted)]">{{ crumb.label }}</span>
              }
              <lucide-angular name="chevron-right" class="text-[var(--color-text-muted)] shrink-0" [size]="14" color="currentColor" />
            } @else {
              <span class="text-[var(--color-text-primary)] font-medium">{{ crumb.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `
})
export class BreadcrumbComponent {
  items = input<Breadcrumb[]>([]);
}
