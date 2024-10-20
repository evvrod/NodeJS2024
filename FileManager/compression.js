import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';
import { resolve, join, basename } from 'path';
import { isExist, isFile, isDirectory } from './fileChecker.js'

export const compressFile = async (sourcePath, destinationPath) => {
    try {
        const targetPath = resolve(process.cwd(), sourcePath);
        const outputDir = resolve(process.cwd(), destinationPath);
        const outputPath = join(outputDir, `${basename(sourcePath)}.br`);

        await isExist(targetPath);
        await isFile(targetPath);
        await isExist(outputDir);
        await isDirectory(outputDir);

        await pipeline(
            createReadStream(targetPath),
            createBrotliCompress(),
            createWriteStream(outputPath)
        );
        console.log(`--- File compressed successfully: ${outputPath} ---`);
    } catch (error) {
        throw Error(error.message);
    }
};

export const decompressFile = async (sourcePath, destinationPath) => {
    try {
        const targetPath = resolve(process.cwd(), sourcePath);
        const outputDir = resolve(process.cwd(), destinationPath);
        const outputPath = join(outputDir, basename(sourcePath, '.br'));

        await isExist(targetPath);
        await isFile(targetPath);
        await isExist(outputDir);
        await isDirectory(outputDir);

        await pipeline(
            createReadStream(targetPath),
            createBrotliDecompress(),
            createWriteStream(outputPath)
        );
        console.log(`--- File decompressed successfully: ${outputPath} ---`);
    } catch (error) {
        throw Error(error.message);
    }
};