import logger from '../utils/logger';
import { ClientManager, Client } from './clientManager';

interface Ship {
  type: 'small' | 'medium' | 'large' | 'huge';
  length: number;
  position: { x: number; y: number };
  direction: boolean;
}

export interface GamePlayer {
  idClient: string;
  idPlayer: string;
  ships: Ship[];
  isReady: boolean;
}

export class Game {
  private gameManager: GameManager;
  private players: GamePlayer[];
  private currentPlayerIndex: number;
  private attacks: Array<{
    currentPlayer: string;
    position: { x: number; y: number };
    status: 'miss' | 'shot' | 'killed';
  }>;
  private id: string;
  private statusGame: string;
  private winner: GamePlayer | undefined;
  private grid: { width: number; height: number };

  constructor(gameManager: GameManager, id: string, clients: Client[]) {
    this.gameManager = gameManager;
    this.id = id;
    this.players = this.addPlayers(clients);
    this.currentPlayerIndex = 0;
    this.attacks = [];
    this.statusGame = 'created';
    this.grid = { width: 10, height: 10 };
    this.winner = undefined;
  }

  addPlayerShips(playerId: string, ships: Ship[]): void {
    const player = this.getPlayerById(playerId);
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    player.ships = ships;
    player.isReady = true;
  }

  startGame() {
    this.statusGame = 'started';
    logger.log(`Game ${this.id} has started`);
  }

  finishGame(winnerId: string) {
    this.statusGame = 'finished';
    this.winner = this.getPlayerById(winnerId);
    if (this.winner) {
      this.gameManager.recordWinner(this.winner);
      logger.log(`Game finished. Winner: ${this.winner.idPlayer}`);
    }
  }

  attack(playerId: string, position: { x: number; y: number }) {
    if (this.isAlreadyAttacked(playerId, position)) {
      logger.log(
        `Player ${playerId} already attacked position ${position.x}/${position.y}.`,
      );
      return [];
    }

    const opponent = this.players[(this.currentPlayerIndex + 1) % 2];

    let attackStatus: 'miss' | 'shot' | 'killed' = 'miss';
    let hitShip: Ship | null = null;

    for (const ship of opponent.ships) {
      if (this.isShipShot(position, ship)) {
        attackStatus = 'shot';
        hitShip = ship;
        break;
      }
    }

    const itemAttacks: {
      currentPlayer: string;
      position: { x: number; y: number };
      status: 'miss' | 'shot' | 'killed';
    }[] = [];

    if (hitShip) {
      if (this.isShipKilled(hitShip, position, playerId)) {
        for (let i = 0; i < hitShip.length; i++) {
          const shipPart = hitShip.direction
            ? { x: hitShip.position.x, y: hitShip.position.y + i }
            : { x: hitShip.position.x + i, y: hitShip.position.y };

          itemAttacks.push({
            currentPlayer: playerId,
            position: shipPart,
            status: 'killed',
          });
        }

        const surroundingMisses = this.markSurroundingMisses(hitShip, playerId);
        itemAttacks.push(...surroundingMisses);

        attackStatus = 'killed';
      } else {
        itemAttacks.push({ currentPlayer: playerId, position, status: 'shot' });
      }
    } else {
      itemAttacks.push({ currentPlayer: playerId, position, status: 'miss' });
    }

    this.attacks.push(...itemAttacks);

    logger.log(
      `Player ${this.players[this.currentPlayerIndex].idPlayer} attacked opponent ${opponent.idPlayer} at position ${position.x}/${position.y}. Result: ${attackStatus}`,
    );

    if (attackStatus === 'miss') {
      this.nextTurn();
    }

    if (attackStatus === 'killed') {
      if (this.isFinished(playerId, opponent)) {
        this.statusGame = 'finished';
        this.winner = this.getPlayerById(playerId);
        if (this.winner) {
          this.gameManager.recordWinner(this.winner);
          logger.log(`Game finished. Winner: ${this.winner.idPlayer}`);
        }
      }
    }

    return itemAttacks;
  }

  randomAttack(playerId: string) {
    const attackResults = [];
    let singleAttackResults;
    let position: { x: number; y: number } = { x: 0, y: 0 };
    do {
      let isValidAttack = false;
      while (!isValidAttack) {
        position = {
          x: Math.floor(Math.random() * this.grid.width),
          y: Math.floor(Math.random() * this.grid.width),
        };

        const alreadyAttacked = this.attacks.some(
          (attack) =>
            attack.currentPlayer === playerId &&
            attack.position.x === position.x &&
            attack.position.y === position.y,
        );

        if (!alreadyAttacked) {
          isValidAttack = true;
        }
      }

      singleAttackResults = this.attack(playerId, position);

      attackResults.push(...singleAttackResults);

      if (this.isGameFinished()) {
        break;
      }
    } while (
      singleAttackResults.some(
        (result) => result.status === 'shot' || result.status === 'killed',
      )
    );

    return attackResults;
  }

