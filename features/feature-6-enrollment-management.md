# Feature: Enrollment Management

**Feature ID:** 6
**Branch pattern:** `feature/6-enrollment-management`
**Status:** Draft
**Created:** 2026-09-18
**Input:** CRD enrollment for users.
**Depends on:** [Feature 1 -- User Auth & Sessions](feature-1-user-auth-session-management.md), [Feature 2 -- Semesters](feature-2-semester-management.md), [Feature 3 -- Courses](feature-3-course-management), [Feature 5 -- Sections](feature-5-section-management.md)
**Related:** `frontend/src/views/EnrollmentList.vue`, `frontend/src/views/Section.vue`, `backend/app/routes/courses.routes.js`, `backend/app/routes/users.routes.js`, `backend/app/routes/sections.routes.js`, `backend/app/routes/enrollments.routes.js`, `backend/app/routes/semester.routes.js`

---

## User Stories

### US-6.1: View Current Enrollments

**As an** authenticated student user
**I want to** see a list of all sections I am currently enrolled in
**So that** I can know what I have on my schedule.

**Priority:** P1
**Independent test:** `EnrollmentList.vue` shows a list of sections I am enrolled in for this semester.
**Acceptance scenarios:** see ### US-6.1 under Acceptance Criteria

### US-6.2: Enrollment Details

**As an** authenticated student user
**I want to** see the details of a selected `enrollment`
**So that** I can know about its details.

**Priority:** P1
**Independent test:** `enrollment` details located along each `enrollment`'s list row
**Acceptance scenarios:** see ### US-6.2 under Acceptance Criteria

### US-6.3: Add Enrollment

**As an** authenticated student user
**I want to** add `enrollment`s to my `enrollment`s list
**So that** I can change what I'm doing this semester.

**Priority:** P1
**Independent test:** Click **+ New enrollment**, modal opens with `courses` combobox, select a `course`, `sections` combobox appears beneath `courses`, selecting a `section` adds new `enrollment` to `enrollment` list
**Acceptance scenarios:** see ### US-6.3 under Acceptance Criteria

### US-6.4: Remove Enrollment

**As an** authenticated student user
**I want to** remove `enrollment`s from my `enrollment`s list
**So that** I can drop out of a `section`

**Priority:** P2
**Independent test:** open `enrollment` details modal, elevated button somewhere inside called **Delete**, clicking button asks for confirmation, confirming removes selected `enrollment` from `enrollment`s list
**Acceptance scenarios:** see ### US-6.4 under Acceptance Criteria

### US-6.5: Seek semesters pagination

**As any** authenticated student user
**I want to** press the `Previous` and `Next` buttons in the `EnrollmentList.vue` view
**So that** I can see my different semester's enrollments

**Priority:** P2
**Independent test:** pressing `Previous` button shows the enrollments for the previous semester, pressing the `Next` button shows the enrollments for the next semester
**Acceptance scenarios:** see ### US-6.5 under Acceptance Criteria

### US-6.6: No editing enrollments

**As any** authenticated student user
**I want to** reject `PUT` on `enrollment` routes
**So that** I can map `enrollment` accurately to the enroll/drop/withdraw process

**Priority:** P3
**Independent test:** send any `PUT` request to any `enrollment` api route, receive `405` error
**Acceptance scenarios:** see ### US-6.6 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: A student user can only view and interact with their `enrollment`s if they are authenticated and have a valid `session`
- **FR-002**: A student user's `enrollment`s **MUST** be shown based on a provided `semesterId`.
- **FR-003**: `enrollment`s **MUST NOT** be shown in a single, big list.
- **FR-004**: A student user **MUST** be able to navigate to different `semester` groups of `enrollment`s without changing views from `EnrollmentList.vue`
- **FR-005**: A student user's `enrollment`s with different `semesterId`s **MUST** be in separate list views on `EnrollmentList.vue`
- **FR-006**: A student user **MUST** be allowed to see the `enrollment`s it owns for a given semester on `EnrollmentList.vue`
- **FR-007**: A student user **MUST NOT** be allowed to see the `enrollment`s other student users own
- **FR-008**: A student user **MUST** be allowed to see the details of the `enrollment`s it owns
- **FR-009**: A student user **MUST NOT** be allowed to see the details of `enrollment`s other student users owns
- **FR-010**: A student user **MUST** be allowed to add `enrollment`s to its ownership
- **FR-011**: A student user **MUST** be allowed to remove `enrollment`s from its ownership
- **FR-012**: A student user **MUST NOT** be allowed to add `enrollment`s to other student users
- **FR-013**: A student user **MUST NOT** be allowed to remove `enrollment`s from other student users' ownership
- **FR-014**: Enrollment resources **MUST NOT** support `PUT` or in-place updates.
- **FR-015**: A student user **MUST** use `DELETE` and `POST` to remove and add enrollments instead of overwriting.

