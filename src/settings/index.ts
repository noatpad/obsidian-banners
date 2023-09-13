import { plug } from 'src/main';
import { SettingsTab } from './SettingsTab';
import store from './store';

type StyleOption = 'solid' | 'gradient';
export type BannerDragModOption = 'None' | 'Shift' | 'Ctrl' | 'Alt' | 'Meta';
type HeaderTextDecorOption = 'none' | 'shadow' | 'border';
export type HeaderHorizontalAlignmentOption = 'left' | 'center' | 'right' | 'custom';
export type HeaderVerticalAlignmentOption = 'center' | 'above' | 'edge' | 'below' | 'custom';

export interface BannerSettings {
  height: number;
  mobileHeight: number;
  style: StyleOption;
  showInInternalEmbed: boolean;
  internalEmbedHeight: number;
  showInPopover: boolean;
  popoverHeight: number;
  bannerDragModifier: BannerDragModOption;
  frontmatterField: string;
  enableDragInInternalEmbed: boolean;
  enableDragInPopover: boolean;
  enableLockButton: boolean;
  headerSize: string;
  headerDecor: HeaderTextDecorOption;
  headerHorizontalAlignment: HeaderHorizontalAlignmentOption;
  headerHorizontalTransform: string;
  headerVerticalAlignment: HeaderVerticalAlignmentOption;
  headerVerticalTransform: string;
  iconSize: string;
  useTwemoji: boolean;
  showPreviewInLocalModal: boolean;
  localModalSuggestionLimit: number;
  bannersFolder: string;
}

export const DEFAULT_SETTINGS: BannerSettings = {
  height: 300,
  mobileHeight: 180,
  style: 'solid',
  showInInternalEmbed: true,
  internalEmbedHeight: 200,
  showInPopover: true,
  popoverHeight: 120,
  bannerDragModifier: 'None',
  frontmatterField: 'banner',
  enableDragInInternalEmbed: false,
  enableDragInPopover: false,
  enableLockButton: true,
  headerSize: '3em',
  headerDecor: 'shadow',
  headerHorizontalAlignment: 'left',
  headerHorizontalTransform: '0px',
  headerVerticalAlignment: 'edge',
  headerVerticalTransform: '0px',
  iconSize: '1.2em',
  useTwemoji: true,
  showPreviewInLocalModal: true,
  localModalSuggestionLimit: 15,
  bannersFolder: '/'
};

const TEXT_SETTINGS: Array<keyof BannerSettings> = [
  'frontmatterField',
  'headerSize',
  'headerHorizontalTransform',
  'headerVerticalTransform',
  'iconSize',
  'bannersFolder'
];

const STYLE_OPTION_LABELS: Record<StyleOption, string> = {
  solid: 'Solid',
  gradient: 'Gradient'
};

const BANNER_DRAG_MOD_OPION_LABELS: Record<BannerDragModOption, string> = {
  None: 'None',
  Shift: '⇧ Shift',
  Ctrl: '⌃ Ctrl',
  Alt: '⎇ Alt',
  Meta: '⌘ Meta'
};

const HEADER_TEXT_DECOR_OPTION_LABELS: Record<HeaderTextDecorOption, string> = {
  none: 'None',
  shadow: 'Shadow behind text',
  border: 'Border around text'
};

const HEADER_HORIZONTAL_ALIGN_OPTION_LABELS: Record<HeaderHorizontalAlignmentOption, string> = {
  left: 'Left',
  center: 'Center',
  right: 'Right',
  custom: 'Custom'
};

const HEADER_VERTICAL_ALIGN_OPTION_LABELS: Record<HeaderVerticalAlignmentOption, string> = {
  center: 'Center of the banner',
  above: 'Just above the banner',
  edge: 'Edge of the banner',
  below: 'Just below the banner',
  custom: 'Custom'
};

export const SELECT_OPTIONS_MAP = {
  style: STYLE_OPTION_LABELS,
  bannerDragModifier: BANNER_DRAG_MOD_OPION_LABELS,
  headerDecor: HEADER_TEXT_DECOR_OPTION_LABELS,
  headerHorizontalAlignment: HEADER_HORIZONTAL_ALIGN_OPTION_LABELS,
  headerVerticalAlignment: HEADER_VERTICAL_ALIGN_OPTION_LABELS
};

/* NOTE: The `value` parameter is redundant, but is implemented for Svelte store values.
 * Perhaps think of something cleaner */
export const getSetting = <T extends keyof BannerSettings>(
  key: T,
  value?: BannerSettings[T]
): BannerSettings[T] => (value ?? plug.settings[key] ?? DEFAULT_SETTINGS[key]);

export const loadSettings = async () => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, await plug.loadData()) as BannerSettings;
  for (const [key, val] of Object.entries(settings) as [keyof BannerSettings, unknown][]) {
    if (
      DEFAULT_SETTINGS[key] === val &&
      (typeof val === 'number' || TEXT_SETTINGS.includes(key))
    ) delete settings[key];
  }
  plug.settings = settings;
  await saveSettings();
  plug.addSettingTab(new SettingsTab());
};

export const saveSettings = async (changed: Partial<BannerSettings> = {}) => {
  await plug.saveData(plug.settings);
  store.set(plug.settings);
  plug.events.trigger('setting-change', changed);
  console.log(plug.settings);
};
