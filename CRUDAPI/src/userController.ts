// Обрабатывает HTTP-запросы, взаимодействует с сервисами и отправляет соответствующие ответы.

import { IncomingMessage, ServerResponse } from 'http';
import { CustomError } from './utils/errorHandler';
import IUser from './user';
import userService from './userService';

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

    const user = await userService.createUser(data);
    
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  }

  async getAll(req: IncomingMessage, res: ServerResponse) {
    const users = await userService.getAllUsers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  }

  async getById(req: IncomingMessage, res: ServerResponse, userId?: string) {
    const user = await userService.getUserById(userId!);
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

    const user = await userService.updateUser(userId!, data);

    if (!user) {
      throw new CustomError(404, 'User not found');
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  }

  async delete(req: IncomingMessage, res: ServerResponse, userId?: string) {
    const deleted = await userService.deleteUser(userId!);
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
