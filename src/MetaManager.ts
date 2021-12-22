import { FrontMatterCache, MetadataCache, TFile, Vault } from 'obsidian';
import { stripIndents } from 'common-tags';

import BannersPlugin from './main';
export interface BannerMetadata {
  banner: string,
  banner_x: number,
  banner_y: number,
  banner_icon: string
}

const HAS_YAML_REGEX = /^-{3}(\n|\r|\r\n)((.*)(\n|\r|\r\n))*-{3}/;

export default class MetaManager {
  plugin: BannersPlugin;
  metadata: MetadataCache
  vault: Vault;

  constructor(plugin: BannersPlugin) {
    this.plugin = plugin;
    this.metadata = plugin.app.metadataCache;
    this.vault = plugin.app.vault;
  }

  // Get banner metadata from frontmatter
  getBannerData(frontmatter: FrontMatterCache): BannerMetadata {
    if (!frontmatter) { return }

    const fieldName = this.plugin.getSettingValue('frontmatterField');
    const {
      [fieldName]: banner,
      [`${fieldName}_x`]: banner_x,
      [`${fieldName}_y`]: banner_y,
      [`${fieldName}_icon`]: banner_icon
    } = frontmatter;
    return { banner, banner_x, banner_y, banner_icon };
  }

  // Get banner metadata from a file
  getBannerDataFromFile(fileOrPath: TFile | string): BannerMetadata {
    const file = (fileOrPath instanceof TFile) ? fileOrPath : this.getFileByPath(fileOrPath);
    if (!file) { return }
    return this.getBannerData(this.metadata.getFileCache(file)?.frontmatter);
  }

  // Upsert banner data into a file's frontmatter
  async upsertBannerData(fileOrPath: TFile | string, data: {[key: string]: string | number}) {
    const file = (fileOrPath instanceof TFile) ? fileOrPath : this.getFileByPath(fileOrPath);
    if (!file) { return }

    const fields = Object.entries(data);
    const content = await this.vault.read(file);
    const hasYaml = HAS_YAML_REGEX.test(content);
    const lines = content.split('\n');
    if (hasYaml) {
      // Search through the frontmatter to update target fields if they exist
      const start = lines.indexOf('---');
      const end = lines.indexOf('---', start + 1);
      for (let i = start + 1; i < end && fields.length; i++) {
        const [key] = lines[i].split(': ');
        const targetIndex = fields.findIndex(([k]) => k === key);
        if (targetIndex === -1) { continue }

        lines[i] = `${key}: ${data[key]}`;
        fields.splice(targetIndex, 1);
      }

      // Create new fields with their value if it didn't exist before
      if (fields.length) {
        lines.splice(end, 0, this.formatYamlFields(fields));
      }
    } else {
      // Create frontmatter structure if none is found
      lines.unshift(stripIndents`
        ---
        ${this.formatYamlFields(fields)}
        ---
      `);
    }

    const newContent = lines.join('\n');
    await this.vault.modify(file, newContent);
  }

  async removeBannerData(fileOrPath: TFile | string, fields: string[] = this.getAllBannerFields()) {
    const file = (fileOrPath instanceof TFile) ? fileOrPath : this.getFileByPath(fileOrPath);
    if (!file) { return }

    // If there's no (relevant) YAML to remove, stop here
    const { frontmatter } = this.metadata.getFileCache(file);
    const frontmatterKeys = Object.keys(frontmatter ?? {});
    if (!frontmatter || !fields.some(f => frontmatterKeys.includes(f))) { return }

    const content = await this.vault.read(file);
    const lines = content.split('\n');
    const { line: start } = frontmatter.position.start;
    let { line: end } = frontmatter.position.end;

    // Determine if the entire YAML should be removed or only part of it
    if (frontmatterKeys.every(f => fields.includes(f) || f === 'position')) {
      lines.splice(start, end - start + 1);
    } else {
      // Iterate through each YAML field-line and remove the desired ones
      for (let i = start + 1; i < end && fields.length; i++) {
        const [key] = lines[i].split(': ');
        const fieldIndex = fields.indexOf(key);
        if (fieldIndex === -1) { continue }

        lines.splice(i, 1);
        fields.splice(fieldIndex, 1);
        i--;
        end--;
      }
    }

    const newContent = lines.join('\n');
    await this.vault.modify(file, newContent);
  }

  // Get file based on a path string
  getFileByPath(path: string): TFile {
    const file = this.vault.getAbstractFileByPath(path);
    return (file instanceof TFile) ? file : null;
  }

  // Format into valid YAML fields
  formatYamlFields(fields: any[]): string {
    return fields.sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');
  }

  // Get all banner fields
  getAllBannerFields(): string[] {
    const base = this.plugin.getSettingValue('frontmatterField');
    return ['', '_x', '_y', '_icon'].map(suffix => `${base}${suffix}`);
  }
}
