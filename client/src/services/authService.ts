import apiClient from '../api/apiClient';

// API response types
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organization: string;
  };
  token?: string;
  refreshToken?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetCodePayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

// Auth Service
export const authService = {
  /**
   * Register a new user account
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', payload);

    // Store tokens if provided
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', payload);

    // Store tokens if provided
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/forgot-password', payload);
    return response.data;
  },

  /**
   * Verify reset code
   */
  async verifyResetCode(payload: VerifyResetCodePayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/verify-reset-code', payload);
    return response.data;
  },

  /**
   * Reset password with verified code
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/reset-password', payload);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
      refreshToken,
    });

    // Store new tokens
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * Logout by clearing the stored tokens
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Verify token validity by making an authenticated request
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await apiClient.get('/api/auth/verify');
      return response.status === 200;
    } catch {
      return false;
    }
  },
};
