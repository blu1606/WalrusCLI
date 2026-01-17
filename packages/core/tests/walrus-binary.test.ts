import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalrusBinaryManager } from '../src/walrus/binary-manager';
import { ConfigManager } from '../src/config';
import fs from 'fs-extra';
import axios from 'axios';

vi.mock('fs-extra');
vi.mock('axios');
vi.mock('../src/config');

describe('WalrusBinaryManager', () => {
    let binaryManager: WalrusBinaryManager;
    let mockConfigManager: ConfigManager;

    beforeEach(() => {
        vi.clearAllMocks();
        mockConfigManager = new ConfigManager();
        binaryManager = new WalrusBinaryManager(mockConfigManager);
    });

    it('should return existing binary path', async () => {
        // @ts-ignore
        fs.existsSync.mockReturnValue(true);
        const path = await binaryManager.ensureBinaryExists();
        expect(path).toContain('walrus');
        expect(axios).not.toHaveBeenCalled();
    });

    it('should download binary if not exists', async () => {
        // @ts-ignore
        fs.existsSync.mockReturnValue(false);
        // @ts-ignore
        fs.createWriteStream.mockReturnValue({
            on: (event, cb) => {
                if (event === 'finish') cb();
                return { on: () => {} };
            }
        });
        // @ts-ignore
        axios.mockResolvedValue({
            data: {
                pipe: vi.fn()
            }
        });

        const path = await binaryManager.ensureBinaryExists();
        expect(axios).toHaveBeenCalled();
        expect(path).toContain('walrus');
    });
});
