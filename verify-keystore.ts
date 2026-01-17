import { Keystore } from './packages/core/src/wallet/keystore';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

async function run() {
    console.log('[INFO] Starting Keystore verification...');
    const testDir = path.join(os.tmpdir(), 'walrus-verify-keystore-' + Date.now());
    await fs.ensureDir(testDir);

    try {
        const keystore = new Keystore(testDir);
        const keypair = new Ed25519Keypair();
        const address = keypair.getPublicKey().toSuiAddress();
        console.log(`[INFO] Generated keypair for address: ${address}`);

        // Test Plain Text
        console.log('[INFO] Testing plain text save/load...');
        await keystore.saveKeypair(keypair);
        const loadedPlain = await keystore.loadKeypair();
        if (loadedPlain?.getPublicKey().toSuiAddress() === address) {
            console.log('[OK] Plain text save/load successful');
        } else {
            console.log('[FAIL] Plain text save/load failed');
        }

        // Test Encrypted
        console.log('[INFO] Testing encrypted save/load...');
        const password = 'test-password';
        await keystore.saveKeypair(keypair, password);

        try {
            await keystore.loadKeypair();
            console.log('[FAIL] Should have required password');
        } catch (e: any) {
            console.log('[OK] Correctly rejected load without password: ' + e.message);
        }

        try {
            await keystore.loadKeypair('wrong-password');
            console.log('[FAIL] Should have rejected wrong password');
        } catch (e: any) {
            console.log('[OK] Correctly rejected wrong password');
        }

        const loadedEncrypted = await keystore.loadKeypair(password);
        if (loadedEncrypted?.getPublicKey().toSuiAddress() === address) {
            console.log('[OK] Encrypted save/load successful');
        } else {
            console.log('[FAIL] Encrypted save/load failed');
        }

    } catch (error) {
        console.error('[ERROR]', error);
    } finally {
        await fs.remove(testDir);
        console.log('[INFO] Cleanup done');
    }
}

run();
