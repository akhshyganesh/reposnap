# reposnap

`reposnap` is a simple CLI tool to generate a complete snapshot of your codebase, including file contents and structure. You can exclude specific directories or files during the snapshot process.

## AI Code Review

`reposnap` is ideal for preparing your code for AI review. It:

- Creates a single file containing all your code files
- Identifies and optionally excludes binary files
- Limits the number of files to respect AI context limits
- Focuses on source code by excluding common non-code files

Use the `--ai-prep` flag for optimal AI review preparation.

## Installation

```
npm install reposnap
```

While the package name is `reposnap`, the CLI command is simply `reposnap`.

You can use it directly with `npx`:

```bash
npx reposnap
```

Alternatively, you can install it globally:

```bash
npm install -g reposnap
```

And then use it as:

```bash
reposnap
```

## Usage

### Basic Usage

Simply run the command:

```bash
reposnap
```

This will:

- Generate a snapshot of the current directory.
- Save the output as `<folder-name>_snapshot.txt` (e.g., `my-project_snapshot.txt`).

### AI Review Preparation

```bash
reposnap --ai-prep
```

This will:

- Exclude binary files
- Set reasonable file count limits for AI context windows
- Limit max file size to focus on code

### Options

| Option                   | Alias     | Description                                                 |
| ------------------------ | --------- | ----------------------------------------------------------- |
| `--root <directory>`     | `--r`     | Root directory of the codebase (default: current directory) |
| `--output <file>`        | `--o`     | Output file name (default: `<folder-name>_snapshot.txt`)    |
| `--ignore-dirs <dirs>`   | `--idir`  | Additional directories to ignore (in addition to defaults)  |
| `--ignore-files <files>` | `--ifile` | Additional files to ignore (in addition to defaults)        |
| `--exclude-binary`       | `--xb`    | Completely exclude binary files from the snapshot           |
| `--max-files <number>`   | `--mf`    | Maximum number of files to include (default: 1000)          |
| `--max-size <KB>`        | `--ms`    | Maximum file size in KB (default: 500)                      |
| `--ai-prep`              | `--ai`    | Optimize for AI review (excludes binary, limits files)      |

### Example

1. **Basic Snapshot**:

   ```bash
   reposnap
   ```

   This will scan the current directory and generate a snapshot file with the default name.

2. **Specify Root Directory**:

   ```bash
   reposnap --r ./my-project
   ```

3. **Custom Output File**:

   ```bash
   reposnap --o my_snapshot.txt
   ```

4. **Ignore Additional Directories**:

   ```bash
   reposnap --idir dist temp logs
   ```

5. **Ignore Additional Files**:

   ```bash
   reposnap --ifile *.env *.pem
   ```

6. **Prepare for AI Review**:

   ```bash
   reposnap --ai-prep --o for_gpt.txt
   ```

7. **Combine Options**:
   ```bash
   reposnap --r ./my-project --o snapshot.txt --idir dist --ifile *.log --exclude-binary
   ```

### Default Ignored Paths

#### Directories

- `.git`
- `node_modules`
- `dist`
- `build`
- `.vscode`
- `__pycache__`
- `coverage`

#### Files

- `.DS_Store`
- `.gitignore`
- `*.pyc`
- `*.log`
- `.env`
- `*.key`
- `*.crt`
- `*.pem`
- `package-lock.json`
- `yarn.lock`
- `pnpm-lock.yaml`
- Many common binary file types (images, fonts, executables)

### Why Use reposnap?

- Quickly create a complete snapshot of your codebase.
- Prepare code for AI review with appropriate context limits.
- Avoid sensitive information by using default excludes.
- Customize the snapshot with simple options.

## License

MIT License
