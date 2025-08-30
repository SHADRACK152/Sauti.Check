import { LoginRequest, RegisterRequest } from "@shared/schema";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  location: string;
  role: string;
  articlesRead: number;
  factsChecked: number;
  bookmarksCount: number;
}

interface AuthResponse {
  token: string;
  user: User;
}

export const auth = {
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout(): void {
    this.removeToken();
    this.removeUser();
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  auth.setToken(data.token);
  auth.setUser(data.user);
  return data;
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  const data: AuthResponse = await response.json();
  auth.setToken(data.token);
  auth.setUser(data.user);
  return data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch('/api/auth/me', {
    headers: auth.getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  const data = await response.json();
  auth.setUser(data.user);
  return data.user;
};
