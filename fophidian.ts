import builtins from 'builtin-modules';
import 'dotenv/config';
import esbuild, { BuildOptions, Plugin } from 'esbuild';
import { ensureFile, existsSync } from 'fs-extra';
import { createRequire } from 'module';
import { basename, dirname, join, resolve } from 'path';
import util from 'util';
const copyNewer = require('copy-newer');

// # Knobs
const prod = process.argv[2] === 'prod';
const ARTIFACTS_DIR = './dist';
if (
  (!prod && !process.env.OBSIDIAN_TEST_VAULT) ||
  !existsSync(process.env.OBSIDIAN_TEST_VAULT as string)
) {
  const message = 'Path could not be found. Exiting.';
  logg({ err: `${process.env.OBSIDIAN_TEST_VAULT}, ${message}`, message });
  process.exit(1);
}

const originalConfig: BuildOptionSpec = {
  bundle: true,
  color: true,
  entryPoints: {
    main: 'src/main.ts'
  },
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/closebrackets',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/comment',
    '@codemirror/fold',
    '@codemirror/gutter',
    '@codemirror/highlight',
    '@codemirror/history',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/matchbrackets',
    '@codemirror/panel',
    '@codemirror/rangeset',
    '@codemirror/rectangular-selection',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/stream-parser',
    '@codemirror/text',
    '@codemirror/tooltip',
    '@codemirror/view',
    ...builtins
  ],
  format: 'cjs',
  loader: {
    '.png': 'dataurl',
    '.jpg': 'dataurl'
  },
  logLevel: 'info',
  minify: prod,
  outfile: './dist/main.js',
  plugins: [],
  sourcemap: prod ? false : 'inline',
  target: 'es2020',
  treeShaking: true
};

// # helpers
// ## Types
type BuildOptionSpec = BuildOptions;

/**
 * All Func Specs typically return the DataCarryOverSpec
 */
export type FuncSpec = (
  config: BuildOptionSpec,
  dataCarryover: DataCarryOverSpec
) => DataCarryOverSpec;
export type DataCarryOverSpec = (Record<'esbuild_path', string> & {
  [key: string]: any;
}) & {};

export type InitializePipeConfigs = [BuildOptionSpec, DataCarryOverSpec];

export const { pipe, injectPlugins, apply } = createPipeKit();

// # pipe stages
export function doManifestData() {
  apply((config, dataCarryover) => {
    const require = createRequire(resolve('', dataCarryover.esbuild_path));
    const manifest = require('./manifest.json');
    dataCarryover.manifestId = manifest.id;
    return dataCarryover;
  });
}

export function doMoveArtifactsUsingPlugins() {
  apply((config: BuildOptionSpec, dataCarryover: DataCarryOverSpec) => {
    if (process.env.OBSIDIAN_TEST_VAULT) {
      const pluginDir = join(
        process.env.OBSIDIAN_TEST_VAULT,
        '.obsidian/plugins',
        basename(dataCarryover.manifestId)
      );
      injectPlugins({
        name: 'plugin:move-artifacts',
        setup(build) {
          build.onEnd(genCopy);
          async function genCopy() {
            const outDir =
              build.initialOptions.outdir ??
              dirname(build.initialOptions.outfile || ARTIFACTS_DIR);

            await copyNewer('{main.js,styles.css,manifest.json}', pluginDir, {
              verbose: true,
              cwd: outDir
            }).catch(console.log);
          }
        }
      });
    }
    return dataCarryover;
  });
}
export function doHotReload(isHotReload = true): void {
  apply((config, dataCarryover) => {
    const plugin: Plugin = {
      name: 'hotreload',
      setup(build) {
        build.onEnd(async () => {
          if (process.env.OBSIDIAN_TEST_VAULT) {
            const pluginDir = join(
              process.env.OBSIDIAN_TEST_VAULT,
              '.obsidian/plugins',
              basename(dataCarryover.manifestId)
            );
            if (isHotReload) await ensureFile(pluginDir + '/.hotreload');
          }
        });
      }
    };
    injectPlugins(plugin);
    return dataCarryover;
  });
}
// ## Default Factories

