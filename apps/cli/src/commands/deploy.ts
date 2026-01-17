import { Command } from 'commander';

export const deployCommand = new Command('deploy')
  .description('Deploy or update a decentralized website')
  .action(async () => {
    console.log('Starting deployment...');
    // 1. Read config
    // 2. Diff files
    // 3. Upload blobs (via SiteBuilderWrapper / WalrusClient)
    // 4. Update Sui Object
    console.log('[!] Not implemented: Core deployment logic pending.');
  });

export const statusCommand = new Command('status')
  .description('Show deployment history/status')
  .action(async () => {
    console.log('Fetching deployment status...');
    console.log('[!] Not implemented: History tracking pending.');
  });
