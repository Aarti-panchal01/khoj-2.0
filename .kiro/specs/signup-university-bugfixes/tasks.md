# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Unauthenticated University Fetch Returns 401 and Triggers auth:expired
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case — unauthenticated GET /api/universities — to ensure reproducibility
  - Test that `GET /api/universities` with no Authorization header returns 200 and a non-empty array (from Bug Condition in design: `isBugCondition({ type: 'pageLoad', page: 'signup', authState: 'unauthenticated' })`)
  - Also test that mounting `<Signup />` with no auth token does NOT dispatch `auth:expired` on `window`
  - Run test on UNFIXED code — expect FAILURE (GET returns 401, auth:expired fires)
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists)
  - Document counterexamples found: e.g. "GET /api/universities returns 401 for unauthenticated request", "auth:expired CustomEvent dispatched on Signup mount"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.2, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Authenticated Session Expiry Still Triggers auth:expired Redirect
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: when an authenticated request receives a 401 and the refresh call also fails, `auth:expired` is dispatched and `navigate('/login')` is called
  - Observe on UNFIXED code: `GET /api/items` (protected route) returns 401 without a valid token
  - Observe on UNFIXED code: `validateForm` in Signup.jsx rejects passwords of length 7 and accepts length 8
  - Write property-based test: for all simulated authenticated sessions where the refresh cookie is absent/invalid, `auth:expired` is always dispatched after a 401 (from Preservation Requirements in design: `NOT isBugCondition(input)` where input involves a real expired session)
  - Write property-based test: for all password strings of length < 8, `validateForm` returns a rejection error; for length >= 8, it does not reject on password length
  - Verify both tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix signup university bugs

  - [x] 3.1 Remove authMiddleware from GET /api/universities in universityRoutes.js
    - Remove `authMiddleware` argument from `router.get('/', authMiddleware, ...)` so the route becomes `router.get('/', async (_req, res) => { ... })`
    - Remove the `require('../middleware/authMiddleware')` import if it is no longer used in this file
    - _Bug_Condition: isBugCondition({ type: 'pageLoad', page: 'signup', authState: 'unauthenticated' }) — unauthenticated request to GET /api/universities receives 401_
    - _Expected_Behavior: GET /api/universities returns 200 with university list for unauthenticated requests_
    - _Preservation: All other routes in universityRoutes.js are unaffected; authMiddleware remains in place on all protected routes_
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 3.2 Add PUBLIC_PATHS guard in apiClient.js to prevent auth:expired for public endpoints
    - Add `const PUBLIC_PATHS = ['/universities'];` near the top of apiClient.js
    - Update the 401 auto-refresh condition from `response.status === 401 && auth && !path.startsWith('/auth/')` to also exclude public paths: `&& !PUBLIC_PATHS.some(p => path.startsWith(p))`
    - This is defense-in-depth: even if authMiddleware is accidentally re-added to a public route, the client will not misinterpret the 401 as a session expiry
    - _Bug_Condition: isBugCondition({ type: 'pageLoad', page: 'signup', authState: 'unauthenticated' }) — auth:expired fires because UniversityAPI.list() uses auth: true by default_
    - _Expected_Behavior: auth:expired is NOT dispatched for paths in PUBLIC_PATHS even when response is 401_
    - _Preservation: auth:expired still fires for all non-public authenticated requests where refresh fails_
    - _Requirements: 2.1, 2.2, 3.1_

  - [x] 3.3 Audit and fix password hint copy in Signup.jsx
    - Confirm the password `<Input>` placeholder reads `"At least 8 characters"` — it already does in current code
    - Search for any other copy surfaces (tooltip, helper text, aria-description, comments) that reference "6 characters" and update them to "8 characters"
    - Confirm `validateForm` check is `formData.password.length < 8` — already correct
    - No code change needed if no stale "6 characters" copy is found; document the audit result
    - _Bug_Condition: isBugCondition({ type: 'passwordHint', source: 'signupUI' }) — any copy referencing 6 characters is inconsistent with min(8) validation_
    - _Expected_Behavior: All password hint copy on the signup form references "at least 8 characters"_
    - _Preservation: Password validation logic (length < 8 threshold) is unchanged_
    - _Requirements: 2.3, 3.2, 3.3_

  - [x] 3.4 Confirm Login.jsx "Create Account" link routes to /signup
    - Verify `<Link to="/signup">Create Account</Link>` is present in Login.jsx — it already is
    - No code change needed; the redirect-to-login symptom was caused by bug #1 (auth:expired on signup load), not by an incorrect link
    - Document confirmation: Login.jsx line with `<Link to="/signup">` is correct
    - _Requirements: 2.1_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Unauthenticated University Fetch Returns 200, No auth:expired
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior (GET /api/universities returns 200, auth:expired not dispatched on Signup mount)
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bugs 1 and 3 are fixed)
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Authenticated Session Expiry and Password Validation Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in auth:expired flow or password validation)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass; ask the user if questions arise