// ### KNOBS
const ENTRY_POINT = {
  main: 'src/main.ts'
};
const ESBUILD_CONFIG_PATH = resolve('', './esbuild.config.ts');
export function manuInitializePipeConfigs(): InitializePipeConfigs {
  return [
    {
      // entryFile path will be handled by entryFile config within esbuild
      entryPoints: ENTRY_POINT
    },
    {
      // esbuild_path is used by createRequire and requires a full path
      esbuild_path: ESBUILD_CONFIG_PATH
    }
  ];
}

// ##

/**
 * @desc Initialize Pipe With Required Data
 */
export function createInitializePipe(
  pipeConfigs = manuInitializePipeConfigs()
) {
  return function () {
    doInitializePipe(
      Object.assign({}, manuInitializePipeConfigs(), pipeConfigs)
    );
  };
}
export function doInitializePipe(
  initializePipeConfigs = manuInitializePipeConfigs()
) {
  apply((config, customData) => {
    const [context, custom] = initializePipeConfigs;
    let key: keyof BuildOptionSpec;
    for (key in context) {
      (config[key] as any) = context[key];
    }
    let customDataKey: keyof DataCarryOverSpec;
    for (customDataKey in custom) {
      customData[customDataKey] = custom[customDataKey];
    }

    return customData;
  });
}

export function createPipeKit() {
  const config = originalConfig;
  const collectedContext = Object.assign({});

  /**
   * @desc Inverts control so that data configuration can be closer to point of need.
   */
  function apply(f: FuncSpec) {
    return f(config, collectedContext);
  }
  /**
   * @desc Provides quick and dirty webpack-merge-like functionanlity
   */
  function assign(payload: BuildOptionSpec) {
    apply((config, custom) => {
      Object.assign(config, payload);
      return custom;
    });
  }
  /**
   * @desc Provides plugin injection
   */
  function injectPlugins(...plugins: Plugin[]) {
    apply((config, custom) => {
      config.plugins!.push(...plugins);
      return custom;
    });
  }

  type Easydo = (...args: any) => Promise<void> | void;

  /**
   * Provides quick way to frontload pipe tasks.
   */
  function getPrimingPipers(): Easydo[] {
    const doCopyManifestToSlab = () =>
      injectPlugins({
        name: 'copy-manifest-to-dist',
        setup(build) {
          build.onEnd(async () => {
            const outDir =
              build.initialOptions.outdir ??
              dirname(build.initialOptions.outfile || ARTIFACTS_DIR);
            await copyNewer('manifest*.json', outDir, {
              verbose: true,
              cwd: '.'
            });
          });
        }
      });
    return [doCopyManifestToSlab];
  }
  const primers = getPrimingPipers();

  type PipeSpec = {
    devPipers: Easydo[];
    prodPipers: Easydo[];
  };
  function pipe({ devPipers, prodPipers }: PipeSpec) {
    const funcs = prod ? prodPipers : devPipers;
    const _funcs = [...primers, ...funcs];
    for (let i = 0; i < _funcs.length; i++) {
      const func = _funcs[i];
      const isThenable = 'AsyncFunction' === func.constructor.name;
      if (isThenable) {
        (async function () {
          await func(originalConfig, collectedContext);
        })();
      } else {
        Object.assign(collectedContext, func());
      }
    }
  }
  // # Api candidates
  pipe.prototype.tap = function tap(f: FuncSpec) {
    apply(f);
  };
  return {
    pipe,
    injectPlugins,
    apply
  };
}

/**
 * @desc Inverted builder
 */
export function createGenBuild(wrapperConfig = { silent: true }) {
  return async function (config: BuildOptionSpec, custom: DataCarryOverSpec) {
    if (!wrapperConfig.silent) {
      logg(config, custom);
    }
    try {
      await genBuild(config, custom);
    } catch (err) {
      logg(err);
    }
  };
}
export async function genBuild(
  config: BuildOptionSpec,
  custom: DataCarryOverSpec
) {
  const context = await esbuild.context(config).catch((err) => {
    const message = 'Esbuild build api error';
    throw new Error(JSON.stringify({ err, message }));
  });
  if (!prod) {
    return await context.watch();
  }
  if (prod) {
    return await context.dispose();
  }
}

// utils
export function logg(...items: any[]) {
  for (const item of items) {
    console.log(util.inspect(item, true, null, true));
  }
}
