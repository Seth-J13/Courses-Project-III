# Feature: Semester Management

**Feature ID:** 2
**Branch pattern:** `feature/2-semester-management`
**Status:** Draft
**Created:** 2026-09-21
**Input:** signed in admin users CRUD semesters.
**Depends on:** [Feature 1 -- User Auth & Sessions](feature-1-user-auth-session-management.md)
**Related:** `frontend/src/views/Semesters.vue`, `backend/app/routes/users.routes.js`, `backend/app/routes/semesters.routes.js`

---

## User Stories

### US-2.1: Create semesters

**As a** signed-in admin user  
**I want to** create named semesters (e.g. "SP2024", "FA2027")  
**So that** I can give students a list of semesters to enroll for

**Priority:** P1  
**Independent test:** Open add-semester dialog, create a semester; it appears in the semesters view  
**Acceptance scenarios:** see ### US-2.1 under Acceptance Criteria

### US-2.2: View all semesters

**As a** signed-in admin user  
**I want to** see all the semesters on one screen  
**So that** I have all the semesters in one place

**Priority:** P1  
**Independent test:** Semesters view loads a single list of semesters (no sidebar split)  
**Acceptance scenarios:** see ### US-2.2 under Acceptance Criteria

### US-2.3: Manage semester rows

**As a** signed-in admin user  
**I want** each semester row to show **edit** and **delete** actions  
**So that** I can manage semesters without leaving the semesters view

**Priority:** P1  
**Independent test:** Each semester row exposes edit and delete icon actions, interact to open respective modals
**Acceptance scenarios:** see ### US-2.3 under Acceptance Criteria

### US-2.4: Rename and delete semesters

**As a** signed-in admin user  
**I want to** rename or delete a semester  
**So that** I can keep the semesters list organized

**Priority:** P2  
**Independent test:** Rename and delete a semester from row actions; semesters view updates  
**Acceptance scenarios:** see ### US-2.4 under Acceptance Criteria

### US-2.5: Search Semesters

**As a** signed-in admin user  
**I want** to search for semesters containing certain key characters
**So that** I can quickly find which semester I'm looking for

**Priority:** P2  
**Independent test:** Typing in search bar filters semesters based on search bar content
**Acceptance scenarios:** see ### US-2.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: All semester endpoints MUST require a valid session (`authenticate` middleware).
- **FR-002**: semester names **MUST** be trimmed before save; empty strings MUST be rejected.
- **FR-003**: semester names **MUST** follow the format `AAYYYY` where `AA` is a two-letter season code (`FA` for autumn, `WI` for winter, `SP` for spring, `SU` for summer) and `YYYY` is a four-digit year
- **FR-004**: semesters **MUST** be listed in chronological order, first by year and then by season.
- **FR-005**: This feature **MUST** deliver semester CRUD and a **single-view** semesters UI in `Semesters.vue` (dialog-based add/edit/delete). No sidebar/main split.
- **FR-006**: typing in the on-screen semester search bar updates the semester list with only semesters containing the search bar's content as a substring.
- **FR-007**: signed-out users **MUST NOT** have access to any `/courses/semesters` routes
- **FR-008**: signed-in students **MUST NOT** have access to any non-`GET` `/courses/semesters` routes (`POST`/`PUT`/`DELETE` → `403`)
- **FR-009**: signed-in students **MUST** be allowed to call `GET /courses/semesters` and `GET /courses/semesters/:semesterId` (valid session required)
- **FR-010**: signed-in students **MUST NOT** access the admin management UI `Semesters.vue` (route guard redirects them away; API `GET` remains allowed)

---

## Assumptions

- Feature 1 auth and session handling MUST be merged to `dev` before implementing this feature.
- semesters use **dialog-based** workflows (no split sidebar / main panel).

## Edge Cases

- Empty or whitespace-only semester name → client block and/or `400`.
- semester name longer than 6 characters → `400`.
- Invalid `semesterId` → `404`.
- Unauthenticated semester view or `GET /courses/semesters` → redirect or `401`.
- Student `POST`/`PUT`/`DELETE` → `403`.
- Student `GET /courses/semesters` or `GET /courses/semesters/:semesterId` → `200` (when authorized and resource exists).
- Student navigates to `Semesters.vue` → redirected away from the management view (not treated as logged out).

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: Signed-in admin can create, view, rename, and delete semesters on one screen.
- **SC-003**: Signed-in student cannot access `Semesters.vue`, but can `GET` semester list and semester-by-id APIs.
- **SC-004**: `npm test` passes for semester API and semesters-view behavior.

