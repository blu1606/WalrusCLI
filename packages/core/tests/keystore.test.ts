import { describe, it, expect } from 'vitest';
import { Keystore } from '../src/wallet/keystore';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('Keystore', () => {
  const testDir = path.join(os.tmpdir(), 'walrus-test-keystore-' + Date.now());

  beforeAll(async () => {
    await fs.ensureDir(testDir);
  });

  afterAll(async () => {
    await fs.remove(testDir);
  });

  it('should save and load a plain text keypair', async () => {
    const keystore = new Keystore(testDir);
    const keypair = new Ed25519Keypair();

    await keystore.saveKeypair(keypair);

    const loaded = await keystore.loadKeypair();
    expect(loaded).toBeDefined();
    expect(loaded?.getPublicKey().toSuiAddress()).toBe(keypair.getPublicKey().toSuiAddress());
  });

  it('should save and load an encrypted keypair', async () => {
    const keystore = new Keystore(testDir);
    const keypair = new Ed25519Keypair();
    const password = 'secure-password-123';

    await keystore.saveKeypair(keypair, password);

    // Should fail without password
    await expect(keystore.loadKeypair()).rejects.toThrow('Password required');

    // Should fail with wrong password
    await expect(keystore.loadKeypair('wrong-password')).rejects.toThrow();

    // Should succeed with correct password
    const loaded = await keystore.loadKeypair(password);
    expect(loaded).toBeDefined();
    expect(loaded?.getPublicKey().toSuiAddress()).toBe(keypair.getPublicKey().toSuiAddress());
  });
});
