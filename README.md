# Corporate Task Tracker — Enterprise MERN Stack Application

A production-grade, full-stack enterprise task tracking and management application built with the **MERN** stack (**MongoDB**, **Express.js**, **React.js**, and **Node.js**). This platform enables cross-functional engineering and product teams to organize project deliverables across multiple project management methodologies (**Kanban**, **Scrum**, and **Project Management**), track sprint milestones and velocity, monitor critical deadlines, filter tasks in real-time, and enforce role-based access control (RBAC).

---

## Course Syllabus Outcomes Mapping

This project is structured and documented to explicitly demonstrate mastery of the core course syllabus outcomes:

1. [Outcome 1: Introduction to Web Development](#1-introduction-to-web-development)
   - [Client-Server Architecture](#a-client-server-architecture)
   - [HTTP Status Codes Used](#b-http-status-codes-used)
   - [React.js Frontend Architecture](#c-reactjs)
   - [Tailwind CSS Design System](#d-tailwind-css)
2. [Outcome 2: Full Stack Web Frameworks](#2-full-stack-web-frameworks)
   - [MERN Stack Architecture Diagram](#mern-stack-architecture-diagram-text)
   - [Data Modeling & Schemas](#persisted-data-schemas)
3. [Outcome 3: RESTful Web Services](#3-restful-web-services)
   - [API Endpoint Specifications](#api-endpoint-specifications)
4. [Outcome 4: Authentication & Authorization](#4-authentication--authorization)
   - [How JWT Authentication Works](#how-jwt-authentication-works)
   - [Admin vs. User Roles (RBAC)](#admin-vs-user-roles-rbac)
5. [Multi-Methodology Workflow System](#5-multi-methodology-workflow-system)
   - [Kanban Mode (Visual 3-Column Continuous Flow)](#kanban-mode-continuous-flow)
   - [Scrum Mode (Sprints, Backlog & Velocity Tracking)](#scrum-mode-sprints-backlog--velocity-tracking)
   - [Project Management Mode (Milestones, Timelines & Deadlines)](#project-management-mode-milestones-timelines--deadlines)
6. [Outcome 5: Setup Instructions to Run Client and Server Locally](#6-setup-instructions-to-run-both-client-and-server-locally)
   - [Testing Application Features](#4-testing-the-application-features)
   - [Directory Structure](#directory-structure)

---

### 1. Introduction to Web Development

#### A. Client-Server Architecture
The application implements a decoupled, modern **Client-Server Architecture**:
- **Client (Frontend)**: A Single Page Application (SPA) built with React 19 and Vite. The frontend runs entirely within the client's web browser, executing presentation logic, maintaining local UI state, capturing user input, and issuing asynchronous HTTP requests.
- **Server (Backend)**: A Node.js and Express.js REST API service listening on port `5000`. The server is responsible for request validation, business logic execution, authentication, password hashing, database operations via Mongoose ODM, and returning standard JSON payloads.
- **Decoupled Communication**: The frontend and backend communicate strictly over HTTP/1.1 using JSON as the data interchange format, connected via Axios with configured base URLs and request/response interceptors.

```
+-------------------------------------------------------------+
|                     CLIENT TIER (Browser)                   |
|  React 19 SPA • Tailwind CSS • React Router • Axios Client  |
+-------------------------------------------------------------+
                              |   ^
        HTTP Requests (JSON)  |   |  HTTP Responses (JSON)
        Authorization: Bearer |   |  Status Codes (200, 201, 401...)
                              v   |
+-------------------------------------------------------------+
|                     SERVER TIER (Node.js)                   |
|  Express.js API • JWT Middleware • Controllers • Mongoose   |
+-------------------------------------------------------------+
                              |   ^
                Mongoose ODM  |   |  Data Queries & Updates
                              v   |
+-------------------------------------------------------------+
|                    DATABASE TIER (MongoDB)                  |
|          Users Collection     •     Tasks Collection        |
+-------------------------------------------------------------+
```

#### B. HTTP Status Codes Used
The application adheres strictly to standard HTTP semantics to signal success or failure states:

| Status Code | Meaning | Usage in Application |
|---|---|---|
| **`200 OK`** | Request succeeded | Returned on successful retrieval of tasks (`GET /api/tasks`), server health check (`GET /api/health`), user authentication (`POST /api/auth/login`), task updates (`PUT /api/tasks/:id`), and task deletion (`DELETE /api/tasks/:id`). |
| **`201 Created`** | Resource created successfully | Returned when a new user registers (`POST /api/auth/register`) or when a new task is created (`POST /api/tasks`). Includes the newly created object in the response. |
| **`400 Bad Request`** | Client validation failure | Returned when required fields are missing (e.g. empty task title, missing email/password), invalid email syntax, password length < 6 characters, duplicate user email, or invalid enum values for status/priority. |
| **`401 Unauthorized`** | Authentication missing or invalid | Returned when an endpoint requires authentication but no token is provided, the token format is invalid, the token has expired, or invalid login credentials are provided. |
| **`403 Forbidden`** | Authenticated user lacks permission | Returned by `authorizeAdmin` middleware when a standard `User` attempts an action reserved exclusively for `Admin` accounts (e.g., executing `DELETE /api/tasks/:id`). |
| **`404 Not Found`** | Resource does not exist | Returned when attempting to fetch, update, or delete a task with a non-existent or invalid MongoDB ObjectId, or when accessing unmapped API routes. |
| **`500 Internal Server Error`** | Unhandled server exception | Returned by centralized Express error handling when an unhandled server or database error occurs. |

#### C. React.js
The user interface is engineered using **React 19**:
- **Single Page Application (SPA)**: Fast, flicker-free transitions without full browser reloads.
- **Component-Driven Architecture**: Modular, maintainable components including `Navbar`, `TaskCard`, `Dashboard`, `ScrumView`, `ProjectManagementView`, `Login`, and `Register`.
- **React Hooks**:
  - `useState`: Manages local component state (tasks array, active methodology switcher, filter terms, modal visibility, form inputs, loading indicators).
  - `useEffect`: Handles lifecycle events, initial API data synchronization, document title updates, and global keyboard shortcuts (e.g., closing modal on `Escape`).
  - `useContext`: Consumes the global authentication context (`AuthContext`) through the custom `useAuth()` hook.
- **React Router DOM (v7)**: Provides declarative routing (`/`, `/login`, `/register`, `/dashboard`), client-side redirection for unauthenticated visitors, and navigation guards.

#### D. Tailwind CSS
The styling layer utilizes **Tailwind CSS (v3.4)**:
- **Utility-First Paradigm**: Composable, maintainable class names that eliminate bulky, disconnected stylesheets.
- **Responsive Layout**: Fluid breakpoints (`sm:`, `md:`, `lg:`) enabling views to shift effortlessly from a stacked mobile layout to a multi-column desktop workflow.
- **Modern Corporate Dark Theme**: Curated palette utilizing `slate-950` as the canvas, `slate-900` card surfaces, and dynamic accent gradients (`indigo-500`, `purple-500`, `cyan-400`).
- **State Styling & Micro-Interactions**: Hover transitions, active press effects (`active:scale-95`), focus rings for accessibility, and animated spin loaders (`animate-spin`).

---

### 2. Full Stack Web Frameworks

#### MERN Stack Architecture Diagram (Text)

```
===================================================================================
                         MERN STACK SYSTEM ARCHITECTURE
===================================================================================

  [ CLIENT TIER : PRESENTATION LAYER ]
  +-------------------------------------------------------------------------------+
  |  React.js (v19) SPA with Vite Build Tool                                      |
  |                                                                               |
  |  +-------------------+  +--------------------------------------------------+  |
  |  |   Pages           |  |   Components                                     |  |
  |  |   - Dashboard.jsx |  |   - Navbar.jsx                                   |  |
  |  |   - Login.jsx     |  |   - TaskCard.jsx                                 |  |
  |  |   - Register.jsx  |  |   - ScrumView.jsx (Sprints, Backlog, Velocity)   |  |
  |  |                   |  |   - ProjectManagementView.jsx (Milestone Table)  |  |
  |  +-------------------+  +--------------------------------------------------+  |
  |                                                                               |
  |  +-------------------------------------------------------------------------+  |
  |  |   Axios HTTP Client (`/api/axios.js`)                                   |  |
  |  |   - Request Interceptor: Injects `Authorization: Bearer <token>`        |  |
  |  |   - Methodology Segmented Control ('Kanban', 'Scrum', 'Project Mgmt')   |  |
  |  |   - Dynamic Search & Filter Bar (Title, Priority, Status)               |  |
  |  +-------------------------------------------------------------------------+  |
  +-------------------------------------------------------------------------------+
                                         |
                                         | REST / JSON over HTTP
                                         v
  [ SERVER TIER : APPLICATION & API LAYER ]
  +-------------------------------------------------------------------------------+
  |  Node.js Runtime & Express.js (v5) Web Framework                              |
  |                                                                               |
  |  +-------------------------------------------------------------------------+  |
  |  |  Global Middleware: CORS, express.json(), 404 & Central Error Handlers  |  |
  |  +-------------------------------------------------------------------------+  |
  |                                                                               |
  |  +------------------------------------+  +---------------------------------+  |
  |  |  Authentication Routing            |  |  Task Routing                   |  |
  |  |  `/api/auth`                       |  |  `/api/tasks`                   |  |
  |  |  - POST /register                  |  |  - GET / (verifyToken)          |  |
  |  |  - POST /login                     |  |  - POST / (verifyToken)         |  |
  |  |                                    |  |  - PUT /:id (verifyToken)       |  |
  |  |                                    |  |  - DELETE /:id (authorizeAdmin) |  |
  |  +------------------------------------+  +---------------------------------+  |
  |                   |                                       |                   |
  |                   v                                       v                   |
  |  +------------------------------------+  +---------------------------------+  |
  |  |  authController.js                 |  |  taskController.js              |  |
  |  |  - bcrypt password hashing         |  |  - CRUD business logic          |  |
  |  |  - jwt.sign token generator        |  |  - Scrum/PM field sanitization  |  |
  |  |                                    |  |  - Mongoose query populator     |  |
  |  +------------------------------------+  +---------------------------------+  |
  |                                                                               |
  |  +-------------------------------------------------------------------------+  |
  |  |  Security Middleware: `authMiddleware.js`                               |  |
  |  |  - `verifyToken`: Decodes & validates JWT bearer tokens                  |  |
  |  |  - `authorizeAdmin`: Restricts deletion to users with `role: 'Admin'`   |  |
  |  +-------------------------------------------------------------------------+  |
  +-------------------------------------------------------------------------------+
                                         |
                                         | Mongoose Object Data Modeling (ODM)
                                         v
  [ DATABASE TIER : PERSISTENCE LAYER ]
  +-------------------------------------------------------------------------------+
  |  MongoDB Database Engine (Port 27017 or Atlas URI)                            |
  |                                                                               |
  |  +------------------------------------+  +---------------------------------+  |
  |  |  User Collection                   |  |  Task Collection                |  |
  |  |  - _id: ObjectId                   |  |  - _id: ObjectId                |  |
  |  |  - name: String                    |  |  - title: String (Required)     |  |
  |  |  - email: String (Unique, Indexed) |  |  - description: String          |  |
  |  |  - password: String (Hashed)       |  |  - status: Enum (Backlog, etc.) |  |
  |  |  - role: Enum ('User', 'Admin')    |  |  - priority: Enum (Low, etc.)   |  |
  |  |  - timestamps: createdAt, etc.     |  |  - sprint: String               |  |
  |  |                                    |  |  - storyPoints: Number (1-13)   |  |
  |  |                                    |  |  - milestone: String            |  |
  |  |                                    |  |  - startDate: Date              |  |
  |  |                                    |  |  - dueDate: Date                |  |
  |  |                                    |  |  - createdBy: Ref -> User       |  |
  |  +------------------------------------+  +---------------------------------+  |
  +-------------------------------------------------------------------------------+
===================================================================================
```

#### Persisted Data Schemas

##### Task Schema (`server/models/Task.js`)
- `title`: String, required, trimmed.
- `description`: String, optional, trimmed.
- `status`: String enum `['Backlog', 'To-Do', 'In Progress', 'Completed']`, default `'To-Do'`.
- `priority`: String enum `['Low', 'Medium', 'High']`, default `'Medium'`.
- `sprint`: String enum / custom string (e.g. `'Backlog'`, `'Sprint 1'`, `'Sprint 2'`), default `'Backlog'`.
- `storyPoints`: Number (1, 2, 3, 5, 8, 13), default `1`.
- `milestone`: String (e.g. `'Phase 1: Planning'`, `'Phase 2: Execution'`, `'Phase 3: Launch'`), default `'General'`.
- `startDate`: Date, optional.
- `dueDate`: Date, optional.
- `createdBy`: ObjectId reference to `User` model, indexed.
- `timestamps`: Automatic `createdAt` and `updatedAt`.

##### User Schema (`server/models/User.js`)
- `name`: String, required, trimmed.
- `email`: String, required, unique, lowercase, trimmed.
- `password`: String, required, hashed with bcrypt (salt rounds = 10).
- `role`: String enum `['User', 'Admin']`, default `'User'`.
- `timestamps`: Automatic `createdAt` and `updatedAt`.

---

### 3. RESTful Web Services

The application exposes a clean, stateless REST API adhering to resource-oriented URI naming conventions and standard HTTP methods.

#### API Endpoint Specifications

| Method | Endpoint | Description | Request Body | Auth Required | Status Codes |
|---|---|---|---|---|---|
| **`GET`** | `/api/health` | Service health status check | _None_ | Public | `200 OK`, `500 Server Error` |
| **`POST`** | `/api/auth/register` | Register a new user account | `{ "name": "...", "email": "...", "password": "...", "role": "User" \| "Admin" }` | Public | `201 Created`, `400 Bad Request`, `500 Server Error` |
| **`POST`** | `/api/auth/login` | Authenticate credentials & return JWT | `{ "email": "...", "password": "..." }` | Public | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `500 Server Error` |
| **`GET`** | `/api/tasks` | Fetch all tasks (populates creator details, sorted newest first) | _None_ | `Bearer <JWT>` | `200 OK`, `401 Unauthorized`, `500 Server Error` |
| **`POST`** | `/api/tasks` | Create a new task (supports sprint, story points, milestone, due date) | `{ "title": "...", "description": "...", "status": "To-Do", "priority": "Medium", "sprint": "Backlog", "storyPoints": 1, "milestone": "Phase 1: Planning", "dueDate": "2026-11-01" }` | `Bearer <JWT>` | `201 Created`, `400 Bad Request`, `401 Unauthorized`, `500 Server Error` |
| **`PUT`** | `/api/tasks/:id` | Update an existing task's status, sprint, points, milestone, due date, or priority | `{ "status": "In Progress" \| "Completed" \| "To-Do" \| "Backlog", "sprint": "Sprint 1", "storyPoints": 3, "milestone": "Phase 2: Execution", "dueDate": "2026-11-15", ... }` | `Bearer <JWT>` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Server Error` |
| **`DELETE`** | `/api/tasks/:id` | Permanently delete a task (Admins only) | _None_ | `Bearer <JWT>` (Admin role) | `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Server Error` |

---

### 4. Authentication & Authorization

The system implements security using **JSON Web Tokens (JWT)** for stateless session management and **Role-Based Access Control (RBAC)** to differentiate between standard `User` accounts and privileged `Admin` accounts.

#### How JWT Authentication Works
1. **Password Hashing**: During registration (`authController.js`), passwords are encrypted using `bcryptjs` with a work factor of 10 salts (`bcrypt.genSalt(10)`). Plaintext passwords are never saved.
2. **Token Generation**: Upon successful login or registration, the server signs a JWT containing the user's ID and role:
   ```javascript
   jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
   ```
3. **Client Storage & Dispatch**:
   - The token is securely stored in browser `localStorage`.
   - The centralized Axios client (`client/src/api/axios.js`) automatically intercepts every outbound request and attaches the header:
     ```http
     Authorization: Bearer <token>
     ```
4. **Token Verification**:
   - Protected routes pass through the `verifyToken` middleware (`server/middleware/authMiddleware.js`).
   - The middleware verifies token signature and expiration against `JWT_SECRET`.
   - If valid, the decoded payload is attached to `req.user` and execution proceeds; otherwise, an HTTP `401 Unauthorized` is returned.

#### Admin vs. User Roles (RBAC)
- **User Role**:
  - Assigned by default to registered team members.
  - Can view all methodology views (Kanban, Scrum, Project Management), create new tasks, update task statuses (e.g. moving between To-Do, In Progress, and Completed, or moving backlog items into active sprints), and view task creator information.
  - Does **not** have permissions to delete tasks.
- **Admin Role**:
  - High-privilege managerial role.
  - Possesses all `User` capabilities plus exclusive authorization to delete any task across Kanban, Scrum, and Project Management views.
- **Dual-Layer RBAC Enforcement**:
  1. **Backend Layer (Authoritative)**: The `authorizeAdmin` middleware checks `req.user.role === 'Admin'`. Non-admin requests to `DELETE /api/tasks/:id` immediately fail with `403 Forbidden ({ message: "Access denied: Admins only" })`.
  2. **Frontend Layer (UX)**: In `TaskCard.jsx` and `ProjectManagementView.jsx`, the red Delete button is conditionally rendered **only** when `currentUser.role === 'Admin'`. Regular users never see or interact with the delete control.
- **Role Badges**: The `Navbar` and task cards display distinctive visual role pills:
  - `Admin`: Purple badge (`bg-purple-500/20 text-purple-300`).
  - `User`: Emerald badge (`bg-emerald-500/20 text-emerald-300`).

---

### 5. Multi-Methodology Workflow System

The Corporate Task Tracker features a unified multi-methodology engine that allows engineering teams, agile scrum masters, and project managers to view and manage the exact same shared task repository through three distinct industry-standard methodologies.

Users switch between methodologies instantaneously using the interactive segmented control tab bar (`data-testid="methodology-switcher"`) at the top of the Dashboard. All updates (`POST`, `PUT`, `DELETE`) immediately synchronize with React state without page reloads or data desynchronization.

```
+---------------------------------------------------------------------------------+
|                  METHODOLOGY SEGMENTED CONTROL TAB BAR                          |
|  [ Kanban Board (Flow) ]    [ Scrum Mode (Sprints) ]    [ Project Mgmt (Plan) ] |
+---------------------------------------------------------------------------------+
```

#### Kanban Mode (Continuous Flow)
- **Visual 3-Column Workflow**:
  - **To-Do**: Indigo header accent and badge (`bg-indigo-500/15 text-indigo-300`), tracking ready-to-start items.
  - **In Progress**: Amber header accent and badge (`bg-amber-500/15 text-amber-300`), tracking work currently under development.
  - **Completed**: Emerald header accent and badge (`bg-emerald-500/15 text-emerald-300`), tracking finished deliverables.
- **Continuous Flow Metrics**: Column headers dynamically count active tasks and display status distributions.
- **Card Controls**:
  - Direct status selector dropdown on each card triggering `PUT /api/tasks/:id` with optimistic UI feedback.
  - Visual priority indicators (`High` in red, `Medium` in yellow, `Low` in blue).
  - Admin-only delete button triggering `DELETE /api/tasks/:id`.
  - Empty column illustration with quick "Add task" action that opens the creation modal prefilled with that column's status.

#### Scrum Mode (Sprints, Backlog & Velocity Tracking)
- **Sprint Selector**:
  - Top-level sprint selector allowing team leads to toggle between active iterations (`Sprint 1`, `Sprint 2`).
- **Sprint Velocity Counter (`data-testid="sprint-velocity-counter"`)**:
  - Aggregates committed Story Points vs. Completed Story Points for the selected sprint.
  - Real-time percentage completion meter and dynamic gradient progress bar.
- **Collapsible Product Backlog**:
  - Dedicated backlog section showing all unallocated tasks (`sprint === 'Backlog'`).
  - Summarizes total backlog item count and total uncommitted Story Points.
  - Expand/collapse toggle button (`data-testid="toggle-backlog-button"`).
- **One-Click Sprint Commitment**:
  - Each backlog card features a quick **"Move to Sprint"** button (`data-testid="move-to-sprint-:id"`).
  - Triggers `PUT /api/tasks/:id` with `{ sprint: selectedSprint, status: 'To-Do' }`, immediately moving the item from the backlog into the active sprint board and recalculating sprint velocity.
- **Active Sprint Board**:
  - 3-column sprint execution board (`To-Do`, `In Progress`, `Completed`) strictly filtered to the currently active sprint.
  - Column headers summarize both the task count and aggregated Story Points for that specific stage.
- **Story Points Estimation**:
  - Agile Fibonacci scale (1, 2, 3, 5, 8, 13) rendered on task cards via the purple Story Points pill (`data-testid="story-points-badge"`).

#### Project Management Mode (Milestones, Timelines & Deadlines)
- **Executive Project Overview Header (`data-testid="pm-overview-header"`)**:
  - **Overall Completion Percentage** (`data-testid="completion-percentage"`): Percentage of total project deliverables marked Completed.
  - **Total Tasks Count** (`data-testid="total-tasks-count"`): Total deliverables across all project phases.
  - **Overdue Tasks Alert Count** (`data-testid="overdue-tasks-count"`): High-visibility warning badge showing deliverables whose `dueDate` is past the current date and not yet completed.
- **Milestone & Timeline Portfolio Hierarchy**:
  - Tasks grouped into structured phases:
    - `Phase 1: Planning`
    - `Phase 2: Execution`
    - `Phase 3: Launch`
    - Custom user-defined milestones.
  - Each milestone group features collapsible headers, milestone progress bars, and deliverable counts.
- **Structured Timeline Deliverables Table**:
  - **Task Title & Description**: Deliverable name and scope details.
  - **Priority Badge**: Color-coded pill (`High`, `Medium`, `Low`).
  - **Status Dropdown**: Interactive status selector (Backlog, To-Do, In Progress, Completed) triggering `PUT /api/tasks/:id` directly from the table row.
  - **Story Points**: Estimated deliverable effort points.
  - **Due Date & Overdue Highlight**: Due date displayed with calendar icon; if past due, highlighted in red with an overdue warning triangle (`data-testid="overdue-badge"`).
  - **Visual Stage Progress Bar**: Progress indicator reflecting deliverable status (10% Backlog, 25% To-Do, 60% In Progress, 100% Completed).
  - **Admin-Only Delete**: Trash icon button (`DELETE /api/tasks/:id`) visible only to Admin accounts.

---

### 6. Setup Instructions to Run Both Client and Server Locally

#### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local MongoDB Community Server running at `mongodb://127.0.0.1:27017` OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string)

---

#### 1. Clone the Repository
```bash
git clone https://github.com/TheGuy24084/corporate-task-tracker.git
cd corporate-task-tracker
```

---

#### 2. Server (Backend) Configuration & Startup
Navigate into the server directory, install dependencies, and start the API:

```bash
cd server
npm install
```

Ensure a `.env` file exists in `server/` with the following environment variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/corporate-task-tracker
JWT_SECRET=supersecretjwtkey123
```

Start the backend server:
```bash
# Development mode with auto-reload (nodemon)
npm run dev

# Or standard production mode
npm start
```
*The server will start on `http://localhost:5000`. You can verify by visiting `http://localhost:5000/api/health` in your browser.*

---

#### 3. Client (Frontend) Configuration & Startup
Open a new terminal window, navigate into the client directory, install dependencies, and run Vite:

```bash
cd client
npm install
```

Start the client development server:
```bash
npm run dev
```
*Vite will start the client on `http://localhost:5173`. Open this URL in your web browser.*

---

#### 4. Testing the Application Features

1. **Pre-configured Demo Credentials**:
   - The login page includes a quick **Auto-fill Admin** button with pre-configured demo credentials:
     - **Email**: `admin@company.com`
     - **Password**: `Admin123!`
2. **Custom Account Registration**:
   - Visit the `/register` page to create your own account.
   - Choose either the **User** or **Admin** role from the demo dropdown to test role-based behavior.
3. **Switching Methodologies**:
   - Click the segmented control tabs at the top of the Dashboard:
     - **Kanban Board**: Experience 3-column continuous delivery with live task status updates.
     - **Scrum Mode**: Inspect active sprint velocity, expand the Product Backlog, and click "Move to Sprint 1" to commit items.
     - **Project Management**: Review project milestone completion, overdue task alerts, and stage progress bars.
4. **Task Creation Modal (Scrum & PM Inputs)**:
   - Click **Create Task** to open the modal.
   - Set Title, Description, Priority, and Status.
   - Configure Scrum & PM fields: **Sprint** (`Backlog`, `Sprint 1`, `Sprint 2`), **Story Points** (1, 2, 3, 5, 8, 13), **Milestone** (`Phase 1: Planning`, `Phase 2: Execution`, `Phase 3: Launch`), and **Due Date**.
   - Submitting immediately inserts the task into the active view without page reload.
5. **Dynamic Search & Filtering Bar**:
   - **Search Input**: Type in any title or keyword into the search bar at the top of the Dashboard to filter tasks in real-time.
   - **Priority Filter**: Select `High (Red)`, `Medium (Yellow)`, or `Low (Blue)` to isolate tasks by priority.
   - **Status Filter**: Choose a status (`Backlog`, `To-Do`, `In Progress`, `Completed`) to filter tasks.
   - **Reset Button**: Click `Reset` to quickly restore the unfiltered view.
6. **Role-Based Access Control (RBAC) Verification**:
   - Log in as an **Admin**: Notice the purple role badge and the red **Delete** button on cards and milestone rows.
   - Log in as a standard **User**: The Delete button is hidden from the UI, and direct API calls to `DELETE /api/tasks/:id` return `403 Forbidden`.

---

## Directory Structure

```
corporate-task-tracker/
├── README.md                      # Comprehensive syllabus documentation & methodology guide
├── .gitignore                     # Root git ignore
├── server/                        # Node.js / Express.js REST API
│   ├── .env                       # Server environment variables
│   ├── index.js                   # Express application entry point & error middleware
│   ├── package.json               # Server dependencies & scripts
│   ├── controllers/
│   │   ├── authController.js      # Registration, login, and JWT generation logic
│   │   └── taskController.js      # Task CRUD, Scrum, and PM business logic
│   ├── middleware/
│   │   └── authMiddleware.js      # verifyToken and authorizeAdmin RBAC middleware
│   ├── models/
│   │   ├── Task.js                # Mongoose schema (status, sprint, storyPoints, milestone, dates)
│   │   └── User.js                # Mongoose schema for users & roles
│   └── routes/
│       ├── authRoutes.js          # Routes for authentication endpoints
│       └── taskRoutes.js          # Routes for task management endpoints
└── client/                        # React 19 Frontend SPA (Vite)
    ├── index.html                 # HTML5 document entry
    ├── package.json               # Client dependencies & scripts
    ├── tailwind.config.js         # Tailwind CSS theme configuration
    ├── vite.config.js             # Vite configuration
    └── src/
        ├── main.jsx               # React DOM root render
        ├── App.jsx                # Router and layout shell
        ├── index.css              # Base Tailwind directives
        ├── AuthContext.jsx        # React Context for user authentication & token
        ├── api/
        │   └── axios.js           # Axios instance with JWT request interceptor
        ├── components/
        │   ├── Navbar.jsx         # Responsive header with auth status & role badges
        │   ├── TaskCard.jsx       # Interactive task card with methodology-aware badges
        │   ├── ScrumView.jsx      # Agile Scrum view with Sprint selector, Backlog & Velocity
        │   └── ProjectManagementView.jsx # PM view with Milestone grouping, deadlines & progress
        └── pages/
            ├── Dashboard.jsx      # Unified dashboard with methodology switcher & filters
            ├── Login.jsx          # Login page with demo auto-fill
            └── Register.jsx       # Registration page with role selector
```

---

## Verification & Quality Assurance

- **Frontend Build**: Verified with `npm run build` using Vite (built cleanly in under 2 seconds).
- **Frontend Linter**: Validated with `npm run lint` using oxlint (0 errors).
- **Backend Syntax**: Verified with Node.js syntax analysis (`node -c`).
- **REST Conformance**: All endpoints conform to standard HTTP status codes, structured JSON error responses, and token authorization.
