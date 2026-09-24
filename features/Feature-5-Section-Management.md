# Feature: Section Management

**Feature ID:** 5
**Branch pattern:** `feature/5-Section-Management`
**Status:** Ready
**Created:** 2026-09-23
**Input:** Admins can create, edit, list, filter, and remove course sections. Students cannot use section management.
**Depends on:** Feature 1 user authentication and roles (session and `role` must already exist)
**Related:** `features/reference/api.md`, `features/reference/data-model.md`, `features/reference/behavior.md`

---

## User Stories

### US-5.1: Add Section

**As a** Admin
**I want to** create new sections for courses
**So that** students can enroll

**Priority:** P1
**Independent test:** From the Section Management screen, an admin can add a new section and sees it in the list.
**Acceptance scenarios:** see ### US-5.1 under Acceptance Criteria

### US-5.2: Edit Section

**As a** Admin
**I want** to update and change sections for a course
**So that** any changes can be made and errors corrected

**Priority:** P1
**Independent test:** From the Section Management screen, an admin can modify an existing section and the changes appear in the list.
**Acceptance scenarios:** see ### US-5.2 under Acceptance Criteria

### US-5.3: Remove Section

**As a** Admin
**I want to** remove outdated and unused sections
**So that** those sections no longer appear

**Priority:** P2
**Independent test:** From the Section Management screen, delete a section, then confirm it no longer appears in the list and cannot be enrolled in.
**Acceptance scenarios:** see ### US-5.3 under Acceptance Criteria

### US-5.4: List & Filter Sections

**As an** Admin
**I want to** view and filter sections by course, faculty, day, room, and time
**So that** I can quickly find and manage relevant sections

**Priority:** P1
**Independent test:** From the Section Management screen, apply filters and confirm only matching sections are shown.
**Acceptance scenarios:** see ### US-5.4 under Acceptance Criteria

---



## Requirements



### Functional Requirements

- **FR-001**: Admins can create a section with `courseId`, `dayOfWeek`, `roomNum`, `timeStart`, `timeEnd`, and `facultyId`.
- **FR-002**: `sectionId` MUST follow the format `AAAA-####-##` for example `CMSC-1111-01`.
- **FR-003**: Admins can edit any section fields except `sectionId`.
- **FR-004**: Admins can delete any section.
- **FR-005**: Listing sections must show course, faculty, time, and room.
- **FR-006**: Only a signed-in user whose `role` is `admin` can call the section management API or open the Section Management screen. A signed-in student MUST receive **403** message "Access denied". A missing or invalid session MUST receive **401** message "Unauthorized!".
- **FR-007**: `timeStart` MUST be earlier than `timeEnd`. Otherwise **400** message "Time start must be less than time end".
- **FR-008**: The system MUST reject the creation of a section that has the same `facultyId`  as another on the same `dayOfWeek` and the same `timeStart` `timeEnd`. Response **400** message: "Faculty is already taken for this time".
- **FR-009**: The system MUST reject the creation of a section that has the same `roomNum` - **FR-008**: The system MUST reject the creation of a section that has the same `facultyId`  as another on the same `dayOfWeek` and the same `timeStart` `timeEnd`. Response **400** message "Room is already taken for this time".

---

## Assumptions

- Courses and faculty already exist and are managed outside this feature.
- Feature 1 already authenticates users, stores a session token, and returns `role` (`admin` or `student`).
- This feature checks that session. It does not implement login, logout, or registration.
- Section management is only for admins. Students enroll through a later enrollment feature.
- The app framework exists (`/courses` mount, Bearer token, Vue router).

---

## Edge Cases

- Creating or updating a section with a `courseId` that does not exist returns **400** the message would be "Course does not exist".
- Creating or updating a section with a `facultyId` that does not exist returns **400** the message would be "Faculty does not exist".
- `timeStart` that is not earlier than `timeEnd` returns **400** the message would be "Time start must be less than time end".
- A missing `courseId` or `dayOfWeek` returns **400** with one message for that field "{field} is required. for example the message could be "courseId is required".
- A faculty member already scheduled at an overlapping time on the same day returns **400** the message would be "Faculty is already taken for this time".
- A room already scheduled at an overlapping time on the same day returns **400** the message would be "Room is already taken for this time".
- A signed-in non-admin like student calling any section endpoint returns **403** the message would be "Access denied".
- Deleting or updating a `sectionId` that does not exist returns **400** the message would be "Section does not exist".

