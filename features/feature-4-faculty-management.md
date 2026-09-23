# Feature: User Authentication & Session Management

**Feature ID:** {Number}
**Branch pattern:** `feature/#-short-name`
**Status:** {Draft | Ready | Shipped}
**Created:** 2026-09-22
**Input:** Manage faculty

---

## User Stories

### US-4.1: Add Faculty 

**As a** admin
**I want to** add a faculty member 
**So that** faculty members can be added to sections

**Priority:** P2
**Independent test:** New faculty first and last name, university_id, and department is added to the `faculty table` in the database
**Acceptance scenarios:** see ### US-4.1 under Acceptance Criteria

### US-4.2: Edit Faculty 
**As a** admin
**I want to** edit a selected faculty member
**So that** I can change any information of a faculty member in the database

**Priority:** P2
**Independent test:** Changing selected faculty member information in a modal and when finished the record is updated in the `faculty table`
**Acceptance scenarios:** see ### US-4.2 under Acceptance Criteria

### US-4.3: Delete Faculty  
**As a** admin
**I want to** remove faculty 
**So that** faculty no longer availabe are removed

**Priority:** P2
**Independent test:** Clicking the delete button removes the faculty member from the database and updates the faculty list
**Acceptance scenarios:** see ### US-4.3 under Acceptance Criteria

### US-4.4: List Facutly
**As a** admin
**I want to** view all faculty
**So that** I can manage all faculty by updating or deleting faculty members

**Priority:** P2
**Independent test:** On loading the faculty vue page all currently added faculty are listed with edit and delete icons
**Acceptance scenarios:** see ### US-4.4 under Acceptance Criteria
---

## Requirements

### Functional Requirements

- **FR-001**: System **MUST** add new faculty members to the `faculty table` when a new faculty is added
- **FR-002**: System **MUST** update seleccted faculty member in the `faculty table` when the selected faculty has been changed
- **FR-003**: System **MUST** delete selected faculty member from the `faculty table` when user presses the faculty delete button
- **FR-004**: System **MUST** allow user to add faculty first name and last name when adding a new faculty
- **FR-005**: System **MUST** allow user to input faculty university id
- **FR-006**: System **MUST** allow user to input faculty department
- **FR-007**: System **MUST** allow user to edit faculty first name and last name when adding a new faculty
- **FR-008**: System **MUST** allow user to edit faculty university id
- **FR-009**: System **MUST** allow user to edit faculty department
- **FR-010**: System **MUST** list all faculty in the table in order by last name
---

## Assumptions

- Feature 1 - `Auth`, Feature 2 - `Semester Management`, and Feature 3 - `Course Management` are already finished
- `MenuBar` with sign in and sign out are already added and can be used from Feature 1 - `Auth`
- Do not add anything that is out of scope like data filters, separate vue pages, or extra tables in the database besides what is mentioned `## Data Ownership & Isolataion`

## Edge Cases

- PUT or Add faculty with the same id --> `400`
- PUT or POST with incorrect database types --> `500`
- PUT or POST with no inputted values --> `400`
- GET, POST, PUT, DELETE as a student --> `401`

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge
- **SC-002**: Admin can add new faculty with the correct data to the `faculty-table`
- **SC-003**: Admin can edit any faculty data and update the `faculty-table`
- **SC-004**: Admin can delete any faculty from the `faculty-table`
- **SC-005**: Students can not view faculty vue web page
- **SC-006**: Students can not add, edit, or delete faculty
- **SC-007**: npm test passes for `faculty.test.js`

---

## Data Ownership & Isolation


| Rule | Requirement |
|------|-------------|
| **Read scope** | `GET /todo/lists` returns only lists where `userId = req.user.id`. |
| **Write scope** | `PUT` and `DELETE` apply only when the list row matches both `id` and `req.user.id`. |
| **Create scope** | New lists are always owned by the authenticated user. |
| **Cross-user access** | If a list belongs to another user, respond with `404` — never `403` (do not confirm the list exists). |
| **UI scope** | The lists view shows only lists returned by `GET /todo/lists` for the signed-in user. |
| **Implementation** | Use a shared helper (e.g. `getAccessibleListOrNull(req, listId)`) in `app/authorization/` — do not duplicate scope logic in controllers. |

---

