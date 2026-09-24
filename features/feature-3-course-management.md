# Feature: Semester Management

**Feature ID:** 3
**Branch pattern:** `feature/3-course-management`
**Status:** Draft
**Created:** 2026-09-23
**Input:** signed in admin users CRUD semesters.
**Depends on:** [Feature 1 -- User Auth & Sessions](feature-1-user-auth-session-management.md),
[Feature 2 -- Semester Management](feature-2-semester-management.md)
**Related:** `frontend/src/views/Courses.vue`, `backend/app/routes/users.routes.js`, `backend/app/routes/semesters.routes.js`,
`backend/app/routes/courses.routes.js`

---

## User Stories

### US-3.1: Create courses

**As a** signed-in admin user  
**I want to** create named courses (e.g. "CMSC-4302", "ARTS-3453")  
**So that** I can give students a list of courses to enroll for

**Priority:** P1  
**Independent test:** Open add-course dialog, create a course; it appears in the courses view  
**Acceptance scenarios:** see ### US-3.1 under Acceptance Criteria

### US-3.2: View my courses

**As a** signed-in admin user  
**I want to** see all of my courses on one screen  
**So that** I can see

**Priority:** P1  
**Independent test:** Dashboard loads a single course of owned courses (no sidebar split)  
**Acceptance scenarios:** see ### US-3.2 under Acceptance Criteria

### US-3.3: Manage course rows

**As a** signed-in admin user  
**I want** each course row to show **edit** and **delete** actions  
**So that** I can manage courses without leaving the courses view

**Priority:** P1  
**Independent test:** Each course row exposes edit and delete icon actions, interact to open respective modals
**Acceptance scenarios:** see ### US-3.3 under Acceptance Criteria

### US-3.4: Rename and delete courses

**As a** signed-in admin user  
**I want to** rename or delete a course  
**So that** I can keep my workspace organized

**Priority:** P2  
**Independent test:** Rename and delete an owned course from row actions; courses view updates  
**Acceptance scenarios:** see ### US-3.4 under Acceptance Criteria

### US-2.5: Search Courses

**As a** signed-in admin user  
**I want** to search for courses containing certain key characters
**So that** I can quickly find which course I'm looking for

**Priority:** P2  
**Independent test:**
**Acceptance scenarios:** see ### US-3.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: All course endpoints MUST require a valid session (`authenticate` middleware).
- **FR-002**: course names MUST be trimmed before save; empty strings MUST be rejected.
- **FR-003**: course Id's MUST follow the format `XXXX-####` where `XXXX` is a four-letter course code (`CMSC` for computer science, `ARTS` for an arts class, `BIBL` for a Bible class, `HIST` for history, etc.)
- **FR-004**: course Id's MUST follow the format `XXXX-####` where `####` is a four-digit code for the course (The first digit stands for the difficulty. For example '1' is freshmen level, '2' is sophomore level, '3' is junior level, '4' is senior level, and '5' is graduate level. The second through fourth digits are mainly identifiers for which course is offered.) 
- **FR-005**: This feature MUST deliver course CRUD and a **single-view** courses UI in `Dashboard.vue` (dialog-based add/edit/delete). No sidebar/main split.
- **FR-006**: typing in the on-screen course search bar updates the course list with only courses containing the search bar's content as a substring.
- **FR-007**: signed-out users MUST NOT have access to any `/courses` routes
- **FR-008**: signed-in students MUST NOT have access to any non-`GET` `/courses` routes
- **FR-009**: courses MUST have a corresponding semester (FA, WI, SP, SU for fall, winter, spring, and summer semesters respectively)

---

## Assumptions

- Feature 1 auth and session handling MUST be merged to `dev` before implementing this feature.
- semesters use **dialog-based** workflows (no split sidebar / main panel).

## Edge Cases

- Empty or whitespace-only course name → client block and/or `400`.
- course Id longer than 9 characters → `400`.
- Invalid `courseId` → `400`; unowned course → `404`.
- Unauthenticated dashboard or `GET /courses/semesters` → redirect or `401`.

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: Signed-in admin can create, view, rename, and delete courses on one screen.
- **SC-003**: Signed-in student cannot access this view
- **SC-004**: `npm test` passes for semester API and dashboard courses-view behavior.

---

## Data Ownership & Isolation