---


## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: Admins are able to create valid sections.
- **SC-003**: Admins are able to see sections in a filtered list.
- **SC-004**: Admins are able to edit sections and the changed values appear in the list.
- **SC-005**: Admins are able to filter sections by `courseId`, `dayOfWeek`, `roomNum`, `timeStart`, `timeEnd`, and `facultyId`.
- **SC-006**: Admins are able to delete sections and they disappear from the list.
- **SC-007**: Only admins can access the section management API. Students receive **403**.

---



## Data Ownership & Isolation

Feature 5 owns `sections`. It reads `courses` and `faculty` to validate foreign keys. It reads the Feature 1 session and user `role`. It does not create or own `users` or `sessions`.


| Rule               | Requirement                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Who may call**   | `role = admin` after a valid Bearer session                                                                        |
| **Read scope**     | Admins may list and filter every section. Students may not.                                                        |
| **Write scope**    | Admins may create, update, and delete any section. Students may not.                                               |
| **Create scope**   | New rows are not owned by the caller. `sectionId` is generated as `AAAA-####-##`.                                   |
| **Student access** | Signed-in student → **403** `{ "message": "Access denied." }`                                                      |
| **No session**     | Missing or invalid token → **401** `{ "message": "Unauthorized!" }`                                                |
| **UI scope**       | Section Management route is admin-only. Students and signed-out users never see the management form.               |
| **Implementation** | `authenticate` then `requireAdmin` from `app/authorization/`. Do not duplicate the role check in every controller. |


---

## Key Entities

- **Section:** A scheduled offering of a course, tied to a faculty member, room, day, and time.
- **Course:** Existing entity from Course Management; referenced by `courseId`.
- **Faculty:** Existing entity from Faculty Management; referenced by `facultyId`.
- **User / session:** Existing Feature 1 entities. This feature only reads `role` and the Bearer token. It does not store passwords or sessions on a section.

---

## API Requirements

All routes mount under `/courses`. Auth is `Authorization: Bearer <token>` from Feature 1. Every route below requires an admin session.


| Method   | Endpoint                   | Auth  | Purpose                         |
| -------- | -------------------------- | ----- | ------------------------------- |
| `GET`    | `/courses/sections`            | Admin | List sections; optional filters |
| `POST`   | `/courses/sections`            | Admin | Create a section                |
| `PUT`    | `/courses/sections/:sectionId` | Admin | Update a section                |
| `DELETE` | `/courses/sections/:sectionId` | Admin | Delete a section                |


**List query (all optional):** `courseId`, `facultyId`, `dayOfWeek`, `roomNum`, `timeStart`, `timeEnd`.  
Only sections that match every provided filter are returned. No filters returns every section.

**Create / update request body:**

```json
{
  "courseId": "CMSC-1111",
  "dayOfWeek": "Monday",
  "roomNum": "A12",
  "timeStart": "09:00:00",
  "timeEnd": "10:15:00",
  "facultyId": 1112233
}
```

Update uses the same body. `sectionId` is not accepted in the body.

**Success — create (**`201`**) and update (**`200`**):**

```json
{
  "sectionId": "CMSC-1111-01",
  "courseId": "CMSC-1111",
  "dayOfWeek": "Monday",
  "roomNum": "A12",
  "timeStart": "09:00:00",
  "timeEnd": "10:15:00",
  "facultyId": 1112233
}
```

The next `##` is the next unused two-digit number for that `courseId` (`01`, `02`, …).

**Success — list (**`200`**):** an array of the same section objects. Each item is enough to show course (`courseId`), faculty (`facultyId`), time (`timeStart`–`timeEnd`), and room (`roomNum`).

**Success — delete (**`200`**):** `{ "message": "Section deleted." }`

**Error response:** `{ "message": "..." }`


| Status | When                                      | Message                                                                                                |
| ------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `400`  | Missing field                             | `courseId is required.` (same pattern for `dayOfWeek`, `roomNum`, `timeStart`, `timeEnd`, `facultyId`) |
| `400`  | Unknown course                            | `Course does not exist.`                                                                               |
| `400`  | Unknown faculty                           | `Faculty does not exist.`                                                                              |
| `400`  | `timeStart` is not before `timeEnd`       | `Time start must be less than time end.`                                                               |
| `400`  | Same faculty, same day, overlapping times | `Faculty is already taken for this time.`                                                              |
| `400`  | Same room, same day, overlapping times    | `Room is already taken for this time.`                                                                 |
| `400`  | Update or delete of unknown `sectionId`   | `Section does not exist.`                                                                              |
| `401`  | No token or invalid session               | `Unauthorized!`                                                                                        |
| `403`  | Signed-in user is not `admin`             | `Access denied.`                                                                                       |

