# Design Document: Multi-University Campus Isolation

## Overview

Khoj is a lost & found platform for university students. This feature hardens and completes end-to-end campus isolation so that a user at one campus can only see and interact with items posted by users at the same campus. The system already has the data model scaffolding (University, Campus sub-documents, universityId/campusId on User and Item). This design closes the remaining gaps: a dedicated `enforceCampusIsolation` middleware, strict campus-scoped queries on all item routes, a hardened signup flow that resolves names to ObjectIds, and a data-driven seed script for the five target universities.

The key design principle throughout is: **ObjectIds are the source of truth for access control; display strings (universityName, campusName) are never used in queries.**

---

## Architecture

The system follows a layered Express/MongoDB architecture. Campus isolation is enforced at the database query layer — not in application-level post-fetch filtering.

```mermaid
flowchart TD
    Client -->|HTTP + Bearer JWT| Express

    subgraph Middleware Chain
        A[authMiddleware\nverifies JWT, re-reads User from DB\nattaches req.user with universityId + campusId]
        B[enforceCampusIsolation\nattaches req.campusFilter\n= universityId + campusId from req.user]
        A --> B
    end

    subgraph Item Routes
        C[GET /items\nfilter by campusFilter]
        D[GET /items/mine\nfilter by user._id + universityId]
        E[GET /items/:id\nfilter by _id + campusFilter → 404 if miss]
        F[POST /items\nset universityId+campusId from req.user]
        G[PUT /items/:id\nstrip protected fields, filter by user+campusFilter]
        H[DELETE /items/:id\nfilter by user+campusFilter]
    end

    B --> C & D & E & F & G & H

    subgraph Auth Routes
        I[POST /auth/signup\nresolve university+campus names → ObjectIds]
        J[POST /auth/login\nvalidate university by ObjectId comparison]
    end

    subgraph Public Routes
        K[GET /api/universities\nno auth required]
    end

    subgraph Database
        L[(MongoDB)]
        M[universities collection\nembedded campuses array]
        N[users collection\nuniversityId + campusId ObjectIds]
        O[items collection\nuniversityId + campusId ObjectIds]
    end

    Express --> Middleware Chain
    Express --> Auth Routes
    Express --> Public Routes
    I --> L
    C & D & E & F & G & H --> L
    K --> L
```

---

## Components and Interfaces

### 1. `enforceCampusIsolation` middleware

**File:** `server/src/middleware/enforceCampusIsolation.js`

```js
// Attaches req.campusFilter = { universityId, campusId } from req.user.
// Must be applied AFTER authMiddleware (which populates req.user from DB).
// universityId and campusId are NEVER read from req.body, req.query, or req.params.
const enforceCampusIsolation = (req, res, next) => {
  req.campusFilter = {
    universityId: req.user.universityId,
    campusId: req.user.campusId,
  };
  next();
};
```

Placement in the middleware chain:
```
authMiddleware → enforceCampusIsolation → route handler
```

`req.campusFilter` is a plain object that route handlers spread directly into MongoDB `find()` / `findOne()` filter arguments. This keeps isolation logic in one place and prevents routes from accidentally omitting the campus scope.

### 2. `authMiddleware` (existing — no changes needed)

Already re-reads the full User document from MongoDB on every request using the `_id` from the verified JWT. `universityId` and `campusId` in the JWT payload are ignored for access control — they are only present for client-side display caching. The DB read is the authoritative source.

### 3. Item Routes (`itemRoutes.js`)

All routes apply `authMiddleware` then `enforceCampusIsolation`. The `buildUniversityFilter` helper is replaced by direct use of `req.campusFilter`.

| Route | Isolation filter |
|---|---|
| `GET /items` | `{ ...req.campusFilter, ...optionalFilters }` |
| `GET /items/mine` | `{ user: req.user._id, universityId: req.campusFilter.universityId }` |
| `GET /items/:id` | `{ _id, ...req.campusFilter }` → 404 if no match |
| `POST /items` | Sets `universityId`, `campusId`, `universityName`, `campusName` from `req.user` — ignores any values in `req.body` |
| `PUT /items/:id` | Strips protected fields before update; filter includes `user + campusFilter` |
| `DELETE /items/:id` | Filter includes `user + campusFilter` |

The `PROTECTED_ITEM_FIELDS` constant already covers `universityId`, `campusId`, `universityName`, `campusName` — no change needed there.

### 4. Auth Routes — Signup (`authRoutes.js`)

The `resolveUniversityAndCampus` helper already exists and does the right thing: it looks up the university by name (case-insensitive regex), finds the campus sub-document by name, and returns the ObjectIds. The signup handler already stores `university._id` and `campus._id` on the User. No logic changes are needed — this is already correct.

The Zod `signupSchema` uses `college` for the university name field (legacy naming). This is fine — the field is renamed to `universityName` only at the DB layer.

### 5. Seed Data (`data/universities.js` + `utils/seedUniversities.js`)

The seed data file already contains all five target universities with the correct campuses. The seed script already checks `countDocuments()` and skips if non-zero. No changes needed.

