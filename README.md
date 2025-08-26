# Study Time Tracker (Full-Stack)

## Backend (server)
1) Open a terminal:
```
cd server
npm install
npm start
```
API runs at `http://localhost:4000`.

## Frontend (client)
If you **already have** a React app, copy `src/*` into your app's `src` and add `react-router-dom`.
Or to run this client:
```
cd client
npm install
npm start
```
Set the backend URL by creating `.env` in `client` with:
```
REACT_APP_API_URL=http://localhost:4000
```
This repository is configured without a database connection:
- In-Memory Mock DB: A zero-dependency option perfect for live demos, portfolio showcases, and easy deployment without needing a database host.

## Features
- Register / Login (JWT)
- Start/Pause/Reset timer and save a study session
- List, filter by date, delete sessions
- Daily & total time summary

