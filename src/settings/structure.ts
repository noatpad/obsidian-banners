type StyleOption = 'solid' | 'gradient';
export type LengthValue = string | number;
export type BannerDragModOption = 'None' | 'Shift' | 'Ctrl' | 'Alt' | 'Meta';
type HeaderTextDecorOption = 'none' | 'shadow' | 'border';
export type HeaderHorizontalAlignmentOption = 'left' | 'center' | 'right' | 'custom';
export type HeaderVerticalAlignmentOption = 'center' | 'above' | 'edge' | 'below' | 'custom';

export interface BannerSettings {
  style: StyleOption;
  height: LengthValue;
  mobileHeight: LengthValue;
  adjustWidthToReadableLineWidth: boolean;
  showInInternalEmbed: boolean;
  internalEmbedHeight: LengthValue;
  showInPopover: boolean;
  popoverHeight: LengthValue;
  bannerDragModifier: BannerDragModOption;
  frontmatterField: string;
  enableDragInInternalEmbed: boolean;
  enableDragInPopover: boolean;
  enableLockButton: boolean;
  headerSize: LengthValue;
  headerDecor: HeaderTextDecorOption;
  headerHorizontalAlignment: HeaderHorizontalAlignmentOption;
  headerHorizontalTransform: LengthValue;
  headerVerticalAlignment: HeaderVerticalAlignmentOption;
  headerVerticalTransform: LengthValue;
  useHeaderByDefault: boolean;
  defaultHeaderValue: string;
  iconSize: LengthValue;
  useTwemoji: boolean;
  showPreviewInLocalModal: boolean;
  localModalSuggestionLimit: number;
  bannersFolder: string;
  autoDownloadPastedBanners: boolean;
}

export const FILENAME_KEY = 'filename';

export const DEFAULT_SETTINGS: BannerSettings = {
  style: 'solid',
  height: 300,
  mobileHeight: 180,
  adjustWidthToReadableLineWidth: false,
  showInInternalEmbed: true,
  internalEmbedHeight: 200,
  showInPopover: true,
  popoverHeight: 120,
  bannerDragModifier: 'None',
  frontmatterField: 'banner',
  enableDragInInternalEmbed: false,
  enableDragInPopover: false,
  enableLockButton: true,
  headerSize: 'var(--inline-title-size)',
  headerDecor: 'shadow',
  headerHorizontalAlignment: 'left',
  headerHorizontalTransform: '0px',
  headerVerticalAlignment: 'edge',
  headerVerticalTransform: '0px',
  useHeaderByDefault: false,
  defaultHeaderValue: `{{${FILENAME_KEY}}}`,
  iconSize: '1.2em',
  useTwemoji: true,
  showPreviewInLocalModal: true,
  localModalSuggestionLimit: 15,
  bannersFolder: '/',
  autoDownloadPastedBanners: false
};

export const LENGTH_SETTINGS: Array<keyof BannerSettings> = [
  'height',
  'mobileHeight',
  'internalEmbedHeight',
  'popoverHeight',
  'headerSize',
  'headerHorizontalTransform',
  'headerVerticalTransform',
  'iconSize'
];

export const TEXT_SETTINGS: Array<keyof BannerSettings> = [
  ...LENGTH_SETTINGS,
  'frontmatterField',
  'defaultHeaderValue',
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
