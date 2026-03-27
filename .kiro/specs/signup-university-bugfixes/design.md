# Signup & University Bugfixes — Bugfix Design

## Overview

Three bugs affect the unauthenticated signup flow. Two of them (redirect-to-login on "Create Account" click, and empty university dropdown) share the same root cause: `GET /api/universities` is guarded by `authMiddleware`, so unauthenticated requests receive a 401, which the global `auth:expired` handler in `apiClient.js` interprets as a session expiry and navigates to `/login`. The third bug is a cosmetic inconsistency where password UI copy referenced 6 characters while the actual validation requires 8.

The fix strategy is minimal and targeted:
1. Remove `authMiddleware` from `GET /api/universities` (it is public reference data).
2. Guard the `auth:expired` dispatch in `apiClient.js` so it only fires for requests made with `auth: true` (already the case) AND only when the refresh attempt fails for a genuinely authenticated session — the current code already does this correctly, so the real fix is just #1.
3. Audit all password hint copy and align it to "at least 8 characters".
4. Confirm the "Create Account" link in `Login.jsx` routes to `/signup` (it already does — no code change needed, the redirect was caused by bug #1).

---

## Glossary

- **Bug_Condition (C)**: The set of inputs/states that trigger one of the three bugs.
- **Property (P)**: The desired correct behavior when the bug condition holds.
- **Preservation**: Existing behaviors that must remain unchanged after the fix.
- **authMiddleware**: Express middleware in `server/src/middleware/authMiddleware.js` that validates a JWT Bearer token and rejects unauthenticated requests with HTTP 401.
- **auth:expired**: A browser `CustomEvent` dispatched by `apiClient.js` when a token refresh fails, causing `AuthContext` to navigate to `/login`.
- **UniversityAPI.list()**: Frontend call to `GET /api/universities` via `apiRequest('/universities')` with default `auth: true`.
- **isBugCondition**: Pseudocode predicate defined below that identifies inputs triggering any of the three bugs.

---

## Bug Details

### Bug Condition

The bugs manifest when an unauthenticated user visits the signup page (or clicks "Create Account" from login), or when any user reads password hint copy.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input — one of:
           { type: 'navigation', from: 'login', action: 'createAccount' }
           { type: 'pageLoad', page: 'signup', authState: 'unauthenticated' }
           { type: 'passwordHint', source: 'signupUI' }
  OUTPUT: boolean

  IF input.type = 'navigation'
     AND input.from = 'login'
     AND input.action = 'createAccount'
  THEN RETURN true   -- Bug 1: redirect loop

  IF input.type = 'pageLoad'
     AND input.page = 'signup'
     AND input.authState = 'unauthenticated'
  THEN RETURN true   -- Bugs 1 & 3: auth:expired fires, dropdown empty

  IF input.type = 'passwordHint'
     AND input.source = 'signupUI'
  THEN RETURN true   -- Bug 2: inconsistent copy

  RETURN false
END FUNCTION
```

### Examples

- **Bug 1 & 3**: Unauthenticated user clicks "Create Account" on `/login` → navigates to `/signup` → `Signup.jsx` mounts → `UniversityAPI.list()` fires → `GET /api/universities` returns 401 → `apiClient.js` attempts token refresh → refresh fails (no session) → dispatches `auth:expired` → `AuthContext` calls `navigate('/login')` → user is bounced back to login. University dropdown is also empty because the fetch never resolved.
- **Bug 2**: User reads the `<Input>` placeholder `"At least 8 characters"` on the signup form — this is already correct in `Signup.jsx`. However, any stale copy elsewhere (e.g., tooltip, helper text, or a previous version of the placeholder) that says "6 characters" is inconsistent with the Zod schema `password: z.string().min(8)` and the frontend `validateForm` check `formData.password.length < 8`.
- **Edge case**: Login page also calls `UniversityAPI.list()` — after the fix, this call will succeed for unauthenticated users too, which is the desired behavior.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When an authenticated user's access token expires mid-session, `auth:expired` MUST still fire and redirect to `/login`.
- Password validation (both frontend and backend) MUST continue to reject passwords shorter than 8 characters.
- All protected routes (`/`, `/post`, `/profile`) MUST continue to require a valid token via `authMiddleware`.
- The login page university datalist MUST continue to populate.
- Signup form submission logic, OTP verification flow, and all other auth flows MUST be unaffected.

**Scope:**
All inputs that do NOT match `isBugCondition` must produce identical behavior before and after the fix. Specifically:
- Authenticated API requests that receive a 401 (expired token) must still trigger the refresh → `auth:expired` flow.
- Any request made with `auth: false` (signup, login, verify-email, refresh) must continue to bypass the 401 handler entirely.
- Campus dropdown population after university selection must continue to work.

---

## Hypothesized Root Cause

1. **`authMiddleware` on a public endpoint**: `GET /api/universities` is used by both the signup and login forms — both of which are accessible without authentication. Placing `authMiddleware` on this route was an over-restriction. The 401 it returns is misinterpreted by the global error handler as a session expiry.

2. **`auth:expired` fires on any 401 from a non-`/auth/` path**: `apiClient.js` dispatches `auth:expired` whenever a token refresh fails for a request where `auth: true`. Since `UniversityAPI.list()` uses the default `auth: true`, and the refresh cookie is absent for a fresh unauthenticated user, the refresh fails and `auth:expired` fires — even though the user was never authenticated to begin with.

3. **Password copy inconsistency**: The Zod schema was updated from `min(6)` to `min(8)` (comment in `validators.js` confirms: "raised from 6 to 8") but not all UI copy was updated in sync. The `Signup.jsx` placeholder already says "At least 8 characters", so the inconsistency may exist in other surfaces (e.g., a tooltip, a separate helper text component, or documentation).

4. **"Create Account" link is correct but ineffective**: `Login.jsx` already has `<Link to="/signup">Create Account</Link>` — the routing is correct. The redirect-to-login symptom is entirely caused by bug #1 (the `auth:expired` event firing on signup page load).

---

## Correctness Properties

Property 1: Bug Condition — Unauthenticated Signup Flow Completes Without Redirect

_For any_ input where `isBugCondition` returns true and the input involves an unauthenticated user navigating to or loading the signup page, the fixed system SHALL allow the user to remain on `/signup`, SHALL populate the university dropdown with data from `GET /api/universities`, and SHALL NOT dispatch `auth:expired` or navigate to `/login` as a result of the university fetch.

**Validates: Requirements 2.1, 2.2, 2.4**

Property 2: Preservation — Authenticated Session Expiry Still Triggers Redirect

_For any_ input where `isBugCondition` returns false and an authenticated user's token expires (refresh also fails), the fixed `apiClient.js` SHALL still dispatch `auth:expired` and `AuthContext` SHALL still navigate to `/login`, preserving the existing session-expiry protection.

**Validates: Requirements 3.1, 3.4**

Property 3: Bug Condition — Password Validation Copy Is Consistent

_For any_ input where `isBugCondition` returns true and the input involves reading password hint copy on the signup form, the fixed UI SHALL display "at least 8 characters" (or equivalent wording referencing 8), consistent with the backend Zod schema `min(8)` and the frontend `validateForm` check.

**Validates: Requirements 2.3**

Property 4: Preservation — Password Validation Logic Unchanged

_For any_ password input, the fixed system SHALL continue to reject passwords shorter than 8 characters and accept passwords of 8 or more characters, with no change to the validation logic in `validateForm` or the Zod schema.

**Validates: Requirements 3.2, 3.3**

---

## Fix Implementation

### Changes Required

**File 1**: `khoj-2.0-main/server/src/routes/universityRoutes.js`

**Change**: Remove `authMiddleware` from the `GET /` route.

```js
// Before
router.get('/', authMiddleware, async (_req, res) => { ... });

// After
router.get('/', async (_req, res) => { ... });
```

Also remove the `authMiddleware` import if it is no longer used in this file.

**Rationale**: Universities are public reference data used by unauthenticated signup and login forms. There is no sensitive information in the university/campus list that warrants authentication.

---

**File 2**: `khoj-2.0-main/src/lib/apiClient.js`

**Change**: Add a path-based public-endpoint guard so that `auth:expired` is never dispatched for known public endpoints, even if they are called with `auth: true` by mistake.

Specifically, add `/universities` to a `PUBLIC_PATHS` set and skip the refresh/`auth:expired` logic when the path matches:

```js
const PUBLIC_PATHS = ['/universities'];

// Inside apiRequest, replace the 401 block condition:
if (response.status === 401 && auth && !path.startsWith('/auth/') && !PUBLIC_PATHS.some(p => path.startsWith(p))) {
  // existing refresh + auth:expired logic
}
```

**Rationale**: Defense-in-depth. Even if `authMiddleware` is accidentally re-added to a public route in the future, the client will not misinterpret the 401 as a session expiry. This also fixes the symptom independently of the server-side fix.

---

**File 3**: `khoj-2.0-main/src/pages/auth/Signup.jsx` (audit only)

**Change**: Verify the password `<Input>` placeholder reads "At least 8 characters". Current code already has this correct (`placeholder="At least 8 characters"`). No code change needed unless other copy surfaces are found.

**File 4**: `khoj-2.0-main/src/pages/auth/Login.jsx` (no change needed)

The `<Link to="/signup">Create Account</Link>` is already correct. No change required.

---

## Testing Strategy

### Validation Approach

Two-phase approach: first run exploratory tests against the unfixed code to confirm the root cause, then verify the fix satisfies all correctness properties and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs on unfixed code and confirm the root cause hypotheses.

**Test Plan**: Write integration/unit tests that simulate an unauthenticated browser session calling `GET /api/universities` and mounting the `Signup` component. Run on unfixed code to observe the 401 and the `auth:expired` dispatch.

**Test Cases**:
1. **Unauthenticated university fetch**: Call `GET /api/universities` with no Authorization header → expect 401 on unfixed code, 200 on fixed code. (will fail on unfixed code)
2. **auth:expired fires on signup load**: Mount `<Signup />` with no auth token, spy on `window.dispatchEvent` → expect `auth:expired` to be dispatched on unfixed code, NOT dispatched on fixed code. (will fail on unfixed code)
3. **Dropdown empty on signup**: Mount `<Signup />` unauthenticated → expect university list to be empty on unfixed code, populated on fixed code. (will fail on unfixed code)
4. **Password hint copy**: Render `<Signup />` → assert placeholder text contains "8" not "6". (may already pass if copy was partially fixed)

**Expected Counterexamples**:
- `GET /api/universities` returns 401 for unauthenticated requests.
- `auth:expired` CustomEvent is dispatched when `Signup` mounts without a session.
- University dropdown `universities` state remains `[]` after mount.

### Fix Checking

**Goal**: Verify that for all inputs where `isBugCondition` holds, the fixed system produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedSystem(input)
  ASSERT expectedBehavior(result)   -- per Property 1 or Property 3
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where `isBugCondition` does NOT hold, the fixed system behaves identically to the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalSystem(input) = fixedSystem(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random token/session states to verify the `auth:expired` path is still triggered correctly.
- It catches edge cases (e.g., partially expired tokens, concurrent requests) that manual tests miss.
- It provides strong guarantees that the 401-refresh-redirect flow is unchanged for authenticated sessions.

**Test Cases**:
1. **Session expiry preservation**: Simulate an authenticated request that returns 401 with a failed refresh → assert `auth:expired` is still dispatched and `navigate('/login')` is called.
2. **Protected route preservation**: Confirm `GET /api/items` still returns 401 without a valid token (authMiddleware still in place).
3. **Password validation preservation**: Submit signup form with 7-char password → assert rejection; with 8-char password → assert acceptance.
4. **Login university datalist preservation**: Mount `<Login />` unauthenticated after fix → assert university datalist populates (same fix benefits login too).

### Unit Tests

- Test `GET /api/universities` returns 200 with university list when called without Authorization header (after fix).
- Test `GET /api/universities` still returns data correctly when called with a valid token (authenticated users can also call it).
- Test `apiRequest` does NOT dispatch `auth:expired` when path is in `PUBLIC_PATHS` and response is 401.
- Test `validateForm` in `Signup.jsx` rejects passwords of length 7 and accepts length 8.

### Property-Based Tests

- Generate random unauthenticated request scenarios to `GET /api/universities` and assert all return 200 after fix.
- Generate random authenticated sessions with expired tokens and assert `auth:expired` is always dispatched when refresh fails (preservation of Property 2).
- Generate random password strings of varying lengths and assert `validateForm` consistently applies the `length < 8` threshold.

### Integration Tests

- Full signup flow: unauthenticated user → clicks "Create Account" → lands on `/signup` → university dropdown populated → fills form → submits → reaches `/verify-email`.
- Session expiry flow: authenticated user → token expires → refresh fails → redirected to `/login` (regression test).
- Login page university datalist: unauthenticated user → lands on `/login` → university datalist populated.
