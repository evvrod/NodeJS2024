import { resolve, dirname, join } from 'path';
import { chdir, cwd } from 'process';
import { stat, readdir } from 'node:fs/promises';
import os from 'node:os';
import { isExist, isFile, isDirectory } from './fileChecker.js'

const homeDirectory = os.homedir();

export const printCurrentDirectory = () => {
  console.log(`>>> You are currently in ${cwd()}`);
};

export const initializeHomeDirectory = () => {
  try {
    chdir(homeDirectory);
    printCurrentDirectory();
  } catch (error) {
    console.log('Operation failed');
  }
};

export const goUp = () => {
  try {
    const parentDir = resolve(cwd(), '..');
    if (parentDir === cwd()) {
      console.log('You are currently in the root directory');
    } else {
      chdir(parentDir);
      printCurrentDirectory();
    }
  } catch (error) {
    throw Error(error.message);
  }
};

export const changeDirectory = async (path) => {
  try {
    const targetPath = resolve(cwd(), path);

    await isExist(targetPath);
    await isDirectory(targetPath);

    chdir(targetPath);
    printCurrentDirectory();
  } catch (error) {
    throw Error(error.message);
  }
};

export const listDirectory = async () => {
  try {
    const currentPath = cwd();
    const files = await readdir(currentPath);

    const statsPromises = files.map(async (file) => {
      const fullPath = resolve(currentPath, file);
      const fileStats = await stat(fullPath);
      return { name: file, isDirectory: fileStats.isDirectory(), isFile: fileStats.isFile() };
    });

    const filesWithStats = await Promise.allSettled(statsPromises);
    const directories = filesWithStats.filter((file) => file.value.isDirectory).map((dir) => dir.value.name).sort();;
    const regularFiles = filesWithStats.filter((file) => file.value.isFile).map((file) => file.value.name).sort();;

    const tableData = [
      ...directories.map((dir) => ({
        Name: dir,
        Type: 'Directory'
      })),
      ...regularFiles.map((file) => ({
        Name: file,
        Type: 'File'
      }))
    ];
    console.table(tableData);
  } catch (error) {
    throw Error(error.message);
  }
};

