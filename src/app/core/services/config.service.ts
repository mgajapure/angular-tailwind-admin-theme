import { Injectable, signal, computed } from '@angular/core';
import { AdminConfig, defaultConfig } from '../../config/theme.config';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly STORAGE_KEY = 'admin:config';

  config = signal<AdminConfig>(this.loadConfig());

  theme = computed(() => this.config().theme);
  layout = computed(() => this.config().layout);
  features = computed(() => this.config().features);
  branding = computed(() => this.config().branding);

  update<K extends keyof AdminConfig>(key: K, value: Partial<AdminConfig[K]>) {
    this.config.update(c => ({
      ...c,
      [key]: { ...c[key], ...value }
    }));
    this.persist();
  }

  reset() {
    this.config.set({ ...defaultConfig });
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config()));
    } catch (e) {
      console.warn('Could not persist config:', e);
    }
  }

  private loadConfig(): AdminConfig {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return this.mergeDeep(defaultConfig, parsed);
      }
    } catch (e) {
      console.warn('Could not load config:', e);
    }
    return { ...defaultConfig };
  }

  private mergeDeep(target: any, source: any): any {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
}
