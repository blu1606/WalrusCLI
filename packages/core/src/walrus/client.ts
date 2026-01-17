import { spawn } from 'cross-spawn';
import { logger } from '../logging';
import { WalrusBinaryManager } from './binary-manager';
import fs from 'fs-extra';

export interface StoreBlobResult {
  blobId: string;
  suiRefType?: string;
  suiRefObjectId?: string;
  cost?: number;
}

export class WalrusClient {
  private binaryManager: WalrusBinaryManager;

  constructor(binaryManager: WalrusBinaryManager) {
    this.binaryManager = binaryManager;
  }

  async storeBlob(filePath: string): Promise<StoreBlobResult> {
    const binaryPath = await this.binaryManager.ensureBinaryExists('walrus');

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
      // Command: walrus store <file> --json
      const child = spawn(binaryPath, ['store', filePath, '--json'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          logger.error('Walrus store command failed', { code, stderr });
          reject(new Error(`Walrus store failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          // Parsing logic depends on actual JSON output structure of `walrus store`
          // Assuming structure for now based on typical CLI JSON outputs
          resolve({
              blobId: result.blobId || result.id, // Adjust based on actual output
              // other fields
          });
        } catch (e) {
            // Fallback parsing if not JSON or parsing fails
            // Some versions might output plain text
             logger.warn('Failed to parse JSON output from walrus store', { stdout });
             // Simple regex fallback for Blob ID
             const match = stdout.match(/Blob ID: ([a-zA-Z0-9]+)/);
             if (match) {
                 resolve({ blobId: match[1] });
             } else {
                 reject(new Error('Could not parse Blob ID from output'));
             }
        }
      });
    });
  }

  async readBlob(blobId: string, outputPath: string): Promise<void> {
      const binaryPath = await this.binaryManager.ensureBinaryExists('walrus');

      return new Promise((resolve, reject) => {
          // Command: walrus read <blobId> --out <outputPath>
          const child = spawn(binaryPath, ['read', blobId, '--out', outputPath], {
              stdio: ['ignore', 'pipe', 'pipe']
          });

          let stderr = '';
          child.stderr?.on('data', (data) => { stderr += data.toString(); });

          child.on('close', (code) => {
              if (code !== 0) {
                  reject(new Error(`Walrus read failed: ${stderr}`));
              } else {
                  resolve();
              }
          });
      });
  }

  async deleteBlob(blobId: string): Promise<void> {
       const binaryPath = await this.binaryManager.ensureBinaryExists('walrus');

       return new Promise((resolve, reject) => {
           // Command: walrus delete <blobId>
           // Note: Verify if `delete` is supported directly in the CLI version being used
           const child = spawn(binaryPath, ['delete', blobId], {
               stdio: ['ignore', 'pipe', 'pipe']
           });

           let stderr = '';
           child.stderr?.on('data', (data) => { stderr += data.toString(); });

           child.on('close', (code) => {
               if (code !== 0) {
                   reject(new Error(`Walrus delete failed: ${stderr}`));
               } else {
                   resolve();
               }
           });
       });
  }
}
