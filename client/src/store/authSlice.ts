import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  authService,
  RegisterPayload,
  LoginPayload,
} from "../services/authService";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");

      if (savedToken) {
        /*      const isValid = await authService.verifyToken();
        if (!isValid) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          return { token: null, user: null };
        } */

        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            return { token: savedToken, user };
          } catch {
            localStorage.removeItem("auth_user");
            return { token: savedToken, user: null };
          }
        }

        return { token: savedToken, user: null };
      }

      return { token: null, user: null };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to initialize auth";
      return rejectWithValue(message);
    }
  },
);

export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.login(credentials);

      if (response.token && response.user) {
        localStorage.setItem("auth_user", JSON.stringify(response.user));
        return { token: response.token, user: response.user };
      }

      throw new Error(response.message || "Login failed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return rejectWithValue(message);
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await authService.register(payload);

      if (response.token && response.user) {
        localStorage.setItem("auth_user", JSON.stringify(response.user));
        return { token: response.token, user: response.user };
      }

      throw new Error(response.message || "Registration failed");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      return rejectWithValue(message);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword({ email });

      if (!response.success) {
        throw new Error(response.message || "Failed to send reset code");
      }

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send reset code";
      return rejectWithValue(message);
    }
  },
);

export const verifyResetCode = createAsyncThunk(
  "auth/verifyResetCode",
  async (
    { email, code }: { email: string; code: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.verifyResetCode({ email, code });

      if (!response.success) {
        throw new Error(response.message || "Invalid reset code");
      }

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid reset code";
      return rejectWithValue(message);
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    {
      email,
      code,
      newPassword,
    }: { email: string; code: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.resetPassword({
        email,
        code,
        newPassword,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to reset password");
      }

      return true;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reset password";
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      localStorage.removeItem("auth_user");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize Auth
    builder.addCase(initializeAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.token && !!action.payload.user;
    });
    builder.addCase(initializeAuth.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Forgot Password
    builder.addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Verify Reset Code
    builder.addCase(verifyResetCode.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyResetCode.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(verifyResetCode.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
