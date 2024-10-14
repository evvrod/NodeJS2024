import { initializeCLI, exitFileManager } from './cli.js';
import { initializeHomeDirectory } from './navigation.js';

const args = process.argv.slice(2);

const username = args.find((arg) => arg.startsWith('--username')).split('=')[1];

if (!args.includes('--') || !username) console.log('Operation failed');

console.log(`Welcome to the File Manager, ${username}!`);
initializeHomeDirectory();

initializeCLI(username);

process.on('SIGINT', () => {
    exitFileManager(username);
});

process.on('exit', () => {
    exitFileManager(username);
});