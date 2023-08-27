import type {} from 'obsidian';

declare module 'obsidian' {
  interface MarkdownPostProcessorContext {
    containerEl: HTMLElement
  }
}

interface BannerMetadata {
  src: string,
  x: number,
  y: number
}
