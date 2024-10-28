import { WebSocket } from 'ws';
import { ClientManager } from './managers/clientManager';

import logger from './utils/logger';

const sessions = new Map<string, WebSocket>();
const clientManager = new ClientManager();

const messageHandlers: Record<string, (ws: WebSocket, data: string) => void> = {
  'reg': handleRegister,
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
      throw new Error('Unknown command');
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
}
