import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { ConfigManager } from '../config';
import { logger } from '../logging';

export class SuiService {
    private client: SuiClient;
    private keypair: Ed25519Keypair | null = null;
    private configManager: ConfigManager;

    constructor(configManager: ConfigManager) {
        this.configManager = configManager;
        const env = this.configManager.get('env');
        const rpcUrl = this.configManager.get('suiRpcUrl') || getFullnodeUrl(env);

        this.client = new SuiClient({ url: rpcUrl });
    }

    setKeypair(secretKey: string) {
        // Assuming base64 or hex secret key
        try {
            // Simplified key loading logic
            // In a real app, handle different formats (bech32, hex, etc.)
            const keyBuffer = Buffer.from(secretKey, 'base64');
            this.keypair = Ed25519Keypair.fromSecretKey(keyBuffer);
        } catch (error) {
            logger.error('Failed to load keypair', { error });
            throw error;
        }
    }

    async getGasPrice(): Promise<bigint> {
        return this.client.getReferenceGasPrice();
    }

    async executeTransaction(tx: TransactionBlock) {
        if (!this.keypair) {
            throw new Error('Keypair not set. Cannot sign transaction.');
        }

        try {
            const result = await this.client.signAndExecuteTransactionBlock({
                signer: this.keypair,
                transactionBlock: tx,
                options: {
                    showEffects: true,
                    showEvents: true,
                },
            });
            return result;
        } catch (error) {
            logger.error('Transaction failed', { error });
            throw error;
        }
    }

    // Example: Register a site (Placeholder move call)
    async registerSite(siteName: string, blobId: string) {
        const tx = new TransactionBlock();
        // Replace with actual Move package ID and module
        const packageId = '0x...';

        tx.moveCall({
            target: `${packageId}::walrus_site::register`,
            arguments: [
                tx.pure(siteName),
                tx.pure(blobId)
            ]
        });

        return this.executeTransaction(tx);
    }
}
