import { describe, it, expect } from 'vitest';
import { SiteManager } from '../src/site';
import fs from 'fs-extra';
import path from 'path';

// Note: Testing SiteManager with real file system or intricate mocks
// For simplicity, let's test the diff logic which is pure logic

describe('SiteManager Diff Logic', () => {
    const siteManager = new SiteManager();

    it('should identify added files', () => {
        const localFiles = [
            { path: 'index.html', hash: 'abc', mimeType: 'text/html', size: 100 },
            { path: 'style.css', hash: 'def', mimeType: 'text/css', size: 50 }
        ];
        const remoteManifest = {}; // Empty remote

        const diff = siteManager.compareSites(localFiles, remoteManifest);
        expect(diff.added).toHaveLength(2);
        expect(diff.modified).toHaveLength(0);
        expect(diff.deleted).toHaveLength(0);
    });

    it('should identify modified files', () => {
        const localFiles = [
            { path: 'index.html', hash: 'abc_new', mimeType: 'text/html', size: 100 }
        ];
        const remoteManifest = {
            'index.html': 'abc_old'
        };

        const diff = siteManager.compareSites(localFiles, remoteManifest);
        expect(diff.added).toHaveLength(0);
        expect(diff.modified).toHaveLength(1);
        expect(diff.deleted).toHaveLength(0);
    });

    it('should identify deleted files', () => {
         const localFiles: any[] = [];
         const remoteManifest = {
             'old.txt': 'xyz'
         };

         const diff = siteManager.compareSites(localFiles, remoteManifest);
         expect(diff.added).toHaveLength(0);
         expect(diff.modified).toHaveLength(0);
         expect(diff.deleted).toHaveLength(1);
         expect(diff.deleted[0]).toBe('old.txt');
    });
});
