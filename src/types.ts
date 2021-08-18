// Common
export interface XY {
  x: number,
  y: number
}

// Metadata
export interface BannerMetadata {
  banner: string,
  banner_x: number,
  banner_y: number
}

// Settings
export type StyleOption = 'solid' | 'gradient';

export interface SettingsOptions {
  height: number,
  style: StyleOption
}
