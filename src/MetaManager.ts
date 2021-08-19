import { FrontMatterCache, MetadataCache, TFile, Vault } from 'obsidian';
import { stripIndents } from 'common-tags';

import Banners from './main';
import { BannerMetadata } from './types';

const HAS_YAML_REGEX = /^-{3}(\n|\r|\r\n)((.*)(\n|\r|\r\n))*-{3}/;

export default class MetaManager {
  plugin: Banners;
  metadata: MetadataCache
  vault: Vault;

  constructor(plugin: Banners) {
    this.plugin = plugin;
    this.metadata = plugin.app.metadataCache;
    this.vault = plugin.app.vault;
  }

  // Get banner metadata from a file
  getBannerData(path: string): BannerMetadata {
    const file = this.getFileByPath(path);
    if (!file) { return }

    const {
      banner,
      banner_x,
      banner_y
    } = this.metadata.getFileCache(file)?.frontmatter ?? {} as FrontMatterCache | BannerMetadata;
    return { banner, banner_x, banner_y };
  }

  // Upsert banner data into a file's frontmatter
  async upsertBannerData(fileOrPath: TFile | string, data: Partial<BannerMetadata>) {
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

        const dataKey = key as keyof BannerMetadata;
        lines[i] = `${key}: ${data[dataKey]}`;
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

  // async removeBannerData(fileOrPath: TFile | string, fields: Array<keyof BannerMetadata> = ['banner', 'banner_x', 'banner_y']) {
  //   const file = (fileOrPath instanceof TFile) ? fileOrPath : this.getFileByPath(fileOrPath);
  //   if (!file) { return }

  //   // If there's no YAML to remove, then stop here
  //   const content = await this.vault.read(file);
  //   const hasYaml = HAS_YAML_REGEX.test(content);
  //   if (!hasYaml) { return }

  //   // Go one-by-one and delete the given fields of the YAML
  //   const lines = content.split('\n');
  //   const start = lines.indexOf('---');
  //   let end = lines.indexOf('---', start + 1);
  //   let isEmpty = true;
  //   for (let i = start + 1; i < end && fields.length; i++) {
  //     const [key] = lines[i].split(': ');
  //     const fieldIndex = fields.indexOf(key as keyof BannerMetadata);
  //     if (fieldIndex === -1) {
  //       if (key) { isEmpty = false }
  //       continue;
  //     }

  //     lines.splice(i, 1);
  //     fields.splice(fieldIndex, 1);
  //     i--;
  //     end--;
  //   }

  //   // If the YAML is empty after deleting those fields, remove the YAML lines as well
  //   // FIXME: When YAML is deleted in one swoop, the preprocessor doesn't fire, leaving the banner there.
  //   if (isEmpty) {
  //     lines.splice(start, end - start + 1);
  //   }

  //   const newContent = lines.join('\n');
  //   await this.vault.modify(file, newContent);
  // }

  // Get file based on a path string
  getFileByPath(path: string): TFile {
    const file = this.vault.getAbstractFileByPath(path);
    return (file instanceof TFile) ? file : null;
  }

  // Format into valid YAML fields
  formatYamlFields(fields: any[]): string {
    return fields.sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');
  }
}
