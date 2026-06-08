# PIP API Testing Guide

This guide provides instructions on how to test the PIP Backend API using tools like **Postman**, **Insomnia**, or the **VS Code REST Client**.

## 1. General Configuration

- **Base URL:** http://localhost:8000
- **Global Headers:** For all POST requests, ensure you include:
    - Content-Type: application/json

---

## 2. System Health Check

Verify the server is running and the environment is configured correctly.

- **Method:** GET
- **URL:** /health
- **Expected Response:** 200 OK

---

## 3. Authentication Endpoints

### Register User
Creates a new account, hashes the password using bcrypt, and initializes user progression.

- **Method:** POST
- **URL:** /api/register
- **Constraints:** Password must be at least 6 characters.
- **Body (JSON):**
  {
  "name": "testuser",
  "email": "user@example.com",
  "password": "securepassword123"
  }

### Login User
Authenticates a user and returns their profile data.

- **Method:** POST
- **URL:** /api/login
- **Body (JSON):**
  {
  "email": "user@example.com",
  "password": "securepassword123"
  }
- **Success Response:** 200 OK (Returns user object without the password hash).

---

## 4. User Endpoints

### Get All Users
Returns a list of all registered users (helpful for finding IDs during testing).

- **Method:** GET
- **URL:** /api/users

### Get User Profile
Returns detailed profile data for a specific user.

- **Method:** GET
- **URL:** /api/users/:id

### Check Onboarding Status
Returns whether the user has completed the initial onboarding process.

- **Method:** GET
- **URL:** /api/users/:id/onboarding-status
- **Response Example:**
  {
  "userId": "12345",
  "isOnboarded": true
  }

### Get User Progress
Returns the specific progression levels and statistics for a user.

- **Method:** GET
- **URL:** /api/users/:id/progress

---
