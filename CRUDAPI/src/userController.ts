// Обрабатывает HTTP-запросы, взаимодействует с сервисами и отправляет соответствующие ответы.

import { IncomingMessage, ServerResponse } from 'http';
import { CustomError } from './utils/errorHandler.ts';
import IUser from './user.ts';
import userService from './userService.ts';

class UserController {
  async create(req: IncomingMessage, res: ServerResponse) {
    const body = await this.readRequestBody(req);

    let data: IUser;
    try {
      data = JSON.parse(body);
    } catch {
      throw new CustomError(400, 'Invalid JSON format');
    }

    if (!data.username || !data.age) {
      throw new CustomError(400, 'Invalid request data');
    }

    const user = userService.createUser(data);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  }

  getAll(req: IncomingMessage, res: ServerResponse) {
    const users = userService.getAllUsers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  }

  getById(req: IncomingMessage, res: ServerResponse, userId?: string) {
    const user = userService.getUserById(userId!);
    if (!user) {
      throw new CustomError(404, 'User not found');
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  }

  async update(req: IncomingMessage, res: ServerResponse, userId?: string) {
    const body = await this.readRequestBody(req);

    let data;

    try {
      data = JSON.parse(body);
    } catch {
      throw new CustomError(400, 'Invalid JSON format');
    }

    const user = userService.updateUser(userId!, data);

    if (!user) {
      throw new CustomError(404, 'User not found');
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  }

  delete(req: IncomingMessage, res: ServerResponse, userId?: string) {
    const deleted = userService.deleteUser(userId!);
    if (!deleted) {
      throw new CustomError(404, 'User not found');
    }
    res.writeHead(204);
    res.end();
  }

  readRequestBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      });
      req.on('error', (err) => {
        reject(err);
      });
    });
  }
}
const userController = new UserController();

export default userController;
