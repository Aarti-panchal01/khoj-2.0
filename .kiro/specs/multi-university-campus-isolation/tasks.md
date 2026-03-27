# Implementation Plan: Multi-University Campus Isolation

## Overview

Harden end-to-end campus isolation so users only see and interact with items from their own campus. The work spans seed data correction, a new middleware, item route refactoring, signup hardening, auth middleware verification, property-based tests, and a frontend dropdown smoke-check.

## Tasks

- [ ] 1. Correct seed data in `data/universities.js`
  - Remove the third PES campus ("Hanumanth Nagar Campus") — only EC and RR campuses are in scope
  - Verify the final list matches exactly: PES University (Electronic City Campus, Ring Road Campus), Dayananda Sagar University (Main Campus), RV College of Engineering (Main Campus), REVA University (Main Campus), UVCE (Main Campus)
  - Confirm `seedUniversities.js` still uses `countDocuments()` guard so re-runs are idempotent
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2. Create `enforceCampusIsolation` middleware
  - [ ] 2.1 Create `server/src/middleware/enforceCampusIsolation.js`
    - Attach `req.campusFilter = { universityId: req.user.universityId, campusId: req.user.campusId }` sourced exclusively from `req.user`
    - Call `next()` unconditionally — no branching logic needed
    - _Requirements: 5.1, 5.2_

  - [ ]* 2.2 Write property test for `enforceCampusIsolation` (Property 10)
    - **Property 10: enforceCampusIsolation attaches correct campusFilter**
    - Generate random `universityId` / `campusId` ObjectId pairs on `req.user`, run the middleware, assert `req.campusFilter` equals those exact values
    - Assert values are never sourced from `req.body`, `req.query`, or `req.params`
    - **Validates: Requirements 5.1, 5.2**

- [ ] 3. Refactor item routes to use `req.campusFilter`
  - [ ] 3.1 Wire `enforceCampusIsolation` into `itemRoutes.js`
    - Import and apply `enforceCampusIsolation` after `authMiddleware` at the router level
    - _Requirements: 5.3_

  - [ ] 3.2 Harden `GET /items` — replace `buildUniversityFilter` with `req.campusFilter`
    - Spread `req.campusFilter` as the base filter (includes both `universityId` and `campusId`)
    - Remove the `?campusId=` query-param override — campus must come from the authenticated user only
    - Retain optional `type`, `status`, `category`, `search` query filters
    - _Requirements: 3.1, 3.5, 7.1, 7.2, 7.3_

  - [ ] 3.3 Harden `GET /items/:id` — add `campusId` to the findOne filter
    - Change filter from `{ _id, universityId }` to `{ _id, ...req.campusFilter }`
    - Catch Mongoose `CastError` on invalid ObjectId and return 404
    - _Requirements: 3.2, 3.4, 7.4_

  - [ ] 3.4 Harden `GET /items/mine` — verify university scoping is present
    - Confirm filter includes `universityId: req.campusFilter.universityId` (already present; verify no regression)
    - _Requirements: 3.3_

  - [ ] 3.5 Harden `POST /items` — verify campus fields come from `req.user`
    - Confirm `universityId`, `campusId`, `universityName`, `campusName` are set from `req.user` and not from `req.body` (already present; verify no regression after middleware refactor)
    - _Requirements: 4.1, 6.1_

  - [ ] 3.6 Harden `PUT /items/:id` — add `campusId` to ownership filter
    - Change filter from `{ _id, user, universityId }` to `{ _id, user, ...req.campusFilter }`
    - Confirm `PROTECTED_ITEM_FIELDS` strips `universityId`, `campusId`, `universityName`, `campusName` from payload
    - _Requirements: 4.2, 4.3_

  - [ ] 3.7 Harden `DELETE /items/:id` — add `campusId` to ownership filter
    - Change filter from `{ _id, user, universityId }` to `{ _id, user, ...req.campusFilter }`
    - _Requirements: 4.3_

  - [ ]* 3.8 Write property test for campus-scoped item feed (Property 4)
    - **Property 4: Campus-scoped item feed**
    - Generate N users across M campuses, insert items per user, assert `GET /items` for each user returns zero items from other campuses
    - **Validates: Requirements 3.1, 3.5, 7.1, 7.2, 7.3**

  - [ ]* 3.9 Write property test for cross-campus 404 (Property 5)
    - **Property 5: Campus-scoped item by ID returns 404 for cross-campus access**
    - Generate two users on different campuses, have user B request user A's item by `_id`, assert HTTP 404
    - **Validates: Requirements 3.2, 3.4, 7.4**

  - [ ]* 3.10 Write property test for `/mine` scoping (Property 6)
    - **Property 6: /mine scoped to user and university**
    - Generate multiple users, insert items, assert `GET /items/mine` for each user returns only their own items
    - **Validates: Requirements 3.3**

  - [ ]* 3.11 Write property test for POST ignoring spoofed campus fields (Property 7)
    - **Property 7: POST ignores spoofed campus fields in request body**
    - Generate random ObjectIds for `universityId`/`campusId` in POST body, assert stored item uses user's actual DB values
    - **Validates: Requirements 4.1, 6.1**

  - [ ]* 3.12 Write property test for PUT cannot change campus fields (Property 8)
    - **Property 8: PUT cannot change campus fields**
    - Generate random campus field values in PUT body, assert those fields on the stored item remain unchanged
    - **Validates: Requirements 4.2**

  - [ ]* 3.13 Write property test for ownership enforcement on PUT/DELETE (Property 9)
    - **Property 9: Ownership and university enforced on PUT and DELETE**
    - Generate two users, assert user B receives 404 when attempting to modify or delete user A's items
    - **Validates: Requirements 4.3**

