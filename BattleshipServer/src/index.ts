import startHttpServer from './http_server/index';
import startWebSocketServer from './websocket_server/server';

const HTTP_PORT = 8181;
const WEBSOCKET_PORT = 3000;

startHttpServer(HTTP_PORT);
startWebSocketServer(WEBSOCKET_PORT);