Courses are not owned by anybody; however, only administrator-role users are authorized to write/create on `courses`

| Rule                  | Requirement                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Read scope**        | `GET /courses` returns only courses.                                                                                                 |
| **Write scope**       | `PUT` and `DELETE` apply only when the course row matches both `id` and `req.user.id`.                                                         |
| **Create scope**      | New courses owned by nobody.                                                                                                                   |
| **Cross-user access** | If an unauthorized user tries to `PUT`, `DELETE`, or `POST` courses, respond with `403`.                                                       |
| **UI scope**          | The courses view shows only courses returned by `GET /courses` for the signed-in admin.                                            |
| **Implementation**    | Use a shared helper (e.g. `getAccessiblesemesterOrNull(req, courseId)`) in `app/authorization/` — do not duplicate scope logic in controllers. |

---

## API Requirements

| Method   | Endpoint                         | Auth       | Purpose               |
| -------- | -------------------------------- | ---------- | --------------------- |
| `GET`    | `/courses`             | Yes        | Fetch all courses   |
| `GET`    | `/courses/:courseId` | Yes        | Show course details |
| `POST`   | `/courses`             | Yes, admin | Create a new course |
| `PUT`    | `/courses/:courseId` | Yes, admin | Update a course     |
| `DELETE` | `/courses/:courseId` | Yes, admin | Delete a course     |

All endpoints except `GET` require **an administrator-role user** to access/operate. Non-admin user access returns `403`.

**Create course request body:**

```json
{
  "courseId": "CMSC-4321",
  "semester_offered": "FA",
  "name": "Software Engineering 4",
  "description": "Make students suffer through speckits"
  "sections": [
    {"sectionId": "CMSC-4321-01"}
  ]
}
```

**courses success response** (`200` / `201`):

