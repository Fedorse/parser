import type { FileNode } from '$lib/utils';

const mockRoots: FileNode[] = [
  {
    name: 'src',
    path: '/project/src',
    type: 'Directory',
    children: [
      { name: 'app.d.ts', path: '/project/src/app.d.ts', type: 'File' },
      { name: 'app.css', path: '/project/src/app.css', type: 'File' },
      {
        name: 'app',
        path: '/project/src/app',
        type: 'Directory',
        children: [
          { name: 'App.svelte', path: '/project/src/app/App.svelte', type: 'File' },
          { name: 'Header.svelte', path: '/project/src/app/Header.svelte', type: 'File' },
          { name: 'Footer.svelte', path: '/project/src/app/Footer.svelte', type: 'File' },
          {
            name: 'ThemeProvider.svelte',
            path: '/project/src/app/ThemeProvider.svelte',
            type: 'File'
          },
          { name: 'stores.ts', path: '/project/src/app/stores.ts', type: 'File' }
        ]
      },
      {
        name: 'routes',
        path: '/project/src/routes',
        type: 'Directory',
        children: [
          { name: '+layout.svelte', path: '/project/src/routes/+layout.svelte', type: 'File' },
          { name: '+layout.ts', path: '/project/src/routes/+layout.ts', type: 'File' },
          { name: '+page.svelte', path: '/project/src/routes/+page.svelte', type: 'File' },
          { name: '+page.ts', path: '/project/src/routes/+page.ts', type: 'File' },
          {
            name: 'about/+page.svelte',
            path: '/project/src/routes/about/+page.svelte',
            type: 'File'
          },
          {
            name: 'docs/+layout.svelte',
            path: '/project/src/routes/docs/+layout.svelte',
            type: 'File'
          },
          {
            name: 'docs/+page.svelte',
            path: '/project/src/routes/docs/+page.svelte',
            type: 'File'
          },
          {
            name: 'settings',
            path: '/project/src/routes/settings',
            type: 'Directory',
            children: [
              {
                name: '+layout.svelte',
                path: '/project/src/routes/settings/+layout.svelte',
                type: 'File'
              },
              {
                name: '+page.svelte',
                path: '/project/src/routes/settings/+page.svelte',
                type: 'File'
              },
              {
                name: 'appearance/+page.svelte',
                path: '/project/src/routes/settings/appearance/+page.svelte',
                type: 'File'
              }
            ]
          },
          {
            name: 'parser',
            path: '/project/src/routes/parser',
            type: 'Directory',
            children: [
              {
                name: '+page.svelte',
                path: '/project/src/routes/parser/+page.svelte',
                type: 'File'
              },
              { name: '+page.ts', path: '/project/src/routes/parser/+page.ts', type: 'File' },
              {
                name: 'Preview.svelte',
                path: '/project/src/routes/parser/Preview.svelte',
                type: 'File'
              }
            ]
          }
        ]
      },
      {
        name: 'lib',
        path: '/project/src/lib',
        type: 'Directory',
        children: [
          { name: 'types.ts', path: '/project/src/lib/types.ts', type: 'File' },
          { name: 'utils.ts', path: '/project/src/lib/utils.ts', type: 'File' },
          { name: 'consts.ts', path: '/project/src/lib/consts.ts', type: 'File' },
          {
            name: 'tauri',
            path: '/project/src/lib/tauri',
            type: 'Directory',
            children: [
              { name: 'index.ts', path: '/project/src/lib/tauri/index.ts', type: 'File' },
              { name: 'commands.ts', path: '/project/src/lib/tauri/commands.ts', type: 'File' }
            ]
          },
          {
            name: 'components',
            path: '/project/src/lib/components',
            type: 'Directory',
            children: [
              {
                name: 'LayoutShell.svelte',
                path: '/project/src/lib/components/LayoutShell.svelte',
                type: 'File'
              },
              {
                name: 'FileTreeFlow.svelte',
                path: '/project/src/lib/components/FileTreeFlow.svelte',
                type: 'File'
              },
              {
                name: 'FolderGroup.svelte',
                path: '/project/src/lib/components/FolderGroup.svelte',
                type: 'File'
              },
              {
                name: 'FileNode.svelte',
                path: '/project/src/lib/components/FileNode.svelte',
                type: 'File'
              },
              {
                name: 'ui',
                path: '/project/src/lib/components/ui',
                type: 'Directory',
                children: [
                  {
                    name: 'button.svelte',
                    path: '/project/src/lib/components/ui/button.svelte',
                    type: 'File'
                  },
                  {
                    name: 'tabs/index.ts',
                    path: '/project/src/lib/components/ui/tabs/index.ts',
                    type: 'File'
                  },
                  {
                    name: 'card.svelte',
                    path: '/project/src/lib/components/ui/card.svelte',
                    type: 'File'
                  },
                  {
                    name: 'collapsible.svelte',
                    path: '/project/src/lib/components/ui/collapsible.svelte',
                    type: 'File'
                  },
                  {
                    name: 'input.svelte',
                    path: '/project/src/lib/components/ui/input.svelte',
                    type: 'File'
                  }
                ]
              }
            ]
          },
          {
            name: 'stores',
            path: '/project/src/lib/stores',
            type: 'Directory',
            children: [
              { name: 'user.ts', path: '/project/src/lib/stores/user.ts', type: 'File' },
              { name: 'theme.ts', path: '/project/src/lib/stores/theme.ts', type: 'File' },
              { name: 'files.ts', path: '/project/src/lib/stores/files.ts', type: 'File' }
            ]
          },
          {
            name: 'assets',
            path: '/project/src/lib/assets',
            type: 'Directory',
            children: [
              { name: 'logo.svg', path: '/project/src/lib/assets/logo.svg', type: 'File' },
              {
                name: 'placeholder.png',
                path: '/project/src/lib/assets/placeholder.png',
                type: 'File'
              }
            ]
          }
        ]
      },
      {
        name: 'monaco-editor',
        path: '/project/src/monaco-editor',
        type: 'Directory',
        children: [
          {
            name: 'monaco-editor.svelte',
            path: '/project/src/monaco-editor/monaco-editor.svelte',
            type: 'File'
          },
          {
            name: 'schemas/inventory.schema.json',
            path: '/project/src/monaco-editor/schemas/inventory.schema.json',
            type: 'File'
          }
        ]
      },
      {
        name: 'styles',
        path: '/project/src/styles',
        type: 'Directory',
        children: [
          { name: 'globals.css', path: '/project/src/styles/globals.css', type: 'File' },
          { name: 'tokens.css', path: '/project/src/styles/tokens.css', type: 'File' }
        ]
      },
      {
        name: 'hooks',
        path: '/project/src/hooks',
        type: 'Directory',
        children: [
          { name: 'useFlowLayout.ts', path: '/project/src/hooks/useFlowLayout.ts', type: 'File' },
          { name: 'useTheme.ts', path: '/project/src/hooks/useTheme.ts', type: 'File' }
        ]
      }
    ]
  },

  {
    name: 'src-tauri',
    path: '/project/src-tauri',
    type: 'Directory',
    children: [
      { name: 'Cargo.toml', path: '/project/src-tauri/Cargo.toml', type: 'File' },
      { name: 'tauri.conf.json', path: '/project/src-tauri/tauri.conf.json', type: 'File' },
      {
        name: 'src',
        path: '/project/src-tauri/src',
        type: 'Directory',
        children: [
          { name: 'main.rs', path: '/project/src-tauri/src/main.rs', type: 'File' },
          { name: 'commands.rs', path: '/project/src-tauri/src/commands.rs', type: 'File' },
          { name: 'consts.rs', path: '/project/src-tauri/src/consts.rs', type: 'File' },
          {
            name: 'utils',
            path: '/project/src-tauri/src/utils',
            type: 'Directory',
            children: [
              { name: 'fs.rs', path: '/project/src-tauri/src/utils/fs.rs', type: 'File' },
              { name: 'parser.rs', path: '/project/src-tauri/src/utils/parser.rs', type: 'File' },
              {
                name: 'prepare_app.rs',
                path: '/project/src-tauri/src/utils/prepare_app.rs',
                type: 'File'
              }
            ]
          }
        ]
      }
    ]
  },

  {
    name: 'public',
    path: '/project/public',
    type: 'Directory',
    children: [
      { name: 'favicon.ico', path: '/project/public/favicon.ico', type: 'File' },
      { name: 'robots.txt', path: '/project/public/robots.txt', type: 'File' },
      { name: 'apple-touch-icon.png', path: '/project/public/apple-touch-icon.png', type: 'File' }
    ]
  },

  {
    name: 'tests',
    path: '/project/tests',
    type: 'Directory',
    children: [
      { name: 'setup.ts', path: '/project/tests/setup.ts', type: 'File' },
      {
        name: 'unit',
        path: '/project/tests/unit',
        type: 'Directory',
        children: [
          { name: 'utils.spec.ts', path: '/project/tests/unit/utils.spec.ts', type: 'File' },
          { name: 'stores.spec.ts', path: '/project/tests/unit/stores.spec.ts', type: 'File' }
        ]
      },
      {
        name: 'e2e',
        path: '/project/tests/e2e',
        type: 'Directory',
        children: [
          {
            name: 'parser-flow.spec.ts',
            path: '/project/tests/e2e/parser-flow.spec.ts',
            type: 'File'
          },
          { name: 'file-tree.spec.ts', path: '/project/tests/e2e/file-tree.spec.ts', type: 'File' }
        ]
      }
    ]
  },

  {
    name: 'scripts',
    path: '/project/scripts',
    type: 'Directory',
    children: [
      { name: 'dev.ts', path: '/project/scripts/dev.ts', type: 'File' },
      { name: 'build.ts', path: '/project/scripts/build.ts', type: 'File' },
      { name: 'release.ts', path: '/project/scripts/release.ts', type: 'File' }
    ]
  },

  {
    name: '.github',
    path: '/project/.github',
    type: 'Directory',
    children: [
      {
        name: 'workflows',
        path: '/project/.github/workflows',
        type: 'Directory',
        children: [
          { name: 'ci.yml', path: '/project/.github/workflows/ci.yml', type: 'File' },
          { name: 'release.yml', path: '/project/.github/workflows/release.yml', type: 'File' }
        ]
      },
      { name: 'ISSUE_TEMPLATE.md', path: '/project/.github/ISSUE_TEMPLATE.md', type: 'File' }
    ]
  },

  {
    name: 'config',
    path: '/project/config',
    type: 'Directory',
    children: [
      { name: 'tailwind.config.ts', path: '/project/config/tailwind.config.ts', type: 'File' },
      { name: 'postcss.config.cjs', path: '/project/config/postcss.config.cjs', type: 'File' },
      { name: 'eslint.config.js', path: '/project/config/eslint.config.js', type: 'File' },
      { name: 'prettier.config.cjs', path: '/project/config/prettier.config.cjs', type: 'File' }
    ]
  },

  // корневые файлы
  { name: 'package.json', path: '/project/package.json', type: 'File' },
  { name: 'pnpm-lock.yaml', path: '/project/pnpm-lock.yaml', type: 'File' },
  { name: 'svelte.config.js', path: '/project/svelte.config.js', type: 'File' },
  { name: 'vite.config.ts', path: '/project/vite.config.ts', type: 'File' },
  { name: 'tsconfig.json', path: '/project/tsconfig.json', type: 'File' },
  { name: 'tsconfig.node.json', path: '/project/tsconfig.node.json', type: 'File' },
  { name: '.env.example', path: '/project/.env.example', type: 'File' },
  { name: '.gitignore', path: '/project/.gitignore', type: 'File' },
  { name: 'README.md', path: '/project/README.md', type: 'File' }
];

export const load = async ({ url }) => {
  // позже: const roots = await invoke<FileNode[]>('get_graph_by_path', { path: relPath });
  const roots = mockRoots;
  return { roots, url };
};
