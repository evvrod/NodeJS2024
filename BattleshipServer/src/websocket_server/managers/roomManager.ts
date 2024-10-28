import { Client, ClientManager } from './clientManager';
import logger from '../utils/logger';

export class Room {
  roomId: string;
  roomUsers: Client[];
  maxPlayers: number;

  constructor(id: string, maxPlayers = 2) {
    this.roomId = id;
    this.roomUsers = [];
    this.maxPlayers = maxPlayers;
  }

  addPlayer(player: Client) {
    if (this.isRoomFull() && this.hasPlayer(player.index)) {
      throw new Error(
        `User ${player.index} cannot be added to room ${this.roomId}. The room is full or the user is already in the room.`,
      );
    }
    this.roomUsers.push(player);
  }

  hasPlayer(playerId: string): boolean {
    return this.roomUsers.some((player) => player.index === playerId);
  }

  getPlayers() {
    return this.roomUsers;
  }

  isRoomFull(): boolean {
    return this.roomUsers.length === this.maxPlayers;
  }
}

export class RoomManager {
  private rooms: Map<string, Room>;
  private clientManager: ClientManager;

  constructor(clientManager: ClientManager) {
    this.rooms = new Map();
    this.clientManager = clientManager;
  }

  createRoom(): Room {
    const roomId = Math.random().toString(36).substring(2, 9);
    const room = new Room(roomId);
    this.rooms.set(roomId, room);
    logger.log(`Room created with ID: ${room.roomId}`);

    return room;
  }

  getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRooms() {
    return Array.from(this.rooms.keys());
  }

  getFreeRooms() {
    const freeRooms: Room[] = [];
    this.rooms.forEach((room) => {
      if (!room.isRoomFull()) {
        freeRooms.push(room);
      }
    });
    return freeRooms;
  }

  addPlayerToRoom(clientId: string, roomId: string) {
    const player = this.getClientById(clientId);
    const room = this.getRoomByID(roomId);

    room.addPlayer(player);
    logger.log(`User ${clientId} added to room ${roomId}`);
  }

  private getRoomByID(roomId: string): Room {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error(`Room with ID ${roomId} not found.`);
    }

    return room;
  }

  private getClientById(clientId: string): Client {
    const player = this.clientManager.getPlayerById(clientId);

    if (!player) {
      throw new Error(`Player with ID ${clientId} not found.`);
    }
    return player;
  }
}
