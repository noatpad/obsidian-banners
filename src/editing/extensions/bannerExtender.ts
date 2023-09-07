import { EditorState, StateEffect } from '@codemirror/state';
import { editorInfoField, parseYaml } from 'obsidian';
import { extractBannerData } from 'src/utils';
import {
  assignBannerEffect,
  hasEffect,
  isBannerEffect,
  leafBannerMap,
  openNoteEffect,
  refreshEffect,
  removeBannerEffect,
  upsertBannerEffect
} from './utils';

const yamlRegex = new RegExp(/^---(?<yaml>.*)---/, 's');

// Parse raw frontmatter to get banner metadata
/* BUG: Undos and redos do not have the latest frontmatter in the editing view,
causing desynced banner data to pass through until an extra change is done */
const parseBannerFrontmatter = (state: EditorState): Partial<BannerMetadata> => {
  const { data } = state.field(editorInfoField);
  const match = data?.match(yamlRegex);
  if (!match?.groups?.yaml) return extractBannerData();

  const { yaml } = match.groups;
  const frontmatter = parseYaml(yaml) as Record<string, unknown>;
  return extractBannerData(frontmatter);
};

/* Transaction extender that essentially is in charge of sending banner-related
effects to `bannerField` */
const bannerExtender = EditorState.transactionExtender.of((transaction) => {
  const { docChanged, effects, state } = transaction;
  if (isBannerEffect(effects)) return null;

  const bannerData = parseBannerFrontmatter(state);
  const newEffects: StateEffect<any>[] = [];
  const effectFromData = bannerData.source
    ? upsertBannerEffect.of(bannerData)
    : removeBannerEffect.of(null);
  if (hasEffect(effects, openNoteEffect)) {
    console.log('open note!');
    const { leaf } = state.field(editorInfoField);
    const banner = leafBannerMap[leaf.id];
    if (banner) newEffects.push(assignBannerEffect.of(banner));
    newEffects.push(effectFromData);
  } else if (hasEffect(effects, refreshEffect) || docChanged) {
    newEffects.push(effectFromData);
  }

  return { effects: newEffects };
});

export default bannerExtender;
