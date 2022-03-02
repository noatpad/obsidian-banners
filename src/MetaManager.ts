import { MetadataCache, TFile, Vault } from 'obsidian';
import { stripIndents } from 'common-tags';

import BannersPlugin from './main';

export interface IBannerMetadata {
  src: string,
  x: number,
  y: number,
  icon: string
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
  getBannerData(frontmatter: {[key: string]: string}): IBannerMetadata {
    if (!frontmatter) { return }

    const fieldName = this.plugin.getSettingValue('frontmatterField');
    const {
      [fieldName]: src,
      [`${fieldName}_x`]: x,
      [`${fieldName}_y`]: y,
      [`${fieldName}_icon`]: icon
    } = frontmatter;
    return {
      src,
      x: x !== undefined ? parseFloat(x) : undefined,
      y: y !== undefined ? parseFloat(y) : undefined,
      icon
    };
  }

  // Upsert banner data into a file's frontmatter
  async upsertBannerData(fileOrPath: TFile | string, data: Partial<IBannerMetadata>) {
    const file = (fileOrPath instanceof TFile) ? fileOrPath : this.getFileByPath(fileOrPath);
    if (!file) { return }

    // Get banner data based on the designated prefix for banner data fields
    const { src, x, y, icon } = data;
    const baseName = this.plugin.getSettingValue('frontmatterField');
    const trueFields = {
      ...(src && { [baseName]: src }),
      ...(x && { [`${baseName}_x`]: x }),
      ...(y && { [`${baseName}_y`]: y }),
      ...(icon && { [`${baseName}_icon`]: icon })
    };

    const fieldsArr = Object.entries(trueFields);
    const content = await this.vault.read(file);
    const hasYaml = HAS_YAML_REGEX.test(content);
    const lines = content.split('\n');
    if (hasYaml) {
      // Search through the frontmatter to update target fields if they exist
      const start = lines.indexOf('---');
      const end = lines.indexOf('---', start + 1);
      for (let i = start + 1; i < end && fieldsArr.length; i++) {
        const [key] = lines[i].split(': ');
        const targetIndex = fieldsArr.findIndex(([k]) => k === key);
        if (targetIndex === -1) { continue }

        lines[i] = `${key}: ${trueFields[key]}`;
        fieldsArr.splice(targetIndex, 1);
      }

      // Create new fields with their value if it didn't exist before
      if (fieldsArr.length) {
        lines.splice(end, 0, this.formatYamlFields(fieldsArr));
      }
    } else {
      // Create frontmatter structure if none is found
      lines.unshift(stripIndents`
        ---
        ${this.formatYamlFields(fieldsArr)}
        ---
      `);
    }

    const newContent = lines.join('\n');
    await this.vault.modify(file, newContent);
  }

  // Remove banner data from a file's frontmatter
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

  // Helper to get all banner fields
 private getAllBannerFields(): string[] {
    const base = this.plugin.getSettingValue('frontmatterField');
    return ['', '_x', '_y', '_icon'].map(suffix => `${base}${suffix}`);
  }
}
