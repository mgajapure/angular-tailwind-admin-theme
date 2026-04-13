import { Injectable, signal, computed } from '@angular/core';

export interface Breadcrumb {
  label: string;
  route?: string;
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
  // Sidebar state
  isMini = signal(false);
  isMobileOpen = signal(false);

  // Page meta
  pageTitle = signal('Dashboard');
  breadcrumbs = signal<Breadcrumb[]>([]);

  // Settings panel
  isSettingsOpen = signal(false);

  // Responsive detection
  private mq = window.matchMedia('(max-width: 1023px)');
  isMobile = signal(this.mq.matches);

  constructor() {
    this.mq.addEventListener('change', e => {
      this.isMobile.set(e.matches);
      if (e.matches) {
        this.isMobileOpen.set(false);
      }
    });
  }

  toggleMini() {
    if (this.isMobile()) {
      this.isMobileOpen.update(v => !v);
    } else {
      this.isMini.update(v => !v);
    }
  }

  closeMobile() {
    this.isMobileOpen.set(false);
  }

  openSettings() {
    this.isSettingsOpen.set(true);
  }

  closeSettings() {
    this.isSettingsOpen.set(false);
  }

  setPage(title: string, breadcrumbs: Breadcrumb[] = []) {
    this.pageTitle.set(title);
    this.breadcrumbs.set(breadcrumbs);
  }

  sidebarWidth = computed(() => {
    if (this.isMobile()) return '0px';
    return this.isMini() ? 'var(--sidebar-mini-width)' : 'var(--sidebar-width)';
  });
}
