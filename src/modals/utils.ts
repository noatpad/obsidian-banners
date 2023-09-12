import type { SearchMatches, TFile } from 'obsidian';

interface PathPart { part: string; bold: boolean }

export const getPathParts = (file: TFile, matches: SearchMatches): PathPart[] => {
  const { path } = file;
  if (!matches.length) return [{ part: path.slice(0, path.length), bold: false }];

  const parts: PathPart[] = [];
  let i = 0;
  for (const [start, end] of matches) {
    if (i !== start) parts.push({ part: path.slice(i, start), bold: false });
    parts.push({ part: path.slice(start, end), bold: true });
    i = end;
  }
  if (i !== path.length) parts.push({ part: path.slice(i, path.length), bold: false });
  return parts;
};