Overlap means the time ranges share any minute on the same `dayOfWeek`. A section does not overlap itself on update.

---

## Screen Requirements

### View: Section Management — route name `sectionManagement`

- Path: `/sections`
- Heading: **Section Management**
- Visible in the nav only when the stored user `role` is `admin`.
- Signed-out visitors are redirected to the Feature 1 login route. This screen does not contain email, password, **Login**, **Logout**, or **Create Account**.
- A signed-in student who opens `/sections` sees `<v-alert type="error">Access denied.</v-alert>` and no form.

**Filters**

- Fields: **Course**, **Faculty**, **Day**, **Room**, **Time start**, **Time end**
- Primary action: **Apply Filters** (`oc-cta`)
- **Empty state:** `No sections match these filters.`

**List**

- Columns: Course, Faculty, Day, Room, Time start, Time end, Section ID
- Row actions: **Edit** (`aria-label`: **Edit section**), **Delete** (`aria-label`: **Delete section**)

**Add / Edit dialog**

- **Add Section** opens the dialog (`oc-cta`).
- Fields: Course, Faculty, Day, Room, Time start, Time end
- Save label: **Save**
- `sectionId` is shown after create and is not editable
- **Loading:** progress while the request is in flight
- **Error:** `<v-alert type="error">` with the API `message`

---

## Data Model Requirements

This feature **owns** `sections`. It **reads** `courses`, `faculty`, and the Feature 1 `users` / `sessions` tables. It does not store passwords, tokens, or login identifiers on a section.

### `sections` table


| Field       | Type       | Rules                                              |
| ----------- | ---------- | -------------------------------------------------- |
| `sectionId` | STRING PK  | Required; not auto-increment; format `AAAA-####-##` |
| `courseId`  | STRING FK  | Required; references `courses.courseId`            |
| `dayOfWeek` | STRING     | Required                                           |
| `roomNum`   | STRING     | Required; Max char is 7                            |
| `timeStart` | TIME       | Required; must be earlier than `timeEnd`           |
| `timeEnd`   | TIME       | Required                                           |
| `facultyId` | INTEGER FK | Required; references `faculty.facultyId`           |

### Associations

- `Course` hasMany `Section`
- `Section` belongsTo `Course`
- `Faculty` hasMany `Section`
- `Section` belongsTo `Faculty`

---

## Acceptance Criteria (Gherkin)

### US-5.1 — Add Section

#### Scenario: Admin creates a valid section

- **Given** I am signed in as an admin
- **And** course `CMSC-1111` exists
- **And** faculty `1112233` exists
- **And** I am on the Section Management page
- **When** I enter course `CMSC-1111`, faculty `1112233`, day `Monday`, room `HSH 212`, time start `09:00:00`, and time end `10:15:00`
- **And** I press **Save**
- **Then** the API returns `201`
- **And** the new section id is `CMSC-1111-01`
- **And** the section appears in the list



#### Scenario: Missing required field

- **Given** I am signed in as an admin
- **When** I create a section without `courseId`
- **Then** the API returns `400` with the message "courseId is required"
- **And** no section is created

#### Scenario: Course does not exist

- **Given** I am signed in as an admin
- **And** course `CMSC-9999` does not exist
- **When** I create a section with course `CMSC-9999` and valid fields
- **Then** the API returns `400` with the message "Course does not exist"

#### Scenario: Faculty does not exist

- **Given** I am signed in as an admin
- **And** faculty `1112233` does not exist
- **When** I create a section with faculty `1112233` and valid fields
- **Then** the API returns `400` with the message "Faculty does not exist."

#### Scenario: Time start is not before time end

- **Given** I am signed in as an admin
- **When** I create a section with time start `11:00:00` and time end `10:00:00`
- **Then** the API returns `400` with the message "Time start must be less than time end."

#### Scenario: Faculty is already taken

- **Given** I am signed in as an admin
- **And** faculty `1112233` already has a Monday section from `09:00:00` to `10:15:00`
- **When** I create another Monday section for faculty `1112233` from `10:00:00` to `11:00:00`
- **Then** the API returns `400` with the message "Faculty is already taken for this time."

