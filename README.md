# Smart Task Manager

A full-stack application demonstrating the flexible, schema-less nature of MongoDB.

## Features
- **Express.js API** providing RESTful CRUD operations.
- **Mongoose Data Modeling** using `Schema.Types.Mixed` to allow completely dynamic fields for any individual task without altering the database schema.
- **Vanilla JavaScript Frontend** showcasing a modern, minimal, glassmorphic layout. It renders arbitrary, deeply nested `dynamicFields` dynamically using responsive capsules.

## Tech Stack
- Frontend: HTML5, CSS3, Vanilla JS
- Backend: Node.js, Express.js
- Database: MongoDB (Atlas)

## Project Structure
```text
j:\DBMS_project
│
├── backend/
│   ├── models/
│   │   └── Task.js       # Mongoose model with dynamic schema
│   ├── routes/
│   │   └── tasks.js      # Express router
│   ├── .env              # Environment vars (MongoDB URI)
│   ├── package.json
│   └── server.js         # Entry point
│
└── frontend/
    ├── app.js            # API & DOM logic
    ├── index.html        # App structure
    └── style.css         # Modern design
```

## Running the Application

### 1. Start the Backend Server
The backend connects to MongoDB Atlas using the URI provided in `backend/.env`.

Open a terminal, navigate to the `backend` directory, and run the server:
```bash
cd backend
# Ensure dependencies are installed
npm install
# Start
node server.js
```
The server will run on `http://localhost:5000` and should print `Successfully connected to MongoDB Atlas`.

### 2. View the Frontend
Since the frontend uses plain HTML, CSS, and JS, you can simply open the `frontend/index.html` file in your preferred web browser, or serve it using an extension like Visual Studio Code's "Live Server".

Try creating tasks with varying inputs in the "Dynamic Fields" text area! For example:
```json
{
  "priority": "Critical",
  "tags": ["frontend", "bug", "urgent"],
  "estimatedHours": 5,
  "assignedTo": { "name": "Alice", "role": "Developer" }
}
```
You'll see MongoDB persists these perfectly, and the UI adapts automatically to render any array, nested object, or string seamlessly.