- [ ] 4. Checkpoint — ensure all item route tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Harden signup to resolve university+campus names to ObjectIds
  - [ ] 5.1 Audit `resolveUniversityAndCampus` in `authRoutes.js`
    - Verify the case-insensitive regex lookup correctly matches all five seeded university names
    - Verify campus lookup is case-insensitive string comparison (already `.toLowerCase()`)
    - Verify HTTP 400 is returned with the correct message when university name is not found
    - Verify HTTP 400 is returned with the correct message when campus name is not found
    - Verify `university._id` and `campus._id` (ObjectIds) are stored on the User — not the raw name strings
    - _Requirements: 6.2, 6.3_

  - [ ] 5.2 Tighten the `signupSchema` campus field validation
    - Change `campus` from fully optional to required when the selected university has more than one campus — add a note in the validator or handle in the route
    - _Requirements: 6.2_

  - [ ]* 5.3 Write property test for signup name resolution (Property 12)
    - **Property 12: Signup resolves names to ObjectIds; invalid names return 400**
    - For valid university+campus name pairs: assert stored user has matching ObjectIds
    - For invalid names: assert HTTP 400 with descriptive message
    - **Validates: Requirements 6.2, 6.3**

- [ ] 6. Verify `authMiddleware` reads universityId/campusId from DB, not JWT
  - [ ] 6.1 Audit `authMiddleware.js`
    - Confirm `User.findById(decoded.id)` fetches the full user document including `universityId` and `campusId`
    - Confirm `req.user` is set to the DB document — not the JWT payload
    - Confirm `decoded.universityId` / `decoded.campusId` from the JWT are never used for access control
    - _Requirements: 6.1_

  - [ ]* 6.2 Write property test for authMiddleware using DB values (Property 11)
    - **Property 11: authMiddleware reads universityId/campusId from DB, not JWT**
    - Forge a JWT whose payload contains a `universityId` that differs from the DB value, assert the system uses the DB value for all access control decisions
    - **Validates: Requirements 6.1**

- [ ] 7. Write property-based tests for data model and seed invariants
  - [ ] 7.1 Set up test infrastructure in `server/src/tests/campus-isolation.test.js`
    - Install `fast-check` and `mongodb-memory-server` as dev dependencies if not already present
    - Set up `MongoMemoryServer` lifecycle (start before tests, stop after)
    - Connect Mongoose to the in-memory instance
    - Seed the five universities before each test suite using `seedUniversities`
    - _Requirements: 2.1_

  - [ ]* 7.2 Write property test for university document round-trip (Property 1)
    - **Property 1: University document structure round-trip**
    - Generate arbitrary university names and campus name arrays, insert, read back, assert `_id` uniqueness and name preservation
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 7.3 Write property test for campus fields copied from user to item (Property 2)
    - **Property 2: Campus fields copied from user to item at write time**
    - Generate arbitrary `universityId`/`campusId` on a mock user, simulate POST, assert stored item fields match user fields
    - **Validates: Requirements 1.3, 1.4, 4.1**

  - [ ]* 7.4 Write property test for seed idempotence (Property 3)
    - **Property 3: Seed idempotence**
    - Run `seedUniversities` twice on an empty collection, assert document count equals 5 both times
    - **Validates: Requirements 2.2, 2.3**

  - [ ] 7.5 Write unit test: seed inserts exactly 5 universities on empty collection
    - Assert collection count is 5 after seeding an empty DB
    - Assert all five university names are present
    - _Requirements: 2.1_

  - [ ] 7.6 Write unit tests for cross-campus and cross-university access denial
    - PES EC Campus user sees zero items from PES Ring Road Campus (Req 7.1)
    - PES user sees zero items from DSU (Req 7.2)
    - DSU user sees zero items from PES (Req 7.3)
    - `GET /items/:id` with invalid ObjectId returns 404
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 7.7 Write property test for dynamic university inclusion in GET /api/universities (Property 13)
    - **Property 13: GET /api/universities includes dynamically added universities**
    - Insert a randomly generated university document directly into the DB, assert it appears in `GET /api/universities` response
    - **Validates: Requirements 8.1, 8.3, 8.4**

- [ ] 8. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Verify frontend signup dropdown shows all 5 universities
  - [ ] 9.1 Confirm `UniversityAPI.list()` in `Signup.jsx` calls `GET /api/universities`
    - Trace `UniversityAPI.list()` in `src/lib/apiClient.js` to confirm it hits the correct endpoint
    - _Requirements: 8.3_

  - [ ] 9.2 Confirm campus dropdown renders correctly for PES (2 campuses) and single-campus universities
    - Verify the `matchedUniversity.campuses.length > 1` branch shows a "Select campus" placeholder for PES
    - Verify single-campus universities (DSU, RVCE, REVA, UVCE) auto-select their only campus
    - _Requirements: 8.3, 8.4_

- [ ] 10. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with `mongodb-memory-server` — no live DB required
- The `enforceCampusIsolation` middleware must always be applied AFTER `authMiddleware`
- `universityId` and `campusId` from the JWT payload are intentionally ignored for access control — the DB is always the source of truth
