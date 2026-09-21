# Feature: Enrollment Management

**Feature ID:** 6
**Branch pattern:** `feature/6-enrollment-management`
**Status:** Draft
**Created:** 2026-09-18
**Input:** CRUD enrollment for users.
**Depends on:** [Feature 1 -- User Auth & Sessions](feature-1-user-auth-session-management.md), [Feature 2 -- Courses](feature-2-course-management.md), [Feature 5 -- Sections](feature-5-section-management.md)
**Related:** `frontend/src/views/EnrollmentList.vue`, `frontend/src/views/Section.vue`, `frontend/src/views/EditEnrollment.vue`, `backend/app/routes/courses.routes.js`, `backend/app/routes/users.routes.js`, `backend/app/routes/sections.routes.js`, `backend/app/routes/enrollments.routes.js`, `backend/app/routes/semester.routes.js`

---

## User Stories

### US-6.1: View Current Enrollments

**As an** authenticated student user
**I want to** see a list of all sections I am currently enrolled in
**So that** I can know what I have on my schedule.

**Priority:** P1
**Independent test:** `Semester.vue` shows a list of sections I am enrolled in for this semester.
**Acceptance scenarios:** see ### US-6.1 under Acceptance Criteria

### US-6.2: Enrollment Details

**As an** authenticated student user
**I want to** see the details of a selected `enrollment`
**So that** I can know about its details.

**Priority:** P1
**Independent test:** click on an existing `enrollment`, details modal opens containing `section` content
**Acceptance scenarios:** see ### US-6.2 under Acceptance Criteria

### US-6.3: Add Enrollment

**As an** authenticated student user
**I want to** add `enrollment`s to my `enrollment`s list
**So that** I can change what I'm doing this semester.

**Priority:** P1
**Independent test:** Click `Add Section`, modal opens with list of `courses`, select a `course`, content in modal changes to that `course`'s `section`s, clicking on a `section` adds new `enrollment` to `enrollment` list
**Acceptance scenarios:** see ### US-6.3 under Acceptance Criteria

### US-6.4: Remove Enrollment

**As an** authenticated student user
**I want to** remove `enrollment`s from my `enrollment`s list
**So that** I can drop out of a `section`

**Priority:** P2
**Independent test:** open `enrollment` details modal, elevated button somewhere inside called `DROP`, clicking button asks for confirmation, confirming removes selected `enrollment` from `enrollment`s list
**Acceptance scenarios:** see ### US-6.4 under Acceptance Criteria

### US-6.5: Locked out if inauthenticated

**As any** unauthenticated user or user without a valid session
**I want to** be unable to do anything from US-6.1, US-6.2, US-6.3, and US-6.4
**So that** every student user's `enrollment`s are protected from unauthenticated actors

**Priority:** P2
**Independent test:** attempt US-6.1 and be rejected, attempt US-6.2 and be rejected, attempt US-6.3 and be rejected, attempt US-6.4 and be rejected
**Acceptance scenarios:** see ### US-6.5 under Acceptance Criteria

---

## Requirements

### Functional Requirements

- **FR-001**: A student user can only view and interact with their `enrollment`s if they are authenticated and have a valid `session`
- **FR-002**: A student user's `enrollment`s with the same `semesterId` **MUST** be grouped together into a single list view on `Semester.vue`
- **FR-003**: A student user's `enrollment`s with different `semesterId`s **MUST** be in separate list views on `Semester.vue`
- **FR-004**: A student user **MUST** be allowed to see the `enrollment`s it owns for a given semester on `Semester.vue`
- **FR-005**: A student user **MUST NOT** be allowed to see the `enrollment`s other student users own
- **FR-006**: A student user **MUST** be allowed to see the details of the `enrollment`s it owns
- **FR-007**: A student user **MUST NOT** be allowed to see the details of `enrollment`s other student users owns
- **FR-008**: A student user **MUST** be allowed to add `enrollment`s to its ownership
- **FR-009**: A student user **MUST** be allowed to remove `enrollment`s from its ownership
- **FR-010**: A student user **MUST NOT** be allowed to add `enrollment`s to other student users
- **FR-011**: A student user **MUST NOT** be allowed to remove `enrollment`s from other student users' ownership

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
| **Read scope**        | For student users only, the semester page loads a list of enrollments by route id (`GET /courseapi/enrollments/:userId/:semesterId`)                                                         |
| **Write scope**       | Enrollments cannot be manually edited since they consist of only foreign keys. They should be created and removed instead                                                                    |
| **Create scope**      | `POST /courseapi/enrollments/:userId/*` succeeds only when the row does not already exist and `:userId = req.user.id`.                                                                       |
| **Cross-user access** | Another user’s enrollment on read/create/delete → `404` `{ "message": "Cannot find Enrollment with userId=${userId}." }` (not `403`). Missing/invalid Bearer token on routes → `401`.        |
| **UI scope**          | `Semester.vue` shows the enrollments for `route.params.id`. Navigation to `Semester.vue` comes from signing into the application as a student.                                               |
| **Implementation**    | Enrollment operations already check for auth (`req.user.id`). Prefer a shared helper in `app/authorization/` for enrollment ownership rather than duplicating the check in every controller. |

