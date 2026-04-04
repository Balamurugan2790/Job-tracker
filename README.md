# Job Application Tracker

A full-stack web application for managing and tracking job applications with user authentication and AI-powered insights.

## Features

- **User Authentication**: Register and login to manage personal job applications
- **Job Management**: Add, update, delete, and filter/search job applications
- **Status Tracking**: Track application status (applied, interview, rejected)
- **AI Insights**: View statistics and charts on application success rates
- **Modern UI**: Built with Material-UI for a clean, responsive interface
- **Persistent Storage**: SQLite database for data persistence

## Setup

### Backend

1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `python app.py`

### Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Usage

- Register a new account or login
- Add job applications using the "Add Job" button
- View and manage jobs in the Jobs tab
- Check insights and statistics in the Insights tab with interactive charts
- Filter and search applications for easy navigation

## API Endpoints

- `POST /register` - Register a new user
- `POST /login` - Login and get JWT token
- `GET /jobs` - Retrieve user's jobs (with optional filters)
- `POST /jobs` - Add a new job
- `PUT /jobs/<id>` - Update a job
- `DELETE /jobs/<id>` - Delete a job
- `GET /insights` - Get application statistics and insights