import chalk from 'chalk';
import https from 'https';
import { version as currentVersion } from '../../package.json';

export async function checkLatestVersion(): Promise<void> {
  try {
    const latestVersion = await getLatestNpmVersion('reposnap');
    console.log(chalk.gray(`Current version: ${currentVersion}`));
    if (latestVersion && compareVersions(latestVersion, currentVersion) > 0) {
      console.log(chalk.yellow('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
      console.log(
        chalk.yellow(`┃  ${chalk.bold('⚠️  Update Available')}                                ┃`)
      );
      console.log(
        chalk.yellow(
          `┃  Current version: ${chalk.red(currentVersion)}                             ┃`
        )
      );
      console.log(
        chalk.yellow(
          `┃  Latest version: ${chalk.green(latestVersion)}                              ┃`
        )
      );
      console.log(chalk.yellow(`┃                                                     ┃`));
      console.log(
        chalk.yellow(`┃  Update with: ${chalk.cyan('npm install -g reposnap@latest')}        ┃`)
      );
      console.log(chalk.yellow('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛'));
      console.log('');
    }
  } catch (error) {
    // Silently fail - version check should never block main functionality
  }
}

function getLatestNpmVersion(packageName: string): Promise<string | null> {
  return new Promise((resolve) => {
    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => resolve(null), 3000);

    https
      .get(
        `https://registry.npmjs.org/${packageName}/latest`,
        { headers: { 'User-Agent': 'reposnap' } },
        (res) => {
          if (res.statusCode !== 200) {
            clearTimeout(timeoutId);
            return resolve(null);
          }

          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            clearTimeout(timeoutId);
            try {
              const packageInfo = JSON.parse(data);
              resolve(packageInfo.version || null);
            } catch (e) {
              resolve(null);
            }
          });
        }
      )
      .on('error', () => {
        clearTimeout(timeoutId);
        resolve(null);
      });
  });
}

function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] > v2Parts[i]) return 1;
    if (v1Parts[i] < v2Parts[i]) return -1;
  }

  return 0;
}
