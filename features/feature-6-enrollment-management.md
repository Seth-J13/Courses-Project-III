# Feature: Enrollment Management

**Feature ID:** 6
**Branch pattern:** `feature/6-enrollment-management`
**Status:** Draft
**Created:** 2026-09-18
**Input:** CRUD enrollment for users.
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
**Independent test:** click on an existing `enrollment`, details modal opens containing `section` content, close modal
**Acceptance scenarios:** see ### US-6.2 under Acceptance Criteria

### US-6.3: Add Enrollment

**As an** authenticated student user
**I want to** add `enrollment`s to my `enrollment`s list
**So that** I can change what I'm doing this semester.

**Priority:** P1
**Independent test:** Click `Add Section`, modal opens with `courses` combobox, select a `course`, `sections` combobox appears beneath `courses`, selecting a `section` adds new `enrollment` to `enrollment` list
**Acceptance scenarios:** see ### US-6.3 under Acceptance Criteria

### US-6.4: Remove Enrollment

**As an** authenticated student user
**I want to** remove `enrollment`s from my `enrollment`s list
**So that** I can drop out of a `section`

**Priority:** P2
**Independent test:** open `enrollment` details modal, elevated button somewhere inside called `DROP`, clicking button asks for confirmation, confirming removes selected `enrollment` from `enrollment`s list
**Acceptance scenarios:** see ### US-6.4 under Acceptance Criteria

### US-6.5: Seek semesters pagination

**As any** authenticated student user
**I want to** press the `Previous` and `Next` buttons in the `EnrollmentList.vue` view
**So that** I can see my different semester's enrollments

**Priority:** P2
**Independent test:** pressing `Previous` button shows the enrollments for the previous semester, pressing the `Next` button shows the enrollments for the next semester
**Acceptance scenarios:** see ### US-6.5 under Acceptance Criteria

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

---

## Assumptions

- Feature 1, Feature 2, Feature 3, Feature 4, and Feature 5 are already on `dev`

## Edge Cases

- Fetch or Update another user's `enrollment`s -> `404`
- POST or Update `enrollment` with the same `semesterId`, `sectionId`, AND `userId` -> `400`
- PUT in general. Enrollments are not overwritten and should not use PUT -> `400`

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge
- **SC-002**: Student user can Create, Read, Update, and Delete their own `enrollment`s
- **SC-003**: Student user can **NOT** Create, Read, Update, or Delete from/to any other student user's `enrollment`s
- **SC-004**: npm test passes for `frontend/tests/enrollment.test.js` and for `backend/tests/Enrollment.test.js`

---

## Data Ownership & Isolation

Each user owns their enrollments. Enrollments belong to one user, and a user can have many enrollments. The shared ingredient catalog is not owned by this feature.

| Rule                  | Requirement                                                                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Read scope**        | For student users only, the semester page loads a list of enrollments by route id (`GET /courses/enrollments/:userId/:semesterId`)                                                           |
| **Write scope**       | Enrollments cannot be manually edited since they consist of only foreign keys. They should be created and removed instead                                                                    |
| **Create scope**      | `POST /courses/enrollments/:userId/*` succeeds only when the row does not already exist and `:userId = req.user.id`.                                                                         |
| **Cross-user access** | Another user’s enrollment on read/create/delete → `404` `{ "message": "Cannot find Enrollment with userId=${userId}." }` (not `403`). Missing/invalid Bearer token on routes → `401`.        |
| **UI scope**          | `EnrollmentList.vue` shows the enrollments for `route.params.id`. Navigation to `EnrollmentList.vue` comes from signing into the application as a student.                                   |
| **Implementation**    | Enrollment operations already check for auth (`req.user.id`). Prefer a shared helper in `app/authorization/` for enrollment ownership rather than duplicating the check in every controller. |

---

## Key Entities

- **User**: registered account (name, id, role, email, password); owns enrollments.
- **Enrollment**: Entity collecting `semester.semesterId`, `section.sectionId`, and `user.id`; shows users what sections they're signed up for and when

---

## API Requirements

Mount prefix: `/courses`. Flat JSON (no `{ success, data }` envelope). Errors: `{ "message": "Human-readable explanation." }`. Authenticated writes send `Authorization: Bearer <token>`.

This feature uses the enrollments endpoints below (CUD sections and CUD semesters stay in other features).

