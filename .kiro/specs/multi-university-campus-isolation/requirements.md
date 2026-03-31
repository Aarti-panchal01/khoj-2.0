# Requirements Document

## Introduction

Khoj is a lost & found web application for university students. This feature introduces strict multi-university, multi-campus data isolation so that users at one campus can only see and interact with lost/found items posted by users at the same campus. The system must support the five target universities (PES University, Dayananda Sagar University, RV College of Engineering, REVA University, UVCE) and be extensible to new universities and campuses via database inserts alone — no code changes required.

The existing codebase already has University and Campus models, universityId/campusId fields on User and Item, and partial isolation logic. This feature hardens and completes that isolation end-to-end.

## Glossary

- **System**: The Khoj backend (Node.js/Express/MongoDB server).
- **University**: A top-level educational institution (e.g., PES University). Stored as a MongoDB document with embedded campus sub-documents.
- **Campus**: A physical location belonging to a University (e.g., Electronic City Campus). Stored as a sub-document with its own `_id`.
- **User**: An authenticated account holder. Always associated with exactly one University and one Campus at registration time.
- **Item**: A lost or found post created by a User. Always tagged with the creating User's universityId and campusId.
- **Campus Isolation**: The guarantee that a User can only read or write Items belonging to their own University AND Campus.
- **enforceCampusIsolation**: A reusable Express middleware that injects the authenticated user's universityId and campusId into MongoDB query filters.
- **Seed Script**: A startup utility that inserts the canonical university/campus data into the database if not already present.
- **JWT**: JSON Web Token used for stateless authentication. universityId and campusId are NEVER trusted from the JWT payload for access control — they are always re-read from the database.

---

## Requirements

### Requirement 1: University and Campus Data Models

**User Story:** As a system administrator, I want universities and campuses to be stored as structured database documents, so that access control decisions are based on authoritative, database-sourced identifiers.

#### Acceptance Criteria

1. THE System SHALL store each University as a MongoDB document with fields: `_id` (ObjectId), `name` (String, unique), and `campuses` (array of sub-documents).
2. THE System SHALL store each Campus as a sub-document of its parent University with fields: `_id` (ObjectId, auto-generated) and `name` (String).
3. THE System SHALL store each User document with a `universityId` field (ObjectId reference to University) and a `campusId` field (ObjectId reference to a campus sub-document `_id`).
4. THE System SHALL store each Item document with a `universityId` field (ObjectId) and a `campusId` field (ObjectId) copied from the creating User at write time.
5. THE System SHALL maintain denormalised `universityName` and `campusName` string fields on User and Item documents for display purposes only — these fields SHALL NOT be used in access control queries.

---

### Requirement 2: Seed Data for Target Universities

**User Story:** As a developer, I want the five target universities and their campuses to be automatically seeded into the database on server startup, so that the system is ready to use without manual database setup.

#### Acceptance Criteria

1. WHEN the server starts and the universities collection is empty, THE Seed Script SHALL insert the following universities and campuses:
   - PES University: Electronic City Campus, Ring Road Campus
   - Dayananda Sagar University: Main Campus
   - RV College of Engineering: Main Campus
   - REVA University: Main Campus
   - UVCE: Main Campus
2. WHEN the server starts and the universities collection already contains documents, THE Seed Script SHALL skip insertion and leave existing data unchanged.
3. THE Seed Script SHALL be driven entirely by a data file (e.g., `data/universities.js`) such that adding a new university requires only appending an entry to that file and restarting the server — no logic changes are required.

---

### Requirement 3: Campus Isolation on Item Reads

**User Story:** As a student, I want to only see lost & found items from my own campus, so that the feed is relevant to me and data from other campuses is never exposed.

#### Acceptance Criteria

1. WHEN an authenticated User requests `GET /api/items`, THE System SHALL return only Items where `item.universityId` equals `user.universityId` AND `item.campusId` equals `user.campusId`.
2. WHEN an authenticated User requests `GET /api/items/:id`, THE System SHALL return the Item only if `item.universityId` equals `user.universityId` AND `item.campusId` equals `user.campusId`.
3. WHEN an authenticated User requests `GET /api/items/mine`, THE System SHALL return only Items where `item.user` equals `user._id` AND `item.universityId` equals `user.universityId`.
4. IF a request for `GET /api/items/:id` matches an Item that exists but belongs to a different university or campus, THEN THE System SHALL return HTTP 404 — the same response as if the Item did not exist.
5. THE System SHALL derive `universityId` and `campusId` for all read filters exclusively from the authenticated user's database record — never from query parameters, request headers, or the JWT payload.

