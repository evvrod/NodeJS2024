// Настраивает HTTP-сервер и маршруты для обработки запросов.

import http from 'node:http';
import userController from './userController.js';
import validateUUID from './utils/validateUUID.js';
import { CustomError, withErrorHandling } from './utils/errorHandler.js';

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
    userController.getAll(req, res);
  },

  'GET /api/users/:id': async (req, res, userId) => {
    if (!userId || !validateUUID(userId)) {
      throw new CustomError(400, 'Invalid UUID format');
    }
    userController.getById(req, res, userId);
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

    userController.delete(req, res, userId);
  },
};

function matchRoute(
  method: string,
  url: string,
): [RouteHandler | undefined, string | undefined] {
  const routeKeys = Object.keys(routes);

  for (const route of routeKeys) {
    const [routeMethod, routePath] = route.split(' ');

    if (method !== routeMethod) continue;

    const routeParts = routePath.split('/');
    const urlParts = url.split('/');

    if (routeParts.length !== urlParts.length) continue;

    let userId: string | undefined;

    const isMatch = routeParts.every((part, index) => {
      if (part.startsWith(':')) {
        userId = urlParts[index];
        return true;
      }
      return part === urlParts[index];
    });

    if (isMatch) {
      return [routes[route], userId];
    }
  }

  return [undefined, undefined];
}

export default function createServer(port: number) {
  const server = http.createServer(
    withErrorHandling(
      async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const { method, url } = req;

        if (!method || !url) {
          throw new CustomError(404, 'Not found endpoint');
        }

        const [routeHandler, userId] = matchRoute(method, url);

        if (routeHandler) {
          await routeHandler(req, res, userId);
        } else {
          throw new CustomError(404, 'Not found endpoint');
        }
      },
    ),
  );

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
