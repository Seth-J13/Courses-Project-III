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
*   Icon-only row actions use `size="small"` and accessible `aria-label`s (**Edit Faculty**, **Delete Faculty**).
*   **Empty state:** **"No faculty yet. Add your faculty member."** when the admin has zero faculty.
*   **Loading state:** skeleton or progress indicator while faculty are fetching.
*   **Error state:** `<v-alert type="error">` for API failures.

**Implementation note:** one route/view for faculty; faculty CRUD dialogs are child components or inline `<v-dialog>` blocks in `Dashboard.vue` unless the team splits presentational dialogs later.

---

## Key Entities

- **User**: registered account (name, email, username, role); role must be admin to view page
- **Session**: server-side record tying a JWT token to a user; expires after 24 hours.

---

## Data Model Requirements
### `faculty` table


| Field          | Type        | Rules                              |
| -------------- | ----------- | ---------------------------------- |
| `universityId` | INTEGER PK  | NOT NULL, POSITIVE INT, MINIMUM 7 DIGITS, UNIQUE, Required |
| `fName`        | STRING      | Required                           |
| `lName`        | STRING      | Required                           |
| `dept`         | STRING(255) | Required         |

---

## Acceptance Criteria (Gherkin)
### US-4.1 — Add Faculty

#### Scenario: Admin clicks the add faculty button

- **Given** I am a admin and on the faculty page
- **When** I click the `Add` faculty button
- **Then** a modal pops up to allow me to enter data
- **And** no API request is sent

#### Scenario: Admin inputs faculty first name with correct values

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Add` faculty button
- **When** I input a correct value into the first name input text
- **Then** the input text reflects the change I made
- **And** no API request is sent

#### Scenario: Admin inputs faculty first name with incorrect values

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Add` faculty button
- **When** I input a incorrect value into the first name input text
- **Then** the input text reflects the change I made
- **And** no API request is sent


#### Scenario: Admin inputs faculty last name with correct values

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Add` faculty button
- **When** I input a correct value into the last name input text
- **Then** the input text reflects the change I made
- **And** no API request is sent

#### Scenario: Admin inputs faculty last name with incorrect values

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Add` faculty button
- **When** I input a incorrect value into the last name input text
- **Then** the input text reflects the change I made
- **And** no API request is sent

#### Scenario: Admin inputs faculty department with correct values

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Add` faculty button
- **When** I input a correct value into the department name input text
- **Then** the input text reflects the change I made
- **And** no API request is sent

#### Scenario: Admin inputs faculty department with incorrect values

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Add` faculty button
- **When** I input a incorrect value into the department name input text
- **Then** the input text reflects the change I made
- **And** no API request is sent

#### Scenario: Admin clicks the `Add Faculty` button with correct inputted values

- **Given** I am a admin on the faculty page
- **When** I have clicked the `Add Faculty` button
- **Then** the API returns `200` with a payload containing `universityId`, `fname`, `lname`, and `dept`
- **And** the add modal closes and the faculty list refreshes to show all faculty

#### Scenario: Admin clicks the `Add Faculty` button with incorrect inputted values

- **Given** I am a admin on the faculty page
- **When** I have clicked the `Add Faculty` button
- **Then** the API returns `400` with `{"message": "Invalid faculty information"}`
- **And** I remain on the add modal 
- **And** a error notification pops up for 5 seconds saying `Cannot add faculty`

#### Scenario: Admin clicks the `Cancel` button

- **Given** I am a admin on the faculty page
- **When** I have clicked the `Cancel` button
- **Then** input texts are cleared and the add modal closes 
- **And** no API request is sent


### US-4.2 — Edit Faculty 

#### Scenario: Admin clicks the `Edit` icon button on a faculty record

- **Given** I am a admin on the faculty page
- **When** I have clicked the `Edit` icon button on a specific faculty in the faculty list
- **Then** a edit modal pops up with the `first name`, `last name`, and `department` filled out with the selected faculty's info
- **And** no API request is sent


#### Scenario: Admin edits the faculty's `first name` text input

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Edit` icon button on a specific faculty in the faculty list
- **When** I edit the `first name` text input 
- **Then** `first name` text input reflects the new inputted value
- **And** no API request is sent

#### Scenario: Admin edits the faculty's `last name` text input

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Edit` icon button on a specific faculty in the faculty list
- **When** I edit the `last name` text input 
- **Then** `last name` text input reflects the new inputted value
- **And** no API request is sent

