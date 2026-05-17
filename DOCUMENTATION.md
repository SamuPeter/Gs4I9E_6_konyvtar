# Library Management System - Technical Documentation

This guide walks you through how the application is built, how to set it up, and how to use the API.

---

## Table of Contents

1. [Application Structure](#application-structure)
2. [Installation Guide](#installation-guide)
3. [Configuration](#configuration)
4. [How to Run](#how-to-run)
5. [API Endpoints](#api-endpoints)
6. [Authentication](#authentication)
7. [Testing](#testing)

---

## Application Structure

The application is organized in layers. Each layer has a specific job:

### Folder Layout

```
project/
├── src/
│   ├── config/           # Database and Swagger setup
│   ├── controllers/      # Handle HTTP requests
│   ├── services/         # Business logic (do the real work)
│   ├── middleware/       # Check permissions, validate input
│   ├── routes/           # Define URL endpoints
│   ├── entities/         # Database table definitions
│   ├── utils/            # Helper functions
│   └── app.js            # Main application file
├── public/               # Website files (HTML, CSS, JavaScript)
├── tests/                # Automated tests
├── package.json          # Project dependencies
└── .env                  # Configuration file (secrets)
```

### How the Layers Work

1. **Routes** - Listen for requests at a URL (like `/api/books`)
2. **Controllers** - Receive the request and decide what to do
3. **Services** - Do the actual work (find a book, save user data, etc)
4. **Database Layer** - TypeORM talks to MySQL
5. **Entities** - Describe what a User, Book, or Loan looks like

**Example flow:**
```
User clicks "Borrow Book" button
    ↓
Frontend sends POST /api/loans request
    ↓
Route receives it, calls Controller
    ↓
Controller calls loansService.createLoan()
    ↓
Service saves to database using TypeORM
    ↓
Database saves the record
    ↓
Controller sends back success message
    ↓
User sees "Book borrowed!"
```

---

## Installation Guide

### What You Need First

- **Node.js** (version 14 or newer) - Download from nodejs.org
- **MySQL** (version 5.7 or newer) - Or MariaDB works too
- **Git** - For version control
- A code editor like VS Code

### Step 1: Clone the Project

```bash
git clone https://github.com/SamuPeter/Gs4I9E_6_konyvtar.git
cd Gs4I9E_6_konyvtar
```

### Step 2: Install Dependencies

```bash
npm install
```

This reads `package.json` and downloads all required packages:
- **express** - Web framework
- **typeorm** - Database layer
- **jsonwebtoken** - Authentication tokens
- **bcrypt** - Password encryption
- **jest** - Testing
- **swagger-ui-express** - API documentation
- **mysql2** 
- **dotenv**

### Step 3: Create MySQL Database

Open MySQL and run:

```sql
CREATE DATABASE library_db;
```

### Step 4: Create Configuration File

In the project root, create a file called `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password_here
DB_NAME=library_db
JWT_SECRET=your_secret_key_here
PORT=3000
```

**Important:** Never share the `.env` file - it has passwords!

### Step 5: Start the Application

```bash
node src/app.js
```

You should see:
```
Server running at http://localhost:3000
```

Visit that address in your browser.

---

## Configuration

### Environment Variables (.env file)

The `.env` file controls how the application runs. Here's what each setting does:

| Variable | What it does | Example |
|----------|-------------|----------|
| `DB_HOST` | Where MySQL server is | `localhost` |
| `DB_PORT` | MySQL port number | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASS` | MySQL password | `mypassword` |
| `DB_NAME` | Database name | `library_db` |
| `JWT_SECRET` | Secret for security tokens | Any long random string |
| `PORT` | Which port app listens on | `3000` |

### Database Configuration

The database config is in `src/config/data-source.js`. It tells TypeORM:
- Where to find MySQL
- Which tables to use (User, Book, Loan, AdminAuditLog)
- Connection settings

You shouldn't change this unless you know what you're doing.

---

## How to Run

### Start Development Server

```bash
node src/app.js
```

The app will be at `http://localhost:3000`

### Run Tests

```bash
npm test
```

This runs all automated tests using Jest. Look for:
- ✓ (green checkmark) = test passed
- ✗ (red X) = test failed

### View API Documentation

Start the server, then visit:
```
http://localhost:3000/api-docs
```

You'll see Swagger UI - an interactive guide to all API endpoints.

---

## API Endpoints

The API is the way the frontend talks to the backend. Here's what you can do:

### Authentication Endpoints

#### Register a New User

```
POST /api/auth/register
```

**Send this:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Get back:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "insertId": 1 }
}
```

---

#### Login

```
POST /api/auth/login
```

**Send this:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Get back:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

Save this token - you'll need it for other requests.

---

### Books Endpoints

#### Get All Books

```
GET /api/books
```

**Get back:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "978-0-7432-7356-5",
      "available": true
    }
  ]
}
```

---

#### Get One Book

```
GET /api/books/:id
```

Example: `GET /api/books/1`

**Get back:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "available": true
  }
}
```

---

### Loans Endpoints (Requires Authentication)

#### Create a Loan (Borrow a Book)

```
POST /api/loans
```

**You need to:**
1. Be logged in
2. Send your JWT token in the header

**Header:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Send this:**
```json
{
  "book_id": 1,
  "return_date": "2024-06-17"
}
```

**Get back:**
```json
{
  "success": true,
  "message": "Book borrowed successfully",
  "data": {
    "id": 5,
    "book_id": 1,
    "user_id": 1,
    "borrow_date": "2024-05-17",
    "return_date": "2024-06-17"
  }
}
```

---

#### Get Your Loans

```
GET /api/loans/my-loans
```

**Header:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Get back:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "book_id": 1,
      "book_title": "The Great Gatsby",
      "borrow_date": "2024-05-17",
      "return_date": "2024-06-17",
      "is_returned": false
    }
  ]
}
```

---

#### Return a Book

```
PUT /api/loans/:id/return
```

Example: `PUT /api/loans/5/return`

**Header:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Get back:**
```json
{
  "success": true,
  "message": "Book returned successfully"
}
```

---

### Admin Endpoints (Admin Only)

#### Get All Users

```
GET /api/admin/users
```

**Header:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

Only admins can use this.

**Get back:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "is_active": true
    }
  ]
}
```

---

#### Deactivate a User

```
PUT /api/admin/users/:id/deactivate
```

**Header:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Get back:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

## Authentication

Most API endpoints require you to be logged in. Here's how it works:

### Step 1: Register or Login

Send your email and password to:
```
POST /api/auth/register  (new users)
POST /api/auth/login     (existing users)
```

### Step 2: Get Your Token

You get back a JWT token. It looks like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi...
```

