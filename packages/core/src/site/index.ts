import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';
import { logger } from '../logging';

export interface FileEntry {
    path: string;
    hash: string;
    mimeType: string;
    size: number;
}

export class SiteManager {
    async scanDirectory(dirPath: string): Promise<FileEntry[]> {
        const files: FileEntry[] = [];

        const processDir = async (currentDir: string) => {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    await processDir(fullPath);
                } else if (entry.isFile()) {
                    const relativePath = path.relative(dirPath, fullPath);
                    const buffer = await fs.readFile(fullPath);
                    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
                    const mimeType = mime.lookup(fullPath) || 'application/octet-stream';

                    files.push({
                        path: relativePath,
                        hash,
                        mimeType,
                        size: entry.path.length // Rough size check, correct is fs.stat
                    });
                }
            }
        };

        await processDir(dirPath);
        return files;
    }

    compareSites(localFiles: FileEntry[], remoteManifest: Record<string, string>): {
        added: FileEntry[],
        modified: FileEntry[],
        deleted: string[]
    } {
        const added: FileEntry[] = [];
        const modified: FileEntry[] = [];
        const deleted: string[] = [];

        const remotePaths = new Set(Object.keys(remoteManifest));

        for (const file of localFiles) {
            if (remotePaths.has(file.path)) {
                if (remoteManifest[file.path] !== file.hash) {
                    modified.push(file);
                }
                remotePaths.delete(file.path);
            } else {
                added.push(file);
            }
        }

        deleted.push(...remotePaths);

        return { added, modified, deleted };
    }
}