---

## Assumptions

- Feature 1, Feature 2, Feature 3, Feature 4, and Feature 5 are already on `dev`

## Edge Cases

- Fetch another user's `enrollment`s -> `404`
- POST `enrollment` with the same `semesterId`, `sectionId`, AND `universityId` -> `409`
- PUT in general. Enrollments are not overwritten and should not use PUT -> `405`

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge
- **SC-002**: Student user can Create, Read, and Delete their own `enrollment`s
- **SC-003**: Student user can **NOT** Create, Read, Update, or Delete from/to any other student user's `enrollment`s
- **SC-004**: npm test passes for `frontend/tests/enrollments.test.js` and for `backend/tests/EnrollmentList.test.js`

---

## Data Ownership & Isolation

Each user owns their enrollments. Enrollments belong to one user, and a user can have many enrollments.

| Rule                  | Requirement                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Read scope**        | For student users only, the semester page loads a list of enrollments by route id (`GET /courses/enrollments/:universityId/:semesterId`)                                                               |
| **Write scope**       | Enrollments cannot be manually edited since they consist of only foreign keys. They should be created and removed instead                                                                              |
| **Create scope**      | `POST /courses/enrollments/:universityId/*` succeeds only when the row does not already exist and `:universityId === req.user.universityId`.                                                           |
| **Cross-user access** | Another user’s enrollment on read/create/delete → `404` `{ "message": "Cannot find Enrollment with universityId=${universityId}." }` (not `403`). Missing/invalid Bearer token on routes → `401`.      |
| **UI scope**          | `EnrollmentList.vue` shows the enrollments for `:universityId`. Navigation to `EnrollmentList.vue` comes from signing into the application as a student.                                               |
| **Implementation**    | Enrollment operations already check for auth (`req.user.universityId`). Prefer a shared helper in `app/authorization/` for enrollment ownership rather than duplicating the check in every controller. |

---

## Key Entities

- **User**: registered account (name, id, role, email, password); owns enrollments.
- **Enrollment**: Entity collecting `semester.semesterId`, `section.sectionId`, and `user.universityId`; shows users what sections they're signed up for and when

---

## API Requirements

Mount prefix: `/courses`. Flat JSON (no `{ success, data }` envelope). Errors: `{ "message": "Human-readable explanation." }`. Authenticated writes send `Authorization: Bearer <token>`.

This feature uses the `enrollment`s endpoints below (CUD sections and CUD semesters stay in other features).

| Method   | Endpoint                                                    | Auth | Purpose                                                                           |
| -------- | ----------------------------------------------------------- | ---- | --------------------------------------------------------------------------------- |
| `GET`    | `/courses/enrollments/:universityId/`                       | Yes  | List the enrollments for the user where `:universityId === req.user.universityId` |
| `POST`   | `/courses/enrollments/:universityId/`                       | Yes  | Add an `enrollment` to the user where `:universityId === req.user.universityId`   |
| `GET`    | `/courses/enrollments/:universityId/semesters/:semesterId`  | Yes  | List only the enrollments the user `:universityId === req.user.universityId`      |
| `GET`    | `/courses/sections/:sectionId`                              | Yes  | List the details of the `section` whose `sectionId === :sectionId`                |
| `DELETE` | `/courses/enrollments/:universityId/:semesterId/:sectionId` | Yes  | Remove the enrollment specified by the route parameters                           |

**Unauthenticated write:** `401` `{ "message": "Unauthorized! No Auth Header" }` (or expired-token message).

### Load enrollment (`GET /courses/enrollments/:universityId`)

**Success** (`200`): array with all enrollments for that user (frontend uses index `0`)

