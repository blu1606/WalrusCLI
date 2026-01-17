import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

export class Keystore {
  private keystorePath: string;

  constructor(configDir?: string) {
    const homedir = os.homedir();
    const defaultDir = path.join(homedir, '.walrus');
    this.keystorePath = path.join(configDir || defaultDir, 'walrus.keystore');
  }

  async saveKeypair(keypair: Ed25519Keypair, password?: string): Promise<void> {
    const secretKey = keypair.export().privateKey;

    // Verify directory exists
    await fs.ensureDir(path.dirname(this.keystorePath));

    if (password) {
      // Encrypt with AES-256-CBC
      const salt = crypto.randomBytes(16);
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

      let encrypted = cipher.update(secretKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      await fs.writeJSON(this.keystorePath, {
        schema: 'walrus-keystore-v1',
        encrypted: true,
        data: encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex')
      }, { mode: 0o600 });
    } else {
      // Plain text (Warn in UI)
      await fs.writeJSON(this.keystorePath, {
        schema: 'walrus-keystore-v1',
        encrypted: false,
        privateKey: secretKey
      }, { mode: 0o600 });
    }
  }

  async loadKeypair(password?: string): Promise<Ed25519Keypair | null> {
    if (!await fs.pathExists(this.keystorePath)) {
      return null;
    }

    const data = await fs.readJSON(this.keystorePath);

    if (data.encrypted) {
      if (!password) {
        throw new Error('Keystore is encrypted. Password required.');
      }

      const salt = Buffer.from(data.salt, 'hex');
      const iv = Buffer.from(data.iv, 'hex');
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

      let decrypted = decipher.update(data.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return Ed25519Keypair.fromSecretKey(decrypted);
    } else {
      return Ed25519Keypair.fromSecretKey(data.privateKey);
    }
  }

  getAddress(): string | null {
    // Helper to get address without full load if possible,
    // but for Ed25519 we usually need the keypair or stored address.
    return null;
  }
}
