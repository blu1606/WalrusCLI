import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { spawn } from 'cross-spawn';
import axios from 'axios';
import { logger } from '../logging';
import { ConfigManager } from '../config';

export class WalrusBinaryManager {
  private configManager: ConfigManager;
  private binDir: string;
  private binaryName: string;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.binDir = path.join(os.homedir(), '.walrus', 'bin');
    this.binaryName = process.platform === 'win32' ? 'walrus.exe' : 'walrus';
  }

  async ensureBinaryExists(): Promise<string> {
    const binaryPath = path.join(this.binDir, this.binaryName);

    if (fs.existsSync(binaryPath)) {
      // Check version or integrity if needed
      return binaryPath;
    }

    logger.info('Walrus binary not found, downloading...');
    await this.downloadBinary(binaryPath);
    return binaryPath;
  }

  private async downloadBinary(destPath: string): Promise<void> {
    const platform = process.platform;
    const arch = process.arch;

    // Determine download URL based on OS/Arch
    // NOTE: Using placeholder URLs for now, need to be updated with actual reliable sources or `suiup` logic if possible
    // The requirements mention `suiup` or direct curl. Implementing direct download logic for portability.

    let url = '';
    const baseUrl = 'https://storage.googleapis.com/mysten-walrus-binaries';
    // WARNING: These URLs are based on documentation examples and might need adjustment for specific versions

    if (platform === 'linux' && arch === 'x64') {
        url = `${baseUrl}/walrus-testnet-latest-ubuntu-x86_64`;
    } else if (platform === 'darwin' && arch === 'arm64') {
        url = `${baseUrl}/walrus-testnet-latest-macos-arm64`;
    } else if (platform === 'darwin' && arch === 'x64') {
        url = `${baseUrl}/walrus-testnet-latest-macos-x86_64`;
    } else if (platform === 'win32' && arch === 'x64') {
        url = `${baseUrl}/walrus-testnet-latest-windows-x86_64.exe`;
    } else {
        throw new Error(`Unsupported platform: ${platform}-${arch}`);
    }

    fs.ensureDirSync(this.binDir);

    logger.info(`Downloading Walrus binary from ${url}`);

    const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    });

    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => {
            if (platform !== 'win32') {
                fs.chmodSync(destPath, 0o755);
            }
            logger.info('Walrus binary downloaded successfully');
            this.configManager.set('walrusBinaryPath', destPath);
            resolve();
        });
        writer.on('error', reject);
    });
  }

  getBinaryPath(): string {
      return path.join(this.binDir, this.binaryName);
  }
}