```json
[
  {
    "semesterId": 2,
    "sectionId": "CMSC-2011-91",
    "universityId": 42
  },
  {
    "semesterId": 3,
    "sectionId": "CMSC-3023-02",
    "universityId": 42
  }
]
```

**Server error:** `500` `{ "message": "…" }`.

### Add enrollment (`POST /courses/enrollments/:universityId`)

**Request body** (fields the add request sends):

```json
{
  "semesterId": 2,
  "sectionId": "CMSC-2011-91"
}
```

Missing `semesterId`, `sectionId` → `400` bad request.
Duplicate combination of all three → `409` conflict.

**Success** (`200`): created `enrollment` row (includes `semesterId`, `sectionId`, and `recipeId`).

**Server error:** `500` `{ "message": "…" }`.

### Remove Enrollment (`DELETE /courses/enrollments/:universityId/:semesterId/:sectionId`)

**Success** (`204`)

**Not found/Not owned:** `404`

```json
{ "message": "Cannot find enrollment for universityId=1." }
```

**Server error:** `500` `{ "message": "…" }`.

---

## Screen Requirements

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

**enrollments view (this feature)**

- Heading: **My Enrollments**
- Primary action: **+ New enrollment** opens a `<v-dialog>` with a **Course** field `<v-combobox>`, a conditionally-visible **Section** field `<v-combobox>`, and **Create** / **Cancel** buttons. Use class `oc-cta` on **Create** and **+ New enrollment** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
- Display interactive search bar named `Find` above any lists
- Display enrollments as rows (e.g. `<v-list>` or table). The following columns should be in the list:
  - **SectionId** -- `XXXX-####-##` unique identifier code (e.g. `CMSC-1113`)
  - **Name** -- The name of the course the section belongs to (e.g. `Programming I`)
  - **Days** -- Which days of the week the section meets on (e.g. `M W F` or `T Th`)
  - **Time** -- Start Time to End Time (e.g. `12:40pm - 1:30pm`)
  - **Room** -- The room code a section meets in (e.g. `PEC-233`)
  - **Instructor** -- The name of the `faculty` in the `section` (e.g. `David North`).
  - Each row contains a **Delete** icon — opens confirmation `<v-dialog>`
- Icon-only row action uses `size="small"` and accessible `aria-label` (**Drop Class**).
- **Empty state:** **"No enrollments yet. Add an enrollment."** when no enrollments exist in the database.
- **Loading state:** skeleton or progress indicator while enrollments are fetching.
- **Error state:** `<v-alert type="error">` for API failures.

**Implementation note:** one route/view for `enrollment`s; `enrollment` CRD dialogs are child components or inline `<v-dialog>` blocks in `EnrollmentList.vue` unless the team splits presentational dialogs later.

**App chrome**

- Existing `MenuBar`. This feature does not add or hide chrome.

---

## Data Model Requirements

This feature uses the existing `users`, `courses`, `sections`, and `semesters` tables along with a new `enrollments` table. Sequelize also stores `createdAt` / `updatedAt`.

### `enrollments` table

| Field          | Type    | Rules                                                      |
| -------------- | ------- | ---------------------------------------------------------- |
| `semesterId`   | INTEGER | Required; foreign key to `semester.id`; Primary Key        |
| `sectionId`    | STRING  | Required; foreign key to `sections.id`; Primary Key        |
| `universityId` | INTEGER | Required; foreign key to `users.universityId`; Primary Key |

### Associations

- `User` hasMany `enrollments`
- `enrollment` belongsTo `User`

---

## Acceptance Criteria (Gherkin)

### US-6.1: View Current Enrollments

#### Scenario: view enrollment list with no enrollments

- **Given** I am a signed in student user
- **When** I view the `EnrollmentList` view
- **And** I have no `enrollment`s
- **Then** I see "No enrollments yet. Add an enrollment."
- **And** no enrollments show up

#### Scenario: view enrollment list with enrollments

- **Given** I am a signed in student user
- **When** I view the `EnrollmentList` view
- **And** I have an `enrollment` for the `sectionId` `4` for the `semesterId` `105`
- **Then** I see a row containing the details of `sectionId` `4`
- **And** each row has a **Delete** icon
- **And** I see a `Previous` button
- **And** I see a `Next` button