```json
{
  "courseId": "CMSC-4321",
  "semester_offered": "FA",
  "name": "Software Engineering 4",
  "description": "Make students suffer through speckits"
  "sections": [
    {"sectionId": "CMSC-4321-01"}
  ]
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** `404`.
**Invalid Request:** `400`.
**Server/Connection Error:** `500`.

\*Put course request body:\*\*

## Screen Requirements

### [View: Semesters] — route name `courses`

**Single Vue view** (`Courses.vue`) — no sidebar / main-panel split.

**courses view (this feature)**

- Heading: **Courses**
- Primary action: **+ New course** opens a `<v-dialog>` with a name `<v-text-field>` and **Create** / **Cancel**. Use class `oc-cta` on **Create** and **+ New course** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- Display interactive search bar named `Find` above any lists
- Display courses as rows (e.g. `<v-course>` or table): each row shows the **course name** and icon actions:
  - **Edit** icon — opens rename `<v-dialog>` pre-filled with current name; **Save** / **Cancel**
  - **Delete** icon — opens confirmation `<v-dialog>`
- Icon-only row actions use `size="small"` and accessible `aria-label`s (**Edit course**, **Delete course**).
- **Empty state:** **"No courses yet. Create a course."** when no courses exist in the database.
- **Loading state:** skeleton or progress indicator while courses are fetching.
- **Error state:** `<v-alert type="error">` for API failures.

**Implementation note:** one route/view for courses; course CRUD dialogs are child components or inline `<v-dialog>` blocks in `Courses.vue` unless the team splits presentational dialogs later.

**App chrome**

- Existing `MenuBar`. This feature does not add or hide chrome.

---

## Key Entities

- **course**: named item.
- **admin**: authenticated administrator user permitted to access all course routes.
- **student**: authenticated student user permitted to only access `GET` course routes.

---

## Data Model Requirements

### `courses` table

| Field          | Type       | Rules                             |
| -------------- | ---------- | --------------------------------- |
| `courseId`        | STRING PK |     Required; Unique; exactly 9 chars|
| `courseName`      | STRING     | Required  |
| `semesterOffered` |	ENUM	| Required; `FA`, `WI`, `SP`, `SU` |
| `offeringFrequency` |	ENUM	| Required; `none`, `everyYear`, `oddYears`, `evenYears` |
| `description`       | 	TEXT	| Optional |
| `createdAt`         | 	DATE	| Sequelize timestamps |
| `updatedAt`         |	DATE | 	Sequelize timestamps |
---

## Acceptance Criteria (Gherkin)

### US-3.1 — Create courses

#### Scenario: Admin creates a new course

- **Given** I am signed in as an admin on the course view
- **When** I click **+ New course**
- **And** I enter course Id `CMSC-4324`
- **And** I enter description `XXXXXX`
- **And** I enter course name `SE4`
- **And** I add a semester `FA`
- **And** I confirm the dialog
- **Then** the API returns `201` with a course object containing `courseId`, `courseName`, `description` and `semesters`
- **And** `CMSC-4324` appears in the courses view
- **And** the add-course dialog closes

#### Scenario: Admin creates a course with an empty name

- **Given** I am signed in as an admin on the course view
- **When** I open the new course dialog
- **And** I leave the name field empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"course name is required."**
- **And** no API request is sent

#### Scenario: Admin creates a course with an empty description

- **Given** I am signed in as an admin on the course view
- **When** I open the new course dialog
- **And** I leave the description field empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"description is required."**
- **And** no API request is sent

#### Scenario: Admin creates a course without semester

- **Given** I am signed in as an admin on the course view
- **When** I open the new course dialog
- **And** I leave the semester empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"semester is required."**
- **And** no API request is sent

#### Scenario: Admin creates a course with a name that is too long

- **Given** I am signed in as an admin on the course view
- **When** I submit a course id longer than 9 characters
- **Then** the API returns `400` with `{ "message": "course name must be 9 characters." }`
- **And** the error is displayed in a `<v-alert type="error">`

#### Scenario: Admin creates a course with an id that is improperly formatted

- **Given** I am signed in as an admin on the course view
- **When** I submit a course name that does not follow the XXXX-#### convention (XXXX being a 4-letter department title) and #### being 4 integers
- **Then** the API returns `400` with `{ "message": "course name must be of the form XXXX-#### (e.g. CMSC-4321)." }`
- **And** the error is displayed in a `<v-alert type="error">`

---

### US-3.2 — View all courses

#### Scenario: Course view loads with existing semesters

- **Given** I am signed in as an admin
- **And** the courses `CMSC-4321` and `ARTS-3214` exist
- **When** I navigate to the courses view
- **Then** both courses appear in the courses view
- **And** each row shows the course name with edit and delete icon actions

#### Scenario: No courses exist

- **Given** I am signed in as an admin
- **And** no courses exist
- **When** I navigate to the course view
- **Then** I see **"No courses yet. Create a course."**

---

### US-3.3 — Manage course rows

#### Scenario: course rows show edit and delete actions

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I view the courses view
- **Then** the `CMSC-4321` row shows an **Edit course** icon action
- **And** the `CMSC-4321` row shows a **Delete course** icon action

---

### US-3.4 — Edit and delete courses

#### Scenario: Admin edits a course

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I click the edit icon on the `CMSC-4321` row
- **And** I change the name to `ARTS-4321` in the rename dialog
- **And** I confirm
- **Then** the API returns `200` with the updated semester object
- **And** the courses view shows `ARTS-4321` instead of `CMSC-4321`

#### Scenario: Admin deletes a course

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I click the delete icon on the `CMSC-4321` row
- **And** I confirm the delete dialog
- **Then** the API returns `204`
- **And** the course is removed from the courses view

---

### US-3.5 — Search courses

#### Scenario: Search bar appears with courses

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I view the courses view
- **Then** I see a search bar named `Find` above the courses list
  returns

#### Scenario: No search bar appears with no courses

- **Given** I am signed in as an admin
- **And** the course `CMSC-4321` exists
- **When** I view the courses view
- **Then** I see **"No courses yet. Create a course."**
- **And** I see no search bars in the view

#### Scenario: Admin types in course search bar

- **Given** I am signed in as an admin
- **And** I am viewing the courses view
- **And** the courses `CMSC-4321`, `ARTS-3214`, `BIBL-3421`, and `CMSC-1324` exist
- **When** I type `CMSC` in the `Find` search bar
- **Then** the course list updates to contain only the courses `CMSC-4321` and `CMSC-1324`

#### Scenario: Admin types in course search bar 2

- **Given** I am signed in as an admin
- **And** I am viewing the courses view
- **And** the courses `CMSC-4321`, `ARTS-3214`, `BIBL-4321`, and `CMSC-1324` exist
- **When** I type `4321` in the `Find` search bar
- **Then** the course list updates to contain only the courses `CMSC-4321` and `BIBL-4321`

#### Scenario: Unauthenticated user accesses the courses view

- **Given** I have no session in `localStorage`
- **When** I navigate to the courses view
- **Then** I am redirected to the login page

#### Scenario: Unauthenticated API request to courses

- **Given** I have no valid session token
- **When** I request `GET /courses`
- **Then** the API returns `401` with an unauthorized message

---

## Test Coverage Map

| Story  | Scenario                                                                            | Test file                                                            | Test name                                                                             |
| ------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| US-3.1 | Admin creates a new course                                                        | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `Admin creates a new course`                                                        |
| US-3.1 | Admin creates a course with an empty name                                         | `frontend/tests/Courses.test.js`                                    | `Admin creates a course with an empty name`                                         |
| US-3.1 | Admin creates a course with an empty id                                   | `frontend/tests/Courses.test.js`                                    | `Admin creates a course with an empty id`                                   |
| US-3.1 | Admin creates a course with an empty description                                     | `frontend/tests/Courses.test.js`                                    | `Admin creates a course with an empty description`                                     |
| US-3.1 | Admin creates a course with an id that is too long                               | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `Admin creates a course with an id that is too long`                               |
| US-3.1 | Admin creates a course with an id that is improperly formatted                   | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `Admin creates a semester with a name that is improperly formatted`                   |
| US-3.2 | Courses view loads with existing courses                                             | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `Courses view loads with existing courses`                                             |
| US-3.2 | No courses exist                                                                  | `frontend/tests/Courses.test.js`                                    | `No courses exist`                                                                  |
| US-3.3 | course rows show edit and delete actions                                          | `frontend/tests/Courses.test.js`                                    | `course rows show edit and delete actions`                                          |
| US-3.4 | Admin edits a course                                                              | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `Admin edits a course`                                                              |
| US-3.4 | Admin deletes a course                                                            | `backend/tests/courses.test.js`, `frontend/tests/Courses.test.js` | `Admin deletes a course`                                                            |
| US-3.5 | Search bar appears with courses                                                   | `frontend/tests/Courses.test.js`                                    | `Search bar appears with courses`                                                   |
| US-3.5 | No search bar appears with no courses                                             | `frontend/tests/Courses.test.js`                                    | `No search bar appears with no courses`                                             |
| US-3.5 | Admin types in course search bar                                                  | `frontend/tests/Courses.test.js`                                    | `Admin types in course search bar`                                                  |
| US-3.5 | Admin types in course search bar 2                                                | `frontend/tests/Courses.test.js`                                    | `Admin types in course search bar 2`                                                |
| US-3.5 | Unauthenticated user accesses the courses view                                         | `frontend/tests/Courses.test.js`                                    | `Unauthenticated user accesses the courses view`                                         |
| US-3.5 | Unauthenticated API request to semesters                                            | `backend/tests/courses.test.js`                                    | `Unauthenticated API request to courses`                                            |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 3 from @features/feature-3-course-management.md on branch `feature/3-course-management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checksemester in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/data-model.md`, `features/reference/api.md`, `features/reference/behavior.md`

---

## Definition of Done

- [ ] Backend and frontend implemented per this spec (**FR-00N** satisfied)
- [ ] **Success Criteria (SC-00N)** met
- [ ] All mapped tests pass (`npm test`)
- [ ] Test Coverage Map complete
- [ ] `features/reference/data-model.md` updated (if schema changed)
- [ ] `features/reference/api.md` updated (if API changed)
- [ ] `features/reference/behavior.md` updated (if product rules changed)

---

## Out of Scope

- Faculty items (see `features/feature-4-faculty-management.md`)
- `MenuBar` beyond basic sign-out (full nav deferred if not needed)
- Drag-and-drop semester reordering
- Sharing courses with other users
- `POST`/`GET`/`PUT`/`DELETE` anywhere that's not `/courses/courses` or `/courses/:courseId`

---

## Delivered to Feature 5

The following are intentionally deferred to the next feature spec:

- `courses` table and associations
- `sections` table and associations

## Delivered to Feature 7

The following are intentionally deferred to the next feature spec:

- `courses` table and associations