# Bugfix Requirements Document

## Introduction

Three bugs affect the signup flow of the Khoj webapp:

1. Clicking "Create Account" on the login page redirects back to the login page instead of staying on the signup page. Root cause: the `/api/universities` endpoint requires authentication (`authMiddleware`), so when the unauthenticated signup form calls `UniversityAPI.list()` it receives a 401, which triggers the global `auth:expired` event in `apiClient.js`, which in turn calls `navigate('/login')` — bouncing the user away from signup.

2. Password validation shows an inconsistent minimum length message. The frontend placeholder and inline hint previously referenced 6 characters, but the actual validation (both frontend `validateForm` and backend Zod schema) requires 8 characters.

3. The university dropdown on the signup page is empty. Same root cause as bug 1: the `/api/universities` route is guarded by `authMiddleware`, so unauthenticated requests (signup form) receive a 401 and the dropdown never populates.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an unauthenticated user clicks "Create Account" on the login page THEN the system redirects them back to `/login` instead of showing the signup page

1.2 WHEN an unauthenticated user lands on the signup page THEN the system fires the `auth:expired` event (triggered by the 401 from `GET /api/universities`) and navigates to `/login`

1.3 WHEN a user enters exactly 6 characters in the password field on the signup form THEN the system displays a validation error saying the password is too short, despite a prior hint suggesting 6 characters was sufficient

1.4 WHEN the signup page loads THEN the university dropdown shows no options because `GET /api/universities` returns 401 for unauthenticated requests

### Expected Behavior (Correct)

2.1 WHEN an unauthenticated user clicks "Create Account" on the login page THEN the system SHALL navigate to `/signup` and remain there

2.2 WHEN an unauthenticated user is on the signup page and the page fetches universities THEN the system SHALL NOT fire `auth:expired` or redirect to `/login` as a result of that request

2.3 WHEN a user enters a password shorter than 8 characters on the signup form THEN the system SHALL display a consistent error message stating that at least 8 characters are required

2.4 WHEN the signup page loads THEN the university dropdown SHALL display all available universities fetched from the backend

### Unchanged Behavior (Regression Prevention)

3.1 WHEN an authenticated user's access token expires during a normal session THEN the system SHALL CONTINUE TO fire `auth:expired` and redirect to `/login`

3.2 WHEN a user submits the signup form with a password of 8 or more characters THEN the system SHALL CONTINUE TO accept the password as valid

3.3 WHEN a user submits the signup form with a password shorter than 8 characters THEN the system SHALL CONTINUE TO reject it with a validation error

3.4 WHEN an authenticated user accesses any protected route THEN the system SHALL CONTINUE TO require a valid token

3.5 WHEN the login page loads THEN the university datalist SHALL CONTINUE TO populate (login page also fetches universities, but users may already be partially authenticated or the fetch may succeed via refresh cookie)