#### Scenario: view only enrollments matching semesterId

- **Given** I am a signed in student user
- **When** I view the `EnrollmentList` view
- **And** I have an `enrollment` for the `sectionId` `4` for the `semesterId` `105`
- **And** I have an `enrollment` for the `sectionId` `19` for the `semesterId` `105`
- **And** I have an `enrollment` for the `sectionId` `28` for the `semesterId` `106`
- **And** I am viewing my `enrollment` list for `semesterId` `105`
- **Then** I see a header above the `enrollment` list with the name of `semesterId` `105`
- **And** I see a row containing the `section` name of `sectionId` `4`
- **And** I see a row containing the `section` name of `sectionId` `19`

#### Scenario: Student cannot fetch another user's enrollments

- **Given** I am a signed-in student user with `universityId` `42`
- **And** enrollments exist for `universityId` `99`
- **When** I request `GET /courses/enrollments/99`
- **Or** I request `GET /courses/enrollments/99/semesters/:semesterId`
- **Then** the API returns `404` with `{ "message": "Cannot find Enrollment with universityId=99." }`
- **And** I do not receive another user's enrollment data

### US-6.2: Enrollment Details

#### Scenario: view enrollment details

- **Given** I am a signed in student user
- **When** I view the `EnrollmentList` view
- **And** I have an enrollment
- **Then** I see the enrollment's details that fulfill the Screen Requirements

### US-6.3: Add Enrollment

#### Scenario: Open add enrollment modal

- **Given** I am viewing the `EnrollmentList` view
- **When** I click **+ New enrollment**
- **Then** I see a combobox for `Courses`
- **And** I see a `Cancel` and `Confirm` buttons

#### Scenario: Use course combobox

- **Given** I am viewing the `Add Enrollment` modal
- **When** I type in the `Course` combobox
- **Then** I see the course codes for _this semester_ that contain my typing as a substring

#### Scenario: Confirm course combobox

- **Given** I am viewing the `Add Enrollment` modal
- **When** I select a `course` in the `Course` combobox
- **Then** I see a combobox for `Section` containing all the `sections` for that course

#### Scenario: Use section combobox

- **Given** I am viewing the `Add Enrollment` modal
- **And** I have selected a `course` already in the `Course` combobox
- **When** I type in the `Section` combobox
- **Then** I see the section codes that contain my typing as a substring

#### Scenario: Confirm section combobox

- **Given** I am viewing the `Add Enrollment` modal
- **And** I have selected a `course` already in the `Course` combobox
- **When** I select a `section` in the `Section` combobox
- **Then** I see the `section`'s details beneath the combobox

#### Scenario: Create valid enrollment

- **Given** I am viewing the `Add Enrollment` modal
- **And** I have selected a valid `course` already in the `Course` combobox
- **And** I have selected a valid `section` in the `Section` combobox
- **When** I select the **Create** button
- **Then** the API sends a `200`/`201` response along with the created object
- **And** the `enrollment` list updates with the newly created `enrollment`
- **And** the `Add Enrollment` modal closes.

#### Scenario: Create an enrollment with an empty course

- **Given** I am viewing the `Add Enrollment` modal
- **When** I leave the `Course` combobox in its default state or empty
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"Course and Section are both required."**
- **And** no API request is sent

#### Scenario: Create an enrollment with an empty section

- **Given** I am viewing the `Add Enrollment` modal
- **And** I have selected a `course` already in the `Course` combobox
- **When** I leave the `Section` combobox in its default state or empty
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"Section is required."**
- **And** no API request is sent

#### Scenario: Create an enrollment with duplicate data

- **Given** I am viewing the `Add Enrollment` modal
- **And** I have an existing `enrollment`
- **When** I select a `course` and `section` that both match an existing `enrollment`
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"Can't enroll in the same section twice in one semester."**
- **And** no API request is sent

#### Scenario: Create enrollment with improper course ID

- **Given** I am viewing the `Add Enrollment` modal
- **When** I input a `courseId` in the `Course` combobox that does not exist
- **Or** the `courseId` I inputted is not offered this semester
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"Please select a course offered this semester"**
- **And** no API request is sent
- **And** no `Section` combo box appears

