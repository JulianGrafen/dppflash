#!/usr/bin/env node
/**
 * Builds sample DPP pass pages as static HTML for GitHub Pages (dppflash.de).
 * Produces: p/<slug>/index.html, _next/static/*, images/, and .nojekyll (Jekyll would ignore _next).
 */
import { access, cp, mkdir, readdir, rm, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const qrApp = path.join(root, 'src/app/qr');
const qrStash = path.join(root, '.export-stash/qr');

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function stashQrRoute() {
  try {
    await access(qrApp);
  } catch {
    return;
  }
  await rm(qrStash, { recursive: true, force: true });
  await mkdir(path.dirname(qrStash), { recursive: true });
  await rename(qrApp, qrStash);
}

async function restoreQrRoute() {
  try {
    await rename(qrStash, qrApp);
  } catch {
    /* nothing to restore */
  }
}

async function copyPassArtifacts() {
  const out = path.join(root, 'out');
  const passDir = path.join(out, 'p');

  const entries = await readdir(passDir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const slug = ent.name;
    const srcIndex = path.join(passDir, slug, 'index.html');
    const destDir = path.join(root, 'p', slug);
    await mkdir(destDir, { recursive: true });
    await cp(srcIndex, path.join(destDir, 'index.html'));
    console.log(`Wrote p/${slug}/index.html`);
  }

  await rm(path.join(root, '_next'), { recursive: true, force: true });
  await cp(path.join(out, '_next'), path.join(root, '_next'), { recursive: true });

  await writeFile(path.join(root, '.nojekyll'), '');

  await mkdir(path.join(root, 'images'), { recursive: true });
  await cp(
    path.join(root, 'public/images/voltstride-720-hero.png'),
    path.join(root, 'images/voltstride-720-hero.png'),
  );
}

async function main() {
  await stashQrRoute();
  try {
    run('npm', ['run', 'build:app'], { STATIC_EXPORT: '1' });
    await copyPassArtifacts();
  } finally {
    await restoreQrRoute();
  }
  console.log('\nDone. Commit .nojekyll, p/, _next/, images/ and push (Pages needs .nojekyll for _next assets).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
