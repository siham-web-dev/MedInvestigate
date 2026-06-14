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

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to make authenticated requests
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown,
  includeToken: boolean = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token is available and needed
  if (includeToken) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    // Some endpoints might return no content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred');
  }
}

// Auth Service
export const authService = {
  /**
   * Register a new user account
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiCall<AuthResponse>(
      '/api/auth/register',
      'POST',
      payload
    );

    // Store token if provided
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }

    return response;
  },

  /**
   * Login with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiCall<AuthResponse>(
      '/api/auth/login',
      'POST',
      payload
    );

    // Store token if provided
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }

    return response;
  },

  /**
   * Request password reset
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    return apiCall<AuthResponse>(
      '/api/auth/forgot-password',
      'POST',
      payload
    );
  },

  /**
   * Verify reset code
   */
  async verifyResetCode(payload: VerifyResetCodePayload): Promise<AuthResponse> {
    return apiCall<AuthResponse>(
      '/api/auth/verify-reset-code',
      'POST',
      payload
    );
  },

  /**
   * Reset password with verified code
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    return apiCall<AuthResponse>(
      '/api/auth/reset-password',
      'POST',
      payload
    );
  },

  /**
   * Logout by clearing the stored token
   */
  logout(): void {
    localStorage.removeItem('auth_token');
  },

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Verify token validity by making an authenticated request
   * This can be called on app load to verify the stored token is still valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      // Make a test request to verify token
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },
};
