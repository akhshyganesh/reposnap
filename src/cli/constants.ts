// Default ignored directories and files for snapshot generation
export const DEFAULT_IGNORED_DIRS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.vscode',
  '__pycache__',
  'coverage'
];

export const DEFAULT_IGNORED_FILES = [
  '.DS_Store',
  '.gitignore',
  '*.pyc',
  '*.log',
  '.env',
  '*.key',
  '*.crt',
  '*.pem',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '*.ico',
  '*.png',
  '*.jpg',
  '*.jpeg',
  '*.gif',
  '*.svg',
  '*.woff',
  '*.woff2',
  '*.ttf',
  '*.eot',
  '*.mp3',
  '*.mp4',
  '*.mov',
  '*.bin',
  '*.exe',
  '*.dll'
];

// Default configuration values
export const DEFAULT_CONFIG = {
  maxFileSizeKB: 500,
  maxFileCount: 1000,
  excludeBinary: false
};

// AI prep configuration preset
export const AI_PREP_CONFIG = {
  excludeBinary: true,
  maxFileCount: 300,
  maxFileSizeKB: 500
};

// Known text file extensions that should never be treated as binary
export const TEXT_FILE_EXTENSIONS = [
  '.ts',
  '.js',
  '.jsx',
  '.tsx',
  '.json',
  '.md',
  '.txt',
  '.html',
  '.css',
  '.scss',
  '.less',
  '.yml',
  '.yaml',
  '.toml',
  '.xml',
  '.svg',
  '.graphql',
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.conf',
  '.config',
  '.ini',
  '.py',
  '.rb',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.cs',
  '.php',
  '.go',
  '.rs',
  '.vue',
  '.prisma',
  '.sql',
  '.gitignore',
  '.env',
  '.editorconfig'
];
