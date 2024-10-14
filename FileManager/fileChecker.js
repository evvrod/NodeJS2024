import { access, stat } from 'fs/promises';
import { constants } from 'fs';
import { resolve } from 'path';

export const isExist = async (path) => {
  const resolvedPath = resolve(process.cwd(), path);
  try {
    await access(resolvedPath, constants.F_OK);
  } catch (error) {
    throw Error(`File/directory does not exist - ${resolvedPath}`);
  }
};

export const isFile = async (path) => {
  const resolvedPath = resolve(process.cwd(), path);
  try {
    const fileStats = await stat(resolvedPath);
    if (!fileStats.isFile()) {
      throw new Error(`Not a file - ${resolvedPath}`);
    }
  } catch (error) {
    throw Error(`Unable to access file - ${resolvedPath}`);
  }
};

export const isDirectory = async (path) => {
  const resolvedPath = resolve(process.cwd(), path);
  try {
    const fileStats = await stat(resolvedPath);
    if (!fileStats.isDirectory()) {
      throw new Error(`Not a directory - ${resolvedPath}`);
    }
  } catch (error) {
    throw Error(`Unable to access directory - ${resolvedPath}`);
  }
};