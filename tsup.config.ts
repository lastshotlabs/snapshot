import { defineConfig } from 'tsup'
import pkg from './package.json' assert { type: 'json' }

export default defineConfig([
  // SDK entry point
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    external: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'jotai',
      '@unhead/react',
    ],
    esbuildOptions(options) {
      options.jsx = 'automatic'
    },
    async onSuccess() {
      const { copyFileSync, mkdirSync } = await import('node:fs')
      mkdirSync('dist', { recursive: true })
      copyFileSync('src/push/sw.js', 'dist/sw.js')
    },
  },
  // UI entry point (config-driven components, tokens, manifest)
  {
    entry: ['src/ui.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2022',
    external: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'jotai',
      'zod',
      '@unhead/react',
    ],
    esbuildOptions(options) {
      options.jsx = 'automatic'
    },
  },
  // CLI entry point
  {
    entry: {
      'cli/index': 'src/cli/index.ts',
    },
    format: ['esm'],
    dts: false,
    sourcemap: false,
    clean: false,
    target: 'node20',
    platform: 'node',
    bundle: true,
    noExternal: [],
    external: [
      '@oclif/core',
      'node:fs',
      'node:fs/promises',
      'node:path',
      'node:os',
      'node:child_process',
      'node:url',
      'node:process',
      'node:crypto',
    ],
    define: {
      __SNAPSHOT_VERSION__: JSON.stringify(pkg.version),
    },
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // CLI commands
  {
    entry: {
      'cli/commands/init': 'src/cli/commands/init.ts',
      'cli/commands/sync': 'src/cli/commands/sync.ts',
      'cli/commands/manifest/init': 'src/cli/commands/manifest/init.ts',
      'cli/commands/manifest/validate': 'src/cli/commands/manifest/validate.ts',
    },
    format: ['esm'],
    dts: false,
    sourcemap: false,
    clean: false,
    target: 'node20',
    platform: 'node',
    bundle: true,
    noExternal: ['@clack/prompts'],
    external: [
      '@oclif/core',
      'node:fs',
      'node:fs/promises',
      'node:path',
      'node:os',
      'node:child_process',
      'node:url',
      'node:process',
      'node:crypto',
    ],
    define: {
      __SNAPSHOT_VERSION__: JSON.stringify(pkg.version),
    },
  },
  // Vite plugin build
  {
    entry: { vite: 'src/vite/index.ts' },
    format: ['esm', 'cjs'],
    outExtension: ({ format }) => ({ js: format === 'cjs' ? '.cjs' : '.js' }),
    dts: true,
    sourcemap: false,
    clean: false,
    target: 'node20',
    platform: 'node',
    bundle: true,
    noExternal: ['@clack/prompts'],
    external: [
      'vite',
      'node:fs',
      'node:fs/promises',
      'node:path',
      'node:os',
      'node:child_process',
      'node:url',
      'node:process',
      'node:crypto',
    ],
  },
])
