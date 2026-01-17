import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

const program = new Command();

// Load package version
const pkg = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

program
  .name('walrus')
  .description('Walrus CLI - Decentralized Site Management')
  .version(pkg.version);

// Register commands
import { initCommand, loginCommand, whoamiCommand, siteCommand, deployCommand, statusCommand } from './commands';

program.addCommand(initCommand);
program.addCommand(loginCommand);
program.addCommand(whoamiCommand);
program.addCommand(siteCommand);
program.addCommand(deployCommand);
program.addCommand(statusCommand);

program.parse(process.argv);