Current seed data (already correct):
- PES University: Electronic City Campus, Ring Road Campus, Hanumanth Nagar Campus
- Dayananda Sagar University: Main Campus
- RV College of Engineering: Main Campus
- REVA University: Main Campus
- UVCE: Main Campus

### 6. University Routes (`universityRoutes.js`)

`GET /api/universities` is already a public endpoint (no `authMiddleware`). Returns all universities with embedded campuses sorted by name. No changes needed.

---

## Data Models

### University (existing — no changes)

```js
{
  _id: ObjectId,          // auto-generated
  name: String,           // unique, e.g. "PES University"
  slug: String,           // unique, e.g. "pes-university"
  campuses: [
    {
      _id: ObjectId,      // auto-generated sub-document _id
      name: String,       // e.g. "Electronic City Campus"
    }
  ],
  createdAt: Date,
  updatedAt: Date,
}
```

Design decision: **embedded campuses array** (not a separate Campus collection). Rationale: campuses are always read with their parent university (for signup dropdowns, for name resolution). A separate collection would require an extra join on every signup and every `GET /api/universities` call. The embedded pattern is simpler, and campus sub-documents already have their own `_id` for ObjectId referencing. Adding a new campus is a single `$push` to the university document — no code changes required.

### User (existing — no changes)

```js
{
  _id: ObjectId,
  universityId: ObjectId,   // ref: University._id — ACCESS CONTROL
  campusId: ObjectId,       // ref: University.campuses._id — ACCESS CONTROL
  universityName: String,   // denormalised — DISPLAY ONLY
  campusName: String,       // denormalised — DISPLAY ONLY
  // ... other fields
}
```

### Item (existing — no changes)

```js
{
  _id: ObjectId,
  universityId: ObjectId,   // copied from user at POST time — ACCESS CONTROL
  campusId: ObjectId,       // copied from user at POST time — ACCESS CONTROL
  universityName: String,   // copied from user at POST time — DISPLAY ONLY
  campusName: String,       // copied from user at POST time — DISPLAY ONLY
  // ... other fields
}
```

### Key indexes (existing — no changes needed)