#### Scenario: Admin edits the faculty's `department` text input

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Edit` icon button on a specific faculty in the faculty list
- **When** I edit the `department` text input 
- **Then** `department` text input reflects the new inputted value
- **And** no API request is sent

#### Scenario: Admin clicks the `Update Faculty` button with correct inputted values

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Edit` icon button on a specific faculty in the faculty list
- **When** I click the `Update Faculty` button with correct inputted values
- **Then** the API returns `200` with a payload containing `universityId`, `fname`, `lname`, and `dept`
- **And** the edit modal closes and the faculty list refreshes to show all faculty

#### Scenario: Admin clicks the `Update Faculty` button with incorrect inputted values

- **Given** I am a admin on the faculty page
- **And** I have clicked the `Edit` icon button on a specific faculty in the faculty list
- **When** I have clicked the `Update Faculty` button with incorrect inputted values
- **Then** the API returns `400` with `{"message": "Invalid faculty information"}`
- **And** I remain on the add modal 
- **And** a error notification pops up for 5 seconds saying `Cannot add faculty`

#### Scenario: Admin clicks the `Cancel` button

- **Given** I am a admin on the faculty page
- **When** I have clicked the `Cancel` button
- **Then** input texts are cleared and the edit modal closes 
- **And** no API request is sent

### US-4.3 — Delete Faculty

#### Scenario: Admin clicks the `Delete` icon button and deletes the user successfully

- **Given** I am a admin on the faculty page
- **When** I have clicked the `Delete` button
- **Then** the API returns `200` with a payload of `{"message": "Successfully removed faculty"}`

#### Scenario: Admin clicks the `Delete` icon button and deletes the user unsuccessfully

- **Given** I am a admin on the faculty page
- **When** I have clicked the `Delete` button
- **Then** the API returns `500` with a payload of `{"message": "Could not remove {faculty first name} {faculty last name}"}`

### US-4.4 — List Faculty 

#### Scenario: Admin opens the faculty page successfully

- **Given** I am a admin 
- **When** I click the `Faculty` tab on the menu bar
- **Then** the API fetches all faculty and returns `200` with a payload containing all faculty in a JSON format
- **And** displays all faculty as a table with their `first name`, `last name`, `department`, and `Edit/Delete` icon buttons

#### Scenario: Admin opens the faculty page unsuccessfully

- **Given** I am a admin 
- **When** I click the `Faculty` tab on the menu bar
- **Then** the API fetches all faculty and returns `500` with a payload containing `{"message": "Could not retrieve faculty"}`

#### Scenario: Admin `Adds/Edits` a faculty

- **Given** I am a admin 
- **When** I `Add` or `Edit` a faculty
- **Then** the API fetches all faculty and returns `200` with a payload containing all faculty in a JSON format
- **And** displays all faculty as a table with their `first name`, `last name`, `department`, and `Edit/Delete` icon buttons

---

## Test Coverage Map

Each scenario above must map to at least one automated test.