| Method   | Endpoint                                              | Auth | Purpose                                                                                                                                         |
| -------- | ----------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/courses/enrollments/:userId/`                       | Yes  | List the enrollments for the user where `:userId = req.user.id`                                                                                 |
| `POST`   | `/courses/enrollments/:userId/`                       | Yes  | Add an `enrollment` to the user where `:userId = req.user.id`                                                                                   |
| `GET`    | `/courses/enrollments/:userId/semesters/:semesterId`  | Yes  | List only the enrollments the user `:userId = req.user.id` and `:semesterId = req.semester.id`                                                  |
| `GET`    | `/courses/sections/:sectionId`                        | Yes  | List the details of the `section` where `:sectionId = req.section.id`                                                                           |
| `DELETE` | `/courses/enrollments/:userId/:semesterId/:sectionId` | Yes  | Remove the specified enrollment from the user where `:userId = req.user.id`, `:semesterId = req.semester.id`, and `:sectionId = req.section.id` |

**Unauthenticated write:** `401` `{ "message": "Unauthorized! No Auth Header" }` (or expired-token message).

### Load enrollment (`GET /courses/enrollments/:userId`)

**Success** (`200`): array with all enrollments for that user (frontend uses index `0`)

```json
[
  {
    "semesterId": 2,
    "sectionId": "CMSC-2011-91",
    "userId": 42
  },
  {
    "semesterId": 3,
    "sectionId": "CMSC-3023-02",
    "userId": 42
  }
]
```

**Server error:** `500` `{ "message": "…" }`.

### Add enrollment (`POST /courses/enrollments/:userId`)

**Request body** (fields the add request sends):

```json
{
  "semesterId": 2,
  "sectionId": "CMSC-2011-91",
  "userId": 42
}
```

Missing `semesterId`, `sectionId`, or `recipeId` → `400` bad request.
Duplicate combination of all three → `409` conflict.

**Success** (`200`): created `enrollment` row (includes `semesterId`, `sectionId`, and `recipeId`).

**Server error:** `500` `{ "message": "…" }`.

### Remove Enrollment (`DELETE /courses/enrollments/:userId/:semesterId/:sectionId`)

**Success** (`200`):

```json
{ "message": "Enrollment was removed successfully." }
```

**Not owned:** `404`

```json
{ "message": "Cannot find enrollment for userId=1." }
```

**Server error:** `500` `{ "message": "…" }`.

---

## Screen Requirements

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

**enrollments view (this feature)**

- Heading: **My Enrollments**
- Primary action: **+ New enrollment** opens a `<v-dialog>` with a name `<v-text-field>` and **Create** / **Cancel**. Use class `oc-cta` on **Create** and **+ New enrollment** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
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
- **Empty state:** **"No enrollments yet. Add an enrollment."** when no semesters exist in the database.
- **Loading state:** skeleton or progress indicator while enrollments are fetching.
- **Error state:** `<v-alert type="error">` for API failures.

**Implementation note:** one route/view for semesters; semester CRUD dialogs are child components or inline `<v-dialog>` blocks in `Dashboard.vue` unless the team splits presentational dialogs later.

**App chrome**

- Existing `MenuBar` (Recipes, Ingredients, user menu). This feature does not add or hide chrome.

---

## Data Model Requirements

This feature uses the existing `users`, `courses`, `sections`, and `semesters` tables along with a new `enrollments` table. Sequelize also stores `createdAt` / `updatedAt`.

### `enrollments` table

| Field        | Type       | Rules                                               |
| ------------ | ---------- | --------------------------------------------------- |
| `id`         | INTEGER PK | Auto-increment                                      |
| `semesterId` | STRING     | Required; foreign key to `semester.id`; Primary Key |
| `sectionId`  | STRING     | Required; foreign key to `sections.id`; Primary Key |
| `userId`     | INTEGER    | Required; foreign key to `users.id`; Primary Key    |

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

### US-6.2: Enrollment Details

#### Scenario: view enrollment details

- **Given** I am a signed in student user
- **When** I view the `EnrollmentList` view
- **And** I have an enrollment
- **Then** I see the enrollment's details that fulfill the Screen Requirements

### US-6.3: Add Enrollment

#### Scenario: Open add modal

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
- **Then** I see the `section` details beneath the combobox

#### Scenario: Create a enrollment with an empty course

- **Given** I am viewing the `Add Enrollment` modal
- **When** I leave the `Course` combobox in its default state or empty
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"Course and Section are both required."**
- **And** no API request is sent

#### Scenario: Create a enrollment with an empty section

- **Given** I am viewing the `Add Enrollment` modal
- **And** I have selected a `course` already in the `Course` combobox
- **When** I leave the `Section` combobox in its default state or empty
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"Section is required."**
- **And** no API request is sent

#### Scenario: Create a enrollment with duplicate data

- **Given** I am viewing the `Add Enrollment` modal
- **And** I have an existing `enrollment`
- **When** I select a `course` and `section` that both match an existing `enrollment`
- **And** I attempt to confirm
- **Then** inline validation blocks the request
- **And** I see the message **"Can't enroll in the same section twice in one semester."**
- **And** no API request is sent

#### Scenario: Admin creates a semester with a name that is too long **RETURN TO HERE WHEN EDITING**

- **Given** I am signed in as an admin on the semester view
- **When** I submit a semester name longer than 6 characters
- **Then** the API returns `400` with `{ "message": "semester name must be 100 characters or fewer." }`
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

### US-6.4: Remove Enrollment

### US-6.5: Seek semesters pagination

---

## Test Coverage Map

Each scenario above must map to at least one automated test. `it` names must match the Gherkin **Scenario** titles exactly.

| Story  | Scenario                                          | Test file                           | Test name                                           |
| ------ | ------------------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| US-6.1 | User edits recipe name                            | `frontend/tests/EditRecipe.test.js` | `User edits recipe name`                            |
| US-6.2 | User changes the number of servings with a number | `frontend/tests/EditRecipe.test.js` | `User changes the number of servings with a number` |

---

## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 6 from @features/feature-6-recipe-enrollment-management.md on branch `feature/5-recipe-enrollment-management`.

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

-
