import { Command } from 'commander';
import inquirer from 'inquirer';

export const initCommand = new Command('init')
  .description('Initialize a new Walrus site')
  .action(async () => {
    console.log('Initializing Walrus site...');

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Do you want to initialize a new Walrus site in the current directory?',
        default: true
      }
    ]);

    if (answers.continue) {
      console.log('Setting up site configuration...');
      // TODO: Call core logic to generate config
    }
  });
