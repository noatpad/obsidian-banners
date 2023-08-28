import type {} from 'obsidian';

declare module 'obsidian' {
  interface MarkdownPostProcessorContext {
    containerEl: HTMLElement
  }

  interface MarkdownFileInfo {
    file: TFile,
    frontmatterValid: boolean,
    rawFrontmatter: string
  }
}

declare global {
  type Maybe<T> = T | null | undefined;

  interface BannerMetadata {
    src: Maybe<string>,
    x: Maybe<number>,
    y: Maybe<number>
  }
}
