import http from 'node:http';
import request from 'supertest';
import createServer from '../src/server';
import pth from 'node:path';

jest.mock('fs/promises', () => {
  const mockData: Record<string, string | undefined> = {
    'users.json': '[]',
  };
  const originalModule = jest.requireActual('fs/promises');

  return {
    ...originalModule,
    readFile: async (path: string) => {
      const data = mockData[pth.basename(path)];

      if (data) {
        return data;
      } else {
        throw new Error('File does not exist');
      }
    },

    writeFile: async (path: string, data: string) => {
      mockData[pth.basename(path)] = data;
    },

    access: async (path: string) => {
      if (!Object.prototype.hasOwnProperty.call(mockData, pth.basename(path))) {
        throw new Error('File does not exist');
      }
    },

    unlink: async (path: string) => {
      if (mockData[pth.basename(path)]) {
        delete mockData[pth.basename(path)];
      } else {
        throw new Error('File does not exist');
      }
    },
  };
});

const PORT = 1000;
let app: http.Server;

describe('User API - 1 scenario', () => {
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