---

## Data Ownership & Isolation

Semesters are not owned by anybody. Any authenticated user (admin or student) may **read** the shared semester catalog via `GET`. Only administrator-role users may **create/update/delete** semesters or open `Semesters.vue`.

| Rule                 | Requirement                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**       | `GET /courses/semesters` and `GET /courses/semesters/:semesterId` return the shared catalog for any authenticated user (admin or student).   |
| **Write scope**      | `POST`/`PUT`/`DELETE` apply only when the signed-in user is authenticated as an admin.                                                       |
| **Create scope**     | New semesters owned by nobody.                                                                                                               |
| **Non-admin access** | Student (or other non-admin) `POST`/`PUT`/`DELETE` → `403`. Student `GET` is allowed.                                                        |
| **UI scope**         | `Semesters.vue` is **admin-only**. It shows semesters from `GET /courses/semesters`. Students must not reach this view (router/role guard).  |
| **Implementation**   | `authenticate` on all semester routes; **admin** role guard on `POST`/`PUT`/`DELETE` and on the `Semesters.vue` route; load by `semesterId`. |

---

## API Requirements

| Method   | Endpoint                         | Auth                | Purpose               |
| -------- | -------------------------------- | ------------------- | --------------------- |
| `GET`    | `/courses/semesters`             | Yes (admin/student) | Fetch all semesters   |
| `GET`    | `/courses/semesters/:semesterId` | Yes (admin/student) | Show semester details |
| `POST`   | `/courses/semesters`             | Yes, admin          | Create a new semester |
| `PUT`    | `/courses/semesters/:semesterId` | Yes, admin          | Update a semester     |
| `DELETE` | `/courses/semesters/:semesterId` | Yes, admin          | Delete a semester     |

Non-admin user access to `POST`/`PUT`/`DELETE` returns `403`. Authenticated students may `GET`. Unauthenticated requests return `401`.

**Create semester request body:**

```json
{
  "semesterName": "FA2026",
  "startDate": "2026-08-16",
  "endDate": "2026-12-06"
}
```

**semester success response** (`200` / `201`):