| Story | Scenario | Test file | Test name |
|-------|----------|-----------|-----------|
| US-4.1 | Admin clicks the add faculty button | `frontend/tests/Faculty.test.js` | Admin clicks the add faculty button |
| US-4.1 | Admin inputs faculty first name with correct values | `frontend/tests/Faculty.test.js` | Admin inputs faculty first name with correct values |
| US-4.1 | Admin inputs faculty first name with incorrect values | `frontend/tests/Faculty.test.js` | Admin inputs faculty first name with incorrect values |
| US-4.1 | Admin inputs faculty last name with correct values | `frontend/tests/Faculty.test.js` | Admin inputs faculty last name with correct values |
| US-4.1 | Admin inputs faculty last name with incorrect values | `frontend/tests/Faculty.test.js` | Admin inputs faculty last name with incorrect values |
| US-4.1 | Admin inputs faculty department with correct values | `frontend/tests/Faculty.test.js` | Admin inputs faculty department with correct values |
| US-4.1 | Admin inputs faculty department with incorrect values | `frontend/tests/Faculty.test.js` | Admin inputs faculty department with incorrect values |
| US-4.1 | Admin clicks the `Add Faculty` button with correct inputted values | `frontend/tests/Faculty.test.js` | Admin clicks the `Add Faculty` button with correct inputted values |
| US-4.1 | Admin clicks the `Add Faculty` button with correct inputted values | `backend/tests/Faculty.test.js` | Admin clicks the `Add Faculty` button with correct inputted values |
| US-4.1 | Admin clicks the `Add Faculty` button with incorrect inputted values | `frontend/tests/Faculty.test.js` | Admin clicks the `Add Faculty` button with incorrect inputted values |
| US-4.1 | Admin clicks the `Add Faculty` button with incorrect inputted values | `backend/tests/Faculty.test.js` | Admin clicks the `Add Faculty` button with incorrect inputted values |
| US-4.1 | Admin clicks the `Cancel` button | `frontend/tests/Faculty.test.js` | Admin clicks the `Cancel` button |
| US-4.2 | Admin clicks the `Edit` icon button on a faculty record | `frontend/tests/Faculty.test.js` | Admin clicks the `Edit` icon button on a faculty record |
| US-4.2 | Admin edits the faculty's `first name` text input | `frontend/tests/Faculty.test.js` | Admin edits the faculty's `first name` text input |
| US-4.2 | Admin edits the faculty's `last name` text input | `frontend/tests/Faculty.test.js` | Admin edits the faculty's `last name` text input |
| US-4.2 | Admin edits the faculty's `department` text input | `frontend/tests/Faculty.test.js` | Admin edits the faculty's `department` text input |
| US-4.2 | Admin clicks the `Update Faculty` button with correct inputted values | `frontend/tests/Faculty.test.js` | Admin clicks the `Update Faculty` button with correct inputted values |
| US-4.2 | Admin clicks the `Update Faculty` button with correct inputted values | `backend/tests/Faculty.test.js` | Admin clicks the `Update Faculty` button with correct inputted values |
| US-4.2 | Admin clicks the `Update Faculty` button with incorrect inputted values | `frontend/tests/Faculty.test.js` | Admin clicks the `Update Faculty` button with incorrect inputted values |
| US-4.2 | Admin clicks the `Update Faculty` button with incorrect inputted values | `backend/tests/Faculty.test.js` | Admin clicks the `Update Faculty` button with incorrect inputted values |
| US-4.2 | Admin clicks the `Cancel` button | `frontend/tests/Faculty.test.js` | Admin clicks the `Cancel` button |
| US-4.3 | Admin clicks the `Delete` icon button and deletes the user successfully | `frontend/tests/Faculty.test.js` | Admin clicks the `Delete` icon button and deletes the user successfully |
| US-4.3 | Admin clicks the `Delete` icon button and deletes the user successfully | `backend/tests/Faculty.test.js` | Admin clicks the `Delete` icon button and deletes the user successfully |
| US-4.3 | Admin clicks the `Delete` icon button and deletes the user unsuccessfully | `frontend/tests/Faculty.test.js` | Admin clicks the `Delete` icon button and deletes the user unsuccessfully |
| US-4.3 | Admin clicks the `Delete` icon button and deletes the user unsuccessfully | `backend/tests/Faculty.test.js` | Admin clicks the `Delete` icon button and deletes the user unsuccessfully |
| US-4.4 | Admin opens the faculty page successfully | `frontend/tests/Faculty.test.js` | Admin opens the faculty page successfully |
| US-4.4 | Admin opens the faculty page successfully | `backend/tests/Faculty.test.js` | Admin opens the faculty page successfully |
| US-4.4 | Admin opens the faculty page unsuccessfully | `frontend/tests/Faculty.test.js` | Admin opens the faculty page unsuccessfully |
| US-4.4 | Admin opens the faculty page unsuccessfully | `backend/tests/Faculty.test.js` | Admin opens the faculty page unsuccessfully |
| US-4.4 | Admin `Adds/Edits` a faculty | `frontend/tests/Faculty.test.js` | Admin `Adds/Edits` a faculty |
| US-4.4 | Admin `Adds/Edits` a faculty | `backend/tests/Faculty.test.js` | Admin `Adds/Edits` a faculty |
