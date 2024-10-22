// Реализует бизнес-логику CRUD для пользователей. Здесь мы также используем uuid для генерации уникальных идентификаторов.

import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';

import IUser from './user';

class UserService {
  private dataFile = path.join(__dirname, 'users.json');
  private lockFile = path.join(__dirname, 'users.lock');

  private async lock() {
    while (true) {
      try {
        await fs.access(this.lockFile);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch {
        await fs.writeFile(this.lockFile, 'locked');
        break;
      }
    }
  }

  private async unlock() {
    try {
      await fs.unlink(this.lockFile);
    } catch (error) {
      console.error('Failed to unlock:', error);
    }
  }

  async getAllUsers(): Promise<IUser[]> {
    await this.lock();
    try {
      return await this.readUsers();
    } finally {
      await this.unlock();
    }
  }

  async getUserById(userId: string): Promise<IUser | undefined> {
    await this.lock();
    try {
      const users = await this.readUsers();
      return users.find((user) => user.id === userId);
    } finally {
      await this.unlock();
    }
  }

  async createUser(data: Omit<IUser, 'id'>): Promise<IUser> {
    await this.lock();
    try {
      const users = await this.readUsers();

      const newUser = { id: uuidv4(), ...data };
      users.push(newUser);
      await this.saveUsers(users);
      return newUser;
    } finally {
      await this.unlock();
    }
  }

  async updateUser(
    userId: string,
    data: Partial<IUser>,
  ): Promise<IUser | undefined> {
    await this.lock();
    try {
      const users = await this.readUsers();
      const user = users.find((user) => user.id === userId);
      if (user) {
        Object.assign(user, data);
        await this.saveUsers(users);
        return user;
      }
      return undefined;
    } finally {
      await this.unlock();
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    await this.lock();
    try {
      const users = await this.readUsers();
      const index = users.findIndex((user) => user.id === userId);
      if (index !== -1) {
        users.splice(index, 1);
        await this.saveUsers(users);
        return true;
      }
      return false;
    } finally {
      await this.unlock();
    }
  }

  private async saveUsers(users: IUser[]): Promise<void> {
    await fs.writeFile(this.dataFile, JSON.stringify(users, null, 2));
  }

  private async readUsers(): Promise<IUser[]> {
    const dataFromFile = await fs.readFile(this.dataFile, 'utf8');
    return JSON.parse(dataFromFile || '[]');
  }
}

const userService = new UserService();

export default userService;
