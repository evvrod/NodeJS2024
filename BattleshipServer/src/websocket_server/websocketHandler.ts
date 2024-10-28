import { WebSocket } from 'ws';
import { ClientManager } from './managers/clientManager';
import { RoomManager } from './managers/roomManager';
import { GameManager, Game, GamePlayer } from './managers/gameManager';

import logger from './utils/logger';

const sessions = new Map<string, WebSocket>();
const clientManager = new ClientManager();
const gameManager = new GameManager(clientManager);
const roomManager = new RoomManager(clientManager);

const messageHandlers: Record<string, (ws: WebSocket, data: string) => void> = {
  'reg': handleRegister,
  'create_room': handleCreateRoom,
  'add_user_to_room': handleAddUserToRoom,
  'add_ships': handleAddShips,
  'attack': handleAttack,
  'randomAttack': handleRandomAttack,
};

export function wsHandleClose() {
  logger.log('Client disconnected');
}

export function wsHandleError(error: unknown) {
  if (error instanceof Error) {
    logger.error(error.message);
  } else {
    logger.error(String(error));
  }
}

export function wsHandleMessage(ws: WebSocket, message: string) {
  try {
    const { type, data } = JSON.parse(message);

    const handler = messageHandlers[type];
    if (!handler) {
      throw new Error(`Unknown command: ${type}}`);
    }
    handler(ws, data);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(String(error));
    }
  }
}

function handleRegister(ws: WebSocket, data: string) {
  const { name, password } = JSON.parse(data);

  if (!name || !password) {
    throw new Error('Name and password are required');
  }

  const existingPlayer = clientManager.getPlayerByName(name);
  if (existingPlayer) {
    ws.send(
      JSON.stringify({
        type: 'reg',
        data: JSON.stringify({
          name: '',
          index: '',
          error: true,
          errorText: 'User with this name already exists',
        }),
        id: 0,
      }),
    );
    throw new Error('User with this name already exists');
  }

  const player = clientManager.registerPlayer(name, password);
  sessions.set(player.index, ws);
  ws.send(
    JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        name: player.name,
        index: player.index,
      }),
      id: 0,
    }),
  );
  notifyClientsAboutRooms();
}

function handleCreateRoom(ws: WebSocket) {
  const playerId = getIdFromWs(sessions, ws);
  if (!playerId) {
    throw new Error('Player not found');
  }
  const room = roomManager.createRoom();
  roomManager.addPlayerToRoom(playerId, room.roomId);
  notifyClientsAboutRooms();
}

function handleAddUserToRoom(ws: WebSocket, data: string) {
  const { indexRoom } = JSON.parse(data);
  const playerId = getIdFromWs(sessions, ws);

  if (!playerId) {
    throw new Error('Player not found');
  }
  const room = roomManager.getRoomById(indexRoom);
  if (!room) throw new Error('Room not found');

  roomManager.addPlayerToRoom(playerId, indexRoom);
  notifyClientsAboutRooms();

  if (room.isRoomFull()) {
    const game = gameManager.createGame(room.getPlayers());
    notifyClientsAboutCreateGame(game);
  }
}

function handleAddShips(ws: WebSocket, data: string) {
  const { gameId, ships, indexPlayer } = JSON.parse(data);
  const game = gameManager.getGame(gameId);
  if (!game) {
    throw new Error(`Game with ID ${gameId} not found.`);
  }

  game.addPlayerShips(indexPlayer, ships);

  if (game.arePlayersReady()) {
    gameManager.startGame(game.getId());
    if (game.isGameStarted()) {
      notifyPlayersAboutStartGame(game);
      notifyPlayersAboutTurn(game);
    }
  }
}

