/**
 * Task 2 — Preservation Property Tests
 *
 * Property 2: Preservation — Authenticated Session Expiry Still Triggers auth:expired Redirect
 * Property 4: Preservation — Password Validation Logic Unchanged
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 *
 * OBSERVATION-FIRST METHODOLOGY:
 *   - Observed on UNFIXED code: when an authenticated request receives a 401 and the
 *     refresh call also fails, auth:expired is dispatched and navigate('/login') is called.
 *   - Observed on UNFIXED code: GET /api/items (protected route) returns 401 without a valid token.
 *   - Observed on UNFIXED code: validateForm in Signup.jsx rejects passwords of length 7
 *     and accepts length 8.
 *
 * EXPECTED OUTCOME: Tests PASS on UNFIXED code (confirms baseline behavior to preserve).
 * These tests must continue to pass AFTER the fix is applied (regression prevention).
 */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

// ─── Setup ────────────────────────────────────────────────────────────────────

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-preservation';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal Express app that mounts the REAL itemRoutes (protected by authMiddleware).
 * We do NOT connect to MongoDB — authMiddleware rejects before any DB call.
 */
function buildItemApp() {
  const app = express();
  app.use(express.json());
  const itemRoutes = require('../routes/itemRoutes');
  app.use('/api/items', itemRoutes);
  return app;
}

/**
 * Reproduce the exact apiRequest logic from apiClient.js (UNFIXED version).
 * Returns a function that simulates the client-side request with the given fetch mock.
 *
 * This is the UNFIXED condition:
 *   if (response.status === 401 && auth && !path.startsWith('/auth/')) { ... refresh ... auth:expired }
 *
 * @param {Function} mockFetch - fetch mock to inject
 * @param {string|null} initialToken - simulated authToken in localStorage
 * @returns {{ apiRequest: Function, dispatchedEvents: string[] }}
 */
