// Настраивает HTTP-сервер и маршруты для обработки запросов.

import http from 'http';
import userController from './userController.js';
import validateUUID from './utils/validateUUID.js';
import { CustomError, withErrorHandling } from './utils/errorHandler.js';

const port = process.env.PORT || 4000;

type RouteHandler = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
  userId?: string,
  requestBody?: object,
) => Promise<void>;

type Routes = {
  [key: string]: RouteHandler;
};

const routes: Routes = {
  'GET /api/users': async (req, res) => {
    await userController.getAll(req, res);
  },

  'GET /api/users/:id': async (req, res, userId) => {
    if (!userId || !validateUUID(userId)) {
      throw new CustomError(400, 'Invalid UUID format');
    }

    await userController.getById(req, res, userId);
  },

  'POST /api/users': async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) => {
    await userController.create(req, res);
  },

  'PUT /api/users/:id': async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
    userId?: string,
  ) => {
    if (!userId || !validateUUID(userId)) {
      throw new CustomError(400, 'Invalid UUID format');
    }

    await userController.update(req, res, userId);
  },

  'DELETE /api/users/:id': async (req, res, userId) => {
    if (!userId || !validateUUID(userId)) {
      throw new CustomError(400, 'Invalid UUID format');
    }

    await userController.delete(req, res, userId);
  },
};

const server = http.createServer(
  withErrorHandling(
    async (req: http.IncomingMessage, res: http.ServerResponse) => {
      const { method, url } = req;

      const routeKey = `${method} ${url}`;
      const routeHandler = routes[routeKey];

      if (routeHandler) {
        await routeHandler(req, res);
      } else {
        throw new CustomError(404, 'Not found');
      }
    },
  ),
);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
