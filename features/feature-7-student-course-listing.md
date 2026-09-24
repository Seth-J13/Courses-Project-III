# Feature: Todo List Management

**Feature ID:** 7
**Branch pattern:** `feature/7-student-course-listing`
**Status:** Draft
**Created:** 2026-09-24
**Input:** Signed-in users view the courses they are signed up for
**Depends on:** [Feature 3 — Course Management](NEED TO ADD .md FILE)

---

## User Stories

### US-7.1: View my courses
**As a** signed-in user  
**I want to** see all of my courses lists on one screen  
**So that** I can see what courses I have signed up for

**Priority:** P1  
**Independent test:** Dashboard loads a single list of owned courses (no sidebar split)  
**Acceptance scenarios:** see ### US-7.1 under Acceptance Criteria

### US-7.2: Manage course rows
**As a** signed-in user  
**I want** each list row to show and have a **delete** action  
**So that** I can manage courses without leaving the course view 

**Priority:** P1  
**Independent test:** Each course row exposes delete icon action  
**Acceptance scenarios:** see ### US-7.2 under Acceptance Criteria

### US-7.3: Private course list only
**As a** signed-in user  
**I want** my courses are visible only to me and an admin
**So that** other users cannot read the courses I have signed up for

**Priority:** P1  
**Independent test:** Cross-user course access returns `404`; `GET /courses/` never returns another user's rows  
**Acceptance scenarios:** see ### US-7.3 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: All course endpoints MUST require a valid session (`authenticate` middleware).
- **FR-002**: Every database read, update, and delete MUST include `universityId: req.universityId` in the `where` clause.
- **FR-003**: Courses MUST be ordered alphabetically by name in API responses.
- **FR-004**: This feature MUST deliver course read and delete and a **single-view** course lists UI in `Dashboard.vue`. No sidebar/main split. 
- **FR-005**: This feature MUST update course availability and remove user from that course

---

## Assumptions

- Feature 1 auth and session handling MUST be merged to `dev` before implementing this feature.
- Feature 3 Course Management MUST be completed and merged to `dev` before implementing this feature.
- `MenuBar` is introduced in this feature with basic sign-out (profile dropdown).

## Edge Cases

- Invalid `universityId` → `401`; unowned course → `404`.
- Unauthenticated dashboard or `GET /course/:courseId` → redirect or `401`.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: Signed-in user can view and delete courses on one screen without seeing another user's data.
- **SC-003**: `npm test` passes for list API and dashboard lists-view behavior.

---

## Data Ownership & Isolation

Each user owns their lists exclusively. Another authenticated user must not be able to view, rename, or delete them.

| Rule | Requirement |
|------|-------------|
| **Read scope** | `GET /courses/` returns only courses where `universityId = req.universityId`. |
| **Write scope** | `DELETE` applies only when the course row matches both `universityId` and `req.universityId`. |
| **Cross-user access** | If a user does not belong to a returned course, respond with `404` — never `403` (do not confirm the list exists). |
| **UI scope** | The course view shows only courses returned by `GET /courses/` for the signed-in user. |
| **Implementation** | Use a shared helper (e.g. `getAccessibleListOrNull(req, courseId)`) in `app/authorization/` — do not duplicate scope logic in controllers. |

---

## API Requirements

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `GET` | `/courses/` | Yes | Fetch all lists for the authenticated user |
| `DELETE` | `/courses/:courseId` | Yes | Delete a course user is signed up for and update courses to remove user from that course |

All endpoints return **only data owned by the authenticated user**. Cross-user access attempts return `404`.

**Create section request body:**
```json
{ "courseId": "CMCS-3033", "semesterOffered": "FA", "name":"SE4", "description":"software engineering class", "sections": {"section":"01", "section":"02"} }
```

