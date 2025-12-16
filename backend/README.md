# CareerMatch Backend

This directory contains the Node.js backend for the CareerMatch application.

## Tech Stack

- **Framework**: Express.js
- **Database**: SQLite
- **Query Builder/ORM**: Knex.js
- **Authentication**: JSON Web Tokens (JWT), Passport.js (for Google OAuth)
- **Password Hashing**: bcrypt
- **AI**: Google Gemini API

## Setup and Installation

1.  **Navigate to Backend Directory**:
    Open your terminal and change into this directory.
    ```sh
    cd backend
    ```

2.  **Install Dependencies**:
    Install all the required npm packages.
    ```sh
    npm install
    ```

3.  **Set Up Environment Variables**:
    Create a `.env` file in this directory by copying the example file.
    ```sh
    cp .env.example .env
    ```
    - The `.env.example` file contains a default `JWT_SECRET`. You can change this to any secure random string.
    - **You must add your Google Gemini API key** to the `.env` file.
    - **You must add your Google OAuth 2.0 Credentials**. You can get these from the Google Cloud Console.
    ```
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID_HERE"
    GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET_HERE"
    ```
    - For local development, when setting up your Google OAuth credentials, you must add `http://localhost:3001/api/auth/google/callback` as an **Authorized redirect URI**.


4.  **Run Database Migrations and Seeding**:
    This command will create the database file (`data.sqlite3`), set up all the necessary tables, and create a default admin user.
    ```sh
    npm run db:setup
    ```
    This is a shortcut for `npx knex migrate:latest && npx knex seed:run`.

## Running the Server

-   **Development Mode**:
    To run the server in development mode with automatic reloading on file changes (using `nodemon`):
    ```sh
    npm run dev
    ```
    The server will start, typically on `http://localhost:3001`.

-   **Production Mode**:
    To run the server in production mode:
    ```sh
    npm start
    ```

## Sample User Accounts

After running `npm run db:setup`, the following admin account will be created:

-   **Email**: `admin@example.com`
-   **Password**: `admin123`

Student accounts can be created through the signup page.

## API Endpoints

The API is structured with versioning and role-based access.

-   `/api/auth/` - Authentication routes (login, register, google).
-   `/api/public/` - Publicly accessible data (e.g., list of internships).
-   `/api/student/` - Routes accessible only by authenticated students.
-   `/api/admin/` - Routes accessible only by authenticated admins.