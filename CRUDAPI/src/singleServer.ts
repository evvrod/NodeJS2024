import createServer from './server.js';

const PORT = parseInt(process.env.PORT as string, 10) || 4000;

createServer(PORT);
