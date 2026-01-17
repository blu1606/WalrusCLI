import { WalrusBinaryManager } from './binary-manager';
import { logger } from '../logging';
import { spawn } from 'cross-spawn';
import path from 'path';

export class SiteBuilderWrapper {
    private binaryManager: WalrusBinaryManager;

    constructor(binaryManager: WalrusBinaryManager) {
        this.binaryManager = binaryManager;
    }

    async build(siteDir: string, outputDir: string): Promise<void> {
        const binaryPath = await this.binaryManager.ensureBinaryExists('site-builder');
        logger.info(`Building site from ${siteDir} to ${outputDir} using ${binaryPath}`);

        // Placeholder for actual site-builder command execution
        // Example: site-builder build --source <siteDir> --output <outputDir>
         return new Promise((resolve, reject) => {
             const child = spawn(binaryPath, ['build', '--source', siteDir, '--output', outputDir], {
                 stdio: 'inherit'
             });

             child.on('close', (code) => {
                 if (code !== 0) {
                     reject(new Error(`Site builder failed with code ${code}`));
                 } else {
                     resolve();
                 }
             });
         });
    }
}
