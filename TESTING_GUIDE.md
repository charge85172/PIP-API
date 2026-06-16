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
5.  [Gamification (XP & Rewards)](#5-gamification-xp--rewards)
    * [Manually Award XP](#51-manually-award-xp)
    * [Complete Lesson](#52-complete-lesson)
    * [Reset Lesson Completion](#53-reset-lesson-completion)
6.  [Lesson Quiz Flow](#6-lesson-quiz-flow)
    *   [Start Lesson Quiz](#61-start-lesson-quiz)
    *   [Submit Answer](#62-submit-answer)
    *   [Complete Quiz Attempt](#63-complete-quiz-attempt)
    *   [Get Lesson Attempts](#64-get-lesson-attempts)
    *   [Get Lesson Result](#65-get-lesson-result)
7.  [Hamsterverse Data](#7-hamsterverse-data)
    *   [Get Dashboard View](#71-get-dashboard-view)
8.  [Course & Content Endpoints](#8-course--content-endpoints)
    *   [Get All Courses](#81-get-all-courses)
    *   [Get Course By ID](#82-get-course-by-id)
    *   [Get Modules for Course](#83-get-modules-for-course)
    *   [Get Module By ID](#84-get-module-by-id)
    *   [Get Lessons for Module](#85-get-lessons-for-module)
    *   [Get Lesson By ID](#86-get-lesson-by-id)
    *   [Get Questions for Lesson](#87-get-questions-for-lesson)
    *   [Get Question By ID](#88-get-question-by-id)

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


#### Error Responses

*   **404 Not Found - No Progress Found:**
*   **401 Unauthorized:** If no valid JWT token is provided.
*   **500 Internal Server Error:** If a database error occurs.

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

### 6.4. Get Lesson Attempts

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

### 8.3. Get Modules for Course

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

### 8.4. Get Module By ID

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

### 8.5. Get Lessons for Module

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

### 8.6. Get Lesson By ID

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

### 8.7. Get Questions for Lesson

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

### 8.8. Get Question By ID

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