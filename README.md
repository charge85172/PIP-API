PIP Backend API

Een REST API gebouwd met Node.js, Express en SQLite voor het PIP leerplatform. De backend beheert gebruikers, cursussen, modules, lessen, voortgang, XP-systemen, streaks, rewards en het Hamsterverse beloningssysteem. De applicatie gebruikt JWT-authenticatie en SQLite als database.

Functionaliteiten:

Authenticatie:
-Registreren van gebruikers
-Inloggen met JWT-token
-Wachtwoorden gehashed met bcrypt
-JWT middleware voor beveiligde endpoints

Cursussen:
-Overzicht van alle cursussen
-Ophalen van specifieke cursusinformatie
-Modules binnen een cursus
-Lessen binnen modules
-Quizvragen en antwoorden

Voortgangssysteem:
-Starten van lespogingen
-Beantwoorden van quizvragen
-Automatische scoring
-Les voltooiing
-Module- en cursusvoortgang

XP & Levels:
-XP verdienen voor activiteiten
-Automatische levelberekening
-Preventie van dubbele XP-beloningen
-Beloningen ontgrendelen bij level-ups

Dashboard:
-Gebruikersstatistieken
-Module voortgang
-Voltooide lessen
-Streak informatie

Hamsterverse:
-Gamification systeem
-Overzicht van beschikbare rewards
-Ontgrendelde rewards
-Level-gebaseerde beloningen

Technologieën:
-Node.js
-Express.js
-SQLite3
-JWT Authentication
-bcrypt
-ES Modules

Projectstructuur
PIP-API/
│
├── controllers/
│   ├── authController.js
│   ├── courseController.js
│   ├── dashboardController.js
│   ├── hamsterverseController.js
│   ├── lessonController.js
│   ├── moduleController.js
│   ├── progressController.js
│   ├── questionController.js
│   ├── userProgressionController.js
│   └── xpController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── dashboardRoutes.js
│   ├── hamsterverseRoutes.js
│   ├── progressRoutes.js
│   ├── rewardRoutes.js
│   └── userRoutes.js
│
├── middleware/
│   └── auth.js
│
├── Database/
│   └── pip.sqlite
│
├── db.js
└── index.js

Installatie:
1. Clone repository
   git clone <repository-url>
   cd PIP-API
2. Installeer dependencies
   npm install
3. Maak een .env bestand

EXPRESS_PORT=8000

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1y

NODE_ENV=development

4. Start de server:

Development:

npm run dev

Production:

npm start

Server draait standaard op:
http://localhost:8000

Op de server draait de app op:
http://145.24.223.106:8000

API Endpoints:

Auth
Registreren
POST /api/register

Body:

{
"name": "John Doe",
"email": "john@example.com",
"password": "password123"
}

Login
POST /api/login

Body:

{
"email": "john@example.com",
"password": "password123"
}

Response:

{
"success": true,
"data": {
"user": {},
"token": "jwt-token"
}
}

Users

Alle gebruikers
GET /api/users

Gebruiker ophalen
GET /api/users/:id

Onboarding status
GET /api/users/:id/onboarding-status

Gebruikersvoortgang
GET /api/users/:id/progress

Courses

Alle cursussen
GET /api/courses

Specifieke cursus
GET /api/courses/:courseId

Modules van cursus
GET /api/courses/:courseId/modules

Specifieke module
GET /api/courses/:courseId/modules/:moduleId

Lessen van module
GET /api/courses/:courseId/modules/:moduleId/lessons

Specifieke les
GET /api/courses/:courseId/modules/:moduleId/lessons/:lessonId

Vragen van les
GET /api/courses/:courseId/modules/:moduleId/lessons/:lessonId/questions

Specifieke vraag
GET /api/courses/:courseId/modules/:moduleId/lessons/:lessonId/questions/:questionId

Progress

Les starten
POST /api/progress/lessons/:lessonId/start

Body:

{
"userId": 1
}
Antwoord indienen
POST /api/progress/attempts/:attemptId/answers

Body:

{
"questionId": 1,
"answerId": 2
}
Les afronden
POST /api/progress/attempts/:attemptId/complete
Lespogingen ophalen
GET /api/progress/lessons/:lessonId/attempts/:userId
XP Systeem
XP registreren
POST /api/progress/xp

Body:

{
"userId": 1,
"activityType": "question_answer",
"activityId": 10
}

XP wordt automatisch toegevoegd en levels worden bijgewerkt.

Dashboard

Dashboard gegevens ophalen
GET /api/dashboard/:userId

Response bevat:

Gebruikersinformatie

Huidige streak
Hoogste streak
Module voortgang
Voltooide lessen
Hamsterverse
Hamsterverse gegevens ophalen
GET /api/hamsterverse/:userId

Response bevat:

Huidig level
XP
Beschikbare rewards
Ontgrendelde rewards
Database

Belangrijkste tabellen:

users
courses
modules
lessons
questions
answers

lesson_attempts
lesson_attempt_answers

user_progress
user_module_status
user_course_status

xp_transactions

rewards
user_rewards

user_streaks

De database gebruikt SQLite en wordt geïnitialiseerd via db.js.

Health Check
GET /health

Response:

{
"status": "OK",
"timestamp": "2026-06-11T12:00:00.000Z",
"message": "PIP Backend is running"
}

Toekomstige uitbreidingen:
-Refresh tokens
-Role Based Access Control (RBAC)
-Swagger/OpenAPI documentatie
-Unit tests
-Docker deployment
-Rate limiting
-Caching
-Email verificatie
-Password reset functionaliteit
-Auteur

PIP Development Team

Version: 1.0.0