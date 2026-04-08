// Construct base API URL - ensure it does NOT include /api path
// Backend server has app.use('/api/auth', ...) so we'll add /api in the fetch calls
const getAPIBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // If VITE_API_URL is set, remove /api suffix if present
    return envUrl.replace(/\/api\/?$/, '');
  }
  // Local development default
  return 'http://localhost:4000';
};

const API_BASE_URL = getAPIBaseUrl();

// Public endpoints that should never trigger auth:expired on 401 (defense-in-depth)
const PUBLIC_PATHS = ['/universities'];

let isRefreshing = false;
let refreshQueue = []; // queued requests waiting for a new token

const mapItem = (item) => {
  return {
    ...item,
    id: item?._id || item?.id,
  };
};

// CRITICAL: Always get token from localStorage dynamically - never cache it
const getAuthToken = () => {
  return localStorage.getItem('khoj_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('khoj_token', token);
  } else {
    localStorage.removeItem('khoj_token');
  }
};

/** Attempt to get a new access token using the HTTP-only refresh cookie */
const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // send the HTTP-only cookie
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Refresh failed');
  const data = await response.json();
  setAuthToken(data.token);
  return data.token;
};

export const apiRequest = async (path, { method = 'GET', body, headers, auth = true } = {}) => {
  const doFetch = (token) => {
    return fetch(`${API_BASE_URL}/api${path}`, {
      method,
      credentials: 'include',
      headers: auth
        ? { 'Content-Type': 'application/json', ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        : { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  // CRITICAL: Get token dynamically from localStorage for EVERY request
  const currentToken = getAuthToken();
  let response = await doFetch(currentToken);

  // Auto-refresh on 401 — only for authenticated requests, not auth endpoints or public paths
  if (response.status === 401 && auth && !path.startsWith('/auth/') && !PUBLIC_PATHS.some(p => path.startsWith(p))) {
    if (isRefreshing) {
      // Queue this request until the in-flight refresh completes
      const newToken = await new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
      response = await doFetch(newToken);
    } else {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        refreshQueue.forEach(({ resolve }) => resolve(newToken));
        refreshQueue = [];
        response = await doFetch(newToken);
      } catch {
        refreshQueue.forEach(({ reject }) => reject(new Error('Session expired')));
        refreshQueue = [];
        setAuthToken(null);
        // Redirect to login — let the app handle this via AuthContext
        window.dispatchEvent(new CustomEvent('auth:expired'));
        const error = new Error('Session expired. Please log in again.');
        error.status = 401;
        throw error;
      } finally {
        isRefreshing = false;
      }
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    // User-friendly error messages for production
    let userMessage = 'Something went wrong. Please try again.';
    
    if (response.status === 401) {
      userMessage = 'Session expired. Please log in again.';
    } else if (response.status === 403) {
      userMessage = 'You do not have permission to perform this action.';
    } else if (response.status === 404) {
      userMessage = 'The requested resource was not found.';
    } else if (response.status >= 500) {
      userMessage = 'Server error. Please try again later.';
    } else if (errorBody.message) {
      // Only show backend message if it's safe (not exposing internals)
      userMessage = errorBody.message;
    }
    
    const error = new Error(userMessage);
    error.status = response.status;
    error.data = errorBody;
    throw error;
  }

  return response.json().catch(() => ({}));
};

export const AuthAPI = {
  signup: (payload) => apiRequest('/auth/signup', { method: 'POST', body: payload, auth: false }),
  google: (payload) => apiRequest('/auth/google', { method: 'POST', body: payload, auth: false }),
  verifyEmail: (payload) => apiRequest('/auth/verify-email', { method: 'POST', body: payload, auth: false }),
  resendOtp: (payload) => apiRequest('/auth/resend-otp', { method: 'POST', body: payload, auth: false }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload, auth: false }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  refresh: () => apiRequest('/auth/refresh', { method: 'POST', auth: false }),
  me: () => apiRequest('/auth/me'),
  updateProfile: (payload) => apiRequest('/auth/profile', { method: 'PATCH', body: payload }),
};

export const ItemsAPI = {
  /** Pass filters as query string params; set options.auth false for guest (no Authorization header). */
  list: (params = {}, options = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') acc[key] = value;
      return acc;
    }, {});
    const query = new URLSearchParams(cleanParams).toString();
    const auth = options.auth !== false;
    return apiRequest(`/items${query ? `?${query}` : ''}`, { auth }).then((items) => (Array.isArray(items) ? items : []).map(mapItem));
  },
  mine: () => apiRequest('/items/mine').then(items => items.map(mapItem)),
  getById: (id) => apiRequest(`/items/${id}`).then(mapItem),
  create: (payload) => apiRequest('/items', { method: 'POST', body: payload }).then(mapItem),
  update: (id, payload) => apiRequest(`/items/${id}`, { method: 'PUT', body: payload }).then(mapItem),
  remove: (id) => apiRequest(`/items/${id}`, { method: 'DELETE' }),
};

export const UniversityAPI = {
  list: () => apiRequest('/universities', { auth: false }),
};

export const UploadAPI = {
  uploadImages: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('images', file));

    // CRITICAL: Get token dynamically from localStorage
    const token = getAuthToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(errorBody.message || 'Upload failed. Please try again.');
      error.status = response.status;
      throw error;
    }

    return response.json();
  },
};

export const ClaimsAPI = {
  create: (payload) => apiRequest('/claims', { method: 'POST', body: payload }),
  getForItem: (itemId) => apiRequest(`/claims/item/${itemId}`),
  getMine: () => apiRequest('/claims/mine'),
  approve: (claimId) => apiRequest(`/claims/${claimId}/approve`, { method: 'PUT' }),
  reject: (claimId) => apiRequest(`/claims/${claimId}/reject`, { method: 'PUT' }),
};

export const NotificationsAPI = {
  list: () => apiRequest('/notifications'),
  getUnreadCount: () => apiRequest('/notifications/unread'),
  markAsRead: (notificationId) => apiRequest(`/notifications/${notificationId}/read`, { method: 'PUT' }),
  markAllAsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),
};