function handleAttack(ws: WebSocket, data: string) {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const game = gameManager.getGame(gameId);
  if (!game) throw new Error(`Game with ID ${gameId} not found`);

  if (game.getCurrentPlayer().idPlayer !== indexPlayer) {
    throw new Error(`Not turn player ${indexPlayer}`);
  }

  const attackResult = game.attack(indexPlayer, { x, y });

  notifyClientsAttackFeedback(game, attackResult);
  if (game.isGameFinished()) {
    notifyClientsAboutFinish(game);
  }
  notifyPlayersAboutTurn(game);
}

function handleRandomAttack(ws: WebSocket, data: string) {
  const { gameId, indexPlayer } = JSON.parse(data);
  const game = gameManager.getGame(gameId);
  if (!game) throw new Error(`Game with ID ${gameId} not found`);

  if (game.getCurrentPlayer().idPlayer !== indexPlayer) {
    throw new Error(`Not turn player ${indexPlayer}`);
  }

  const attackResult = game.randomAttack(indexPlayer);

  notifyClientsAttackFeedback(game, attackResult);
  notifyPlayersAboutTurn(game);
}

function getIdFromWs(
  map: Map<string, WebSocket>,
  ws: WebSocket,
): string | undefined {
  return [...map.entries()].find(([, clientWs]) => clientWs === ws)?.[0];
}

function broadcastMessage(jsonMessage: string) {
  sessions.forEach((session) => {
    if (session.readyState === WebSocket.OPEN) {
      session.send(jsonMessage);
    }
  });
}

function notifyClientsAboutRooms() {
  const rooms = roomManager.getFreeRooms();

  const jsonMessage = JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(rooms),
    id: 0,
  });

  broadcastMessage(jsonMessage);
}

function notifyClientsAboutWinners() {
  const winners = gameManager.getWinners();

  const jsonMessage = JSON.stringify({
    type: 'update_winners',
    data: JSON.stringify(winners),
    id: 0,
  });

  broadcastMessage(jsonMessage);
}

function notifyClientsAboutCreateGame(game: Game) {
  game.getPlayers().forEach((player) => {
    const playerWs = sessions.get(player.idClient);

    playerWs?.send(
      JSON.stringify({
        type: 'create_game',
        data: JSON.stringify({
          idGame: game.getId(),
          idPlayer: player.idPlayer,
        }),
        id: 0,
      }),
    );
  });
}

function notifyPlayersAboutStartGame(game: Game) {
  const players: GamePlayer[] = game.getPlayers();

  players.forEach((player) => {
    const clientsWs = sessions.get(player.idClient);

    clientsWs?.send(
      JSON.stringify({
        type: 'start_game',
        data: JSON.stringify({
          ships: player.ships,
          currentPlayerIndex: player.idPlayer,
        }),
        id: 0,
      }),
    );
  });
}

function notifyPlayersAboutTurn(game: Game) {
  game.getPlayers().forEach((player) => {
    const playerWs = sessions.get(player.idClient);

    playerWs?.send(
      JSON.stringify({
        type: 'turn',
        data: JSON.stringify({
          currentPlayer: game.getCurrentPlayer().idPlayer,
        }),
        id: 0,
      }),
    );
  });
}

function notifyClientsAttackFeedback(
  game: Game,
  attackResult: {
    currentPlayer: string;
    position: { x: number; y: number };
    status: 'miss' | 'shot' | 'killed';
  }[],
) {
  if (!attackResult) {
    return;
  }
  game.getPlayers().forEach((player) => {
    const playerWs = sessions.get(player.idClient);
    attackResult.forEach((attack) => {
      playerWs?.send(
        JSON.stringify({
          type: 'attack',
          data: JSON.stringify(attack),
          id: 0,
        }),
      );
    });
  });
}

function notifyClientsAboutFinish(game: Game) {
  const winner = game.getWinner();
  if (winner) {
    game.getPlayers().forEach((player) => {
      const playerWs = sessions.get(player.idClient);

      playerWs?.send(
        JSON.stringify({
          type: 'finish',
          data: JSON.stringify({
            winPlayer: winner.idPlayer,
          }),
          id: 0,
        }),
      );
    });

    notifyClientsAboutWinners();
  }
}