  getWinner() {
    return this.winner;
  }

  getId() {
    return this.id;
  }

  getPlayers() {
    return this.players;
  }

  getAttacks() {
    return this.attacks;
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getRandomShips(): Ship[] {
    const ships: Ship[] = [];

    const fieldSize = this.grid.width;

    const shipTypes: { type: Ship['type']; length: number; count: number }[] = [
      { type: 'huge', length: 4, count: 1 }, // 1 большой
      { type: 'large', length: 3, count: 2 }, // 2 средних
      { type: 'medium', length: 2, count: 3 }, // 3 двойных
      { type: 'small', length: 1, count: 4 }, // 4 одиночных
    ];

    const field: number[][] = Array.from({ length: fieldSize }, () =>
      Array(fieldSize).fill(0),
    );

    function canPlaceShip(
      x: number,
      y: number,
      length: number,
      direction: boolean,
    ): boolean {
      for (let i = 0; i < length; i++) {
        const newX = direction ? x + i : x;
        const newY = direction ? y : y + i;

        if (newX >= fieldSize || newY >= fieldSize || field[newY][newX] === 1) {
          return false;
        }
      }
      return true;
    }

    function placeShip(
      x: number,
      y: number,
      length: number,
      direction: boolean,
    ): void {
      for (let i = 0; i < length; i++) {
        const newX = direction ? x + i : x;
        const newY = direction ? y : y + i;
        field[newY][newX] = 1;
      }
    }

    shipTypes.forEach(({ type, length }) => {
      let placed = false;

      while (!placed) {
        const x = Math.floor(Math.random() * fieldSize);
        const y = Math.floor(Math.random() * fieldSize);
        const direction = Math.random() < 0.5;

        if (canPlaceShip(x, y, length, direction)) {
          placeShip(x, y, length, direction);
          ships.push({ type, length, position: { x, y }, direction });
          placed = true;
        }
      }
    });

    return ships;
  }

  arePlayersReady() {
    return this.getPlayers().every((player) => player.isReady);
  }

  isGameStarted() {
    return this.statusGame === 'started';
  }

  isGameFinished() {
    return this.statusGame === 'finished';
  }

  private getPlayerById(playerId: string): GamePlayer | undefined {
    return this.getPlayers().find((player) => player.idPlayer === playerId);
  }

  private nextTurn() {
    logger.log(
      `Turn change: ${this.players[this.currentPlayerIndex].idPlayer} => ${this.players[(this.currentPlayerIndex + 1) % 2].idPlayer}`,
    );
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;
  }

  private addPlayers(clients: Client[]) {
    return clients.map((el) => {
      const idPlayer = Math.random().toString(36).substring(2, 9);
      return {
        idClient: el.index,
        idPlayer,
        ships: [],
        isReady: false,
      };
    });
  }

  private isShipShot(position: { x: number; y: number }, ship: Ship): boolean {
    for (let i = 0; i < ship.length; i++) {
      const shipPart = ship.direction
        ? { x: ship.position.x, y: ship.position.y + i } // Вертикально
        : { x: ship.position.x + i, y: ship.position.y }; // Горизонтально

      if (shipPart.x === position.x && shipPart.y === position.y) {
        return true;
      }
    }
    return false;
  }

  private isShipKilled(
    ship: Ship,
    currentAttack: { x: number; y: number },
    playerId: string,
  ): boolean {
    const allPartsHit = Array.from({ length: ship.length }, (_, i) => ({
      x: ship.direction ? ship.position.x : ship.position.x + i,
      y: ship.direction ? ship.position.y + i : ship.position.y,
    })).every(
      (part) =>
        (part.x === currentAttack.x && part.y === currentAttack.y) ||
        this.attacks.some(
          (attack) =>
            attack.currentPlayer === playerId &&
            attack.position.x === part.x &&
            attack.position.y === part.y,
        ),
    );

    return allPartsHit;
  }

  private isFinished(currentPlayerId: string, opponent: GamePlayer) {
    return opponent.ships.every((ship) =>
      this.isShipDestroyed(ship, currentPlayerId),
    );
  }

  private isShipDestroyed(ship: Ship, playerId: string): boolean {
    const shipParts = Array.from({ length: ship.length }, (_, i) => ({
      x: ship.direction ? ship.position.x : ship.position.x + i,
      y: ship.direction ? ship.position.y + i : ship.position.y,
    }));

    const isDestroyed = shipParts.every((part) =>
      this.attacks.some(
        (attack) =>
          attack.currentPlayer === playerId &&
          attack.position.x === part.x &&
          attack.position.y === part.y &&
          attack.status === 'killed',
      ),
    );
    return isDestroyed;
  }

  private markSurroundingMisses(ship: Ship, playerId: string) {
    const misses: {
      currentPlayer: string;
      position: { x: number; y: number };
      status: 'miss';
    }[] = [];

    const surroundingCoordinates = [];

    if (ship.direction) {
      // Вертикальный корабль
      for (let i = 0; i < ship.length; i++) {
        const shipPart = { x: ship.position.x, y: ship.position.y + i };

        if (i === 0) {
          surroundingCoordinates.push(
            { x: shipPart.x - 1, y: shipPart.y - 1 }, // Левый верх
            { x: shipPart.x, y: shipPart.y - 1 }, // Вверх
            { x: shipPart.x + 1, y: shipPart.y - 1 }, // Правый верх
          );
        }
        if (i === ship.length - 1) {
          surroundingCoordinates.push(
            { x: shipPart.x - 1, y: shipPart.y + 1 }, // Левый низ
            { x: shipPart.x, y: shipPart.y + 1 }, // Низ
            { x: shipPart.x + 1, y: shipPart.y + 1 }, // Правый низ
          );
        }
        surroundingCoordinates.push(
          { x: shipPart.x - 1, y: shipPart.y }, // Левый
          { x: shipPart.x + 1, y: shipPart.y }, // Правый
        );
      }
    } else {
      // Горизонтальный корабль
      for (let i = 0; i < ship.length; i++) {
        const shipPart = { x: ship.position.x + i, y: ship.position.y };

        if (i === 0) {
          surroundingCoordinates.push(
            { x: shipPart.x - 1, y: shipPart.y - 1 }, // Левый верх
            { x: shipPart.x - 1, y: shipPart.y }, // Левый
            { x: shipPart.x - 1, y: shipPart.y + 1 }, // Левый низ
          );
        }
        if (i === ship.length - 1) {
          surroundingCoordinates.push(
            { x: shipPart.x + 1, y: shipPart.y - 1 }, // Правый верх
            { x: shipPart.x + 1, y: shipPart.y }, // Правый
            { x: shipPart.x + 1, y: shipPart.y + 1 }, // Правый низ
          );
        }
        surroundingCoordinates.push(
          { x: shipPart.x, y: shipPart.y - 1 }, // Вверх
          { x: shipPart.x, y: shipPart.y + 1 }, // Низ
        );
      }
    }

    for (const coord of surroundingCoordinates) {
      if (coord.x >= 0 && coord.x <= 9 && coord.y >= 0 && coord.y <= 9) {
        if (
          !this.attacks.some(
            (attack) =>
              attack.currentPlayer === playerId &&
              attack.position.x === coord.x &&
              attack.position.y === coord.y,
          )
        ) {
          misses.push({
            currentPlayer: playerId,
            position: coord,
            status: 'miss',
          });
        }
      }
    }

    return misses;
  }

  private isAlreadyAttacked(
    playerId: string,
    position: { x: number; y: number },
  ) {
    return this.attacks.some(
      (attack) =>
        attack.currentPlayer === playerId &&
        attack.position.x === position.x &&
        attack.position.y === position.y,
    );
  }
}

export class GameManager {
  private games: Map<string, Game>;
  private winners: { player: GamePlayer; wins: number }[];
  private clientManager: ClientManager;

