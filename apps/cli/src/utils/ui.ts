import ora from 'ora';
import chalk from 'chalk';

export async function withSpinner<T>(
  title: string,
  action: () => Promise<T>
): Promise<T> {
  const spinner = ora(title).start();

  try {
    const result = await action();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
}

export const format = {
  success: (msg: string) => console.log(chalk.green(`[OK] ${msg}`)),
  error: (msg: string) => console.log(chalk.red(`[X] Error: ${msg}`)),
  warning: (msg: string) => console.log(chalk.yellow(`[!] Warning: ${msg}`)),
  info: (msg: string) => console.log(chalk.blue(`[i] ${msg}`)),
};