**List success response** (`200` / `201`):
```json
{ "courseId": "CMCS-3033",
 "semesterOffered": "FA",
  "name":"SE4",
   "description":"software engineering class", 
   "sections": {"section":"01", "section":"02"} }
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found / not owned:** `404` (do not use `403`).

---

## Screen Requirements

### [View: Application Dashboard] — route name `View Courses`
Replaces the Feature 1 placeholder home page. **Single Vue view** (`Dashboard.vue`) — no sidebar / main-panel split.

**Lists view (this feature)**
*   Heading: **My Courses**
*   Display owned courses as rows (e.g. `<v-list>` or table): each row shows the **course name**, **semesterOffered**, **name**, **description**, **sections** and icon action:
    *   **Delete** icon — opens confirmation `<v-dialog>`
*   Icon-only row actions use `size="small"` and accessible `aria-label`s (**Edit list**, **Delete list**).
*   **Empty state:** **"No courses yet. Sign up to view your courses."** when the user has zero lists.
*   **Loading state:** skeleton or progress indicator while lists are fetching.
*   **Error state:** `<v-alert type="error">` for API failures.

**App chrome**
*   Introduce `MenuBar` in this feature (not present in Feature 1): signed-in user's name and **Sign out**.
*   `MenuBar` is hidden on login and register routes.

**Implementation note:** one route/view for lists; list CRUD dialogs are child components or inline `<v-dialog>` blocks in `Dashboard.vue` unless the team splits presentational dialogs later.

---

## Key Entities

- **List**: named group belonging to one user; will contain todos (Feature 3).
- **User**: owns many lists (from Feature 1).

---

## Data Model Requirements

### `courses` table
| Field | Type | Rules |
|-------|------|-------|
| `courseId` | STRING PK | UNIQUE |
| `semesterOffered` | STRING | Required; max 2 chars |
| `name` | STRING | Required; |
| `description` | STRING | Required; |
| `sections` | list of Section | Accepts a list of elements of type Section |


### Associations (in `models/index.js`)
*   `section belongsTo course`
---

## Acceptance Criteria (Gherkin)

### US-7.1 — View my sections

#### Scenario: Dashboard loads with listed sections
*   **Given** I am signed in
*   **And** I signed up for courses `CMCS-3033` and `CMCS-2123`
*   **When** I navigate to the dashboard
*   **Then** both courses appear in the course list view
*   **And** each row shows the course name, course id, semester offered, course description, a list of sections, and a delete icon actions

#### Scenario: User has no courses
*   **Given** I am signed in
*   **And** I have not signed up for any courses
*   **When** I navigate to the dashboard
*   **Then** I see **"No courses yet. Sign up to view your courses."**

#### Scenario: User cannot see other users signed up for courses
*   **Given** user B owns signed up for `CMCS-3033`
*   **And** I am signed in as user A
*   **When** I request `GET /courses/:universityId`
*   **Then** the response contains only courses user A is related to

---

### US-7.2 — Manage course rows

#### Scenario: Section rows show edit and delete actions
*   **Given** I am signed in
*   **And** I signed up for `CMCS-3033`
*   **When** I view the dashboard course view
*   **Then** the `CMCS-3033` row shows a **Delete list** icon action

---

### US-7.3 — Private section list only

#### Scenario: User attempts to delete another user's list
*   **Given** I am signed in as user A
*   **And** a list exists that belongs to user B
*   **When** I send `DELETE /course/:universityId` with user B's ID
*   **Then** the API returns `404` with `{ "message": "List with id=<id> not found." }`
*   **And** user B's list still exists

#### Scenario: Unauthenticated user accesses the dashboard
*   **Given** I have no session in `localStorage`
*   **When** I navigate to the dashboard
*   **Then** I am redirected to the login page

#### Scenario: Unauthenticated API request to lists
*   **Given** I have no valid session token
*   **When** I request `GET /courses/`
*   **Then** the API returns `401` with an unauthorized message

---

## Test Coverage Map

Each scenario above must map to at least one automated test.

| Story | Scenario | Test file | Test name |
|-------|----------|-----------|-----------|
| US-7.1 | Dashboard loads with listed courses | `frontend/tests/student-course-listing.test.js` | Dashboard loads with listed sections |
| US-7.1 | User has no courses | `frontend/tests/student-course-listing.test.js` | User has no courses |
| US-7.1 | User cannot see other users signed up for courses | `backend/tests/student-course-listing.test.js` | User cannot see other users signed up for courses |
| US-7.2 | Couse rows show edit and delete actions | `frontend/tests/student-course-listing.test.js` | Section rows show edit and delete actions |
| US-7.3 | User attempts to delete another user's list | `backend/tests/student-course-listing.test.js` | User attempts to delete another user's list |
| US-7.3 | Unauthenticated user accesses the dashboard | `frontend/tests/student-course-listing.test.js` | Unauthenticated user accesses the dashboard |
| US-7.3 | Unauthenticated API request to lists | `backend/tests/student-course-listing.test.js` | Unauthenticated API request to lists |