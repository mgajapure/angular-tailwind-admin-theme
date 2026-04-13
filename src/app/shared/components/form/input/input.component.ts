import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAlertCircle } from '@lucide/angular';

@Component({
  selector: 'ui-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LucideAlertCircle],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label [for]="inputId" class="text-sm font-medium text-[var(--color-text-primary)]">
          {{ label() }}
          @if (required()) { <span class="text-red-500 ml-0.5">*</span> }
        </label>
      }

      <div class="relative flex items-center">
        @if (prefix()) {
          <div class="absolute left-3 text-[var(--color-text-muted)] pointer-events-none">
            <ng-content select="[input-prefix]" />
          </div>
        }

        <input
          [id]="inputId"
          [type]="type()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [required]="required()"
          [(ngModel)]="value"
          [class]="inputClass()"
          [attr.aria-describedby]="hint() || error() ? inputId + '-desc' : null"
          [attr.aria-invalid]="!!error()" />

        @if (suffix()) {
          <div class="absolute right-3 text-[var(--color-text-muted)]">
            <ng-content select="[input-suffix]" />
          </div>
        }
      </div>

      @if (error()) {
        <p [id]="inputId + '-desc'" class="text-xs text-red-500 flex items-center gap-1">
          <svg lucideAlertCircle [size]="12" color="currentColor" />
          {{ error() }}
        </p>
      } @else if (hint()) {
        <p [id]="inputId + '-desc'" class="text-xs text-[var(--color-text-muted)]">{{ hint() }}</p>
      }
    </div>
  `
})
export class InputComponent {
  label = input('');
  type = input('text');
  placeholder = input('');
  hint = input('');
  error = input('');
  disabled = input(false);
  readonly = input(false);
  required = input(false);
  prefix = input(false);
  suffix = input(false);
  value = model('');

  private static _idCounter = 0;
  readonly inputId = (() => `ui-input-${++InputComponent._idCounter}`)();

  inputClass = computed(() => [
    'w-full px-3 py-2 text-sm rounded-[var(--radius)] transition-all duration-150',
    'bg-[var(--color-bg-surface)] border text-[var(--color-text-primary)]',
    'placeholder:text-[var(--color-text-muted)]',
    'focus:outline-none focus:ring-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--color-neutral-50)]',
    this.prefix() ? 'pl-9' : '',
    this.suffix() ? 'pr-9' : '',
    this.error()
      ? 'border-red-400 focus:ring-red-200 dark:focus:ring-red-900/30'
      : 'border-[var(--color-border)] focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)]',
  ].filter(Boolean).join(' '));
}
