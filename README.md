# reposnap

`reposnap` is a simple CLI tool to generate a complete snapshot of your codebase, including file contents and structure. You can exclude specific directories or files during the snapshot process.

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

### Options

| Option                   | Alias     | Description                                                 |
| ------------------------ | --------- | ----------------------------------------------------------- |
| `--root <directory>`     | `--r`     | Root directory of the codebase (default: current directory) |
| `--output <file>`        | `--o`     | Output file name (default: `<folder-name>_snapshot.txt`)    |
| `--ignore-dirs <dirs>`   | `--idir`  | Additional directories to ignore (in addition to defaults)  |
| `--ignore-files <files>` | `--ifile` | Additional files to ignore (in addition to defaults)        |

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

6. **Combine Options**:
   ```bash
   reposnap --r ./my-project --o snapshot.txt --idir dist --ifile *.log
   ```

### Default Ignored Paths

#### Directories

- `.git`
- `node_modules`
- `dist`
- `build`
- `.vscode`
- `__pycache__`

#### Files

- `.DS_Store`
- `.gitignore`
- `*.pyc`
- `*.log`
- `.env`
- `*.key`
- `*.crt`
- `*.pem`

### Why Use reposnap?

- Quickly create a complete snapshot of your codebase.
- Avoid sensitive information by using default excludes.
- Customize the snapshot with simple options.

## License

MIT License
