const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Public endpoints that should never trigger auth:expired on 401 (defense-in-depth)
const PUBLIC_PATHS = ['/universities'];

let authToken = localStorage.getItem('khoj_token') || null;
let isRefreshing = false;
let refreshQueue = []; // queued requests waiting for a new token

const mapItem = (item) => {
  console.log('🔧 mapItem - Raw item from API:', item);
  const mapped = {
    ...item,
    id: item?._id || item?.id,
  };
  console.log('🔧 mapItem - Mapped item:', mapped);
  return mapped;
};

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('khoj_token', token);
  } else {
    localStorage.removeItem('khoj_token');
  }
};

const buildHeaders = (extra = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
};

/** Attempt to get a new access token using the HTTP-only refresh cookie */
const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
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
  const doFetch = (token) =>
    fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: auth
        ? { 'Content-Type': 'application/json', ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        : { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

  let response = await doFetch(authToken);

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
    const error = new Error(errorBody.message || 'Request failed');
    error.status = response.status;
    error.data = errorBody;
    throw error;
  }

  return response.json().catch(() => ({}));
};

export const AuthAPI = {
  signup: (payload) => apiRequest('/auth/signup', { method: 'POST', body: payload, auth: false }),
  verifyEmail: (payload) => apiRequest('/auth/verify-email', { method: 'POST', body: payload, auth: false }),
  resendOtp: (payload) => apiRequest('/auth/resend-otp', { method: 'POST', body: payload, auth: false }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload, auth: false }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  refresh: () => apiRequest('/auth/refresh', { method: 'POST', auth: false }),
  me: () => apiRequest('/auth/me'),
};

export const ItemsAPI = {
  list: (params = {}) => {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') acc[key] = value;
      return acc;
    }, {});
    const query = new URLSearchParams(cleanParams).toString();
    return apiRequest(`/items${query ? `?${query}` : ''}`).then(items => items.map(mapItem));
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

    const headers = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(errorBody.message || 'Upload failed');
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
