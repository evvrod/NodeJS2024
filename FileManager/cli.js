import readline from 'readline';

import { goUp, changeDirectory, listDirectory, printCurrentDirectory } from './navigation.js';
import { readFile, addFile, renameFile, copyFile, moveFile, removeFile } from './fileOperations.js';
import osInfo from './osInfo.js';
import { hashFile } from './hashing.js';
import { compressFile, decompressFile } from './compression.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export const initializeCLI = (username) => {
  rl.on('line', async (input) => {
    const [command, ...args] = input.trim().split(' ');
    try {
      switch (command) {
        case 'up':
          goUp();
          break;
        case 'cd':
          await changeDirectory(args[0]);
          break;
        case 'ls':
          printCurrentDirectory();
          await listDirectory();
          break;
        case 'cat':
          printCurrentDirectory();
          await readFile(args[0]);
          break;
        case 'add':
          printCurrentDirectory();
          await addFile(args[0]);
          break;
        case 'rn':
          printCurrentDirectory();
          await renameFile(args[0], args[1]);
          break;
        case 'cp':
          printCurrentDirectory();
          await copyFile(args[0], args[1]);
          break;
        case 'mv':
          printCurrentDirectory();
          await moveFile(args[0], args[1]);
          break;
        case 'rm':
          printCurrentDirectory();
          await removeFile(args[0]);
          break;
        case 'os':
          printCurrentDirectory();
          osInfo(args[0]);
          break;
        case 'hash':
          printCurrentDirectory();
          await hashFile(args[0]);
          break;
        case 'compress':
          printCurrentDirectory();
          await compressFile(args[0], args[1]);
          break;
        case 'decompress':
          printCurrentDirectory();
          await decompressFile(args[0], args[1]);
          break;
        case '.exit':
          exitFileManager(username);
          break;
        default:
          throw Error('Invalid input. Please enter a valid command');
      }
    } catch (error) {
      console.log('Operation failed: ', error.message);
    }
  });
};

export const exitFileManager = (username) => {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  rl.close();
  process.exit();
};