#### Scenario: Create enrollment with improper section ID

- **Given** I am viewing the `Add Enrollment` modal
- **And** I have selected a valid `courseId` in the `course` combobox
- **When** I input a `sectionId` in the `Section` combobox that does not belong to the selected `course`
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"Please select a valid section from this course"**
- **And** no API request is sent
- **And** no `section` details appear beneath the `Section` combobox

### US-6.4: Remove Enrollment

#### Scenario: Select enrollment delete icon

- **Given** I am viewing the `EnrollmentList` view
- **When** I select the **Delete** icon on an `enrollment`
- **Then** I see a **Drop this class?** modal with **Drop** and **Cancel** buttons

#### Scenario: Confirm delete icon

- **Given** I am viewing the **Drop this class?** modal
- **When** I select **Drop**
- **Then** the API returns `204`
- **And** the selected `enrollment` is no longer in the `EnrollmentList`
- **And** the **Drop this class?** modal closes

#### Scenario: Cancel delete

- **Given** I am viewing the **Drop this class?** modal
- **When** I select **Cancel**
- **Then** no API request is sent
- **And** the **Drop this class?** modal closes
- **And** the selected `enrollment` is still in the `EnrollmentList`

### US-6.5: Seek semesters pagination

#### Scenario: EnrollmentList First Landing

- **Given** I am viewing the **EnrollmentList** view
- **When** the view loads for the first time this `session`
- **Then** I see a list of my `enrollment`s for the current `semester`
- **And** I do not see my `enrollment`s for any other `semester`

#### Scenario: EnrollmentList Return Landing

- **Given** I am viewing the **EnrollmentList** view
- **When** I navigate away from the **EnrollmentList** view
- **And** I navigate back to the **EnrollmentList** view
- **Then** I see my `enrollment`s for the `semester` I most recently looked at

#### Scenario: Navigate Semesters order forward

- **Given** I am viewing the **EnrollmentList** view
- **And** I am viewing my `enrollment`s for the `FA2026` `semester`
- **When** I press the **Next** button four times
- **Then** I see my `enrollment`s for the `WI2026` `semester`
- **Then** I see my `enrollment`s for the `SP2027` `semester`
- **Then** I see my `enrollment`s for the `SU2027` `semester`
- **Then** I see my `enrollment`s for the `FA2027` `semester`

#### Scenario: Navigate Semesters order backward

- **Given** I am viewing the **EnrollmentList** view
- **And** I am viewing my `enrollment`s for the `FA2026` `semester`
- **When** I press the **Previous** button four times
- **Then** I see my `enrollment`s for the `SU2026` `semester`
- **Then** I see my `enrollment`s for the `SP2026` `semester`
- **Then** I see my `enrollment`s for the `WI2025` `semester`
- **Then** I see my `enrollment`s for the `FA2025` `semester`

#### Scenario: Navigate Semesters combobox typing

- **Given** I am viewing the **EnrollmentList** view
- **When** I type anything into the `Semester` combobox without confirming
- **Then** I see all `semester`s in the dropdown with the combobox content as a substring

#### Scenario: Navigate Semesters combobox select

- **Given** I am viewing the **EnrollmentList** view
- **When** I select a `semester` from the `Semester` combobox
- **Then** I see all my `enrollment`s for that selected `semester` only
- **And** pressing the **Previous** or **Next** navigate `semester`s with the current one as a new starting position

### US-6.6: No editing enrollments

#### Scenario: PUT to enrollments is rejected

- **Given** I am signed in as a student
- **When** I send PUT /courses/enrollments/:universityId/...
- **Then** the API returns 405 with `{ "message": "Enrollments are dropped, not edited" }`

---

## Test Coverage Map

Each scenario above must map to at least one automated test. `it` names must match the Gherkin **Scenario** titles exactly.

