# Todo App

A full-stack todo app with user accounts. Each user signs up, logs in, and manages their own private list of todos.

Built with **React** (Create React App) on the frontend and **Node.js + Express + MongoDB** on the backend, with **JWT** authentication.

## Features

- Sign up and log in with email and password
- Stay logged in after refreshing the page (sessions last 7 days)
- Each user only sees and can change their own todos
- Add, complete, edit (double-click) and delete todos
- Filter by All / Active / Completed
- "Items left" counter and "Clear completed" button
- Progress bar ("3 of 8 done")
- Light / dark mode (follows your system setting, remembers your choice)
- Pop-up notifications for actions and errors
- Clear error messages (invalid email, short password, wrong login, server offline)

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend | React 19, Create React App, Ant Design 6 (components, icons, light/dark theme) |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`), password hashing with `bcryptjs` |
| Tooling | nodemon (backend auto-restart), Jest + React Testing Library |

## Project structure

```
todo-app/
├── backend/
│   ├── server.js                  # entry point: load .env, connect to MongoDB, start server
│   ├── app.js                     # Express setup: middleware, routes, error handlers
│   ├── config/db.js               # MongoDB connection
│   ├── models/
│   │   ├── User.js                # user schema + password hashing
│   │   └── Todo.js                # todo schema (linked to its owner)
│   ├── controllers/
│   │   ├── authController.js      # register, login, current user
│   │   └── todoController.js      # todo CRUD, always filtered by the logged-in user
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/...
│   │   └── todoRoutes.js          # /api/todos/... (login required)
│   ├── middleware/
│   │   ├── auth.js                # checks the JWT and sets req.user
│   │   └── errorHandler.js        # 404 + central error handling
│   └── .env.example               # template for environment variables
└── frontend/
    └── src/
        ├── App.js                 # shows login form or todo page
        ├── api.js                 # all backend requests + token storage
        ├── hooks/
        │   └── useTheme.js        # light / dark mode
        └── components/
            ├── AuthForm.js        # login / signup form
            ├── TodoPage.js        # todo list, filters, footer
            ├── TodoForm.js        # "add todo" input
            ├── TodoItem.js        # a single todo row
            └── ProgressBar.js     # "3 of 8 done" bar
```

## Getting started

### 1. Prerequisites

- [Node.js](https://nodejs.org) 18 or newer
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally

On macOS with Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### 2. Clone and install

```bash
git clone https://github.com/thefinancesage47-bit/todo-app.git
cd todo-app

cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure the backend

Create `backend/.env` from the template:

```bash
cd backend
cp .env.example .env
```

Then set `JWT_SECRET` to a long random string. You can generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Port the API listens on | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/todo-app` |
| `JWT_SECRET` | Secret used to sign login tokens (**required**, keep it private) | none |
| `JWT_EXPIRES_IN` | How long a login lasts | `7d` |

### 4. Run the app

Use two terminals:

```bash
# Terminal 1 - backend (http://localhost:5000)
cd backend
npm run dev
```

```bash
# Terminal 2 - frontend (http://localhost:3000)
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000), create an account and start adding todos.

In development, the frontend's `"proxy"` setting in `package.json` forwards `/api` requests to the backend, so no extra configuration is needed.

## API reference

All request and response bodies are JSON. Todo routes require the header:

```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `{ name, email, password }` | `201` `{ token, user }` |
| `POST` | `/api/auth/login` | `{ email, password }` | `200` `{ token, user }` |
| `GET` | `/api/auth/me` | none | `200` `{ user }` (login required) |

### Todos (login required)

| Method | Endpoint | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/api/todos` | none | `200` list of the user's todos |
| `POST` | `/api/todos` | `{ text }` | `201` the new todo |
| `PUT` | `/api/todos/:id` | `{ text?, completed? }` | `200` the updated todo |
| `DELETE` | `/api/todos/:id` | none | `204` no content |

Errors are returned as `{ "error": "message" }` with a matching status code: `400` invalid input, `401` not logged in or bad credentials, `404` not found, `409` email already registered, `500` server error.

## How authentication works

1. On signup, the password is hashed with bcrypt before it is saved; the real password is never stored.
2. On signup or login, the server returns a signed JWT containing the user's id.
3. The frontend stores the token in `localStorage` and sends it with every request.
4. The `auth` middleware verifies the token and loads the user. Every todo query is filtered by that user, so nobody can read or change another user's todos.
5. Logging out deletes the token in the browser. An expired or invalid token sends the user back to the login screen.

## Viewing the data

Data lives in the `todo-app` database, in the `users` and `todos` collections.

```bash
mongosh todo-app --eval 'db.users.find()'
mongosh todo-app --eval 'db.todos.find()'
```

Or connect [MongoDB Compass](https://www.mongodb.com/products/compass) to `mongodb://127.0.0.1:27017`.

## Running tests

```bash
cd frontend
npm test
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Failed to connect to MongoDB` | Start MongoDB: `brew services start mongodb-community` |
| `JWT_SECRET is missing` | Create `backend/.env` as described in step 3 |
| `Port 5000 already in use` | Stop the old process: `kill $(lsof -ti :5000)`, or on macOS turn off AirPlay Receiver, or set a different `PORT` and update `"proxy"` in `frontend/package.json` |
| "Could not connect to the server" in the app | Make sure the backend is running |
