// Реализует бизнес-логику CRUD для пользователей. Здесь мы также используем uuid для генерации уникальных идентификаторов.

import { v4 as uuidv4 } from 'uuid';
import IUser from './user.js';

class UserService {
  private users: IUser[] = [];

  getAllUsers(): IUser[] {
    return this.users;
  }

  getUserById(userId: string): IUser | undefined {
    return this.users.find((user) => user.id === userId);
  }

  createUser(data: Omit<IUser, 'id'>): IUser {
    const newUser: IUser = {
      id: uuidv4(),
      ...data,
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(userId: string, data: Partial<IUser>): IUser | undefined {
    const user = this.getUserById(userId);
    if (user) {
      Object.assign(user, data);
      return user;
    }
    return undefined;
  }

  deleteUser(userId: string): boolean {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}

const userService = new UserService();

export default userService;