| Story  | Scenario                                        | Test file                                                                    | Test name                                         |
| ------ | ----------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| US-6.1 | view enrollment list with no enrollments        | `frontend/tests/EnrollmentList.test.js`                                      | `view enrollment list with no enrollments`        |
| US-6.1 | view enrollment list with enrollments           | `backend/tests/enrollments.test.js`, `frontend/tests/EnrollmentList.test.js` | `view enrollment list with enrollments`           |
| US-6.1 | view only enrollments matching semesterId       | `backend/tests/enrollments.test.js`, `frontend/tests/EnrollmentList.test.js` | `view only enrollments matching semesterId`       |
| US-6.1 | student cannot fetch another user's enrollments | `backend/tests/enrollments.test.js`, `frontend/tests/EnrollmentList.test.js` | `student cannot fetch another user's enrollments` |
| US-6.2 | view enrollment details                         | `frontend/tests/EnrollmentList.test.js`                                      | `view enrollment details`                         |
| US-6.3 | Open add enrollment modal                       | `frontend/tests/EnrollmentList.test.js`                                      | `Open add enrollment modal`                       |
| US-6.3 | Use course combobox                             | `frontend/tests/EnrollmentList.test.js`                                      | `Use course combobox`                             |
| US-6.3 | Confirm course combobox                         | `frontend/tests/EnrollmentList.test.js`                                      | `Confirm course combobox`                         |
| US-6.3 | Use section combobox                            | `frontend/tests/EnrollmentList.test.js`                                      | `Use section combobox`                            |
| US-6.3 | Confirm section combobox                        | `frontend/tests/EnrollmentList.test.js`                                      | `Confirm section combobox`                        |
| US-6.3 | Create valid enrollment                         | `backend/tests/enrollments.test.js`, `frontend/tests/EnrollmentList.test.js` | `Create valid enrollment`                         |
| US-6.3 | Create an enrollment with an empty course       | `frontend/tests/EnrollmentList.test.js`                                      | `Create an enrollment with an empty course`       |
| US-6.3 | Create an enrollment with an empty section      | `frontend/tests/EnrollmentList.test.js`                                      | `Create an enrollment with an empty section`      |
| US-6.3 | Create an enrollment with duplicate data        | `frontend/tests/EnrollmentList.test.js`                                      | `Create an enrollment with duplicate data`        |
| US-6.3 | Create enrollment with improper course ID       | `frontend/tests/EnrollmentList.test.js`                                      | `Create enrollment with improper course ID`       |
| US-6.3 | Create enrollment with improper section ID      | `frontend/tests/EnrollmentList.test.js`                                      | `Create enrollment with improper section ID`      |
| US-6.4 | Select enrollment delete icon                   | `frontend/tests/EnrollmentList.test.js`                                      | `Select enrollment delete icon`                   |
| US-6.4 | Confirm delete icon                             | `backend/tests/enrollments.test.js`, `frontend/tests/EnrollmentList.test.js` | `Confirm delete icon`                             |
| US-6.4 | Cancel delete                                   | `frontend/tests/EnrollmentList.test.js`                                      | `Cancel delete`                                   |
| US-6.5 | EnrollmentList First Landing                    | `backend/tests/enrollments.test.js`, `frontend/tests/EnrollmentList.test.js` | `EnrollmentList First Landing`                    |
| US-6.5 | EnrollmentList Return Landing                   | `frontend/tests/EnrollmentList.test.js`                                      | `EnrollmentList Return Landing`                   |
| US-6.5 | Navigate Semesters order forward                | `frontend/tests/EnrollmentList.test.js`                                      | `Navigate Semesters order forward`                |
| US-6.5 | Navigate Semesters order backward               | `frontend/tests/EnrollmentList.test.js`                                      | `Navigate Semesters order backward`               |
| US-6.5 | Navigate Semesters combobox typing              | `frontend/tests/EnrollmentList.test.js`                                      | `Navigate Semesters combobox typing`              |
| US-6.5 | Navigate Semesters combobox select              | `frontend/tests/EnrollmentList.test.js`                                      | `Navigate Semesters combobox select`              |
| US-6.6 | PUT to enrollments is rejected                  | `backend/tests/enrollments.test.js`                                          | `PUT to enrollments is rejected`                  |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 6 from @features/feature-6-enrollment-management.md on branch `feature/6-enrollment-management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/api.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

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

- Edit/rename UI
- Admin modifying student enrollments

---

## Defer to Feature 7

Student course listing (management, `REST`, `API`'s, views, components, student course catalog/browse)

---

## Defer to Feature 8

Student section listing (management, `REST`, `API`'s, views, components, browse/list sections as a student)