---

## Key Entities

- **User**: registered account (name, id, role, email, password); owns enrollments.
- **Enrollment**: Entity collecting `semester.semesterId`, `section.sectionId`, and `user.id`; shows users what sections they're signed up for and when

---

## API Requirements

Mount prefix: `/courseapi`. Flat JSON (no `{ success, data }` envelope). Errors: `{ "message": "Human-readable explanation." }`. Authenticated writes send `Authorization: Bearer <token>`.

This feature uses the enrollments endpoints below (CUD sections and CUD semesters stay in other features).

| Method   | Endpoint                                                                   | Auth | Purpose                                                                                                                                         |
| -------- | -------------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/courseapi/enrollments/:userId/`                                          | Yes  | List the enrollments for the user where `:userId = req.user.id`                                                                                 |
| `POST`   | `/courseapi/enrollments/:userId/`                                          | Yes  | Add an `enrollment` to the user where `:userId = req.user.id`                                                                                   |
| `GET`    | `/courseapi/enrollments/:userId/semesters/:semesterId`                     | Yes  | List only the enrollments the user `:userId = req.user.id` and `:semesterId = req.semester.id`                                                  |
| `GET`    | `/courseapi/sections/:sectionId`                                           | Yes  | List the details of the `section` where `:sectionId = req.section.id`                                                                           |
| `DELETE` | `/courseapi/enrollments/:userId/semesters/:semesterId/sections/:sectionId` | Yes  | Remove the specified enrollment from the user where `:userId = req.user.id`, `:semesterId = req.semester.id`, and `:sectionId = req.section.id` |

**Unauthenticated write:** `401` `{ "message": "Unauthorized! No Auth Header" }` (or expired-token message).

### Load enrollment (`GET /courseapi/enrollments/:userId`)

**Success** (`200`): array with all enrollments for that user (frontend uses index `0`)

```json
[
  {
    "semesterId": "2",
    "sectionId": "CMSC-2011-91",
    "userId": 42
  },
  {
    "semesterId": "3",
    "sectionId": "CMSC-3023-02",
    "userId": 42
  }
]
```

**Server error:** `500` `{ "message": "…" }`.

### Add enrollment (`POST /courseapi/enrollments/:userId`)

**Request body** (fields the add request sends):

```json
{
  "semesterId": "2",
  "sectionId": "CMSC-2011-91",
  "userId": 42
}
```

Missing `semesterId`, `sectionId`, or `recipeId` → `400` bad request.
Duplicate combination of all three → `409` conflict.

**Success** (`200`): created `enrollment` row (includes `semesterId`, `sectionId`, and `recipeId`).

**Server error:** `500` `{ "message": "…" }`.

### Remove Enrollment (`DELETE /courseapi/enrollments/:userId/:semesterId/:sectionId`)

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

## Screen Requirements **CHECK THIS FIRST WHEN RETURNING**

Follow [ui-style-system.mdc](../.cursor/rules/ui-style-system.mdc). Primary labeled actions use class `oc-cta`. Icon-only row actions need `aria-label`s.

### [View: Edit Recipe] — route name `editRecipe`

- Path: `/recipe/:id` (`props: true`). View: `frontend/src/views/EditRecipe.vue`.
- Heading: **Edit Recipe**
- Reached from a signed-in user’s recipe card (pencil on the list).
- On load: `GET` recipe, recipe ingredients, catalog ingredients, and steps-with-ingredients. Local field edits do **not** call the API until a save/add/update/delete action.

**Recipe details card**

- Text field **Name** (`recipe.name`) — FR-001 / US-6.1
- Number field **Number of Servings** (`recipe.servings`, `type="number"`) — FR-002, FR-003 / US-6.2
- Number field **Time to Make (in minutes)** (`recipe.time`, `type="number"`) — FR-004, FR-005 / US-6.3
- Switch **Publish?** with label `Publish? Yes` or `Publish? No` from `recipe.isPublished` — FR-008 / US-6.4
- Textarea **Description** (`recipe.description`, multiple rows) — FR-006 / US-6.5
- Description resize: vertical grab on the bottom-right resizer changes height; horizontal drag does not widen the box — FR-007 / US-6.6
- Client whole-number check for servings and time: non-integer input is cleared and the user sees **"Please enter a whole number."**; no API request — US-6.2 / US-6.3
- Primary action: **Update Recipe** (`oc-cta`) — FR-009 / US-6.7
- Success snackbar: `${recipe.name} updated successfully!`; remain on the edit page and reload the recipe
- Failure: snackbar shows the API `{ message }`; stay on the edit page

**Ingredients card** (below recipe details)

- Heading: **Ingredients**
- Primary action: **Add** (`oc-cta`)
- Each row: quantity, unit (plural `s` when quantity > 1), ingredient name, price `($pricePerUnit/unit)`, pencil icon, trash icon
- Icon actions: `aria-label` **Edit ingredient**, **Delete ingredient**
- **Empty state:** empty list; **Add** remains available so the user can add an ingredient
- Viewing the list does not send a new request after the initial page load

**Add / Edit Ingredient dialog** (`v-dialog`, persistent)

- Titles: **Add Ingredient** / **Edit Ingredient**
- Fields: **Quantity** (`type="number"`), **Ingredients** select (catalog `item-title="name"`, return object)
- Quantity: numeric values stay in the field; `NaN` is cleared on blur/enter; no API until confirm
- Confirm: **Add Ingredient** or **Update Ingredient** (`oc-cta`)
- Dismiss: **Close** (closes the dialog without saving; no API request)
- Success snackbar: `Ingredient added successfully!` or `${ingredient.name} updated successfully!`
- Error snackbar: API `{ message }`

**Delete ingredient**

- Trash icon immediately calls `DELETE` (no confirm dialog in the current UI)
- Success snackbar: `${ingredient.name} deleted successfully!`
- Error snackbar: API `{ message }`

**Steps card**

- Heading: **Steps**
- Primary action: **Add** (`oc-cta`)
- Table columns: step number, instruction, ingredient chips, edit icon, delete icon
- Rows ordered by `Number` (`stepNumber`) ascending, including duplicates next to each other — US-6.14
- Icon actions: `aria-label` **Edit step**, **Delete step**
- **Empty state:** empty table; **Add** remains available

**Add / Edit Step dialog** (`v-dialog`, persistent)

- Titles: **Add Step** / **Edit Step**
- Fields: **Number** (`type="number"`), **Instruction** (textarea), **Ingredients** multi-select from this recipe’s ingredients (optional)
- Number: integers stay in the field; `NaN` is cleared on blur/enter; empty Instruction stays empty; no API until confirm
- Confirm: **Add Step** or **Update Step** (`oc-cta`)
- Dismiss: **Close**
- Success snackbar: `Step added successfully!` / `Step updated successfully!`
- Error snackbar: API `{ message }`
- After a successful step create/update, selected recipe ingredients are `PUT` with `recipeStepId` set

**Delete step**

- Trash icon immediately calls `DELETE`
- Success snackbar: `Step deleted successfully!`
- Error snackbar: API `{ message }`

**Loading / error**

- Initial fetches run on mount. Request failures that return `{ message }` show in a `v-snackbar` (error color). There is no separate skeleton layout on this view.

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

- `User` hasMany `enrollments`; `enrollment` belongsTo `User`

---

## Acceptance Criteria (Gherkin)

### US-6.1 — Edit Recipe Name

#### Scenario: User edits recipe name

- **Given** I am on the edit recipe page
- **When** I view the `Recipe Name` text input
- **And** I change the recipe name
- **Then** the text input stores the potential new name
- **And** no API request is sent

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
