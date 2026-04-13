import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>({
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@adminkit.io',
    role: 'admin',
    roles: ['admin', 'superuser'],
  });

  private _isAuthenticated = signal(true);

  user = computed(() => this._user());
  isAuthenticated = computed(() => this._isAuthenticated());

  hasRole(role: string): boolean {
    return this._user()?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(r => this.hasRole(r));
  }

  login(email: string, password: string): Promise<boolean> {
    // Mock login
    return new Promise(resolve => {
      setTimeout(() => {
        this._isAuthenticated.set(true);
        resolve(true);
      }, 800);
    });
  }

  logout() {
    this._isAuthenticated.set(false);
    this._user.set(null);
  }
}
