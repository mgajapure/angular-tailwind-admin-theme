import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule, Loader2 } from 'lucide-angular';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule.pick({ Loader2 })],
  template: `
    <lucide-angular name="loader-2" [class]="spinnerClass()" color="currentColor"
         [attr.aria-label]="label()" role="status" [size]="sizeValue()" />
    @if (label() && showLabel()) {
      <span class="sr-only">{{ label() }}</span>
    }
  `,
  host: { class: 'inline-flex items-center gap-2' }
})
export class SpinnerComponent {
  size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  color = input('currentColor');
  label = input('Loading...');
  showLabel = input(false);

  spinnerClass = computed(() => 'animate-spin');

  sizeValue = computed(() => ({ xs: 12, sm: 16, md: 24, lg: 32, xl: 48 }[this.size()]));
}