```json
{
  "semesterId": 105,
  "semesterName": "FA2026",
  "startDate": "2026-08-16",
  "endDate": "2026-12-06",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** `404`.
**Invalid Request:** `400`.
**Server/Connection Error:** `500`.

**Put semester request body:**

```json
{
  "semesterId": 105,
  "semesterName": "SP2026",
  "startDate": "2026-08-16",
  "endDate": "2027-04-28"
}
```

**semester success response** (`200` / `201`):

```json
{
  "semesterId": 105,
  "semesterName": "SP2026",
  "startDate": "2026-08-16",
  "endDate": "2027-04-28",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2027-01-08T12:28:16.148Z"
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** `404`.
**Invalid Request:** `400`.
**Server/Connection Error:** `500`.

**Delete semester success response** (`204`).

---

## Screen Requirements

### [View: Semesters] — route name `semesters`

**Single Vue view** (`Semesters.vue`) — no sidebar / main-panel split.

**Semesters view (this feature)**

- Heading: **Semesters**
- Primary action: **+ New semester** opens a `<v-dialog>` with a name `<v-text-field>`, a start date `<v-date-picker>`, an end date `<v-date-picker>`, and **Create** / **Cancel** buttons. Use class `oc-cta` on **Create** and **+ New semester** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- Display interactive search bar named `Find` above any lists if present (hide if no semesters exist)
- Display semesters as rows (e.g. `<v-semester>` or table): each row shows the **semester name** and icon actions:
  - **Edit** icon — opens Edit `<v-dialog>` pre-filled with current name, start date, and end date; **Save** / **Cancel**
  - **Delete** icon — opens confirmation `<v-dialog>`
- Icon-only row actions use `size="small"` and accessible `aria-label`s (**Edit semester**, **Delete semester**).
- **Empty state:** **"No semesters yet. Create a semester."** when no semesters exist in the database.
- **Loading state:** skeleton or progress indicator while semesters are fetching.
- **Error state:** `<v-alert type="error">` for API failures.

**Implementation note:** one route/view for semesters; semester CRUD dialogs are child components or inline `<v-dialog>` blocks in `Semesters.vue` unless the team splits presentational dialogs later.

**App chrome**

- Existing `MenuBar`. This feature does not add or hide chrome.

---

## Key Entities

- **semester**: named item.
- **admin**: authenticated administrator user permitted to access all semester API routes and `Semesters.vue`.
- **student**: authenticated student user permitted to `GET` semester APIs only; forbidden from `POST`/`PUT`/`DELETE` and from `Semesters.vue`.

---

## Data Model Requirements

### `semesters` table

| Field          | Type       | Rules                             |
| -------------- | ---------- | --------------------------------- |
| `semesterId`   | INTEGER PK | Auto-increment                    |
| `semesterName` | STRING     | Required; Unique; exactly 6 chars |
| `startDate`    | DATE       | Required                          |
| `endDate`      | DATE       | Required;                         |
| `createdAt`    | DATE       | Sequelize timestamps              |
| `updatedAt`    | DATE       | Sequelize timestamps              |

---

## Acceptance Criteria (Gherkin)

### US-2.1 — Create semesters

#### Scenario: Admin creates a new semester

- **Given** I am signed in as an admin on the semester view
- **When** I click **+ New semester**
- **And** I enter semester name `SP2026`
- **And** I enter start date `2026-08-18`
- **And** I enter end date `2026-12-06`
- **And** I confirm the dialog
- **Then** the API returns `201` with a semester object containing `semesterId`, `semesterName`, `startDate` and `endDate`
- **And** `SP2026` appears in the semesters view
- **And** the add-semester dialog closes

#### Scenario: Admin creates a semester with an empty name

- **Given** I am signed in as an admin on the semester view
- **When** I open the new semester dialog
- **And** I leave the name field empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"semester name is required."**
- **And** no API request is sent

#### Scenario: Admin creates a semester with an empty start date

- **Given** I am signed in as an admin on the semester view
- **When** I open the new semester dialog
- **And** I leave the start date field empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"start date is required."**
- **And** no API request is sent

#### Scenario: Admin creates a semester with an empty end date

- **Given** I am signed in as an admin on the semester view
- **When** I open the new semester dialog
- **And** I leave the end date field empty or whitespace only
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"end date is required."**
- **And** no API request is sent

#### Scenario: Admin creates a semester with a name that is too long

- **Given** I am signed in as an admin on the semester view
- **When** I submit a semester name longer than 6 characters
- **Then** the API returns `400` with `{ "message": "semester name must be exactly 6 characters." }`
- **And** the error is displayed in a `<v-alert type="error">`

#### Scenario: Admin creates a semester with a name that is improperly formatted

- **Given** I am signed in as an admin on the semester view
- **When** I submit a semester name that does not follow the AAYYYY convention (AA being `FA`, `WI`, `SP`, or `SU`) and YYYY being 4 integers
- **Then** the API returns `400` with `{ "message": "semester name must be of the form AAYYYY (e.g. SP2026)." }`
- **And** the error is displayed in a `<v-alert type="error">`

#### Scenario: Admin creates a semester with a start date or end date that is improperly formatted

- **Given** I am signed in as an admin on the semester view
- **When** I submit a start date or end date that does not follow the YYYY-MM-DD convention
- **Then** the API returns `400` with `{ "message": "dates must be of the form YYYY-MM-DD." }`
- **And** the error is displayed in a `<v-alert type="error">`

#### Scenario: Student tries creating a semester

- **Given** I am signed in student user
- **When** I submit a `POST` request with any kind of message body
- **Then** the API returns `403` with `{ "message": "Forbidden Request" }`

#### Scenario: Visitor tries creating a semester

- **Given** I am signed-out user
- **When** I submit a `POST` request with any kind of message body
- **Then** the API returns `401` with `{ "message": "Unauthorized" }`

---

### US-2.2 — View all semesters

#### Scenario: Semesters view loads with existing semesters

- **Given** I am signed in as an admin
- **And** the semesters `FA2026`, `SP2026`, `FA2027`, `WI2027`, and `SU2027` exist
- **When** I navigate to the semesters view
- **Then** both semesters appear in the semesters view
- **And** each row shows the semester name with edit and delete icon actions
- **And** the semesters are sorted in this order, top to bottom: `WI2027`, `FA2027`, `SU2027`, `FA2026`, `SP2026`

#### Scenario: No semesters exist

- **Given** I am signed in as an admin
- **And** no semesters exist
- **When** I navigate to the semester view
- **Then** I see **"No semesters yet. Create a semester."**

#### Scenario: Student can GET the semesters list

- **Given** I am a signed-in student user
- **And** the semesters `SP2026` and `FA2027` exist
- **When** I request `GET /courses/semesters`
- **Then** the API returns `200` with both semesters in the response

#### Scenario: Student can GET a semester by id

- **Given** I am a signed-in student user
- **And** the semester `SP2026` exists with `semesterId` `105`
- **When** I request `GET /courses/semesters/105`
- **Then** the API returns `200` with the semester object for `SP2026`

#### Scenario: Student user accesses the semester view

- **Given** I am a signed-in student user
- **When** I navigate to the semesters view (`Semesters.vue`)
- **Then** I am redirected away from `Semesters.vue` (I do not see the admin semesters management UI)
- **And** I remain signed in

#### Scenario: Unauthenticated API request to semesters

- **Given** I have no valid session token
- **When** I request `GET /courses/semesters`
- **Then** the API returns `401` with `{ "message": "Unauthorized" }`

#### Scenario: Unauthenticated user accesses the semester view

- **Given** I have no valid session token
- **When** I navigate to the semesters view
- **Then** I am redirected to the login page

---

### US-2.3 — Manage semester rows

#### Scenario: semester rows show edit and delete actions

- **Given** I am signed in as an admin
- **And** the semester `SP2026` exists
- **When** I view the semesters view
- **Then** the `SP2026` row shows an **Edit semester** icon action
- **And** the `SP2026` row shows a **Delete semester** icon action

---

### US-2.4 — Edit and delete semesters

#### Scenario: Admin edits a semester

- **Given** I am signed in as an admin
- **And** the semester `SP2026` exists
- **When** I click the edit icon on the `SP2026` row
- **And** I change the name to `FA2027` in the edit dialog
- **And** I change the end date to `2027-04-28`
- **And** I confirm
- **Then** the API returns `200` with the updated semester object
- **And** the semesters view shows `FA2027` instead of `SP2026`

#### Scenario: Admin deletes a semester

- **Given** I am signed in as an admin
- **And** the semester `SP2026` exists
- **When** I click the delete icon on the `SP2026` row
- **And** I confirm the delete dialog
- **Then** the API returns `204`
- **And** the semester is removed from the semesters view

#### Scenario: Student tries editing or deleting semesters

- **Given** I am signed in student user
- **When** I submit a `PUT` or `DELETE` request with any kind of message body
- **Then** the API returns `403` with `{ "message": "Forbidden Request" }`

#### Scenario: Visitor tries editing or deleting semesters

- **Given** I am signed-out user
- **When** I submit a `PUT` or `DELETE` request with any kind of message body
- **Then** the API returns `401` with `{ "message": "Unauthorized" }`

---

### US-2.5 — Search Semesters

#### Scenario: Search bar appears with semesters

- **Given** I am signed in as an admin
- **And** the semester `SP2026` exists
- **When** I view the semesters view
- **Then** I see a search bar named `Find` above the semesters list

#### Scenario: No search bar appears with no semesters

- **Given** I am signed in as an admin
- **And** no semesters exist
- **When** I view the semesters view
- **Then** I see **"No semesters yet. Create a semester."**
- **And** I see no search bars in the view

#### Scenario: Admin types in semester search bar

- **Given** I am signed in as an admin
- **And** I am viewing the semesters view
- **And** the semesters `SP2026`, `FA2026`, `SP2027`, and `FA2027` exist
- **When** I type `SP20` in the `Find` search bar
- **Then** the semester list updates to contain only the semesters `SP2026` and `SP2027`

#### Scenario: Admin types in semester search bar 2

- **Given** I am signed in as an admin
- **And** I am viewing the semesters view
- **And** the semesters `SP2026`, `FA2026`, `SP2027`, and `FA2027` exist
- **When** I type `2027` in the `Find` search bar
- **Then** the semester list updates to contain only the semesters `SP2027` and `FA2027`

---

## Test Coverage Map

| Story  | Scenario                                                                            | Test file                                                            | Test name                                                                             |
| ------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| US-2.1 | Admin creates a new semester                                                        | `backend/tests/semesters.test.js`, `frontend/tests/Semester.test.js` | `Admin creates a new semester`                                                        |
| US-2.1 | Admin creates a semester with an empty name                                         | `frontend/tests/Semester.test.js`                                    | `Admin creates a semester with an empty name`                                         |
| US-2.1 | Admin creates a semester with an empty start date                                   | `frontend/tests/Semester.test.js`                                    | `Admin creates a semester with an empty start date`                                   |
| US-2.1 | Admin creates a semester with an empty end date                                     | `frontend/tests/Semester.test.js`                                    | `Admin creates a semester with an empty end date`                                     |
| US-2.1 | Admin creates a semester with a name that is too long                               | `backend/tests/semesters.test.js`, `frontend/tests/Semester.test.js` | `Admin creates a semester with a name that is too long`                               |
| US-2.1 | Admin creates a semester with a name that is improperly formatted                   | `backend/tests/semesters.test.js`, `frontend/tests/Semester.test.js` | `Admin creates a semester with a name that is improperly formatted`                   |
| US-2.1 | Admin creates a semester with a start date or end date that is improperly formatted | `backend/tests/semesters.test.js`, `frontend/tests/Semester.test.js` | `Admin creates a semester with a start date or end date that is improperly formatted` |
| US-2.1 | Student tries creating a semester                                                   | `backend/tests/semesters.test.js`                                    | `Student tries creating a semester`                                                   |
| US-2.1 | Visitor tries creating a semester                                                   | `backend/tests/semesters.test.js`                                    | `Visitor tries creating a semester`                                                   |
| US-2.2 | Semesters view loads with existing semesters                                        | `backend/tests/semesters.test.js`, `frontend/tests/Semester.test.js` | `Semesters view loads with existing semesters`                                        |
| US-2.2 | No semesters exist                                                                  | `frontend/tests/Semester.test.js`                                    | `No semesters exist`                                                                  |
| US-2.2 | Student can GET the semesters list                                                  | `backend/tests/semesters.test.js`                                    | `Student can GET the semesters list`                                                  |
| US-2.2 | Student can GET a semester by id                                                    | `backend/tests/semesters.test.js`                                    | `Student can GET a semester by id`                                                    |
| US-2.2 | Student user accesses the semester view                                             | `frontend/tests/Semester.test.js`                                    | `Student user accesses the semester view`                                             |
| US-2.2 | Unauthenticated API request to semesters                                            | `backend/tests/semesters.test.js`                                    | `Unauthenticated API request to semesters`                                            |
| US-2.2 | Unauthenticated user accesses the semester view                                     | `frontend/tests/Semester.test.js`                                    | `Unauthenticated user accesses the semester view`                                     |
| US-2.3 | semester rows show edit and delete actions                                          | `frontend/tests/Semester.test.js`                                    | `semester rows show edit and delete actions`                                          |
| US-2.4 | Admin edits a semester                                                              | `backend/tests/semesters.test.js`, `frontend/tests/Semester.test.js` | `Admin edits a semester`                                                              |
| US-2.4 | Admin deletes a semester                                                            | `backend/tests/semesters.test.js`, `frontend/tests/Semester.test.js` | `Admin deletes a semester`                                                            |
| US-2.4 | Student tries editing or deleting semesters                                         | `backend/tests/semesters.test.js`                                    | `Student tries editing or deleting semesters`                                         |
| US-2.4 | Visitor tries editing or deleting semesters                                         | `backend/tests/semesters.test.js`                                    | `Visitor tries editing or deleting semesters`                                         |
| US-2.5 | Search bar appears with semesters                                                   | `frontend/tests/Semester.test.js`                                    | `Search bar appears with semesters`                                                   |
| US-2.5 | No search bar appears with no semesters                                             | `frontend/tests/Semester.test.js`                                    | `No search bar appears with no semesters`                                             |
| US-2.5 | Admin types in semester search bar                                                  | `frontend/tests/Semester.test.js`                                    | `Admin types in semester search bar`                                                  |
| US-2.5 | Admin types in semester search bar 2                                                | `frontend/tests/Semester.test.js`                                    | `Admin types in semester search bar 2`                                                |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 2 from @features/feature-2-semester-management.md on branch `feature/2-semester-management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
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

- Drag-and-drop semester reordering
- `POST`/`GET`/`PUT`/`DELETE` anywhere that's not `/courses/semesters` or `/courses/semesters/:semesterId`

---

## Delivered to Feature 3

The following are intentionally deferred to the next feature spec:

- `courses` table and associations
- `sections` table and associations
- Courses (see `features/feature-3-course-management.md`)
