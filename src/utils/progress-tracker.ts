import chalk from 'chalk';
import ora, { Ora } from 'ora';
import cliProgress from 'cli-progress';
import { version as currentVersion } from '../../package.json';

export class ProgressTracker {
  private spinner: Ora;
  private progressBar: cliProgress.SingleBar;
  private totalFiles = 0;
  private processedFiles = 0;
  private currentFile = '';
  private isActive = false;

  constructor() {
    this.spinner = ora({
      text: 'Starting reposnap...',
      color: 'blue'
    });

    this.progressBar = new cliProgress.SingleBar({
      format: `${chalk.cyan('{bar}')} | ${chalk.yellow('{percentage}%')} | {value}/{total} files | ${chalk.green('{file}')}`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
  }

  private getRandomEmoji(): string {
    const emojis = ['📄', '📝', '🗂️', '📑', '📋', '📃', '📜', '📰', '📂', '📒'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  start(): void {
    this.isActive = true;
    console.log(chalk.bold.cyan('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
    console.log(
      chalk.bold.cyan(
        `┃  ${chalk.yellow('📸 RepoSnap')} - Creating Snapshot ${chalk.gray(`v${currentVersion}`)}  ┃`
      )
    );
    console.log(chalk.bold.cyan('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
    this.spinner.start();
  }

  discoveringFiles(): void {
    if (!this.isActive) return;
    this.spinner.text = chalk.blue('🔍 Discovering files in repository...');
  }

  setTotalFiles(count: number): void {
    if (!this.isActive) return;
    this.totalFiles = count;
    this.spinner.succeed(
      `${chalk.green('✓')} ${chalk.bold('Found')} ${chalk.green.bold(count.toString())} ${chalk.bold('files to process')}`
    );
    this.progressBar = new cliProgress.SingleBar({
      format: `${chalk.cyan('{bar}')} ${chalk.gray('|')} ${chalk.yellow('{percentage}%')} ${chalk.gray('|')} ${chalk.blue('{value}/{total}')} files ${chalk.gray('|')} ${chalk.green('{file}')}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true
    });
    this.progressBar.start(count, 0, { file: chalk.italic('Initializing...') });
  }

  processFile(filePath: string): void {
    if (!this.isActive) return;
    this.currentFile = filePath;
    const emoji = this.getRandomEmoji();
    this.progressBar.update(this.processedFiles, {
      file: `${emoji} ${chalk.cyan(filePath)}`
    });
  }

  fileProcessed(): void {
    if (!this.isActive) return;
    this.processedFiles++;
    this.progressBar.update(this.processedFiles, {
      file: `${chalk.green('✓')} ${chalk.dim(this.currentFile)}`
    });
  }

  complete(): void {
    if (!this.isActive) return;
    this.progressBar.update(this.totalFiles);
    this.progressBar.stop();
    console.log('');
    console.log(chalk.green('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
    console.log(chalk.green(`┃  ${chalk.bold('✅ Snapshot created successfully !!')} ┃`));
    console.log(
      chalk.green(
        `┃  ${chalk.yellow(`📊 Files processed: ${this.processedFiles}/${this.totalFiles}`)}${' '.repeat(15 - String(this.totalFiles).length - String(this.processedFiles).length)}┃`
      )
    );
    console.log(chalk.green('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
    this.isActive = false;
  }

  error(message: string): void {
    if (!this.isActive) return;
    this.spinner.fail(chalk.red(`🚨 Error: ${message}`));
    try {
      this.progressBar.stop();
    } catch (e) {
      // If progressBar wasn't started yet, this is fine
    }
    this.isActive = false;
  }
}

// Export a singleton instance
export const progressTracker = new ProgressTracker();
