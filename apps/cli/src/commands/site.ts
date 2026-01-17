import { Command } from 'commander';

export const siteCommand = new Command('site')
  .description('Manage Walrus sites');

siteCommand.command('create')
  .description('Register a new site object on Sui')
  .action(async () => {
    console.log('Creating new site on Sui...');
    // TODO: Connect to SuiService and call registerSite
    console.log('[!] Not implemented: Connection to Sui network required.');
  });

siteCommand.command('list')
  .description('List sites owned by the current address')
  .action(async () => {
    console.log('Fetching sites...');
    // TODO: Indexer query or on-chain scan
    console.log('[!] Not implemented: Indexer integration required.');
  });

siteCommand.command('version')
  .description('Manage site versions')
  .action(async () => {
     console.log('Version management not yet implemented.');
  });
