import http from 'node:http';
import request from 'supertest';
import createServer from '../src/server';

const PORT = 3000;
let app: http.Server;

describe('User API', () => {
  let createdUserId: string;

  beforeAll(() => {
    app = createServer(PORT);
  });

  afterAll((done) => {
    app.close(() => {
      done();
    });
  });

  it('GET /api/users should return an empty array', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST /api/users should create a new user', async () => {
    const newUser = {
      username: 'John Doe',
      age: 25,
      hobbies: ['music', 'reading'],
    };

    const response = await request(app).post('/api/users').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newUser);
    createdUserId = response.body.id;
  });

  it('GET /api/users/:id should return the created user', async () => {
    const response = await request(app).get(`/api/users/${createdUserId}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      username: 'John Doe',
      age: 25,
      hobbies: ['music', 'reading'],
    });
  });

  it('PUT /api/users/:id should update the user', async () => {
    const updatedUser = {
      hobbies: ['music'],
    };

    const response = await request(app)
      .put(`/api/users/${createdUserId}`)
      .send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: createdUserId,
      ...updatedUser,
    });
  });

  it('DELETE /api/users/:id should delete the user', async () => {
    const response = await request(app).delete(`/api/users/${createdUserId}`);
    expect(response.status).toBe(204);
  });

  it('GET /api/users/:id should return 404 for the deleted user', async () => {
    const response = await request(app).get(`/api/users/${createdUserId}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'User not found' });
  });
});
