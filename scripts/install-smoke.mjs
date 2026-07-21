#!/usr/bin/env node
// Packs the real tarball and installs it into an empty throwaway project.
//
// This exists because `npm pack --dry-run` cannot catch dependency specifiers
// that only resolve from inside this repo. A `file:vendor/*.tgz` dependency
// packs and dry-runs happily, then fails for every downstream consumer with
// `ENOENT extracting tarball` — a `file:` specifier resolves relative to the
// CONSUMER's project root, not ours. That shipped once (0.1.4) and was
// invisible from inside the monorepo.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const workDir = mkdtempSync(join(tmpdir(), 'snapshot-install-smoke-'))

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

let failed = false
const fail = (message) => {
  failed = true
  console.error(`\n✗ ${message}`)
}

try {
  console.log('• packing tarball')
  const packed = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', workDir], repoRoot))
  const tarball = join(workDir, packed[0].filename)

  // Static check first — it names the exact offending dependency, which a bare
  // install failure does not.
  const manifest = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
      if (typeof spec === 'string' && /^(file:|link:)/.test(spec)) {
        fail(`${field}.${name} is "${spec}" — a local path specifier cannot resolve for consumers`)
      }
    }
  }

  console.log('• installing into an empty project')
  const project = join(workDir, 'consumer')
  mkdirSync(project)
  writeFileSync(
    join(project, 'package.json'),
    JSON.stringify({ name: 'snapshot-install-smoke', version: '1.0.0', private: true }, null, 2),
  )

  try {
    run('npm', ['install', tarball, '--no-audit', '--no-fund'], project)
  } catch (error) {
    fail(`installing the packed tarball failed:\n${error.stderr || error.stdout || error.message}`)
    throw error
  }

  // Prove the dependency graph actually materialized, not just that npm exited 0.
  for (const pkg of ['@lastshotlabs/snapshot', '@lastshotlabs/frontend-contract']) {
    const installed = join(project, 'node_modules', pkg, 'package.json')
    try {
      const { version } = JSON.parse(readFileSync(installed, 'utf8'))
      console.log(`  ✓ ${pkg}@${version}`)
    } catch {
      fail(`${pkg} is missing from the consumer's node_modules after install`)
    }
  }
} catch (error) {
  if (!failed) fail(error.message)
} finally {
  rmSync(workDir, { recursive: true, force: true })
}

if (failed) {
  console.error('\ninstall smoke test FAILED — the published package would not install for consumers')
  process.exit(1)
}

console.log('\n✓ install smoke test passed')