### Step 3: Use the Token

For any protected endpoint, add this header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

Example with curl:
```bash
curl -H "Authorization: Bearer eyJhbGciOi..." \
  http://localhost:3000/api/loans/my-loans
```

### Step 4: Token Expires

Tokens are valid for a limited time. If you get a 401 error, log in again to get a new token.

---

## Testing

The project includes automated tests using Jest.

### Run All Tests

```bash
npm test
```

### Run Tests for One Feature

```bash
npm test -- authService  # Test login/register
npm test -- booksController  # Test book endpoints
npm test -- loansService  # Test borrowing system
```

### What Gets Tested

- **Authentication** - Can you register and login?
- **Books** - Can you find books and see details?
- **Loans** - Can you borrow and return books?
- **Admin** - Can admins manage users?
- **Middleware** - Does authentication checking work?
- **Validation** - Are input checks working?

### Understanding Test Results

```
PASS  tests/services/authService.test.js
  authService
    register
      ✓ hashes password and returns insertId (5ms)
    login
      ✓ throws on unknown email (2ms)
      ✓ throws on wrong password (1ms)
      ✓ returns token and user on valid credentials (3ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

Green checkmarks mean tests passed. Red X means something is broken.

---

## Troubleshooting

### "Cannot find module" Error

```
Solution: Run npm install again
```

### "Connection refused" Error

```
Solution: Check if MySQL is running and .env has correct credentials
```

### "Invalid Token" Error

```
Solution: Your token expired. Log in again to get a new one.
```

### Port Already in Use

```
If port 3000 is busy, change PORT in .env to 3001 or 3002
```

---

## Quick Reference

### Important Files

- `src/app.js` - Main application
- `src/config/data-source.js` - Database setup
- `.env` - Configuration (keep secret!)
- `src/routes/` - API endpoints
- `src/services/` - Business logic

### Common Commands

```bash
npm install          # Download dependencies
node src/app.js      # Start the application
npm test             # Run tests
```

### Database Entities

- **User** - Person who uses the library
- **Book** - A book in the collection
- **Loan** - When someone borrows a book
- **AdminAuditLog** - Record of admin actions

---

## Summary

This application follows a clean structure with clear separation of concerns:

- **Frontend** - What users see (HTML, CSS, JavaScript)
- **Routes** - URL endpoints
- **Controllers** - Handle requests
- **Services** - Do the work
- **Database** - Store data

Authentication uses JWT tokens for security. All important operations are tested with Jest.

For questions or issues, check the GitHub repository or contact the development team.
