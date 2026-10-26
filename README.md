# Corporate Task Tracker — Enterprise MERN Stack Application

A production-grade, full-stack enterprise task tracking and management application built with the **MERN** stack (**MongoDB**, **Express.js**, **React.js**, and **Node.js**). This platform enables cross-functional engineering and product teams to organize project deliverables, track sprint milestones across a dynamic 3-column Kanban workflow, filter tasks in real-time, and enforce role-based access control (RBAC).

---

## Course Syllabus Outcomes Mapping

This project is structured and documented to explicitly demonstrate mastery of the five core course syllabus outcomes:

1. [Outcome 1: Introduction to Web Development](#1-introduction-to-web-development)
2. [Outcome 2: Full Stack Web Frameworks](#2-full-stack-web-frameworks)
3. [Outcome 3: RESTful Web Services](#3-restful-web-services)
4. [Outcome 4: Authentication & Authorization](#4-authentication--authorization)
5. [Outcome 5: Setup Instructions to Run Client and Server Locally](#5-setup-instructions-to-run-both-client-and-server-locally)

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
- **Component-Driven Architecture**: Modular, maintainable components including `Navbar`, `TaskCard`, `Dashboard`, `Login`, and `Register`.
- **React Hooks**:
  - `useState`: Manages local component state (tasks array, filter terms, active modal visibility, form inputs, loading indicators).
  - `useEffect`: Handles lifecycle events, initial API data synchronization, document title updates, and global keyboard shortcuts (e.g., closing modal on `Escape`).
  - `useContext`: Consumes the global authentication context (`AuthContext`) through the custom `useAuth()` hook.
- **React Router DOM (v7)**: Provides declarative routing (`/`, `/login`, `/register`, `/dashboard`), client-side redirection for unauthenticated visitors, and navigation guards.

#### D. Tailwind CSS
The styling layer utilizes **Tailwind CSS (v3.4)**:
- **Utility-First Paradigm**: Composable, maintainable class names that eliminate bulky, disconnected stylesheets.
- **Responsive Layout**: Fluid breakpoints (`sm:`, `md:`, `lg:`) enabling the Kanban board to shift effortlessly from a stacked 1-column mobile layout to a multi-column desktop workflow.
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
  |  +-------------------+  +-------------------+  +---------------------------+  |
  |  |   Pages           |  |   Components      |  |   Context & State         |  |
  |  |   - Dashboard.jsx |  |   - Navbar.jsx    |  |   - AuthContext.jsx       |  |
  |  |   - Login.jsx     |  |   - TaskCard.jsx  |  |   - (User, Token, Role)   |  |
  |  |   - Register.jsx  |  +-------------------+  +---------------------------+  |
  |  +-------------------+                                                        |
  |                                                                               |
  |  +-------------------------------------------------------------------------+  |
  |  |   Axios HTTP Client (`/api/axios.js`)                                   |  |
  |  |   - Request Interceptor: Injects `Authorization: Bearer <token>`        |  |
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
  |  |  - jwt.sign token generator        |  |  - Mongoose query populator     |  |
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
  |  |  - password: String (Hashed)       |  |  - status: Enum (To-Do, etc.)   |  |
  |  |  - role: Enum ('User', 'Admin')    |  |  - priority: Enum (Low, etc.)   |  |
  |  |  - timestamps: createdAt, etc.     |  |  - createdBy: Ref -> User       |  |
  |  +------------------------------------+  +---------------------------------+  |
  +-------------------------------------------------------------------------------+
===================================================================================
```

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
| **`POST`** | `/api/tasks` | Create a new task (automatically sets `createdBy` to token user) | `{ "title": "...", "description": "...", "status": "To-Do", "priority": "Medium" }` | `Bearer <JWT>` | `201 Created`, `400 Bad Request`, `401 Unauthorized`, `500 Server Error` |
| **`PUT`** | `/api/tasks/:id` | Update an existing task's status, title, description, or priority | `{ "status": "In Progress" \| "Completed" \| "To-Do", ... }` | `Bearer <JWT>` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Server Error` |
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
  - Can view the complete Kanban board, create new tasks, update task statuses (e.g. moving between To-Do, In Progress, and Completed), and view who created each task.
  - Does **not** have permissions to delete tasks.
- **Admin Role**:
  - High-privilege managerial role.
  - Possesses all `User` capabilities plus exclusive authorization to delete any task.
- **Dual-Layer RBAC Enforcement**:
  1. **Backend Layer (Authoritative)**: The `authorizeAdmin` middleware checks `req.user.role === 'Admin'`. Non-admin requests to `DELETE /api/tasks/:id` immediately fail with `403 Forbidden ({ message: "Access denied: Admins only" })`.
  2. **Frontend Layer (UX)**: In `TaskCard.jsx`, the red Delete button is conditionally rendered **only** when `currentUser.role === 'Admin'`. Regular users never see or interact with the delete control.
- **Role Badges**: The `Navbar` and task cards display distinctive visual role pills:
  - `Admin`: Purple badge (`bg-purple-500/20 text-purple-300`).
  - `User`: Emerald badge (`bg-emerald-500/20 text-emerald-300`).

---

### 5. Setup Instructions to Run Both Client and Server Locally

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
   - You can choose either the **User** or **Admin** role from the demo dropdown to test role-based behavior.
3. **Kanban Operations**:
   - Click **Create Task** to open the modal and create new tasks.
   - Change task status using the status dropdown on each card (automatically triggers `PUT /api/tasks/:id`).
   - If logged in as an Admin, click the red **Delete** button on any card to purge the task (triggers `DELETE /api/tasks/:id`).
4. **Dynamic Search & Filtering Bar**:
   - **Search Input**: Type in any title or keyword into the search bar at the top of the Dashboard to filter tasks in real-time across all columns.
   - **Priority Filter**: Select `High (Red)`, `Medium (Yellow)`, or `Low (Blue)` to isolate tasks by priority.
   - **Status Filter**: Choose a status (`To-Do`, `In Progress`, `Completed`) to filter tasks.
   - **Reset Button**: Click the `Reset` button to quickly restore the full Kanban sprint view.

---

## Directory Structure

```
corporate-task-tracker/
├── README.md                  # Comprehensive syllabus documentation
├── .gitignore                 # Root git ignore
├── server/                    # Node.js / Express.js REST API
│   ├── .env                   # Server environment variables
│   ├── index.js               # Express application entry point & error middleware
│   ├── package.json           # Server dependencies & scripts
│   ├── controllers/
│   │   ├── authController.js  # Registration, login, and JWT generation logic
│   │   └── taskController.js  # Task CRUD business logic and queries
│   ├── middleware/
│   │   └── authMiddleware.js  # verifyToken and authorizeAdmin RBAC middleware
│   ├── models/
│   │   ├── Task.js            # Mongoose schema for tasks
│   │   └── User.js            # Mongoose schema for users & roles
│   └── routes/
│       ├── authRoutes.js      # Routes for authentication endpoints
│       └── taskRoutes.js      # Routes for task management endpoints
└── client/                    # React 19 Frontend SPA (Vite)
    ├── index.html             # HTML5 document entry
    ├── package.json           # Client dependencies & scripts
    ├── tailwind.config.js     # Tailwind CSS theme configuration
    ├── vite.config.js         # Vite configuration
    └── src/
        ├── main.jsx           # React DOM root render
        ├── App.jsx            # Router and layout shell
        ├── index.css          # Base Tailwind directives
        ├── AuthContext.jsx    # React Context for user authentication & token
        ├── api/
        │   └── axios.js       # Axios instance with JWT request interceptor
        ├── components/
        │   ├── Navbar.jsx     # Responsive header with auth status & role badges
        │   └── TaskCard.jsx   # Interactive task card with status change & admin delete
        └── pages/
            ├── Dashboard.jsx  # Kanban board with search, filters, metrics, & modal
            ├── Login.jsx      # Login page with demo auto-fill
            └── Register.jsx   # Registration page with role selector
```

---

## Verification & Quality Assurance

- **Frontend Build**: Verified with `npm run build` using Vite.
- **Frontend Linter**: Validated with `npm run lint` using oxlint.
- **Backend Syntax**: Verified with Node.js syntax analysis (`node -c`).
- **REST Conformance**: All endpoints conform to standard HTTP status codes, structured JSON error responses, and token authorization.
