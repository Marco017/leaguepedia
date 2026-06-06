import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'marco';
const SESSION_KEY = 'lp_admin_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private _isAuthenticated = signal(false);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  constructor() {
    // Restore session from sessionStorage on app start
    if (isPlatformBrowser(this.platformId)) {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored === 'true') {
        this._isAuthenticated.set(true);
      }
    }
  }

  login(username: string, password: string): boolean {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      this._isAuthenticated.set(true);
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
      return true;
    }
    return false;
  }

  logout(): void {
    this._isAuthenticated.set(false);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = '/';
    }
  }
}
