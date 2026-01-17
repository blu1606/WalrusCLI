import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { spawn } from 'cross-spawn';
import axios from 'axios';
import { logger } from '../logging';
import { ConfigManager } from '../config';

export type WalrusBinary = 'walrus' | 'site-builder';

export class WalrusBinaryManager {
  private configManager: ConfigManager;
  private binDir: string;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
    this.binDir = path.join(os.homedir(), '.walrus', 'bin');
  }

  async ensureBinaryExists(binary: WalrusBinary): Promise<string> {
    const binaryName = this.getBinaryName(binary);
    const binaryPath = path.join(this.binDir, binaryName);

    if (fs.existsSync(binaryPath)) {
      // Check version or integrity if needed
      return binaryPath;
    }

    logger.info(`${binary} binary not found, downloading...`);
    await this.downloadBinary(binary, binaryPath);
    return binaryPath;
  }

  private getBinaryName(binary: WalrusBinary): string {
    const ext = process.platform === 'win32' ? '.exe' : '';
    return `${binary}${ext}`;
  }

  private async downloadBinary(binary: WalrusBinary, destPath: string): Promise<void> {
    const platform = process.platform;
    const arch = process.arch;

    // Determine download URL based on OS/Arch
    // NOTE: Using placeholder URLs for now, need to be updated with actual reliable sources or `suiup` logic if possible
    // The requirements mention `suiup` or direct curl. Implementing direct download logic for portability.

    let url = '';
    const baseUrl = 'https://storage.googleapis.com/mysten-walrus-binaries';
    // WARNING: These URLs are based on documentation examples and might need adjustment for specific versions

    const binaryPrefix = binary === 'walrus' ? 'walrus' : 'site-builder';

    if (platform === 'linux' && arch === 'x64') {
        url = `${baseUrl}/${binaryPrefix}-testnet-latest-ubuntu-x86_64`;
    } else if (platform === 'darwin' && arch === 'arm64') {
        url = `${baseUrl}/${binaryPrefix}-testnet-latest-macos-arm64`;
    } else if (platform === 'darwin' && arch === 'x64') {
        url = `${baseUrl}/${binaryPrefix}-testnet-latest-macos-x86_64`;
    } else if (platform === 'win32' && arch === 'x64') {
        url = `${baseUrl}/${binaryPrefix}-testnet-latest-windows-x86_64.exe`;
    } else {
        throw new Error(`Unsupported platform: ${platform}-${arch}`);
    }

    fs.ensureDirSync(this.binDir);

    logger.info(`Downloading ${binary} binary from ${url}`);

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
            logger.info(`${binary} binary downloaded successfully`);
            const configKey = binary === 'walrus' ? 'walrusBinaryPath' : 'siteBuilderBinaryPath';
            this.configManager.set(configKey, destPath);
            resolve();
        });
        writer.on('error', reject);
    });
  }

  getBinaryPath(binary: WalrusBinary): string {
      return path.join(this.binDir, this.getBinaryName(binary));
  }
}
