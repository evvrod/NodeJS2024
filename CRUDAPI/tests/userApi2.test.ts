import http from 'node:http';
import request from 'supertest';
import createServer from '../src/server';

const PORT = 3000;
let app: http.Server;

describe('User API - 2 scenario', () => {
  beforeAll(() => {
    app = createServer(PORT);
  });

  afterAll((done) => {
    app.close(() => {
      done();
    });
  });

  it('GET /api/users/:id should return 400 for invalid UUID', async () => {
    const invalidUUID = '123-invalid-uuid';

    const response = await request(app).get(`/api/users/${invalidUUID}`);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid UUID format' });
  });
});
