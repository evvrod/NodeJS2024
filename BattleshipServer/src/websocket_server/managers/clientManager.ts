import logger from '../utils/logger';

export class Client {
  index: string;
  name: string;
  password: string;

  constructor(id: string, name: string, password: string) {
    this.index = id;
    this.name = name;
    this.password = password;
  }
}

export class ClientManager {
  private players: Map<string, Client> = new Map();

  registerPlayer(name: string, password: string): Client {
    const id = Math.random().toString(36).substring(2, 9);
    const player = new Client(id, name, password);
    this.players.set(id, player);
    logger.log(`Registering a new player. Name: ${name} / ID: ${player.index}`);

    return player;
  }

  getPlayerByName(name: string): Client | undefined {
    for (const player of this.players.values()) {
      if (player.name === name) {
        return player;
      }
    }
    return undefined;
  }
}
