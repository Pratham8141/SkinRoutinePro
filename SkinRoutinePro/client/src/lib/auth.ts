import { User } from "@shared/schema";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    // Load auth state from localStorage on initialization
    this.loadAuthState();
  }

  private loadAuthState() {
    try {
      const stored = localStorage.getItem('auth_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.authState = {
          user: parsed.user,
          isAuthenticated: !!parsed.user
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }

  private saveAuthState() {
    try {
      localStorage.setItem('auth_state', JSON.stringify(this.authState));
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  setUser(user: User | null) {
    this.authState = {
      user,
      isAuthenticated: !!user
    };
    this.saveAuthState();
    this.notifyListeners();
  }

  logout() {
    this.authState = {
      user: null,
      isAuthenticated: false
    };
    localStorage.removeItem('auth_state');
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }
}

export const authManager = new AuthManager();

// React hook for using auth state
import { useState, useEffect } from 'react';

export function useAuth(): AuthState & {
  login: (user: User) => void;
  logout: () => void;
} {
  const [authState, setAuthState] = useState<AuthState>(authManager.getAuthState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const login = (user: User) => {
    authManager.setUser(user);
  };

  const logout = () => {
    authManager.logout();
  };

  return {
    ...authState,
    login,
    logout
  };
}
