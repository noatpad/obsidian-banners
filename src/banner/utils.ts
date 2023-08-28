import type { TFile } from "obsidian";
import { plug } from "src/main";

export const parseInternalLink = (src: string, file: TFile): Maybe<string> => {
  const isInternalLink = /^\[\[.+\]\]/.test(src);
  if (!isInternalLink) return null;

  const link = src.slice(2, -2);
  const target = plug.app.metadataCache.getFirstLinkpathDest(link, file.path);
  return target ? plug.app.vault.getResourcePath(target) : link;
}
