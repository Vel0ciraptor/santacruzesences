import { create } from 'zustand';
import { Usuario } from '../types';

interface AuthState {
  user: Usuario | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: Usuario, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const getInitialUser = (): Usuario | null => {
  try {
    const item = localStorage.getItem('user');
    if (!item || item === 'undefined' || item === 'null') return null;
    return JSON.parse(item);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
