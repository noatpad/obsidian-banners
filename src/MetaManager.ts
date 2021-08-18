import { FrontMatterCache, MetadataCache, TFile, Vault } from 'obsidian';
import { stripIndents } from 'common-tags';

import Banners from './main';

export interface BannerMetadata {
  banner: string,
  banner_x: number,
  banner_y: number
}

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
  async upsertBannerData(path: string, data: Partial<BannerMetadata>) {
    const file = this.getFileByPath(path);
    if (!file) { return }

    const fields = Object.entries(data);
    const content = await this.vault.read(file);
    const hasNoYaml = content.match(/^-{3}\s*\n*\r*-{3}/);
    const lines = content.split('\n');
    if (hasNoYaml) {
      // Create frontmatter structure if none is found
      lines.unshift(stripIndents`
        ---
        ${this.formatYamlFields(fields)}
        ---
      `);
    } else {
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
        // const newFields = fields.map(([key, val]) => `${key}: ${val}`).join('\n');
        lines.splice(end, 0, this.formatYamlFields(fields));
      }

      const newContent = lines.join('\n');
      await this.vault.modify(file, newContent);
    }
  }

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
