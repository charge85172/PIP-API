# API Testing Guide

Comprehensive backend testing documentation for the Personal Improvement Platform (PIP). This guide provides detailed Postman-ready test cases for all API endpoints.

---

## Table of Contents

1.  [General Configuration](#1-general-configuration)
    *   [Language Localization](#11-language-localization)
2.  [System Health Check](#2-system-health-check)
3.  [Authentication & Onboarding](#3-authentication--onboarding)
    *   [Register Account](#31-register-account)
    *   [Login](#32-login)
    *   [Complete Onboarding](#33-complete-onboarding)
4.  [User Endpoints](#4-user-endpoints)
    *   [Get All Users](#41-get-all-users)
    *   [Get User By ID](#42-get-user-by-id)
    *   [Get User Progress](#43-get-user-progress)
    *   [Get Onboarding Status](#44-get-onboarding-status)
    *   [Create User](#45-create-user)
    *   [Update User](#46-update-user)
    *   [Delete User](#47-delete-user)
    *   [Get User Streaks](#48-get-user-streaks)
    *   [Get Completed Lessons for User](#49-get-completed-lessons-for-user)
5.  [Gamification (XP & Rewards)](#5-gamification-xp--rewards)
    *   [Manually Award XP](#51-manually-award-xp)
    *   [Complete Lesson](#52-complete-lesson)
    *   [Reset Lesson Completion](#53-reset-lesson-completion)
    *   [Override User XP](#54-override-user-xp)
6.  [Lesson Quiz Flow](#6-lesson-quiz-flow)
    *   [Start Lesson Quiz](#61-start-lesson-quiz)
    *   [Submit Answer](#62-submit-answer)
    *   [Complete Quiz Attempt](#63-complete-quiz-attempt)
    *   [Get Lesson Attempts (Single)](#64-get-lesson-attempts-single)
    *   [Get Lesson Result](#65-get-lesson-result)
    *   [Get All Lesson Attempts for User](#66-get-all-lesson-attempts-for-user)
    *   [Delete Lesson Attempt](#67-delete-lesson-attempt)
7.  [Hamsterverse Data](#7-hamsterverse-data)
    *   [Get Dashboard View](#71-get-dashboard-view)
8.  [Course & Content Endpoints](#8-course--content-endpoints)
    *   [Get All Courses](#81-get-all-courses)
    *   [Get Course By ID](#82-get-course-by-id)
    *   [Create Course](#83-create-course)
    *   [Update Course](#84-update-course)
    *   [Delete Course](#85-delete-course)
    *   [Get Modules for Course](#86-get-modules-for-course)
    *   [Get Module By ID](#87-get-module-by-id)
    *   [Create Module](#88-create-module)
    *   [Update Module](#89-update-module)
    *   [Delete Module](#810-delete-module)
    *   [Get Lessons for Module](#811-get-lessons-for-module)
    *   [Get Lesson By ID](#812-get-lesson-by-id)
    *   [Create Lesson](#813-create-lesson)
    *   [Update Lesson](#814-update-lesson)
    *   [Delete Lesson](#815-delete-lesson)
    *   [Get Questions for Lesson](#816-get-questions-for-lesson)
    *   [Get Question By ID](#817-get-question-by-id)
    *   [Create Question](#818-create-question)
    *   [Update Question](#819-update-question)
    *   [Delete Question](#820-delete-question)

---

## 1. General Configuration

*   **Base URL:** `http://localhost:8000`
*   **Global Headers:**
    *   `Content-Type: application/json`

**Precondition:** Ensure your local server is running by executing `npm run dev` or `node index.js` before testing.

### 1.1. Language Localization

*   **Purpose:** The backend supports multiple languages (Dutch, English, and Hamster) by responding to the `Accept-Language` HTTP header. This allows the frontend to request content in a preferred language.
*   **How to Test:** Include the `Accept-Language` header in your requests with the desired language code.

#### Example: Testing with `/health` endpoint

You can test this functionality with any endpoint that returns user-facing messages. The `/health` endpoint is a simple way to verify.

*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/health`
*   **Authentication:** Not required.

#### Request Headers for different languages:

*   **Dutch:**
    *   `Accept-Language: nl`
*   **English:**
    *   `Accept-Language: en`
*   **Hamster:**
    *   `Accept-Language: hamster`

#### Expected Success Responses (200 OK)

*   **For `Accept-Language: nl`:**
    ```json
    {
      "status": "OK",
      "message": "PIP Backend draait"
    }
    ```
*   **For `Accept-Language: en`:**
    ```json
    {
      "status": "OK",
      "message": "PIP Backend is running"
    }
    ```
*   **For `Accept-Language: hamster`:**
    ```json
    {
      "status": "OK",
      "message": "PIIP Baackeend iis ruunniiing"
    }
    ```
    *Note: The exact "Hamster" message might vary based on the actual translation logic in `utils/translations.js`.*

---

## 2. System Health Check

### 2.1. Verify Server State

*   **Purpose:** Checks if the backend server is operational.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/health`
*   **Authentication:** Not required.

#### Success Response (200 OK)

```json
{
  "status": "OK",
  "message": "PIP Backend is running"
}
```

---

## 3. Authentication & Onboarding

> *New users start at Level 0. Completion of onboarding grants Level 1 and Reward ID 1.*

### 3.1. Register Account

*   **Purpose:** Creates a new user account.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/register`
*   **Authentication:** Not required.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `name` (string, required): User's full name.
    *   `email` (string, required): Unique email address for the user.
    *   `password` (string, required): User's password (minimum 6 characters).

#### Request Body Example

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

#### Success Response (201 Created)

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "level": 0,
    "xp": 0,
    "on_boarding": 0
  }
}
```

#### Error Responses

*   **400 Bad Request - Duplicate Email:**
    ```json
    {
      "message": "Email already registered"
    }
    ```
*   **400 Bad Request - Weak Password:**
    ```json
    {
      "message": "Password must be at least 6 characters long"
    }
    ```

### 3.2. Login

*   **Purpose:** Authenticates a user and provides an access token.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/login`
*   **Authentication:** Not required.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `email` (string, required): User's registered email address.
    *   `password` (string, required): User's password.

#### Request Body Example

```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "level": 0,
    "xp": 0,
    "on_boarding": 0
  }
}
```
*   **Note:** Store the `token` from the response to use in the `Authorization` header for subsequent authenticated requests.

#### Error Responses

*   **401 Unauthorized - Invalid Credentials:**
    ```json
    {
      "message": "Invalid credentials"
    }
    ```

### 3.3. Complete Onboarding

*   **Purpose:** Marks a user's onboarding as complete, awards initial XP/level, and a specific reward.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/users/:id/complete-onboarding`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:id` (integer, required): The ID of the user to complete onboarding for.
*   **Notes:** Sets `on_boarding = 1`, upgrades level to 1, and awards **Hamster Wheel** (Reward ID 1).

#### Success Response (200 OK)

```json
{
  "message": "Onboarding completed successfully",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "level": 1,
    "xp": 0,
    "on_boarding": 1
  },
  "rewardAwarded": {
    "id": 1,
    "name": "Hamster Wheel",
    "description": "First step to a better you!"
  }
}
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User not found"
    }
    ```
*   **400 Bad Request - Already Onboarded:**
    ```json
    {
      "message": "User has already completed onboarding"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

---

## 4. User Endpoints

### 4.1. Get All Users

*   **Purpose:** Retrieves a list of all registered users.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/users`
*   **Authentication:** Required (JWT in `Authorization` header).

#### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "level": 1,
    "xp": 50,
    "on_boarding": 1
  },
  {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "level": 1,
    "xp": 0,
    "on_boarding": 1
  }
]
```

#### Error Responses

*   **401 Unauthorized:** If no valid JWT token is provided.

### 4.2. Get User By ID

*   **Purpose:** Retrieves details for a specific user.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/users/:id`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:id` (integer, required): The ID of the user to retrieve.

#### Success Response (200 OK)

```json
{
  "id": 2,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "level": 1,
  "xp": 0,
  "on_boarding": 1
}
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 4.3. Get User Progress

*   **Purpose:** Returns a summary of a user's streak, completed lessons, and earned rewards.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/users/:id/progress`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:id` (integer, required): The ID of the user.

#### Success Response (200 OK)

```json
{
  "userId": 2,
  "streak": {
    "current": 5,
    "longest": 10
  },
  "lessonsCompleted": 3,
  "rewardsEarned": [
    {
      "id": 1,
      "name": "Hamster Wheel"
    },
    {
      "id": 2,
      "name": "Golden Carrot"
    }
  ]
}
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User progress not found for this user"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 4.4. Get Onboarding Status

*   **Purpose:** Checks if a user has completed the onboarding process.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/users/:id/onboarding-status`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:id` (integer, required): The ID of the user.

#### Success Response (200 OK)

```json
{
  "userId": 2,
  "onboardingCompleted": true
}
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 4.5. Create User

*   **Purpose:** Creates a new user account. This is an administrative endpoint.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/users`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `name` (string, required): User's full name.
    *   `email` (string, required): Unique email address for the user.
    *   `password` (string, required): User's password (minimum 6 characters).

#### Request Body Example

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "strongpassword123"
}
```

#### Success Response (201 Created)

```json
{
  "message": "User created successfully",
  "user": {
    "id": 3,
    "name": "New User",
    "email": "newuser@example.com",
    "level": 0,
    "xp": 0,
    "on_boarding": 0
  }
}
```

#### Error Responses

*   **400 Bad Request - Duplicate Email:**
    ```json
    {
      "message": "Email already registered"
    }
    ```
*   **400 Bad Request - Weak Password:**
    ```json
    {
      "message": "Password must be at least 6 characters long"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 4.6. Update User

*   **Purpose:** Updates an existing user's details.
*   **Method:** `PUT`
*   **URL:** `{{BaseURL}}/api/users/:id`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:id` (integer, required): The ID of the user to update.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `name` (string, optional): New name for the user.
    *   `email` (string, optional): New email for the user (must be unique).
    *   `password` (string, optional): New password for the user (minimum 6 characters).
    *   `level` (integer, optional): New level for the user.
    *   `xp` (integer, optional): New XP for the user.
    *   `on_boarding` (integer, optional): Onboarding status (0 or 1).

#### Request Body Example

```json
{
  "name": "Updated User Name",
  "level": 2
}
```

#### Success Response (200 OK)

```json
{
  "message": "User updated successfully",
  "user": {
    "id": 3,
    "name": "Updated User Name",
    "email": "newuser@example.com",
    "level": 2,
    "xp": 0,
    "on_boarding": 0
  }
}
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User not found"
    }
    ```
*   **400 Bad Request - Invalid Data:**
    ```json
    {
      "message": "Invalid email format"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 4.7. Delete User

*   **Purpose:** Deletes a user account.
*   **Method:** `DELETE`
*   **URL:** `{{BaseURL}}/api/users/:id`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:id` (integer, required): The ID of the user to delete.

#### Success Response (200 OK)

```json
{
  "message": "User deleted successfully"
}
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 4.8. Get User Streaks

*   **Purpose:** Retrieves the current and longest streak for a specific user.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/users/:userId/streak`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:userId` (integer, required): The ID of the user.

#### Success Response (200 OK)

```json
{
  "userId": 2,
  "currentStreak": 7,
  "longestStreak": 15
}
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 4.9. Get Completed Lessons for User

*   **Purpose:** Retrieves a list of all lessons completed by a specific user.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/progress/users/:userId/completed`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:userId` (integer, required): The ID of the user.

#### Success Response (200 OK)

```json
[
  {
    "lessonId": 1,
    "title": "The Cue-Routine-Reward Cycle",
    "completedAt": "2023-11-01T10:00:00Z"
  },
  {
    "lessonId": 2,
    "title": "Identifying Your Cues",
    "completedAt": "2023-11-02T11:30:00Z"
  }
]
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User not found or has no completed lessons"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

---

## 5. Gamification (XP & Rewards)

### 5.1. Manually Award XP

*   **Purpose:** Awards a specified amount of XP to a user for a given activity.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/progress/xp`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `userId` (integer, required): The ID of the user to award XP to.
    *   `activityType` (string, required): Type of activity (e.g., "daily_checkin", "bonus").
    *   `activityId` (string, required): Unique identifier for the specific activity instance.
    *   `xpAmount` (integer, required): The amount of XP to award.
*   **Precondition:** User must have completed onboarding (Level > 0).

#### Request Body Example

```json
{
  "userId": 2,
  "activityType": "daily_checkin",
  "activityId": "day_2023_10_27",
  "xpAmount": 15
}
```

#### Success Response (200 OK)

```json
{
  "message": "XP awarded successfully",
  "newXp": 15,
  "newLevel": 1
}
```

#### Error Responses

*   **400 Bad Request - User Level 0:**
    ```json
    {
      "message": "Cannot award XP to a Level 0 user. Complete onboarding first."
    }
    ```
*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 5.2. Complete Lesson

*   **Purpose:** Marks a lesson as completed for a user and automatically awards XP.
*   **Method:** `PUT`
*   **URL:** `{{BaseURL}}/api/users/:id/progress/lesson/:lessonId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:id` (integer, required): The ID of the user.
    *   `:lessonId` (integer, required): The ID of the lesson being completed.
*   **Notes:** Awards 20 XP automatically upon success.

#### Success Response (200 OK)

```json
{
  "message": "Lesson completed successfully",
  "xpAwarded": 20,
  "newXp": 35,
  "newLevel": 1
}
```

#### Error Responses

*   **404 Not Found - User/Lesson Not Found:**
    ```json
    {
      "message": "User or Lesson not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 5.3. Reset Lesson Completion

*   **Purpose:** Removes the completion status of a specific lesson for a user. This allows the lesson to be taken again and is useful for testing XP triggers or progression logic.
*   **Method:** `DELETE`
*   **URL:** `{{BaseURL}}/api/progress/users/:userId/lessons/:lessonId/completion`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:userId` (integer, required): The ID of the user.
    *   `:lessonId` (integer, required): The ID of the lesson to reset.

#### Success Response (200 OK)

```json
{
  "message": "Lesson completion reset successfully"
}
```

#### Error Responses

*   **404 Not Found - No Progress Found:**
    ```json
    {
      "message": "No completion record found for this user and lesson"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.
*   **500 Internal Server Error:** If a database error occurs.

### 5.4. Override User XP

*   **Purpose:** Directly sets a user's XP to a specific value. This is typically an administrative or debugging tool.
*   **Method:** `PATCH`
*   **URL:** `{{BaseURL}}/api/progress/users/:userId/xp/override`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:userId` (integer, required): The ID of the user whose XP to override.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `xpAmount` (integer, required): The new XP value for the user.

#### Request Body Example

```json
{
  "xpAmount": 500
}
```

#### Success Response (200 OK)

```json
{
  "message": "User XP overridden successfully",
  "newXp": 500,
  "newLevel": 5
}
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "User not found"
    }
    ```
*   **400 Bad Request - Invalid XP Amount:**
    ```json
    {
      "message": "XP amount must be a non-negative integer"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

---

## 6. Lesson Quiz Flow

### 6.1. Start Lesson Quiz

*   **Purpose:** Initiates a quiz attempt for a specific lesson and user, returning quiz questions.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/progress/lessons/:lessonId/start`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:lessonId` (integer, required): The ID of the lesson for which to start the quiz.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `userId` (integer, required): The ID of the user starting the quiz.

#### Request Body Example

```json
{
  "userId": 2
}
```

#### Success Response (201 Created)

```json
{
  "message": "Lesson attempt started",
  "attemptId": 101,
  "lessonId": 1,
  "userId": 2,
  "questions": [
    {
      "questionId": 1,
      "text": "What is the capital of France?",
      "options": [
        {"id": 1, "text": "Berlin"},
        {"id": 2, "text": "Madrid"},
        {"id": 3, "text": "Paris"},
        {"id": 4, "text": "Rome"}
      ]
    }
  ]
}
```
*   **Note:** Store the `attemptId` for submitting answers and completing the quiz.

#### Error Responses

*   **404 Not Found - Lesson Not Found:**
    ```json
    {
      "message": "Lesson not found"
    }
    ```
*   **400 Bad Request - Quiz Already Started:**
    ```json
    {
      "message": "Quiz already started for this lesson and user"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 6.2. Submit Answer

*   **Purpose:** Submits an answer for a specific question within an ongoing quiz attempt.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/progress/attempts/:attemptId/answers`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:attemptId` (integer, required): The ID of the active quiz attempt.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `questionId` (integer, required): The ID of the question being answered.
    *   `answerId` (integer, required): The ID of the selected answer option.

#### Request Body Example

```json
{
  "questionId": 1,
  "answerId": 3
}
```

#### Success Response (200 OK)

```json
{
  "message": "Answer submitted successfully",
  "attemptId": 101,
  "questionId": 1,
  "answerId": 3,
  "isCorrect": true
}
```

#### Error Responses

*   **404 Not Found - Attempt/Question/Answer Not Found:**
    ```json
    {
      "message": "Attempt, Question, or Answer not found"
    }
    ```
*   **400 Bad Request - Answer Already Submitted:**
    ```json
    {
      "message": "Answer already submitted for this question in this attempt"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 6.3. Complete Quiz Attempt

*   **Purpose:** Finalizes a quiz attempt, calculates the score, and updates user progression if passed.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/progress/attempts/:attemptId/complete`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:attemptId` (integer, required): The ID of the quiz attempt to complete.
*   **Notes:** Returns the quiz result. If the score is ≥ 60%, the user's progression status is updated.

#### Success Response (200 OK)

```json
{
  "message": "Quiz attempt completed",
  "attemptId": 101,
  "score": 80,
  "passed": true,
  "xpAwarded": 20,
  "newXp": 55,
  "newLevel": 1
}
```

#### Error Responses

*   **404 Not Found - Attempt Not Found:**
    ```json
    {
      "message": "Quiz attempt not found"
    }
    ```
*   **400 Bad Request - Quiz Already Completed:**
    ```json
    {
      "message": "Quiz attempt already completed"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 6.4. Get Lesson Attempts (Single)

*   **Purpose:** Retrieves details of a specific quiz attempt for a lesson.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/progress/lessons/:lessonId/attempts/:attemptId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:lessonId` (integer, required): The ID of the lesson.
    *   `:attemptId` (integer, required): The ID of the quiz attempt.

#### Success Response (200 OK)

```json
{
  "attemptId": 101,
  "lessonId": 1,
  "userId": 2,
  "score": 80,
  "passed": true,
  "answers": [
    {
      "questionId": 1,
      "submittedAnswerId": 3,
      "isCorrect": true
    }
  ]
}
```

#### Error Responses

*   **404 Not Found - Attempt Not Found:**
    ```json
    {
      "message": "Lesson attempt not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 6.5. Get Lesson Result

*   **Purpose:** Retrieves the final result and feedback for a completed quiz attempt.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/progress/lessons/:lessonId/attempts/:attemptId/result`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:lessonId` (integer, required): The ID of the lesson.
    *   `:attemptId` (integer, required): The ID of the quiz attempt.

#### Success Response (200 OK)

```json
{
  "attemptId": 101,
  "score": 80,
  "passed": true,
  "feedback": "Great job! You answered most questions correctly."
}
```

#### Error Responses

*   **404 Not Found - Attempt Not Found:**
    ```json
    {
      "message": "Lesson attempt result not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 6.6. Get All Lesson Attempts for User

*   **Purpose:** Retrieves all quiz attempts made by a specific user for a given lesson.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/progress/lessons/:lessonId/users/:userId/attempts`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:lessonId` (integer, required): The ID of the lesson.
    *   `:userId` (integer, required): The ID of the user.

#### Success Response (200 OK)

```json
[
  {
    "attemptId": 101,
    "userId": 2,
    "lessonId": 1,
    "score": 80,
    "passed": true,
    "attemptedAt": "2023-11-01T10:05:00Z"
  },
  {
    "attemptId": 102,
    "userId": 2,
    "lessonId": 1,
    "score": 50,
    "passed": false,
    "attemptedAt": "2023-11-01T10:15:00Z"
  }
]
```

#### Error Responses

*   **404 Not Found - Lesson/User Not Found:**
    ```json
    {
      "message": "Lesson or User not found, or no attempts exist"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 6.7. Delete Lesson Attempt

*   **Purpose:** Deletes a specific quiz attempt. This is typically an administrative or debugging tool.
*   **Method:** `DELETE`
*   **URL:** `{{BaseURL}}/api/progress/attempts/:attemptId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:attemptId` (integer, required): The ID of the quiz attempt to delete.

#### Success Response (200 OK)

```json
{
  "message": "Lesson attempt deleted successfully"
}
```

#### Error Responses

*   **404 Not Found - Attempt Not Found:**
    ```json
    {
      "message": "Lesson attempt not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

---

## 7. Hamsterverse Data

### 7.1. Get Dashboard View

*   **Purpose:** Retrieves combined user data for the frontend's "Rewards World" dashboard.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/hamsterverse/:userId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:userId` (integer, required): The ID of the user.

#### Success Response (200 OK)

```json
{
  "userId": 2,
  "hamsterName": "Pip",
  "currentLevel": 1,
  "currentXp": 55,
  "xpToNextLevel": 100,
  "rewards": [
    {
      "id": 1,
      "name": "Hamster Wheel",
      "description": "First step to a better you!"
    },
    {
      "id": 2,
      "name": "Golden Carrot",
      "description": "A tasty treat for your progress."
    }
  ],
  "recentActivities": [
    {
      "type": "lesson_completed",
      "name": "Introduction to Habits",
      "xpEarned": 20,
      "timestamp": "2023-10-27T10:30:00Z"
    },
    {
      "type": "daily_checkin",
      "xpEarned": 15,
      "timestamp": "2023-10-27T08:00:00Z"
    }
  ]
}
```

#### Error Responses

*   **404 Not Found - User Not Found:**
    ```json
    {
      "message": "Hamsterverse data not found for this user"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

---

## 8. Course & Content Endpoints

### 8.1. Get All Courses

*   **Purpose:** Retrieves a list of all available courses.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/courses`
*   **Authentication:** Required (JWT in `Authorization` header).

#### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "title": "Introduction to Habits",
    "description": "Learn the basics of habit formation.",
    "difficulty": "Beginner"
  },
  {
    "id": 2,
    "title": "Advanced Productivity",
    "description": "Master techniques for peak performance.",
    "difficulty": "Advanced"
  }
]
```

#### Error Responses

*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.2. Get Course By ID

*   **Purpose:** Retrieves details for a specific course.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/courses/:courseId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course to retrieve.

#### Success Response (200 OK)

```json
{
  "id": 1,
  "title": "Introduction to Habits",
  "description": "Learn the basics of habit formation.",
  "difficulty": "Beginner",
  "modulesCount": 2
}
```

#### Error Responses

*   **404 Not Found - Course Not Found:**
    ```json
    {
      "message": "Course not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.3. Create Course

*   **Purpose:** Creates a new course.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/courses`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `title` (string, required): The title of the new course.
    *   `description` (string, required): A brief description of the course.
    *   `difficulty` (string, required): The difficulty level (e.g., "Beginner", "Intermediate", "Advanced").

#### Request Body Example

```json
{
  "title": "New Course Title",
  "description": "This is a description for the new course.",
  "difficulty": "Intermediate"
}
```

#### Success Response (201 Created)

```json
{
  "message": "Course created successfully",
  "course": {
    "id": 3,
    "title": "New Course Title",
    "description": "This is a description for the new course.",
    "difficulty": "Intermediate"
  }
}
```

#### Error Responses

*   **400 Bad Request - Missing Fields:**
    ```json
    {
      "message": "Title, description, and difficulty are required"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.4. Update Course

*   **Purpose:** Updates an existing course's details.
*   **Method:** `PUT`
*   **URL:** `{{BaseURL}}/api/courses/:courseId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course to update.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `title` (string, optional): New title for the course.
    *   `description` (string, optional): New description for the course.
    *   `difficulty` (string, optional): New difficulty level for the course.

#### Request Body Example

```json
{
  "title": "Updated Course Title",
  "difficulty": "Advanced"
}
```

#### Success Response (200 OK)

```json
{
  "message": "Course updated successfully",
  "course": {
    "id": 3,
    "title": "Updated Course Title",
    "description": "This is a description for the new course.",
    "difficulty": "Advanced"
  }
}
```

#### Error Responses

*   **404 Not Found - Course Not Found:**
    ```json
    {
      "message": "Course not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.5. Delete Course

*   **Purpose:** Deletes a course.
*   **Method:** `DELETE`
*   **URL:** `{{BaseURL}}/api/courses/:courseId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course to delete.

#### Success Response (200 OK)

```json
{
  "message": "Course deleted successfully"
}
```

#### Error Responses

*   **404 Not Found - Course Not Found:**
    ```json
    {
      "message": "Course or Module not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.6. Get Modules for Course

*   **Purpose:** Retrieves a list of all modules belonging to a specific course.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course.

#### Success Response (200 OK)

```json
[
  {
    "id": 101,
    "courseId": 1,
    "title": "Understanding Habit Loops",
    "order": 1
  },
  {
    "id": 102,
    "courseId": 1,
    "title": "Building New Habits",
    "order": 2
  }
]
```

#### Error Responses

*   **404 Not Found - Course Not Found:**
    ```json
    {
      "message": "Course not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.7. Get Module By ID

*   **Purpose:** Retrieves details for a specific module within a course.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course.
    *   `:moduleId` (integer, required): The ID of the module to retrieve.

#### Success Response (200 OK)

```json
{
  "id": 101,
  "courseId": 1,
  "title": "Understanding Habit Loops",
  "description": "Dive deep into the science of habit formation.",
  "order": 1,
  "lessonsCount": 3
}
```

#### Error Responses

*   **404 Not Found - Module Not Found:**
    ```json
    {
      "message": "Module not found in this course"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.8. Create Module

*   **Purpose:** Creates a new module within a specific course.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course to add the module to.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `title` (string, required): The title of the new module.
    *   `description` (string, optional): A description of the module.
    *   `order` (integer, required): The display order of the module within the course.

#### Request Body Example

```json
{
  "title": "New Module Title",
  "description": "This is a description for the new module.",
  "order": 3
}
```

#### Success Response (201 Created)

```json
{
  "message": "Module created successfully",
  "module": {
    "id": 103,
    "courseId": 1,
    "title": "New Module Title",
    "description": "This is a description for the new module.",
    "order": 3
  }
}
```

#### Error Responses

*   **404 Not Found - Course Not Found:**
    ```json
    {
      "message": "Course not found"
    }
    ```
*   **400 Bad Request - Missing Fields:**
    ```json
    {
      "message": "Title and order are required"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.9. Update Module

*   **Purpose:** Updates an existing module's details within a course.
*   **Method:** `PUT`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course the module belongs to.
    *   `:moduleId` (integer, required): The ID of the module to update.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `title` (string, optional): New title for the module.
    *   `description` (string, optional): New description for the module.
    *   `order` (integer, optional): New display order for the module.

#### Request Body Example

```json
{
  "title": "Updated Module Title",
  "order": 1
}
```

#### Success Response (200 OK)

```json
{
  "message": "Module updated successfully",
  "module": {
    "id": 103,
    "courseId": 1,
    "title": "Updated Module Title",
    "description": "This is a description for the new module.",
    "order": 1
  }
}
```

#### Error Responses

*   **404 Not Found - Course/Module Not Found:**
    ```json
    {
      "message": "Course or Module not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.10. Delete Module

*   **Purpose:** Deletes a module from a course.
*   **Method:** `DELETE`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course the module belongs to.
    *   `:moduleId` (integer, required): The ID of the module to delete.

#### Success Response (200 OK)

```json
{
  "message": "Module deleted successfully"
}
```

#### Error Responses

*   **404 Not Found - Course/Module Not Found:**
    ```json
    {
      "message": "Course or Module not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.11. Get Lessons for Module

*   **Purpose:** Retrieves a list of all lessons belonging to a specific module within a course.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course.
    *   `:moduleId` (integer, required): The ID of the module.

#### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "moduleId": 101,
    "title": "The Cue-Routine-Reward Cycle",
    "order": 1
  },
  {
    "id": 2,
    "moduleId": 101,
    "title": "Identifying Your Cues",
    "order": 2
  }
]
```

#### Error Responses

*   **404 Not Found - Module Not Found:**
    ```json
    {
      "message": "Module not found in this course"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.12. Get Lesson By ID

*   **Purpose:** Retrieves details for a specific lesson within a module.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons/:lessonId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course.
    *   `:moduleId` (integer, required): The ID of the module.
    *   `:lessonId` (integer, required): The ID of the lesson to retrieve.

#### Success Response (200 OK)

```json
{
  "id": 1,
  "moduleId": 101,
  "title": "The Cue-Routine-Reward Cycle",
  "content": "Detailed explanation of habit loops...",
  "order": 1,
  "quizAvailable": true
}
```

#### Error Responses

*   **404 Not Found - Lesson Not Found:**
    ```json
    {
      "message": "Lesson not found in this module"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.13. Create Lesson

*   **Purpose:** Creates a new lesson within a specific module.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course the module belongs to.
    *   `:moduleId` (integer, required): The ID of the module to add the lesson to.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `title` (string, required): The title of the new lesson.
    *   `content` (string, required): The main content of the lesson (e.g., Markdown or HTML).
    *   `order` (integer, required): The display order of the lesson within the module.
    *   `quizAvailable` (boolean, optional): Whether a quiz is available for this lesson (defaults to false).

#### Request Body Example

```json
{
  "title": "New Lesson Title",
  "content": "This is the content of the new lesson.",
  "order": 3,
  "quizAvailable": true
}
```

#### Success Response (201 Created)

```json
{
  "message": "Lesson created successfully",
  "lesson": {
    "id": 3,
    "moduleId": 101,
    "title": "New Lesson Title",
    "content": "This is the content of the new lesson.",
    "order": 3,
    "quizAvailable": true
  }
}
```

#### Error Responses

*   **404 Not Found - Module Not Found:**
    ```json
    {
      "message": "Module not found"
    }
    ```
*   **400 Bad Request - Missing Fields:**
    ```json
    {
      "message": "Title, content, and order are required"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.14. Update Lesson

*   **Purpose:** Updates an existing lesson's details within a module.
*   **Method:** `PUT`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons/:lessonId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course the module belongs to.
    *   `:moduleId` (integer, required): The ID of the module the lesson belongs to.
    *   `:lessonId` (integer, required): The ID of the lesson to update.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `title` (string, optional): New title for the lesson.
    *   `content` (string, optional): New content for the lesson.
    *   `order` (integer, optional): New display order for the lesson.
    *   `quizAvailable` (boolean, optional): New quiz availability status.

#### Request Body Example

```json
{
  "title": "Updated Lesson Title",
  "order": 1
}
```

#### Success Response (200 OK)

```json
{
  "message": "Lesson updated successfully",
  "lesson": {
    "id": 3,
    "moduleId": 101,
    "title": "Updated Lesson Title",
    "content": "This is the content of the new lesson.",
    "order": 1,
    "quizAvailable": true
  }
}
```

#### Error Responses

*   **404 Not Found - Course/Module/Lesson Not Found:**
    ```json
    {
      "message": "Course, Module, or Lesson not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.15. Delete Lesson

*   **Purpose:** Deletes a lesson from a module.
*   **Method:** `DELETE`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons/:lessonId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course the module belongs to.
    *   `:moduleId` (integer, required): The ID of the module the lesson belongs to.
    *   `:lessonId` (integer, required): The ID of the lesson to delete.

#### Success Response (200 OK)

```json
{
  "message": "Lesson deleted successfully"
}
```

#### Error Responses

*   **404 Not Found - Course/Module/Lesson Not Found:**
    ```json
    {
      "message": "Course, Module, Lesson, or Question not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.16. Get Questions for Lesson

*   **Purpose:** Retrieves all quiz questions for a specific lesson.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons/:lessonId/questions`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course.
    *   `:moduleId` (integer, required): The ID of the module.
    *   `:lessonId` (integer, required): The ID of the lesson.

#### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "lessonId": 1,
    "text": "What is the first component of a habit loop?",
    "options": [
      {"id": 1, "text": "Routine"},
      {"id": 2, "text": "Reward"},
      {"id": 3, "text": "Cue"}
    ]
  },
  {
    "id": 2,
    "lessonId": 1,
    "text": "Which of these is an example of a reward?",
    "options": [
      {"id": 4, "text": "Feeling of accomplishment"},
      {"id": 5, "text": "Seeing a notification"},
      {"id": 6, "text": "Opening a book"}
    ]
  }
]
```

#### Error Responses

*   **404 Not Found - Lesson Not Found:**
    ```json
    {
      "message": "Lesson not found or has no questions"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.17. Get Question By ID

*   **Purpose:** Retrieves details for a specific quiz question within a lesson.
*   **Method:** `GET`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course.
    *   `:moduleId` (integer, required): The ID of the module.
    *   `:lessonId` (integer, required): The ID of the lesson.
    *   `:questionId` (integer, required): The ID of the question to retrieve.

#### Success Response (200 OK)

```json
{
  "id": 1,
  "lessonId": 1,
  "text": "What is the first component of a habit loop?",
  "options": [
    {"id": 1, "text": "Routine"},
    {"id": 2, "text": "Reward"},
    {"id": 3, "text": "Cue"}
  ]
}
```

#### Error Responses

*   **404 Not Found - Question Not Found:**
    ```json
    {
      "message": "Question not found in this lesson"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.18. Create Question

*   **Purpose:** Creates a new quiz question for a specific lesson.
*   **Method:** `POST`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons/:lessonId/questions`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course the module belongs to.
    *   `:moduleId` (integer, required): The ID of the module the lesson belongs to.
    *   `:lessonId` (integer, required): The ID of the lesson to add the question to.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `text` (string, required): The text of the question.
    *   `options` (array of objects, required): An array of answer options, each with `id` (integer) and `text` (string).
    *   `correctAnswerId` (integer, required): The `id` of the correct answer option from the `options` array.

#### Request Body Example

```json
{
  "text": "What is the capital of France?",
  "options": [
    {"id": 1, "text": "Berlin"},
    {"id": 2, "text": "Madrid"},
    {"id": 3, "text": "Paris"},
    {"id": 4, "text": "Rome"}
  ],
  "correctAnswerId": 3
}
```

#### Success Response (201 Created)

```json
{
  "message": "Question created successfully",
  "question": {
    "id": 3,
    "lessonId": 1,
    "text": "What is the capital of France?",
    "options": [
      {"id": 1, "text": "Berlin"},
      {"id": 2, "text": "Madrid"},
      {"id": 3, "text": "Paris"},
      {"id": 4, "text": "Rome"}
    ],
    "correctAnswerId": 3
  }
}
```

#### Error Responses

*   **404 Not Found - Lesson Not Found:**
    ```json
    {
      "message": "Lesson not found"
    }
    ```
*   **400 Bad Request - Missing Fields/Invalid Options:**
    ```json
    {
      "message": "Question text, options, and correct answer ID are required"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.19. Update Question

*   **Purpose:** Updates an existing quiz question for a specific lesson.
*   **Method:** `PUT`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course the module belongs to.
    *   `:moduleId` (integer, required): The ID of the module the lesson belongs to.
    *   `:lessonId` (integer, required): The ID of the lesson the question belongs to.
    *   `:questionId` (integer, required): The ID of the question to update.
*   **Request Headers:**
    *   `Content-Type: application/json`
*   **Request Body:**
    *   `text` (string, optional): New text for the question.
    *   `options` (array of objects, optional): New array of answer options.
    *   `correctAnswerId` (integer, optional): New `id` of the correct answer option.

#### Request Body Example

```json
{
  "text": "What is the capital of Germany?",
  "correctAnswerId": 1
}
```

#### Success Response (200 OK)

```json
{
  "message": "Question updated successfully",
  "question": {
    "id": 3,
    "lessonId": 1,
    "text": "What is the capital of Germany?",
    "options": [
      {"id": 1, "text": "Berlin"},
      {"id": 2, "text": "Madrid"},
      {"id": 3, "text": "Paris"},
      {"id": 4, "text": "Rome"}
    ],
    "correctAnswerId": 1
  }
}
```

#### Error Responses

*   **404 Not Found - Course/Module/Lesson/Question Not Found:**
    ```json
    {
      "message": "Course, Module, Lesson, or Question not found"
    }
    ```
*   **400 Bad Request - Invalid Options/Correct Answer:**
    ```json
    {
      "message": "Correct answer ID must be one of the provided options"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.

### 8.20. Delete Question

*   **Purpose:** Deletes a quiz question from a lesson.
*   **Method:** `DELETE`
*   **URL:** `{{BaseURL}}/api/courses/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId`
*   **Authentication:** Required (JWT in `Authorization` header).
*   **Path Parameters:**
    *   `:courseId` (integer, required): The ID of the course the module belongs to.
    *   `:moduleId` (integer, required): The ID of the module the lesson belongs to.
    *   `:lessonId` (integer, required): The ID of the lesson the question belongs to.
    *   `:questionId` (integer, required): The ID of the question to delete.

#### Success Response (200 OK)

```json
{
  "message": "Question deleted successfully"
}
```

#### Error Responses

*   **404 Not Found - Course/Module/Lesson/Question Not Found:**
    ```json
    {
      "message": "Course, Module, Lesson, or Question not found"
    }
    ```
*   **401 Unauthorized:** If no valid JWT token is provided.
