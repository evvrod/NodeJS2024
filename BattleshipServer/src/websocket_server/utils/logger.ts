import fs from 'fs';
import path from 'path';

class Logger {
  private logFilePath: string;

  constructor() {
    this.logFilePath = path.join(__dirname, '../../log/server.log');
  }

  log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}`;
    console.log(logMessage);
    this.writeToFile(logMessage);
  }

  error(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(logMessage);
    this.writeToFile(logMessage);
  }

  writeToFile(message: string) {
    fs.appendFile(this.logFilePath, message + '\n', (err) => {
      if (err) {
        console.error('Failed to write to the log file:', err);
      }
    });
  }
}

export default new Logger();