## API Requirements

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `GET` | `/faculty` | Yes | Retrieve all faculty |
| `POST` | `/faculty` | Yes | Create a new faculty |
| `PUT` | `/faculty/:facultyId` | Yes | Update a faculty with specified facultyId |
| `DELETE` | `/faculty/:facultyId` | Yes | Delete a faculty with specified facultyId |


**Create/Update faculty request body:**
```json
{ "universityId":"1112233", "fname": "John", "lname": "Doe", "dept":"Computer Science" }
```

**Faculty success response** (`200` / `201`):
```json
{
  "universityId": 1112233,
  "fname": "John",
  "lname": "Doe,
  "dept":"Computer Science",
  "createdAt": "2026-07-02T12:00:00.000Z",
  "updatedAt": "2026-07-02T12:00:00.000Z"
}
```

**Error response:** `{ "message": "Human-readable explanation." }` with appropriate HTTP status.  
**Not found:** `404` (do not use `403`).

---

## Screen Requirements

### [View: Application Dashboard] — route name `Faculty`
(`Dashboard.vue`) — no sidebar / main-panel split.

**Lists view (this feature)**
*   Heading: **Faculty**
*   Primary action: **+ New Faculty** opens a `<v-dialog>` with a name `<v-text-field>` and **Create** / **Cancel**. Use class `oc-cta` on **Create** and **+ New List** (per [ui-style-system.mdc](../../.cursor/rules/ui-style-system.mdc)).
*   Display owned lists as rows (e.g. `<v-list>` or table): each row shows the **Faculty fname, lname, dept** and icon actions:
    *   **Edit** icon — opens rename `<v-dialog>` pre-filled with current fname, lname, and dept; **Save** / **Cancel**
    *   **Delete** icon — opens confirmation `<v-dialog>`
    *   *(Feature 5 handles which faculty own which course sections)*
*   Icon-only row actions use `size="small"` and accessible `aria-label`s (**Edit list**, **Delete list**).
*   **Empty state:** **"No lists yet. Create your first list."** when the user has zero lists.
*   **Loading state:** skeleton or progress indicator while lists are fetching.
*   **Error state:** `<v-alert type="error">` for API failures.

**App chrome**
*   Introduce `MenuBar` in this feature (not present in Feature 1): signed-in user's name and **Sign out**.
*   `MenuBar` is hidden on login and register routes.

**Implementation note:** one route/view for lists; list CRUD dialogs are child components or inline `<v-dialog>` blocks in `Dashboard.vue` unless the team splits presentational dialogs later.

---

## Key Entities

- **User**: registered account (name, email, username, role); owns future lists and todos.
- **Session**: server-side record tying a JWT token to a user; expires after 24 hours.

---



## Data Model Requirements
### Look under ./backend/app/models/(file name).js
- This shows the table you will need to model

## VVV Example table (Change or Delete) VVV
### `users` table


| Field      | Type        | Rules                              |
| ---------- | ----------- | ---------------------------------- |
| `id`       | INTEGER PK  | Auto-increment                     |
| `fName`    | STRING      | Required                           |
| `lName`    | STRING      | Required                           |
| `email`    | STRING      | Required, unique                   |
| `username` | STRING(100) | Required, unique; stored lowercase |
| `password` | STRING(255) | Required; bcrypt hash only         |
| `role`     | STRING(20)  | Default `worker`                   |

## ^^^ (Change or Delete) ^^^

---

## Acceptance Criteria (Gherkin)



### US-1.1 — {Related Functional Requirement}



#### Scenario: {What is happening or has happend}

- **Given** {Where are you on the website?}
- **When** {Main action?}
- **And** {What additional action did you take?}
- **Then** {Website response}
- **And** {additional response}
- **And** 
- **etc...** 


## VVV Example AC (Change or Delete) VVV
#### Scenario: User submits registration with missing email

- **Given** I am on the registration page
- **When** I leave the email field empty
- **And** I submit the form
- **Then** inline validation blocks the request
- **And** I see the message **"Email is required."**
- **And** no API request is sent
## ^^^ (Change or Delete) ^^^

---



### US-N.2 — {Related Functional Requirement}



#### Scenario: 

- **Given** 
- **And** 
- **When** 
- **And** 
- **Then** 
- **And** 
- **And**
- **And** 

---

### etc...
