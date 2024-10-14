import { resolve } from 'path';
import { cwd } from 'process';
import { pipeline } from 'node:stream/promises';
import { createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { isExist, isFile, isDirectory } from './fileChecker.js'

export const hashFile = async (path) => {
    try {
        const targetPath = resolve(cwd(), path);
        const HASH_TYPE = 'sha256';
        
        await isExist(targetPath);
        await isFile(targetPath);

        const hash = createHash(HASH_TYPE);
        await pipeline(
            createReadStream(targetPath),
            hash
        );
        const fileHash = hash.digest('hex');
        console.log(`Hash (${HASH_TYPE}) of the file ${path}: ${fileHash}`);
    }
    catch (error) {
        throw Error(error.message);
    }
};