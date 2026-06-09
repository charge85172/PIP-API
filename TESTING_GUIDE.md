# API Testing Guide

Backend testing documentation for the Personal Improvement Platform (PIP).

---

## Table of Contents

1. [General Configuration](https://www.google.com/search?q=%231-general-configuration)
2. [System Health Check](https://www.google.com/search?q=%232-system-health-check)
3. [Authentication & Onboarding](https://www.google.com/search?q=%233-authentication--onboarding)
4. [User Endpoints](https://www.google.com/search?q=%234-user-endpoints)
5. [Gamification (XP & Rewards)](https://www.google.com/search?q=%235-gamification-xp--rewards)
6. [Lesson Quiz Flow](https://www.google.com/search?q=%236-lesson-quiz-flow)
7. [Hamsterverse Data](https://www.google.com/search?q=%237-hamsterverse-data)

---

## 1. General Configuration

* **Base URL:** `http://localhost:8000`
* **Global Headers:** `Content-Type: application/json`

Ensure your local server is running by executing `npm run dev` or `node index.js` before testing.

---

## 2. System Health Check

### Verify Server State

* **Method:** `GET`
* **URL:** `/health`

#### Response Example

```json
{ 
  "status": "OK", 
  "message": "PIP Backend is running" 
}

```

---

## 3. Authentication & Onboarding

> *New users start at Level 0. Completion of onboarding grants Level 1 and Reward ID 1.*

### Register Account

* **Method:** `POST`
* **URL:** `/api/register`
* **Notes:** Minimum 6 character password.

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}

```

### Login

* **Method:** `POST`
* **URL:** `/api/login`

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "secure123"
}

```

### Complete Onboarding

* **Method:** `POST`
* **URL:** `/api/users/:id/complete-onboarding`
* **Notes:** Sets `on_boarding = 1`, upgrades level to 1, and awards **Hamster Wheel**.

---

## 4. User Endpoints

### Get User Progress

* **Method:** `GET`
* **URL:** `/api/users/:id/progress`
* **Notes:** Returns summary of streak, lessons, and rewards.

### Get Onboarding Status

* **Method:** `GET`
* **URL:** `/api/users/:id/onboarding-status`

---

## 5. Gamification (XP & Rewards)

### Manually Award XP

* **Method:** `POST`
* **URL:** `/api/progress/xp`
* **Notes:** Will fail if user is still Level 0.

#### Request Body

```json
{
  "userId": 1,
  "activityType": "daily_checkin",
  "activityId": "day_2023_10_27",
  "xpAmount": 15
}

```

### Complete Lesson

* **Method:** `PUT`
* **URL:** `/api/users/:id/progress/lesson/:lessonId`
* **Notes:** Awarded 20 XP automatically upon success.

---

## 6. Lesson Quiz Flow

### Start Lesson Quiz

* **Method:** `POST`
* **URL:** `/api/progress/lessons/:lessonId/start`

#### Request Body

```json
{ 
  "userId": 1 
}

```

### Submit Answer

* **Method:** `POST`
* **URL:** `/api/progress/attempts/:attemptId/answers`

#### Request Body

```json
{ 
  "questionId": 1, 
  "answerId": 5 
}

```

### Complete Quiz Attempt

* **Method:** `POST`
* **URL:** `/api/progress/attempts/:attemptId/complete`
* **Notes:** Returns result. If score ≥ 60%, updates progression status.

---

## 7. Hamsterverse Data

### Get Dashboard View

* **Method:** `GET`
* **URL:** `/api/hamsterverse/:userId`
* **Notes:** Get combined data for the frontend Rewards World.

#### Response Example


### Complete Quiz Attempt

* **Method:** `POST`
* **URL:** `/api/progress/attempts/:attemptId/complete`
* **Notes:** Returns result. If score ≥ 60%, updates progression status.

---

## 7. Hamsterverse Data

### Get Dashboard View

* **Method:** `GET`
* **URL:** `/api/hamsterverse/:userId`
* **Notes:** Get combined data for the frontend Rewards World.

#### Response Example

