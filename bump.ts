/* eslint-disable import/no-named-as-default-member */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import semver from 'semver';
import type { ReleaseType } from 'semver';
import { dependencies, version } from './package.json';

const [
  _path,
  _file,
  argType = 'patch',
  argBeta
] = process.argv;

const beta = (argBeta === 'beta');
const releaseType = `${beta ? 'pre' : ''}${argType}` as ReleaseType;

const manifestFile = beta ? 'manifest-beta.json' : 'manifest.json';
const manifest = JSON.parse(await readFile(manifestFile, 'utf-8'));
const versions = JSON.parse(await readFile('versions.json', 'utf-8'));
const obsVer = semver.coerce(dependencies.obsidian)!.version;
const newVer = semver.inc(semver.coerce(version)!, releaseType, 'beta', false)!;

manifest.version = newVer;
if (semver.gt(obsVer, manifest.minAppVersion)) {
  manifest.minAppVersion = obsVer;
  versions[newVer] = obsVer;
}

await writeFile(manifestFile, JSON.stringify(manifest, null, '\t'));
await writeFile('versions.json', JSON.stringify(versions, null, '\t'));
execSync(
  `npm version ${newVer} --git-tag-version=false &&
  git commit -a -m "Prepare release" &&
  git tag ${newVer}`
);
