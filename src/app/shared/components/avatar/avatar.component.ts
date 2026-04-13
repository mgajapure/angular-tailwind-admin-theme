import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="wrapperClass()" [attr.title]="name()">
      @if (src()) {
        <img [src]="src()" [alt]="name()" class="w-full h-full object-cover" />
      } @else {
        <span [class]="initialsClass()">{{ initials() }}</span>
      }
      @if (status()) {
        <span [class]="statusClass()"></span>
      }
    </div>
  `
})
export class AvatarComponent {
  src = input('');
  name = input('User');
  size = input<AvatarSize>('md');
  status = input<'online' | 'offline' | 'away' | 'busy' | ''>('');
  rounded = input(true);

  initials = computed(() => {
    return this.name().split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  });

  wrapperClass = computed(() => {
    const sizes: Record<AvatarSize, string> = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };
    return [
      'relative inline-flex shrink-0 overflow-hidden',
      sizes[this.size()],
      this.rounded() ? 'rounded-full' : 'rounded-[var(--radius)]',
    ].join(' ');
  });

  initialsClass = computed(() => {
    const colors = [
      'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700',
      'bg-sky-100 text-sky-700',
      'bg-violet-100 text-violet-700',
    ];
    const idx = this.name().charCodeAt(0) % colors.length;
    return ['w-full h-full flex items-center justify-center font-semibold', colors[idx]].join(' ');
  });

  statusClass = computed(() => {
    const statusColors: Record<string, string> = {
      online: 'bg-emerald-500',
      offline: 'bg-gray-400',
      away: 'bg-amber-500',
      busy: 'bg-red-500',
    };
    const statusSizes: Record<AvatarSize, string> = {
      xs: 'w-1.5 h-1.5 bottom-0 right-0',
      sm: 'w-2 h-2 bottom-0 right-0',
      md: 'w-2.5 h-2.5 bottom-0.5 right-0.5',
      lg: 'w-3 h-3 bottom-0.5 right-0.5',
      xl: 'w-3.5 h-3.5 bottom-1 right-1',
    };
    return [
      'absolute rounded-full ring-2 ring-[var(--color-bg-surface)]',
      statusColors[this.status()] || '',
      statusSizes[this.size()],
    ].join(' ');
  });
}
