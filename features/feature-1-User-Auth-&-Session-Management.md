# Feature: User Auth & Session Management
**Feature ID:** 1
**Branch pattern:** `Feature-1-User-Auth`
**Status:** Ready
**Created:** 2026-09-23
**Input:** Can log in, stay signed in, and log out.

---

## User Stories

### US-1.1: Sign in

**As a** not signed-in user
**I want to** press Login with a valid email and password
**So that** I land on semesters with an active session

**Priority:** P1
**Independent test:** Sign in with valid credentials and land on the semesters list with `user` stored in `localStorage`.
**Acceptance scenarios:** see ### US-1.1 under Acceptance Criteria

### US-1.2: Stay signed in across page loads

**As a** signed-in user
**I want** my session to persist when I go to semesters and when I refresh the page
**So that** I do not have to sign in again after every navigation or refresh

**Priority:** P1
**Independent test:** With a valid `localStorage` session, open semesters and refresh — no re-login prompt.
**Acceptance scenarios:** see ### US-1.2 under Acceptance Criteria **Trace:** `TS-F2-US1.2`

### US-1.3: Sign out

**As a** signed-in user
**I want to** sign out
**So that** no one else can use my account on a shared device

**Priority:** P2
**Independent test:** Sign out clears the server session and `localStorage`; user lands on Login.
**Acceptance scenarios:** see ### US-1.3 under Acceptance Criteria

### US-1.4: Create account

**As a** not signed-in user
**I want to** be able to create an account
**So that** I can create semesters

**Priority:** P1
**Independent test:** Press Create Account, fill credentials in the dialog, then confirm a session exists and courses is shown.
**Acceptance scenarios:** see ### US-1.4 under Acceptance Criteria
**Trace:** `TS-F2-US2.4`

---

## Requirements

### Functional Requirements

- **FR-001**: Users MUST authenticate with **email** + **password** (not username login; not password-only).
- **FR-002**: Successful login MUST create a server session and return a token; the frontend MUST store the payload in `localStorage` under `user` and navigate to courses.
- **FR-003**: A valid session MUST persist across navigation (including courses) and browser refresh until expiry or logout.
- **FR-004**: Logout MUST invalidate the current server session, clear `localStorage` `user`, and send the user to Login.
- **FR-005**: Unknown or unused email on login MUST return **401** with message **"User not found!"**.
- **FR-006**: Wrong password for an existing email MUST return **401** with message **"Invalid password!"**.
- **FR-007**: Missing or expired token on a protected API MUST return **401**; the frontend MUST clear the session and redirect to Login.

---

## Assumptions

- The courses app shell (Vue 3 frontend, Express API mounted at `/courses`, MySQL) already exists in this repo.
- Login identifier is **email**, matching the running courses UI and `users.email`.

---

## Edge Cases

- Unknown email on login → **401** `"User not found!"`
- Wrong password on login → **401** `"Invalid password!"`
- Empty email or password on login → request blocked or **401** with a clear message
- Missing or expired Bearer token on protected API → **401**; frontend clears `user` and redirects to Login

---

## Success Criteria

- **SC-001**: Every Gherkin scenario has at least one automated test before merge.
- **SC-002**: A user can log in with email and password and receive a session token.
- **SC-003**: A signed-in user can log out and is returned to Login with no remaining local session.
- **SC-004**: A valid session survives courses navigation and page refresh until logout or expiry.

---

## Data Ownership & Isolation

Feature 1 starts and ends the caller’s own session. It does not return another user’s profile or token.


| Rule                  | Requirement                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| **Read scope**        | Login success returns **only** the authenticating user’s profile fields and token.                  |
| **Write scope**       | Login creates a `sessions` row for that user. Logout deletes **only** the caller’s current session. |
| **Create scope**      | This feature does not create `users` or courses rows.                                               |
| **Cross-user access** | No endpoint in this feature returns another user’s password, salt, or session token.                |
| **UI scope**          | MenuBar shows the signed-in user’s initials, name, and email from `localStorage` `user`.            |
| **Later features**    | Course APIs must never expose another user’s private courses. Cross-user → `404` (not `403`).       |

## API Requirements
| Method   | Endpoint                         | Auth                | Purpose               |
| -------- | -------------------------------- | ------------------- | --------------------- |
| `GET`    | `/courses/users`                 | Yes (admin)         | Fetch all users       |
| `GET`    | `/courses/sessions`              | Yes (admin)         | Fetch all sessions    |
| `POST`   | `/courses/users`                 | Yes, admin          | Create a new user     |
| `POST`    | `/courses/sessions`             | Yes, admin          | Create a new session  |
| `DELETE` | `/courses/sessions/:sessionId`   | Yes, admin          | Delete a session      |

---

## Key Entities

- **User**: existing account (first name, last name, email) created by Feature 1; used here only to verify credentials.
- **Session**: server-side record tying an encrypted session id (client `token`) to a user; expires after 24 hours.

---

**Login:** `Authorization: Basic <base64(email:password)>`. JSON body is not required for credential check.

**Login success response** (flat JSON, no envelope; never include `password` or `salt`):

```json
{
  "id": 1,
  "email": "DDevito@example.com",
  "firstName": "Danny",
  "lastName": "Devito",
  "token": "<encrypted-session-id>"
}
```

**Logout success:** `{ "message": "Logged out successfully." }`

**Error response:** `{ "message": "Human-readable explanation." }`

Quoted messages that tests must match:


| Situation      | Status | `message`           |
| -------------- | ------ | ------------------- |
| Unknown email  | 401    | `User not found!`   |
| Wrong password | 401    | `Invalid password!` |


---

## Screen Requirements

### [View: Login] — route name `login` (`/`)

- Heading: **Login**
- Fields: **Email**, **Password** (both required)
- Primary action: **Login**
- **Create Account** on this screen is Feature 1 — do not change that dialog in this feature
- **Error:** shows the API `message` (including **"User not found!"** and **"Invalid password!"**)
- **Success:** store payload in `localStorage` `user`, snackbar **"Login successful!"**, navigate to route `courses`

### App chrome — `MenuBar`

- **Courses** button (stays signed in; navigates to `courses`)
- When signed in: avatar (initials from first + last name). Opening it shows name, email, and **Logout**
- **Logout** runs logout, then lands on `login`

---

## Data Model Requirements

This feature **uses** `users` (Feature 1) and **owns** `sessions`.

### `users` table (read for login; not created here)
| Field         | Type       | Rules                                              |
| ------------- | ---------- | -------------------------------------------------- |
| `universityId`| INTEGER PK | NOT NULL, UNIQUE                                   |
| `firstName`   | STRING     | Required                                           |
| `lastName`    | STRING     | Required                                           |
| `email`       | STRING     | Required, unique; login identifier                 |
| `password`    | BLOB       | Required; salted hash only — never store plaintext |
| `salt`        | BLOB       | Required; used to hash the password                |


### `sessions` table


| Field            | Type       | Rules                           |
| ---------------- | ---------- | ------------------------------- |
| `sessionId`             | INTEGER PK | Auto-increment                  |
| `email`          | STRING     | Required                        |
| `expirationDate` | DATE       | Required; 24 hours from login   |
| `universityId`   | INTEGER FK | Required; references `users.universityId` |


The client `token` is the encrypted session `id`. It is not stored as a separate column.

### Associations

- `User` hasMany `Session`
- `Session` belongsTo `User`

---

## Acceptance Criteria (Gherkin)
### US-1.1 — Sign in

#### Scenario: Admin signs in

- **Given** I am on the Login page
- **And** an account exists with role `admin`
- **When** I enter that email and password and press Login
- **Then** I am signed in
- **And** I land on the Semesters page (`/semesters`)

#### Scenario: Student signs in

- **Given** I am on the Login page
- **And** an account exists with role `student`
- **When** I enter that email and password and press Login
- **Then** I am signed in
- **And** I land on the Enrollments page (`/enrollments`)

#### Scenario: Bad email

- **Given** I am on the Login page
- **When** I fill out an unused or wrong email and a password
- **And** I press **Login**
- **Then** I see the message **"User not found!"**
- **And** I remain on Login
- **And** I am not signed in

#### Scenario: Bad password

- **Given** I am on the Login page
- **When** I fill out an existing email and an invalid password
- **And** I press **Login**
- **Then** I see the message **"Invalid password!"**
- **And** I remain on Login
- **And** I am not signed in

### US-1.2 — Stay signed in across page loads

#### Scenario: Changing pages

- **Given** I have a valid session
- **When** I press **Courses**
- **Then** I remain logged in
- **And** I am on the Semesters page

#### Scenario: Refresh pages

- **Given** I have a valid session
- **When** I refresh the page
- **Then** I remain logged in
- **And** I do not have to sign in again

### US-1.3 — Sign out
#### Scenario: Logging out

- **Given** I have a valid session
- **When** I press the profile circle
- **And** I click **Logout**
- **Then** I am logged out of the user session
- **And** I am redirected to the Login page

### US-1.4 — Create account

#### Scenario: Creating new account

- **Given** I am on the Login page
- **When** I press the **Create Account** button
- **And** I fill all textboxes
- **And** I click **Create Account**
- **Then** I am logged into the new account
- **And** I am redirected to the Semesters page

---

## Test Coverage Map

Each scenario above must map to at least one automated test.


| Story  | Scenario             | Test file                      | Test name                    |
| ------ | -------------------- | ------------------------------ | ---------------------------- |
| US-1.1 | Admin signs in       | `frontend/tests/Login.test.js` | `it("Admin signs in")`       |
| US-1.1 | Student signs in     | `frontend/tests/Login.test.js` | `it("Student signs in")`     |
| US-1.1 | Bad email            | `backend/tests/auth.test.js`   | `it("Bad email")`            |
| US-1.1 | Bad password         | `backend/tests/auth.test.js`   | `it("Bad password")`         |
| US-1.2 | Changing pages       | `frontend/tests/Login.test.js` | `it("Changing Pages)`        |
| US-1.2 | Refresh pages        | `frontend/tests/Login.test.js` | `it("Refresh pages")`        |
| US-1.3 | Logging out          | `backend/tests/auth.test.js`   | `it("Logging out)`           |
| US-1.4 | Creating new account | `frontend/tests/Login.test.js` | `it("Creating new account")` |




## Definition of Done

- [ ] Backend and frontend implemented per this spec (**FR-00N** satisfied)
- [ ] **Success Criteria (SC-00N)** met
- [ ] All mapped tests pass (`npm test`)
- [ ] Test Coverage Map complete
- [ ] Test traceability (file headers, nested `describe` / `it`, audit commands in this spec)
- [ ] `features/reference/data-model.md` updated (if schema changed)
- [ ] `features/reference/api.md` updated (if API changed)
- [ ] `features/reference/behavior.md` updated (if product rules changed)

---

## Out of Scope

- Create / edit / delete and per-user and admin ownership

