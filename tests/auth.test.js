import request from 'supertest';
import app from '../app.js';

describe('Auth API', () => {

    test('POST /api/register zonder data geeft 400', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({});

        expect(response.statusCode).toBe(400);
    });

    test('Nieuwe gebruiker registreren', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                name: 'Test User',
                email: 'test@test.nl',
                password: '123456'
            });

        expect(response.statusCode).toBe(201);
    });

    test('Login met verkeerd wachtwoord', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'test@test.nl',
                password: 'fout'
            });

        expect(response.statusCode).toBe(401);
    });

    test('Courses ophalen', async () => {
        const response = await request(app)
            .get('/api/courses');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('Dubbele XP award wordt geweigerd', async () => {

        await request(app)
            .post('/api/progress/xp')
            .send({
                userId: 1,
                activityType: 'lesson',
                activityId: 1
            });

        const response = await request(app)
            .post('/api/progress/xp')
            .send({
                userId: 1,
                activityType: 'lesson',
                activityId: 1
            });

        expect(response.statusCode).toBe(409);
    });

    test('GET /health geeft OK terug', async () => {
        const response = await request(app).get('/health');

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('OK');
    });

});