import { Injectable, effect, inject } from '@angular/core';
import { ConfigService } from './config.service';
import { ThemeConfig, radiusMap } from '../../config/theme.config';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private config = inject(ConfigService);

  constructor() {
    effect(() => {
      const theme = this.config.theme();
      this.applyTheme(theme);
    });

    // Watch system dark mode changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if (this.config.theme().mode === 'system') {
        this.applyDarkMode('system');
      }
    });
  }

  private applyTheme(theme: ThemeConfig) {
    const root = document.documentElement;

    // Apply color scheme class
    root.className = root.className
      .replace(/theme-\w+/g, '')
      .replace(/radius-\w+/g, '')
      .replace(/dark/g, '')
      .trim();

    root.classList.add(`theme-${theme.colorScheme}`);
    root.classList.add(`radius-${theme.borderRadius}`);

    // Apply dark mode
    this.applyDarkMode(theme.mode);

    // Apply radius
    root.style.setProperty('--radius', radiusMap[theme.borderRadius]);

    // Apply font
    const fontMap: Record<string, string> = {
      inter: "'Inter', ui-sans-serif, system-ui, sans-serif",
      geist: "'Geist', ui-sans-serif, system-ui, sans-serif",
      'plus-jakarta': "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    };
    root.style.setProperty('--font-sans', fontMap[theme.fontFamily] || fontMap['inter']);
  }

  private applyDarkMode(mode: string) {
    const isDark = mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }

  toggleDark() {
    const current = this.config.theme().mode;
    const next = current === 'dark' ? 'light' : 'dark';
    this.config.update('theme', { mode: next });
  }
}