---

### Requirement 4: Campus Isolation on Item Writes

**User Story:** As a student, I want items I post to be automatically tagged to my campus, so that only students at my campus can see them and I cannot spoof a different campus.

#### Acceptance Criteria

1. WHEN an authenticated User submits `POST /api/items`, THE System SHALL set `item.universityId` and `item.campusId` from the authenticated user's database record — ignoring any `universityId` or `campusId` fields present in the request body.
2. WHEN an authenticated User submits `PUT /api/items/:id`, THE System SHALL reject any attempt to change `universityId`, `campusId`, `universityName`, or `campusName` on the Item — these fields SHALL remain unchanged after creation.
3. THE System SHALL enforce that a User can only update or delete Items where `item.user` equals `user._id` AND `item.universityId` equals `user.universityId`.

---

### Requirement 5: enforceCampusIsolation Middleware

**User Story:** As a backend developer, I want a single reusable middleware that enforces campus-scoped query filters, so that all routes apply isolation consistently without duplicating filter logic.

#### Acceptance Criteria

1. THE System SHALL provide an `enforceCampusIsolation` middleware function that attaches `req.campusFilter` — an object containing `{ universityId: req.user.universityId, campusId: req.user.campusId }` — to every authenticated request.
2. WHEN `enforceCampusIsolation` is applied to a route, THE System SHALL source `universityId` and `campusId` exclusively from `req.user` (populated by `authMiddleware` from the database) — never from `req.body`, `req.query`, or `req.params`.
3. THE System SHALL apply `enforceCampusIsolation` to all Item read and write routes.

---

### Requirement 6: Authentication Safety — No Frontend-Supplied Identity

**User Story:** As a security engineer, I want the backend to never accept universityId or campusId from the client, so that users cannot escalate privileges by forging their campus identity.

#### Acceptance Criteria

1. THE System SHALL resolve a User's `universityId` and `campusId` by querying the database using the user `_id` from the verified JWT — never by reading `universityId` or `campusId` from the JWT payload, request body, or query string for access control purposes.
2. WHEN a signup request is received, THE System SHALL resolve the university and campus to ObjectIds by looking up the submitted university name and campus name in the database — the resulting ObjectIds SHALL be stored on the User, not the submitted strings.
3. IF a signup request contains a university name or campus name that does not exist in the database, THEN THE System SHALL return HTTP 400 with a descriptive error message.

---

### Requirement 7: Cross-Campus and Cross-University Access Denial

**User Story:** As a security engineer, I want the system to guarantee that no user can access items from a different campus or university, so that data leakage between institutions is impossible.

#### Acceptance Criteria

1. WHEN a PES University Electronic City Campus user requests items, THE System SHALL return zero items that have `campusId` matching PES University Ring Road Campus.
2. WHEN a PES University user requests items, THE System SHALL return zero items that have `universityId` matching Dayananda Sagar University, RV College of Engineering, REVA University, or UVCE.
3. WHEN a Dayananda Sagar University user requests items, THE System SHALL return zero items that have `universityId` matching PES University.
4. IF a user attempts to access an Item belonging to a different university or campus by guessing its `_id`, THEN THE System SHALL return HTTP 404.
5. THE System SHALL enforce isolation at the database query level — frontend filtering alone SHALL NOT be relied upon to enforce campus isolation.

---

### Requirement 8: Future Scalability — Data-Driven University Configuration

**User Story:** As a product manager, I want to add new universities and campuses without requiring code changes, so that the system can scale to new institutions quickly.

#### Acceptance Criteria

1. THE System SHALL support adding a new University by inserting a new document into the universities collection — no application code changes SHALL be required.
2. THE System SHALL support adding a new Campus to an existing University by updating the university's `campuses` array in the database — no application code changes SHALL be required.
3. THE System SHALL expose `GET /api/universities` as a public endpoint that returns all universities and their campuses, so that signup and login forms can dynamically populate dropdowns from the database.
4. WHEN a new university is added to the database, THE System SHALL automatically include it in the `GET /api/universities` response without any code deployment.
