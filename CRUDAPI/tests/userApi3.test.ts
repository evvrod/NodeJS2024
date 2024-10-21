import http from 'node:http';
import request from 'supertest';
import createServer from '../src/server';

const PORT = 3000;
let app: http.Server;

describe('User API - 3 scenario', () => {
  let createdUserId1: string;
  let createdUserId2: string;

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

  it('POST /api/users should create two users', async () => {
    const user1 = {
      username: 'Alice',
      age: 28,
      hobbies: ['painting', 'traveling'],
    };

    const user2 = {
      username: 'Bob',
      age: 35,
      hobbies: ['gaming', 'music'],
    };

    const response1 = await request(app).post('/api/users').send(user1);
    expect(response1.status).toBe(201);
    expect(response1.body).toMatchObject(user1);
    expect(response1.body).toHaveProperty('id');

    createdUserId1 = response1.body.id;

    const response2 = await request(app).post('/api/users').send(user2);
    expect(response2.status).toBe(201);
    expect(response2.body).toMatchObject(user2);
    expect(response2.body).toHaveProperty('id');

    createdUserId2 = response2.body.id;

    const allUsersResponse = await request(app).get('/api/users');
    expect(allUsersResponse.status).toBe(200);
    expect(allUsersResponse.body).toHaveLength(2);
    expect(allUsersResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: createdUserId1, ...user1 }),
        expect.objectContaining({ id: createdUserId2, ...user2 }),
      ]),
    );
  });

  it('DELETE /api/users/:id should delete one user', async () => {
    const deleteResponse = await request(app).delete(
      `/api/users/${createdUserId1}`,
    );
    expect(deleteResponse.status).toBe(204);

    const allUsersResponse = await request(app).get('/api/users');
    expect(allUsersResponse.status).toBe(200);
    expect(allUsersResponse.body).toHaveLength(1);
    expect(allUsersResponse.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: createdUserId2 })]),
    );
  });
});
