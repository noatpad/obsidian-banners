import { MetadataCache, TFile, Vault } from 'obsidian';
import { stripIndents } from 'common-tags';

import BannersPlugin from './main';

export interface IBannerMetadata {
  src: string,
  x: number,
  y: number,
  icon: string,
  lock: boolean
}
type BannerMetadataKey = keyof IBannerMetadata;

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
  getBannerData(frontmatter: Record<string, string|number|boolean>): IBannerMetadata {
    if (!frontmatter) { return null }

    const fieldName = this.plugin.getSettingValue('frontmatterField');
    const {
      [fieldName]: src,
      [`${fieldName}_x`]: x,
      [`${fieldName}_y`]: y,
      [`${fieldName}_icon`]: icon,
      [`${fieldName}_lock`]: lock
    } = frontmatter;
    return {
      src: src as string,
      x: (typeof x === 'number') ? x : parseFloat(x as string),
      y: (typeof y === 'number') ? y : parseFloat(y as string),
      icon: icon as string,
      lock: (typeof lock === 'boolean') ? lock : lock === 'true'
    };
  }

  // Get banner metadata from a given file
  getBannerDataFromFile(file: TFile): IBannerMetadata {
    if (!file) { return null }
    const { frontmatter } = this.metadata.getFileCache(file);
    return this.getBannerData(frontmatter);
  }

  // Upsert banner data into a file's frontmatter
  async upsertBannerData(fileOrPath: TFile | string, data: Partial<IBannerMetadata>) {
    const file = (fileOrPath instanceof TFile) ? fileOrPath : this.getFileByPath(fileOrPath);
    if (!file) { return }

    // Get banner data based on the designated prefix for banner data fields
    const { src, x, y, icon, lock } = data;
    const baseName = this.plugin.getSettingValue('frontmatterField');
    const trueFields: Partial<IBannerMetadata> = {
      ...(src !== undefined && { [baseName]: src }),
      ...(x !== undefined && { [`${baseName}_x`]: x }),
      ...(y !== undefined && { [`${baseName}_y`]: y }),
      ...(icon !== undefined && { [`${baseName}_icon`]: icon }),
      ...(lock !== undefined && { [`${baseName}_lock`]: lock })
    };

    const fieldsArr = Object.keys(trueFields) as [keyof IBannerMetadata];
    const content = await this.vault.read(file);
    const lines = content.split('\n');
    const hasYaml = lines[0] === '---';
    if (hasYaml) {
      // Search through the frontmatter to update target fields if they exist
      let i;
      for (i = 1; i < lines.length && fieldsArr.length; i++) {
        if (lines[i].startsWith('---')) { break }

        const [key] = lines[i].split(': ') as [keyof IBannerMetadata, string];
        const targetIndex = fieldsArr.indexOf(key);
        if (targetIndex === -1) { continue }

        lines[i] = `${key}: ${trueFields[key]}`;
        fieldsArr.splice(targetIndex, 1);
      }

      // Create new fields with their value if it didn't exist before
      if (fieldsArr.length) {
        lines.splice(i, 0, ...this.formatYamlFields(fieldsArr, trueFields));
        i += fieldsArr.length;
      }

      // Add YAML ending separator if needed
      const end = lines.indexOf('---', i);
      if (end === -1) {
        lines.splice(i, 0, '---');
      }
    } else {
      // Create frontmatter structure if none is found
      lines.unshift(stripIndents`
        ---
        ${this.formatYamlFields(fieldsArr, trueFields).join('\n')}
        ---
      `);
    }

    const newContent = lines.join('\n');
    await this.vault.modify(file, newContent);
  }

  // Remove banner data from a file's frontmatter
  async removeBannerData(file: TFile, targetFields: BannerMetadataKey[] = ['src', 'x', 'y', 'icon', 'lock']) {
    // Get the true fields to target
    const srcIndex = targetFields.indexOf('src');
    if (srcIndex > -1) {
      targetFields.splice(srcIndex, 1, '' as BannerMetadataKey);
    }
    const base = this.plugin.getSettingValue('frontmatterField');
    const trueFields = targetFields.map(suffix => `${base}${suffix ? `_${suffix}` : ''}`);

    // If there's no (relevant) YAML to remove, stop here
    const { frontmatter: { position, ...fields }} = this.metadata.getFileCache(file);
    const frontmatterKeys = Object.keys(fields ?? {});
    if (!fields || !trueFields.some(f => frontmatterKeys.includes(f))) { return }

    const content = await this.vault.read(file);
    const lines = content.split('\n');
    const { line: start } = position.start;
    let { line: end } = position.end;

    // Determine if the entire YAML should be removed or only part of it
    if (frontmatterKeys.every(f => trueFields.includes(f))) {
      lines.splice(start, end - start + 1);
    } else {
      // Iterate through each YAML field-line `and remove the desired ones
      for (let i = start + 1; i < end && trueFields.length; i++) {
        const [key] = lines[i].split(': ');
        const fieldIndex = trueFields.indexOf(key);
        if (fieldIndex === -1) { continue }

        lines.splice(i, 1);
        trueFields.splice(fieldIndex, 1);
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
  formatYamlFields(fields: [keyof IBannerMetadata], data: Partial<IBannerMetadata>): string[] {
    return fields.map((key) => [key, `${data[key]}`])
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => `${key}: ${val}`);
  }
}
