import { execSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import semver from 'semver';
import { dependencies } from './package.json';

const releaseType: semver.ReleaseType = (process.argv[2] as semver.ReleaseType) ?? 'patch';

const manifest = JSON.parse(await readFile('manifest.json', 'utf-8'));
const versions = JSON.parse(await readFile('versions.json', 'utf-8'));
const obsVer = semver.clean(dependencies.obsidian.slice(1)) as string;
const newVer = semver.inc(manifest.version, releaseType) as string;

manifest.version = newVer;
if (semver.gt(obsVer, manifest.minAppVersion as string)) {
  manifest.minAppVersion = obsVer;
  versions[newVer] = obsVer;
}

await writeFile('manifest.json', JSON.stringify(manifest, null, '\t'));
await writeFile('versions.json', JSON.stringify(versions, null, '\t'));
execSync(`npm version ${newVer} -m "Prepare release" --git-tag-version=false`);
