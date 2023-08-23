import 'dotenv/config';
import { sassPlugin } from 'esbuild-sass-plugin';
import { copy } from 'esbuild-plugin-copy';
import {
  pipe,
  genBuild,
  doManifestData,
  doInitializePipe,
  injectPlugins,
  doMoveArtifactsUsingPlugins,
  logg,
  doHotReload
} from './fophidian';

// ## build elements
const doSassPlugins = () => {
  injectPlugins(
    sassPlugin(),
    copy({
      assets: { from: ['dist/main.css'], to: ['styles.css'] }
    })
  );
};

// # workhorse
const devPipers = [
  doInitializePipe,
  doManifestData,
  doSassPlugins,
  doMoveArtifactsUsingPlugins,
  doHotReload,
  genBuild
];
const prodPipers = [
  doInitializePipe,
  doManifestData,
  doSassPlugins,
  doMoveArtifactsUsingPlugins,
  genBuild
];
new pipe({ devPipers, prodPipers }).tap((config, customData) => {
  logg(customData);
  return customData;
});
