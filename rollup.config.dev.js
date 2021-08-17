import os from 'os';
import copy from 'rollup-plugin-copy';
import rollup from './rollup.config';

const TEST_VAULT = `${os.homedir()}/Documents/Obsidian/Test Grounds/.obsidian/plugins/banners`;

export default {
  ...rollup,
  plugins: [
    ...rollup.plugins,
    copy({ targets: [{ src: ['dist/**/*', 'manifest.json', '.hotreload'], dest: TEST_VAULT }] })
  ]
};
