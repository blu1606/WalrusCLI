import { Command } from 'commander';
import inquirer from 'inquirer';
import { Keystore } from '@walrus/core';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

export const loginCommand = new Command('login')
  .description('Authenticate with a Sui wallet')
  .action(async () => {
    console.log('Walrus CLI Login');

    const { method } = await inquirer.prompt([
      {
        type: 'list',
        name: 'method',
        message: 'How would you like to login?',
        choices: [
          { name: 'Import Private Key (Ed25519)', value: 'private-key' },
          { name: 'Generate New Wallet', value: 'generate' }
        ]
      }
    ]);

    let keypair: Ed25519Keypair;

    if (method === 'private-key') {
      const { privateKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'privateKey',
          message: 'Enter your private key (bech32 or hex):',
          mask: '*'
        }
      ]);
      // Basic validation/parsing - simplified for now
      try {
        keypair = Ed25519Keypair.fromSecretKey(privateKey.replace(/^0x/, ''));
      } catch (e) {
        console.error('Invalid private key format');
        return;
      }
    } else {
      keypair = new Ed25519Keypair();
      console.log('Generated new wallet:', keypair.getPublicKey().toSuiAddress());
      console.log('Make sure to fund this address with SUI!');
    }

    const { secure } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'secure',
        message: 'Do you want to encrypt your keystore with a password?',
        default: true
      }
    ]);

    let password;
    if (secure) {
      const input = await inquirer.prompt([
        {
          type: 'password',
          name: 'password',
          message: 'Enter a password:',
          mask: '*'
        }
      ]);
      password = input.password;
    }

    const keystore = new Keystore();
    try {
      await keystore.saveKeypair(keypair, password);
      console.log('Login successful! Credentials saved to ~/.walrus/walrus.keystore');
    } catch (error) {
      console.error('Failed to save keystore:', error);
    }
  });

export const whoamiCommand = new Command('whoami')
  .description('Show current active address')
  .action(async () => {
    const keystore = new Keystore();

    // Check if encrypted without prompting first
    try {
        // We try to load without password first to check existence/encryption status
        // But loadKeypair throws if encrypted and no password.
        // We need a better way to check status, or just prompt if needed.
        // For CLI, it's better to just try loading, catch error, prompt if needed.

        let keypair = await keystore.loadKeypair();

        if (!keypair) {
            console.log('Not logged in.');
            return;
        }

        console.log(`Currently logged in as: ${keypair.getPublicKey().toSuiAddress()}`);

    } catch (error: any) {
        if (error.message.includes('Password required')) {
             const { password } = await inquirer.prompt([
                {
                  type: 'password',
                  name: 'password',
                  message: 'Keystore is encrypted. Enter password:',
                  mask: '*'
                }
              ]);

              try {
                  const keypair = await keystore.loadKeypair(password);
                  if (keypair) {
                      console.log(`Currently logged in as: ${keypair.getPublicKey().toSuiAddress()}`);
                  }
              } catch (e) {
                  console.error('Incorrect password or corrupted keystore.');
              }
        } else {
            console.error('Error loading keystore:', error.message);
        }
    }
  });
