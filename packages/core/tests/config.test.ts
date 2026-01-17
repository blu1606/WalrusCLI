import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigManager } from '../src/config';
import fs from 'fs-extra';
import yaml from 'js-yaml';

vi.mock('fs-extra');
vi.mock('js-yaml', () => ({
    load: vi.fn(),
    dump: vi.fn(),
}));
// Mock winston logger to avoid console noise and errors
vi.mock('../src/logging', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    }
}));

describe('ConfigManager', () => {
    let configManager: ConfigManager;
    const mockConfigPath = '/mock/path/config.yaml';

    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore
        fs.existsSync.mockReturnValue(false);
        // @ts-ignore
        yaml.dump.mockReturnValue('env: mainnet');
    });

    it('should load default config if file does not exist', () => {
        configManager = new ConfigManager(mockConfigPath);
        expect(configManager.get('env')).toBe('testnet');
    });

    it('should set and save config', () => {
        configManager = new ConfigManager(mockConfigPath);
        configManager.set('env', 'mainnet');
        expect(configManager.get('env')).toBe('mainnet');
        expect(fs.writeFileSync).toHaveBeenCalled();
    });
});
