# PIP API Testing Guide

This guide provides instructions on how to test the PIP Backend API using tools like **Postman**, **Insomnia**, or the **VS Code REST Client**.[cite: 1]

## 1. General Configuration

- **Base URL:** `http://localhost:8000`[cite: 1]
- **Global Headers:** For all POST/PUT requests, ensure you include:[cite: 1]
  - `Content-Type: application/json`[cite: 1]

---

## 2. System Health Check

Verify the server is running and the environment is configured correctly.[cite: 1]

- **Method:** GET[cite: 1]
- **URL:** `/health`[cite: 1]
- **Expected Response:** 200 OK[cite: 1]

---

## 3. Authentication Endpoints

### Register User
Creates a new account, hashes the password using bcrypt, and initializes user progression.[cite: 1]

- **Method:** POST[cite: 1]
- **URL:** `/api/register`[cite: 1]
- **Constraints:** Password must be at least 6 characters.[cite: 1]
- **Body (JSON):**

  ```[cite: 1]
  {
    "name": "testuser",
    "email": "user@example.com",
    "password": "securepassword123"
  }

### Login User
Authenticates a user and returns their profile data.[cite: 1]

- **Method:** POST[cite: 1]
- **URL:** `/api/login`[cite: 1]
- **Body (JSON):**

  ```[cite: 1]
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
- **Success Response:** 200 OK (Returns user object without the password hash).[cite: 1]

---

## 4. User Endpoints

### Get All Users
Returns a list of all registered users (helpful for finding IDs during testing).[cite: 1]

- **Method:** GET[cite: 1]
- **URL:** `/api/users`[cite: 1]

### Get User Profile
Returns detailed profile data for a specific user.[cite: 1]

- **Method:** GET[cite: 1]
- **URL:** `/api/users/:id`[cite: 1]

### Check Onboarding Status
Returns whether the user has completed the initial onboarding process.[cite: 1]

- **Method:** GET[cite: 1]
- **URL:** `/api/users/:id/onboarding-status`[cite: 1]
- **Response Example:**
  ```[cite: 1]
  {
    "userId": "12345",
    "isOnboarded": true
  }

### Get User Progress
Returns the specific progression levels and statistics for a user, including unlocked rewards.[cite: 1]

- **Method:** GET[cite: 1]
- **URL:** `/api/users/:id/progress`[cite: 1]

---

## 5. Progress & Reward Endpoints

### XP Registration and Reward Unlocking
Registers XP for a specific activity (e.g., a correctly answered question) and automatically unlocks rewards upon level-up.[cite: 1]

- **Method:** POST[cite: 1]
- **URL:** `/api/progress/xp`[cite: 1]
- **Body (JSON):**
  ```[cite: 1]
  {
    "userId": "12345",
    "activityId": "quiz_q1_success",
    "xpAmount": 15
  }
- **Success Response:** 200 OK (Returns total XP, current level, and a list of `unlockedRewards` if any).[cite: 1]
- **Conflict Response:** 409 Conflict (If XP for this activity has already been awarded).[cite: 1]

### Complete Lesson
Marks a lesson as completed, updates progress, streak, and awards XP, potentially unlocking rewards.[cite: 1]

- **Method:** PUT[cite: 1]
- **URL:** `/api/users/:id/progress/lesson/:lessonId`[cite: 1]
- **Success Response:** 200 OK (Returns lesson completion status, XP awarded, total XP, current level, level-up status, and a list of `unlockedRewards` if any).[cite: 1]