#### Scenario: Room is already taken

- **Given** I am signed in as an admin
- **And** room `HSH 212` already has a Monday section from `09:00:00` to `10:15:00`
- **When** I create another Monday section in room `NSW 102` from `10:00:00` to `11:00:00`
- **Then** the API returns `400` with the message "Room is already taken for this time."

### US-5.2 — Edit Section

#### Scenario: Admin updates a section

- **Given** I am signed in as an admin
- **And** section `CMSC-1111-01` exists in room `NSW 201`
- **When** I change the room to `NSW 202` and press **Save**
- **Then** the API returns `200`
- **And** the list shows room `NSW 202` for `CMSC-1111-01`

#### Scenario: Update a missing section

- **Given** I am signed in as an admin
- **And** section `CMSC-1111-99` does not exist
- **When** I send `PUT /courses/sections/CMSC-1111-99` with a valid body
- **Then** the API returns `400` with the message "Section does not exist."

### US-5.3 — Remove Section

#### Scenario: Admin deletes a section

- **Given** I am signed in as an admin
- **And** section `CMSC-1111-01` is in the list
- **When** I press **Delete** for `CMSC-1111-01`
- **Then** the API returns `200`
- **And** `CMSC-1111-01` no longer appears in the list

#### Scenario: Delete a missing section

- **Given** I am signed in as an admin
- **And** section `CMSC-1111-99` does not exist
- **When** I send `DELETE /courses/sections/CMSC-1111-99`
- **Then** the API returns `400` with the message "Section does not exist."

### US-5.4 — List & Filter Sections

#### Scenario: Admin sees course, faculty, time, and room

- **Given** I am signed in as an admin
- **And** section `CMSC-1111-01` exists for faculty `1112233` in room `HSH 212` from `09:00:00` to `10:15:00`
- **When** I open Section Management
- **Then** the list shows course `CMSC-1111`, faculty `1112233`, room `HSH 212`, time start `09:00:00`, and time end `10:15:00`

#### Scenario: Filter sections

- **Given** I am signed in as an admin
- **And** one Monday section exists in room `HSH 212`
- **And** one Wednesday section exists in room `HSH 212`
- **When** I filter by day `Monday` and press **Apply Filters**
- **Then** only the Monday section is shown

#### Scenario: Student cannot access section management

- **Given** I am signed in as a student
- **When** I request `GET /courses/sections`
- **Then** the API returns `403` with the message "Access denied."
- **And** the Section Management page shows **Access denied.**

---

## Test Coverage Map

Each scenario above must map to at least one automated test.


| Story  | Scenario                                   | Test file                                  | Test name                                    |
| ------ | ------------------------------------------ | ------------------------------------------ | -------------------------------------------- |
| US-5.1 | Admin creates a valid section              | `backend/tests/sections.test.js`           | `Admin creates a valid section`              |
| US-5.1 | Admin creates a valid section              | `frontend/tests/SectionManagement.test.js` | `Admin creates a valid section`              |
| US-5.1 | Missing required field                     | `backend/tests/sections.test.js`           | `Missing required field`                     |
| US-5.1 | Course does not exist                      | `backend/tests/sections.test.js`           | `Course does not exist`                      |
| US-5.1 | Faculty does not exist                     | `backend/tests/sections.test.js`           | `Faculty does not exist`                     |
| US-5.1 | Time start is not before time end          | `backend/tests/sections.test.js`           | `Time start is not before time end`          |
| US-5.1 | Faculty is already taken                   | `backend/tests/sections.test.js`           | `Faculty is already taken`                   |
| US-5.1 | Room is already taken                      | `backend/tests/sections.test.js`           | `Room is already taken`                      |
| US-5.2 | Admin updates a section                    | `backend/tests/sections.test.js`           | `Admin updates a section`                    |
| US-5.2 | Admin updates a section                    | `frontend/tests/SectionManagement.test.js` | `Admin updates a section`                    |
| US-5.2 | Update a missing section                   | `backend/tests/sections.test.js`           | `Update a missing section`                   |
| US-5.3 | Admin deletes a section                    | `backend/tests/sections.test.js`           | `Admin deletes a section`                    |
| US-5.3 | Admin deletes a section                    | `frontend/tests/SectionManagement.test.js` | `Admin deletes a section`                    |
| US-5.3 | Delete a missing section                   | `backend/tests/sections.test.js`           | `Delete a missing section`                   |
| US-5.4 | Admin sees course, faculty, time, and room | `frontend/tests/SectionManagement.test.js` | `Admin sees course, faculty, time, and room` |
| US-5.4 | Filter sections                            | `backend/tests/sections.test.js`           | `Filter sections`                            |
| US-5.4 | Filter sections                            | `frontend/tests/SectionManagement.test.js` | `Filter sections`                            |
| US-5.4 | Student cannot access section management   | `backend/tests/sections.test.js`           | `Student cannot access section management`   |
| US-5.4 | Student cannot access section management   | `frontend/tests/SectionManagement.test.js` | `Student cannot access section management`   |


