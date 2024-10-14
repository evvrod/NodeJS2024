import fs from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import os from 'node:os';
import { dirname, join, resolve, basename } from 'path';
import { isExist, isFile, isDirectory } from './fileChecker.js'

export const readFile = async (path) => {
  try {
    const targetPath = resolve(process.cwd(), path);

    await isExist(targetPath);
    await isFile(targetPath);

    await pipeline(
      createReadStream(targetPath, { encoding: 'utf-8' }),
      process.stdout,
      { end: false });
    console.log(`${os.EOL}--- File reading completed ---`);
  }
  catch (error) {
    throw Error(error.message);
  }
}

export const addFile = async (filename) => {
  try {
    const targetPath = resolve(process.cwd(), filename);

    const writeStream = createWriteStream(targetPath);
    writeStream.end();
    console.log(`--- File ${filename} has been created ---`);
  } catch (error) {
    throw Error(error.message);
  }
};

export const renameFile = async (oldPath, newName) => {
  try {
    const oldFilePath = resolve(process.cwd(), oldPath);

    await isExist(oldFilePath);
    await isFile(oldFilePath);

    const directoryPath = dirname(oldFilePath);
    const newFilePath = join(directoryPath, newName);

    await fs.rename(oldFilePath, newFilePath);
    console.log(`--- File renamed successfully from "${basename(oldFilePath)}" to "${newName}" ---`);
  } catch (error) {
    throw Error(error.message);
  }
};

export const copyFile = async (oldPath, newPath) => {
  try {
    const fromPath = resolve(process.cwd(), oldPath);
    const directoryPath = resolve(process.cwd(), newPath);
    const toPath = resolve(directoryPath, basename(oldPath));

    await isExist(fromPath);
    await isFile(fromPath);
    await isExist(directoryPath);
    await isDirectory(directoryPath);

    await pipeline(
      createReadStream(fromPath),
      createWriteStream(toPath)
    );
    console.log(`--- File copied from ${fromPath} to ${toPath} ---`);
  } catch (error) {
    throw Error(error.message);
  }
};

export const moveFile = async (oldPath, newPath) => {
  try {
    const fromPath = resolve(process.cwd(), oldPath);
    const directoryPath = resolve(process.cwd(), newPath);
    const toPath = resolve(directoryPath, basename(oldPath));

    await isExist(fromPath);
    await isFile(fromPath);
    await isExist(directoryPath);
    await isDirectory(directoryPath);

    await pipeline(
      createReadStream(fromPath),
      createWriteStream(toPath)
    );
    await fs.unlink(fromPath)

    console.log(`--- File moved successfully from "${fromPath}" to "${toPath}" ---`);
  } catch (error) {
    throw Error(error.message);
  }
};

export const removeFile = async (path) => {
  try {
    const filePath = resolve(process.cwd(), path);

    await isExist(filePath);
    await isFile(filePath);

    await fs.unlink(filePath);
    console.log(`--- File "${filePath}" removed successfully ---`);
  } catch (error) {
    throw Error(error.message);
  }
};