  constructor(clientManager: ClientManager) {
    this.games = new Map<string, Game>();
    this.winners = [];
    this.clientManager = clientManager;
  }

  createGame(players: Client[]): Game {
    const gameId = this.generateGameId();
    const game = new Game(this, gameId, players);
    this.games.set(gameId, game);
    logger.log(`Game ${gameId} has been created`);
    return game;
  }

  startGame(idGame: string) {
    const game = this.getGame(idGame);
    if (!game) {
      throw new Error(`Game ${idGame} not found`);
    }
    game.startGame();
  }

  finishGame(game: Game, clientId: string) {
    const winnerId = game
      .getPlayers()
      .find((player) => player.idClient !== clientId)?.idPlayer;

    if (winnerId) {
      game.finishGame(winnerId);
    }
  }

  recordWinner(player: GamePlayer) {
    const existingWinner = this.winners.find(
      (winner) => winner.player.idClient === player.idClient,
    );
    if (existingWinner) {
      existingWinner.wins += 1;
    } else {
      this.winners.push({ player, wins: 1 });
    }
  }

  getWinners() {
    return this.winners.map((winner) => ({
      name: this.clientManager.getPlayerById(winner.player.idClient)?.name,
      wins: winner.wins,
    }));
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  getGameWithPlayer(clientId: string): string | undefined {
    for (const game of this.games.values()) {
      const isPlayerInGame = game
        .getPlayers()
        .find((player) => player.idClient === clientId);
      if (isPlayerInGame) {
        console.log(game.getId());
        return game.getId();
      }
    }
    return undefined;
  }

  private generateGameId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}

export default GameManager;