```js
// Item — primary campus-scoped query pattern
{ universityId: 1, campusId: 1, createdAt: -1 }

// User — lookup by university+campus
{ universityId: 1, campusId: 1 }
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: University document structure round-trip

*For any* university name and set of campus names inserted into the database, reading the document back should return a document with the same name, a unique `_id`, and campus sub-documents each with a unique `_id` and the original name.

**Validates: Requirements 1.1, 1.2**

---

### Property 2: Campus fields copied from user to item at write time

*For any* authenticated user posting an item, the stored item's `universityId` and `campusId` must equal the user's `universityId` and `campusId` — regardless of what values (if any) were present in the request body.

**Validates: Requirements 1.3, 1.4, 4.1**

---

### Property 3: Seed idempotence

*For any* non-empty universities collection, running the seed script should leave the collection count unchanged. Equivalently, running the seed twice on an empty collection should produce the same result as running it once.

**Validates: Requirements 2.2, 2.3**

---

### Property 4: Campus-scoped item feed

*For any* authenticated user, `GET /api/items` must return only items where both `item.universityId === user.universityId` AND `item.campusId === user.campusId`. No item from a different campus or university may appear in the response, regardless of query parameters supplied by the client.

**Validates: Requirements 3.1, 3.5, 7.1, 7.2, 7.3**

---

### Property 5: Campus-scoped item by ID returns 404 for cross-campus access

*For any* item belonging to campus A, a user authenticated to campus B who requests that item by its `_id` must receive HTTP 404 — the same response as if the item did not exist.

**Validates: Requirements 3.2, 3.4, 7.4**

---

### Property 6: /mine scoped to user and university

*For any* authenticated user, `GET /api/items/mine` must return only items where `item.user === user._id` AND `item.universityId === user.universityId`. No items belonging to other users may appear.

**Validates: Requirements 3.3**

---

### Property 7: POST ignores spoofed campus fields in request body

*For any* authenticated user who submits a `POST /api/items` request containing arbitrary `universityId` or `campusId` values in the body, the created item's `universityId` and `campusId` must equal the user's actual values from the database — not the values from the request body.

**Validates: Requirements 4.1, 6.1**

---

### Property 8: PUT cannot change campus fields

*For any* item update request that includes `universityId`, `campusId`, `universityName`, or `campusName` in the body, those fields on the stored item must remain unchanged after the update completes.

**Validates: Requirements 4.2**

---

### Property 9: Ownership and university enforced on PUT and DELETE

*For any* user attempting to update or delete an item they do not own, or an item that belongs to a different university, the operation must return HTTP 404 and the item must remain unchanged in the database.

**Validates: Requirements 4.3**

---

### Property 10: enforceCampusIsolation attaches correct campusFilter

*For any* authenticated request, after `enforceCampusIsolation` runs, `req.campusFilter` must equal `{ universityId: req.user.universityId, campusId: req.user.campusId }`. The values must not be sourced from `req.body`, `req.query`, or `req.params`.

**Validates: Requirements 5.1, 5.2**

---

### Property 11: authMiddleware reads universityId/campusId from DB, not JWT

*For any* JWT whose payload contains a `universityId` that differs from the value stored in the database for that user, the system must use the database value for all access control decisions — the JWT payload value must be ignored.

**Validates: Requirements 6.1**

---

### Property 12: Signup resolves names to ObjectIds; invalid names return 400

*For any* valid university name and campus name pair present in the database, signup must store the corresponding ObjectIds on the user document. *For any* university name or campus name not present in the database, signup must return HTTP 400 with a descriptive error message.

**Validates: Requirements 6.2, 6.3**

---

### Property 13: GET /api/universities includes dynamically added universities

*For any* university document inserted directly into the database, `GET /api/universities` must include that university in its response — without any code deployment or server restart.

**Validates: Requirements 8.1, 8.3, 8.4**

---

## Error Handling

| Scenario | HTTP Status | Response body |
|---|---|---|
| Missing or invalid JWT | 401 | `{ message: "Authentication required" }` |
| JWT valid but user not in DB | 401 | `{ message: "User not found" }` |
| Item exists but belongs to different campus | 404 | `{ message: "Item not found" }` |
| PUT/DELETE on item not owned by user | 404 | `{ message: "Item not found" }` |
| Signup with unknown university name | 400 | `{ message: "University not found. Please select from the list." }` |
| Signup with unknown campus name | 400 | `{ message: "Campus not found for this university. Please select from the list." }` |
| Invalid ObjectId in route param | 500 → should be 400 | Mongoose CastError — route handlers should catch and return 400 |
| DB unavailable | 500 | `{ message: "Internal Server Error" }` (production) |

**Note on CastError:** Mongoose throws a `CastError` when an invalid ObjectId string is passed to `findOne({ _id: ... })`. Item routes should catch this and return 404 (treating an invalid ID the same as a not-found item) to avoid leaking implementation details.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- Unit tests cover specific examples, integration points, and error conditions.
- Property-based tests verify universal invariants across randomly generated inputs.

### Property-Based Testing Library

Use **`fast-check`** (npm package) — the standard PBT library for JavaScript/Node.js. It integrates with Node's built-in `node:test` runner (already used in the existing test files) and supports arbitrary generators for ObjectIds, strings, and objects.

Install: `npm install --save-dev fast-check`

Each property test must run a minimum of **100 iterations** (fast-check default is 100; set explicitly with `{ numRuns: 100 }`).

### Tag format

Each property-based test must include a comment:
```
// Feature: multi-university-campus-isolation, Property <N>: <property_text>
```

### Unit Tests (specific examples and edge cases)

- Seed script inserts exactly the 5 target universities on an empty collection (Req 2.1)
- `GET /api/universities` returns 200 with an array for unauthenticated requests (Req 8.3)
- PES EC Campus user sees zero items from PES Ring Road Campus (Req 7.1)
- PES user sees zero items from DSU (Req 7.2)
- DSU user sees zero items from PES (Req 7.3)
- Signup with "Unknown University" returns 400 (Req 6.3)
- Signup with valid university but unknown campus returns 400 (Req 6.3)
- `GET /api/items/:id` with invalid ObjectId returns 404 (error handling)

### Property-Based Tests

Each correctness property maps to exactly one property-based test:

| Test | Property | fast-check arbitraries |
|---|---|---|
| University round-trip | P1 | `fc.string()` for name, `fc.array(fc.string())` for campus names |
| Campus fields copied at write | P2 | `fc.record({ universityId: fcObjectId, campusId: fcObjectId })` for user |
| Seed idempotence | P3 | Run seed twice, assert count unchanged |
| Campus-scoped feed | P4 | Generate N users across M campuses, insert items, verify feed per user |
| Cross-campus 404 | P5 | Generate two users on different campuses, verify 404 on cross-access |
| /mine scoped | P6 | Generate multiple users, verify /mine returns only own items |
| POST ignores spoofed IDs | P7 | Generate random ObjectIds for body, verify stored item uses user's IDs |
| PUT cannot change campus fields | P8 | Generate random campus field values in PUT body, verify unchanged |
| Ownership enforced on PUT/DELETE | P9 | Generate two users, verify user B cannot modify user A's items |
| enforceCampusIsolation filter | P10 | Generate random user with universityId/campusId, verify req.campusFilter |
| authMiddleware uses DB not JWT | P11 | Forge JWT with wrong universityId, verify DB value used |
| Signup name resolution | P12 | Generate valid/invalid university+campus name pairs |
| Dynamic university inclusion | P13 | Insert random university, verify it appears in GET /api/universities |

### Test file location

`server/src/tests/campus-isolation.test.js`

Tests use `supertest` for HTTP-level integration tests against an in-memory MongoDB instance (using `mongodb-memory-server`) so no live database connection is required.
