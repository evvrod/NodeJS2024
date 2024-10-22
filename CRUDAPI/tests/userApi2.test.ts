import http from 'node:http';
import pth from 'node:path';
import request from 'supertest';
import createServer from '../src/server';

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

const PORT = 2000;
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
