import { describe, it, expect } from 'vitest';
import { initCommand } from '../src/commands/init';
import { loginCommand } from '../src/commands/auth';
import { siteCommand } from '../src/commands/site';
import { deployCommand } from '../src/commands/deploy';

describe('CLI Commands Structure', () => {
  it('init command should be defined', () => {
    expect(initCommand.name()).toBe('init');
  });

  it('login command should be defined', () => {
    expect(loginCommand.name()).toBe('login');
  });

  it('site command should have subcommands', () => {
    expect(siteCommand.commands.map(c => c.name())).toEqual(expect.arrayContaining(['create', 'list', 'version']));
  });

  it('deploy command should be defined', () => {
    expect(deployCommand.name()).toBe('deploy');
  });
});
