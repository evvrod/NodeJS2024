import logger from '../utils/logger';

export class Client {
  index: string;
  name: string;
  password: string;
  isBot: boolean;

  constructor(
    id: string,
    name: string,
    password: string,
    isBot: boolean = false,
  ) {
    this.index = id;
    this.name = name;
    this.password = password;
    this.isBot = isBot;
  }
}

export class ClientManager {
  private players: Map<string, Client> = new Map();

  registerPlayer(
    name: string,
    password: string,
    isBot: boolean = false,
  ): Client {
    const id = Math.random().toString(36).substring(2, 9);
    const player = new Client(id, name, password, isBot);
    this.players.set(id, player);
    logger.log(`Registering a new player. Name: ${name} / ID: ${player.index}`);

    return player;
  }

  registerBot(playerId: string) {
    const id = Math.random().toString(36).substring(2, 9);

    const botName = `Bot_${playerId}`;
    const botPassword = 'bot_password';
    const isBot = true;

    const player = new Client(id, botName, botPassword, isBot);
    this.players.set(id, player);

    logger.log(`Registering a new bot. Name: ${botName} / ID: ${player.index}`);

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

  getPlayerById(id: string): Client | undefined {
    return this.players.get(id);
  }
}