---



## Test traceability

Tests must link back to this spec in three layers:

```text
feature-5-Section-Management.md
  └── US-5.1 — Add Section
        └── Scenario: Admin creates a valid section
              └── backend/tests/sections.test.js → it("Admin creates a valid section")
  └── US-5.2 — Edit Section
        └── Scenario: Admin updates a section
              └── backend/tests/sections.test.js → it("Admin updates a section")
  └── US-5.3 — Remove Section
        └── Scenario: Admin deletes a section
              └── backend/tests/sections.test.js → it("Admin deletes a section")
  └── US-5.4 — List & Filter Sections
        └── Scenario: Student cannot access section management
              └── backend/tests/sections.test.js → it("Student cannot access section management")
        └── Scenario: Unsigned request is rejected
              └── backend/tests/sections.test.js → it("Unsigned request is rejected")
```



### File header

Every Feature 5 test file starts with:

```javascript
/**
 * Feature 5 — Section Management
 * Spec: features/feature-5-Section-Management.md
 */
```

Harness-only files (`app.test.js`, `App.test.js`) are exempt — they verify the test setup, not product behavior.

### Nested `describe` blocks

```javascript
describe("Feature 5 — Section Management", () => {
  describe("US-5.1 — Add Section", () => {
    it("Admin creates a valid section", async () => { /* … */ });
    it("Missing required field", async () => { /* … */ });
  });

  describe("US-5.4 — List & Filter Sections", () => {
    it("Student cannot access section management", async () => { /* … */ });
    it("Unsigned request is rejected", async () => { /* … */ });
  });
});
```

- **Outer** `describe` — feature name (matches spec title).
- **Inner** `describe` — `US-5.n` + story title (matches AC `###` heading).
- `it` **name** — exact Gherkin **Scenario** title from this spec.



## Agent implementation request

Copy when asking Cursor to implement this feature (`@` this file):

```text
Implement Feature 5 from @features/feature-5-Section-Management.md on branch `feature/5-Section-Management`.

Follow layer order in @features/framework.md (models → routes → backend tests → frontend → frontend tests).
Follow Test Traceability in this spec (file headers, nested describe blocks, exact Scenario it names).
Map every Gherkin scenario in the Test Coverage Map; run `npm test` before finishing.
Section routes require an existing Feature 1 admin session (`authenticate` + `requireAdmin`). Do not implement login, logout, registration, or password storage in this feature.
If API routes, payloads, schema, or product rules changed per this spec, update @features/reference/courses.md, @features/reference/data-model.md, and/or @features/reference/behavior.md in the same PR to match shipped code.
Complete Definition of Done and the merge checklist in @features/framework.md.
Do not implement behavior not in this spec.
```

**Reference updates for this feature:** `features/reference/data-model.md`, `features/reference/courses.md`, `features/reference/behavior.md`

---



## Definition of Done

- [ ] Backend and frontend implemented per this spec (**FR-001** through **FR-009** satisfied)
- [ ] **Success Criteria (SC-001** through **SC-007)** met
- [ ] All mapped tests pass (`npm test`)
- [ ] Test Coverage Map complete
- [ ] Test traceability (file headers, nested `describe` / `it`, audit commands in this spec)
- [ ] `features/reference/data-model.md` updated (if schema changed)
- [ ] `features/reference/courses.md` updated (if API changed)
- [ ] `features/reference/behavior.md` updated (if product rules changed)

---



## Out of Scope

- Login, logout, stay signed in, and create account (Feature 1)
- Password reset and password hashing
- Course create / edit / delete
- Faculty create / edit / delete
- Student enrollment in a section

