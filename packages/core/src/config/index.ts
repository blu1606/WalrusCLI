import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';
import { logger } from '../logging';

const ConfigSchema = z.object({
  env: z.enum(['devnet', 'testnet', 'mainnet']).default('testnet'),
  walrusBinaryPath: z.string().optional(),
  suiRpcUrl: z.string().optional(),
  walrusAggregatorUrl: z.string().optional(),
  walrusPublisherUrl: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(os.homedir(), '.walrus', 'config.yaml');
    this.config = ConfigSchema.parse({}); // Default config
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const fileContent = fs.readFileSync(this.configPath, 'utf8');
        const parsed = yaml.load(fileContent);
        this.config = ConfigSchema.parse(parsed);
      }
    } catch (error) {
      logger.warn('Failed to load config, using defaults', { error });
    }
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  set<K extends keyof Config>(key: K, value: Config[K]) {
    this.config[key] = value;
    this.save();
  }

  private save() {
    try {
      fs.ensureDirSync(path.dirname(this.configPath));
      fs.writeFileSync(this.configPath, yaml.dump(this.config));
    } catch (error) {
      logger.error('Failed to save config', { error });
    }
  }

  getPath(): string {
    return this.configPath;
  }
}
