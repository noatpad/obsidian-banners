import { TFile } from 'obsidian';
import emojiRegex from 'emoji-regex';
import twemoji from 'twemoji';

import BannersPlugin from './main';
import IconModal from './modals/IconModal';
import { DEFAULT_VALUES } from './Settings';

const EMOJI_REGEX = emojiRegex();

const getIconTransform = (plugin: BannersPlugin): string => {
  const { iconHorizontalAlignment, iconVerticalAlignment } = plugin.settings;
  const { iconHorizontalTransform: dH, iconVerticalTransform: dV } = DEFAULT_VALUES;
  const h = iconHorizontalAlignment === 'custom' ? plugin.getSettingValue('iconHorizontalTransform') : dH;
  const v = iconVerticalAlignment === 'custom' ? plugin.getSettingValue('iconVerticalTransform') : dV;
  return h !== dH || v !== dV ? `translate(${h}, ${v})` : null;
}

const buildIcon = (plugin: BannersPlugin, icon: string, file: TFile): HTMLElement => {
  const box = document.createElement('div');
  box.addClass('icon-box');
  box.style.transform = getIconTransform(plugin);

  const text = icon.match(EMOJI_REGEX)?.join('') ?? icon[0];
  if (plugin.settings.useTwemoji) {
    box.innerHTML = twemoji.parse(text);
  } else {
    box.textContent = text;
  }

  box.onclick = async (e) => { new IconModal(plugin, file).open(); e.stopPropagation();};

  return box;
};

export default buildIcon;
