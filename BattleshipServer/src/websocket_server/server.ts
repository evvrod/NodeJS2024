import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { IncomingMessage } from 'http';

import {
  wsHandleMessage,
  wsHandleClose,
  wsHandleError,
} from './websocketHandler';

import logger from './utils/logger';

export default function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientId = uuidv4();
    const clientIp = req.socket.remoteAddress;
    logger.log(
      `New connection established. Client ID: ${clientId}, IP: ${clientIp}`,
    );

    ws.on('message', (message: string) => wsHandleMessage(ws, message));
    ws.on('close', () => wsHandleClose(ws));
    ws.on('error', (error) => wsHandleError(error));
  });

  logger.log(`Start websocket server on the port: ${port}`);
}