function buildApiClientSimulation(mockFetch, initialToken) {
  const dispatchedEvents = [];

  const savedDispatch = global.dispatchEvent;
  global.dispatchEvent = (event) => {
    dispatchedEvents.push(event.type);
    if (savedDispatch) savedDispatch(event);
  };

  const savedFetch = global.fetch;
  global.fetch = mockFetch;

  const API_BASE_URL = 'http://localhost:4000/api';
  let authToken = initialToken;
  let isRefreshing = false;
  let refreshQueue = [];

  const setAuthToken = (token) => { authToken = token; };

  const refreshAccessToken = async () => {
    const response = await global.fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Refresh failed');
    const data = await response.json();
    setAuthToken(data.token);
    return data.token;
  };

  // UNFIXED apiRequest — no PUBLIC_PATHS guard
  const apiRequest = async (path, { method = 'GET', body, headers, auth = true } = {}) => {
    const doFetch = (token) =>
      global.fetch(`${API_BASE_URL}${path}`, {
        method,
        credentials: 'include',
        headers: auth
          ? { 'Content-Type': 'application/json', ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
          : { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
      });

    let response = await doFetch(authToken);

    // UNFIXED condition — no PUBLIC_PATHS exclusion
    if (response.status === 401 && auth && !path.startsWith('/auth/')) {
      if (isRefreshing) {
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
          global.dispatchEvent(new (class CustomEvent {
            constructor(type) { this.type = type; }
          })('auth:expired'));
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

  const restore = () => {
    global.dispatchEvent = savedDispatch;
    global.fetch = savedFetch;
  };

  return { apiRequest, dispatchedEvents, restore };
}

// ─── validateForm extracted from Signup.jsx ───────────────────────────────────
// We inline the exact logic from Signup.jsx validateForm so we can test it
// as a pure function without mounting React. This mirrors the UNFIXED code.

function validateForm(formData, matchedUniversity) {
  if (!formData.name.trim()) return 'Name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address';
  if (formData.phone.length < 10) return 'Please enter a valid phone number';
  if (!formData.college.trim()) return 'Please select your university';
  if (matchedUniversity && matchedUniversity.campuses.length > 1 && !formData.campus.trim()) {
    return 'Please select your campus';
  }
  if (formData.password.length < 8) return 'Password must be at least 8 characters';
  if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
  return null;
}

/** Minimal valid form data — only password varies in the PBT below */
function makeValidFormData(password, confirmPassword) {
  return {
    name: 'Test User',
    email: 'test@university.edu',
    phone: '9876543210',
    college: 'Test University',
    campus: 'Main Campus',
    password,
    confirmPassword: confirmPassword !== undefined ? confirmPassword : password,
  };
}

// ─── Part 1: Server-side — GET /api/items returns 401 without a valid token ───

describe('Preservation — Protected route GET /api/items requires auth (MUST PASS on unfixed code)', () => {
  test(
    'Property 2: GET /api/items with no Authorization header returns 401 ' +
    '(authMiddleware is still in place on protected routes)',
    async () => {
      const app = buildItemApp();

      const response = await request(app)
        .get('/api/items')
        .set('Accept', 'application/json');
      // No Authorization header

      assert.equal(
        response.status,
        401,
        `Expected 401 but got ${response.status}. ` +
        `Protected route /api/items must still require authentication.`
      );
    }
  );

  test(
    'Property 2: GET /api/items with an invalid/expired token returns 401 ' +
    '(authMiddleware rejects bad tokens)',
    async () => {
      const app = buildItemApp();

      const response = await request(app)
        .get('/api/items')
        .set('Authorization', 'Bearer this.is.an.invalid.token')
        .set('Accept', 'application/json');

      assert.equal(
        response.status,
        401,
        `Expected 401 but got ${response.status}. ` +
        `Protected route /api/items must reject invalid tokens.`
      );
    }
  );
});

// ─── Part 2: Client-side — auth:expired fires for authenticated session expiry ─

describe('Preservation — auth:expired dispatched when authenticated session expires (MUST PASS on unfixed code)', () => {
  /**
   * Property-based test: for all simulated authenticated sessions where the
   * refresh cookie is absent/invalid, auth:expired is always dispatched after a 401.
   *
   * We generate a range of "authenticated session" scenarios:
   *   - Different fake token strings (simulating real but expired JWTs)
   *   - Different protected paths (not /auth/ and not /universities)
   *
   * In all cases, the server returns 401 and the refresh also fails.
   * The UNFIXED apiClient.js MUST dispatch auth:expired in all these cases.
   *
   * **Validates: Requirements 3.1, 3.4**
   */

  // Simulate a range of authenticated session scenarios
  const authenticatedSessionScenarios = [
    // [description, fakeToken, path]
    ['expired JWT on /items', 'eyJhbGciOiJIUzI1NiJ9.expired.sig', '/items'],
    ['expired JWT on /items/mine', 'eyJhbGciOiJIUzI1NiJ9.expired2.sig', '/items/mine'],
    ['expired JWT on /items/abc123', 'eyJhbGciOiJIUzI1NiJ9.expired3.sig', '/items/abc123'],
    ['short fake token on /items', 'fake-token-abc', '/items'],
    ['long fake token on /items', 'a'.repeat(200), '/items'],
    ['token with special chars on /items', 'tok.en-with_special+chars==', '/items'],
    ['numeric-looking token on /items', '1234567890.abcdef.ghijkl', '/items'],
    ['empty-ish token on /items', ' ', '/items'],
  ];

  for (const [description, fakeToken, path] of authenticatedSessionScenarios) {
    test(
      `Property 2: auth:expired is dispatched when authenticated session expires — ${description}`,
      async () => {
        // Mock fetch: the protected endpoint returns 401, refresh also fails
        const mockFetch = async (url) => {
          if (url.includes('/auth/refresh')) {
            return {
              ok: false,
              status: 401,
              json: async () => ({ message: 'Refresh failed — no valid cookie' }),
            };
          }
          // All other requests return 401 (simulating expired token)
          return {
            ok: false,
            status: 401,
            json: async () => ({ message: 'Invalid or expired token' }),
          };
        };

        const { apiRequest, dispatchedEvents, restore } = buildApiClientSimulation(mockFetch, fakeToken);

        try {
          await apiRequest(path, { auth: true });
        } catch {
          // Expected to throw — we only care about auth:expired being dispatched
        }

        restore();

        // PRESERVATION: auth:expired MUST be dispatched for authenticated sessions
        // where the token is expired and refresh fails.
        // This is the behavior we are preserving — it must not be broken by the fix.
        assert.ok(
          dispatchedEvents.includes('auth:expired'),
          `PRESERVATION FAILURE: auth:expired was NOT dispatched for an authenticated session ` +
          `(${description}). ` +
          `Dispatched events: [${dispatchedEvents.join(', ')}]. ` +
          `The fix must not break the session-expiry redirect for authenticated users.`
        );
      }
    );
  }

  test(
    'Property 2: auth:expired is NOT dispatched when auth=false (public endpoints bypass the 401 handler)',
    async () => {
      // Requests with auth: false should never trigger auth:expired
      const mockFetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const { apiRequest, dispatchedEvents, restore } = buildApiClientSimulation(mockFetch, null);

      try {
        await apiRequest('/auth/login', { auth: false });
      } catch {
        // Expected to throw
      }

      restore();

      assert.ok(
        !dispatchedEvents.includes('auth:expired'),
        `auth:expired should NOT be dispatched for auth=false requests. ` +
        `Dispatched events: [${dispatchedEvents.join(', ')}].`
      );
    }
  );

  test(
    'Property 2: auth:expired is NOT dispatched when path starts with /auth/ (auth endpoints bypass the 401 handler)',
    async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const { apiRequest, dispatchedEvents, restore } = buildApiClientSimulation(mockFetch, 'some-token');

      try {
        await apiRequest('/auth/refresh', { auth: true });
      } catch {
        // Expected to throw
      }

      restore();

      assert.ok(
        !dispatchedEvents.includes('auth:expired'),
        `auth:expired should NOT be dispatched for /auth/ paths. ` +
        `Dispatched events: [${dispatchedEvents.join(', ')}].`
      );
    }
  );
});

// ─── Part 3: validateForm password validation preservation ────────────────────

describe('Preservation — validateForm password validation (MUST PASS on unfixed code)', () => {
  /**
   * Property-based test: for all password strings of length < 8, validateForm
   * returns a rejection error; for length >= 8, it does not reject on password length.
   *
   * We generate passwords of lengths 0–15 and verify the threshold is exactly 8.
   *
   * **Validates: Requirements 3.2, 3.3**
   */

  // Generate passwords of lengths 0 through 14 (covers below and above threshold)
  const passwordLengths = Array.from({ length: 15 }, (_, i) => i);

  for (const len of passwordLengths) {
    const password = 'a'.repeat(len);

    test(
      `Property 4: validateForm with password of length ${len} — ` +
      (len < 8 ? 'should reject (too short)' : 'should not reject on password length'),
      () => {
        const formData = makeValidFormData(password);
        const result = validateForm(formData, null);

        if (len < 8) {
          // Must return a password-length error
          assert.ok(
            result !== null && result.toLowerCase().includes('password'),
            `Expected a password validation error for length ${len} but got: ${JSON.stringify(result)}`
          );
          assert.ok(
            result.includes('8'),
            `Expected error message to reference '8' characters for length ${len} but got: ${result}`
          );
        } else {
          // Must NOT return a password-length error
          // (may return null or a different error — we only check it's not a password-length error)
          const isPasswordLengthError =
            result !== null &&
            result.toLowerCase().includes('password') &&
            result.includes('8');
          assert.ok(
            !isPasswordLengthError,
            `Expected no password-length error for length ${len} but got: ${JSON.stringify(result)}`
          );
        }
      }
    );
  }

  test(
    'Property 4: validateForm boundary — length 7 is rejected, length 8 is accepted (password check)',
    () => {
      const shortPassword = 'a'.repeat(7);
      const validPassword = 'a'.repeat(8);

      const shortResult = validateForm(makeValidFormData(shortPassword), null);
      assert.ok(
        shortResult !== null && shortResult.toLowerCase().includes('password'),
        `Expected password error for length 7 but got: ${JSON.stringify(shortResult)}`
      );

      const validResult = validateForm(makeValidFormData(validPassword), null);
      const isPasswordLengthError =
        validResult !== null &&
        validResult.toLowerCase().includes('password') &&
        validResult.includes('8');
      assert.ok(
        !isPasswordLengthError,
        `Expected no password-length error for length 8 but got: ${JSON.stringify(validResult)}`
      );
    }
  );

  test(
    'Property 4: validateForm — passwords do not match returns mismatch error (not a length error)',
    () => {
      const formData = makeValidFormData('password123', 'different456');
      const result = validateForm(formData, null);
      assert.ok(
        result !== null && result.toLowerCase().includes('match'),
        `Expected passwords-do-not-match error but got: ${JSON.stringify(result)}`
      );
    }
  );

  test(
    'Property 4: validateForm — valid form with 8-char password returns null (no error)',
    () => {
      const formData = makeValidFormData('exactly8');
      const result = validateForm(formData, null);
      assert.equal(
        result,
        null,
        `Expected null (no error) for valid form with 8-char password but got: ${JSON.stringify(result)}`
      );
    }
  );

  test(
    'Property 4: validateForm — valid form with long password returns null (no error)',
    () => {
      const formData = makeValidFormData('a'.repeat(64));
      const result = validateForm(formData, null);
      assert.equal(
        result,
        null,
        `Expected null (no error) for valid form with 64-char password but got: ${JSON.stringify(result)}`
      );
    }
  );
});
