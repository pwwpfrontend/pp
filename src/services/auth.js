import axios from "axios";

const API_BASE_URL = "http://optimus-india-njs-01.netbird.cloud:3006";

// Storage keys
const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const ROLE_KEY = "role";
const EMAIL_KEY = "email";

// Basic storage helpers
export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY);
export const getEmail = () => localStorage.getItem(EMAIL_KEY);

const setAuthData = ({ token, refreshToken, role, email }) => {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (role) localStorage.setItem(ROLE_KEY, role);
  if (email) localStorage.setItem(EMAIL_KEY, email);
};

export const clearAuthData = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
};

// Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL
});

// Request: attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Refresh token single-flight control
let isRefreshing = false;
let pendingRequestsQueue = [];

const addPendingRequest = (callback) => {
  pendingRequestsQueue.push(callback);
};

const resolvePendingRequests = (newToken) => {
  pendingRequestsQueue.forEach((callback) => callback(newToken));
  pendingRequestsQueue = [];
};

const rejectPendingRequests = (error) => {
  pendingRequestsQueue.forEach((callback) => callback(null, error));
  pendingRequestsQueue = [];
};

// Response: handle 401 -> try refresh once, then logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // Avoid infinite loop and ignore for refresh endpoint itself
    const isAuthEndpoint = originalRequest?.url?.includes("/login") || originalRequest?.url?.includes("/refresh") || originalRequest?.url?.includes("/logout");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (isRefreshing) {
          // Wait for the current refresh to resolve
          const newAccessToken = await new Promise((resolve, reject) => {
            addPendingRequest((tokenResult, err) => {
              if (err) return reject(err);
              resolve(tokenResult);
            });
          });

          if (newAccessToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }

        isRefreshing = true;
        const refreshed = await refreshToken();
        isRefreshing = false;
        resolvePendingRequests(refreshed.token);

        originalRequest.headers["Authorization"] = `Bearer ${refreshed.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        rejectPendingRequests(refreshError);
        // On refresh failure, perform local cleanup
        clearAuthData();
        // Hard redirect to login page; router may not be available here
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API calls
export async function login(email, password) {
  const response = await api.post("/login", { email, password });
  const { token, refreshToken, role } = response.data || {};
  setAuthData({ token, refreshToken, role, email });
  return { token, refreshToken, role };
}

export async function refreshToken() {
  const storedRefreshToken = getRefreshToken();
  if (!storedRefreshToken) {
    throw new Error("No refresh token available");
  }
  const response = await api.post("/refresh", { refreshToken: storedRefreshToken });
  const { token, refreshToken: newRefreshToken, role } = response.data || {};
  setAuthData({ token, refreshToken: newRefreshToken, role });
  return { token, refreshToken: newRefreshToken, role };
}

export async function logout() {
  try {
    await api.post("/logout");
  } finally {
    clearAuthData();
  }
}

export default {
  api,
  login,
  refreshToken,
  logout,
  getToken,
  getRole,
  getEmail
};


