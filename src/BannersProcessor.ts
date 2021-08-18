import { Events, MarkdownPostProcessorContext, MarkdownView, TFile, Vault, Workspace } from 'obsidian';
import clamp from 'lodash/clamp';
import isURL from 'validator/lib/isURL';

import Banners from './main';
import MetaManager from './MetaManager';
import { BannerMetadata, XY } from './types';

const BANNER_CLASS = 'obsidian-banner';
const BANNER_SELECTOR = `.${BANNER_CLASS}`;

interface MPPCPlus extends MarkdownPostProcessorContext {
  containerEl: HTMLElement
}

export default class BannersProcessor {
  plugin: Banners;
  workspace: Workspace;
  vault: Vault;
  events: Events;
  metaManager: MetaManager;
  prevPath: string;

  constructor(plugin: Banners) {
    this.plugin = plugin;
    this.workspace = plugin.app.workspace;
    this.vault = plugin.app.vault;
    this.events = plugin.events;
    this.metaManager = plugin.metaManager;
    this.prevPath = '';
    this.register();
  }

  // Register postprocessor and listeners
  register() {
    this.plugin.registerMarkdownPostProcessor(async (_, ctx: MPPCPlus) => {
      const { frontmatter, sourcePath } = ctx;
      const viewContainer = ctx.containerEl.parentElement as HTMLDivElement;

      // If no `banner` metadata field exists, remove banner (and its data) if necessary and stop here
      if (!frontmatter?.banner) {
        this.removeBanner(viewContainer);
        return;
      }

      // Clear banner when changing files
      if (sourcePath !== this.prevPath) {
        this.removeBanner(viewContainer);
      }

      // Create banner if it hasn't been already made, otherwise update the banner image
      const { banner: src } = frontmatter;
      const bannerEl = viewContainer.querySelector(BANNER_SELECTOR);
      if (!bannerEl) {
        this.addBanner(viewContainer, src, sourcePath);
      } else {
        const parsed = this.parseSource(src);
        const img = bannerEl.querySelector('img');
        if (img.src !== parsed) {
          img.src = this.parseSource(src);
        }
      }

      this.prevPath = sourcePath;
    });

    // When resizing panes, update the banner image positioning
    this.workspace.on('resize', () => {
      this.workspace.containerEl
        .querySelectorAll('.markdown-preview-view.has-banner')
        .forEach((b: HTMLDivElement) => { this.setBannerOffset(b) });
    });

    // Remove banner when creating a new file or opening an empty file
    this.workspace.on('file-open', async (file) => {
      if (!file || file.stat.size > 0) { return }
      this.workspace.getLeavesOfType('markdown')
        .filter(l => (l.view as MarkdownView).file.path === file.path)
        .forEach(l => {
          const wrapper: HTMLDivElement = l.view.containerEl?.querySelector('.markdown-preview-view.has-banner');
          if (wrapper) {
            this.removeBanner(wrapper);
          }
        })
    });

    // When duplicating a file, update banner's filepath reference
    this.vault.on('create', (file) => {
      if (!(file instanceof TFile) || file.extension !== 'md') { return }

      // Only continue if the file is indeed a duplicate
      const dupe = this.findDuplicateOf(file);
      if (!dupe) { return }
      this.updateFilepathAttr(file.path, dupe.path);
    });

    // When renaming a file, update banner's filepath reference
    this.vault.on('rename', ({ path }, oldPath) => {
      this.updateFilepathAttr(oldPath, path);
    });

    // When settings change, restyle the banners with the current settings
    this.events.on('settingsSave', () => {
      this.workspace.containerEl
        .querySelectorAll('.markdown-preview-view.has-banner')
        .forEach((b: HTMLDivElement) => {
          this.restyleBanner(b);
          this.setBannerOffset(b);
        });
    });
  }

  // Create a banner for a given Markdown Preview View
  addBanner(wrapper: HTMLDivElement, src: string, path: string) {
    const { style } = this.plugin.settings;
    const bannerEl = document.createElement('div');
    const img = document.createElement('img');

    // Set attribute to be used for modifying banner data
    wrapper.setAttribute('filepath', path);

    // Initially make the image full-width (the more common case) and set its inital positioning
    img.draggable = false;
    img.className = 'full-width';
    img.onload = () => { this.setBannerOffset(wrapper) };
    img.src = this.parseSource(src);

    const bannerClasses = [BANNER_CLASS];
    if (style === 'gradient') { bannerClasses.push('gradient') }
    bannerEl.addClasses(bannerClasses);
    bannerEl.appendChild(img);

    // Set up banner image drag handlers
    let dragging = false;
    let prevPos: XY;
    bannerEl.onmousedown = (e) => {
      // Prepare dragging behavior
      prevPos = this.getMousePos(e, bannerEl);
      dragging = true;
    };
    bannerEl.onmousemove = (e) => {
      // Only continue if dragging
      if (!dragging) { return }

      // Get delta of mouse drag
      const currentPos = this.getMousePos(e, bannerEl);
      const delta: XY = { x: currentPos.x - prevPos.x, y: currentPos.y - prevPos.y };
      prevPos = currentPos;

      // Move the image within the banner div & the image's boundaries
      const { height, width } = img;
      const { left, top } = img.style;
      const newTop = clamp(parseInt(top || '0') + delta.y, bannerEl.clientHeight - height, 0);
      const newLeft = clamp(parseInt(left || '0') + delta.x, bannerEl.clientWidth - width, 0);
      img.style.top = `${newTop}px`;
      img.style.left = `${newLeft}px`;
    }
    wrapper.onmouseup = async () => {
      // Only continue when finishing drag
      if (!dragging) { return }
      dragging = false;

      // Update banner data
      const attr = wrapper.getAttribute('filepath');
      await this.metaManager.upsertBannerData(attr, this.calcBannerOffset(img, bannerEl));
    };

    // Set up entire wrapper
    wrapper.prepend(bannerEl);
    wrapper.addClass('has-banner');
  }

  // Remove banner from view
  removeBanner(wrapper: HTMLElement) {
    // If banner doesn't exist, do nothing
    const bannerDiv = wrapper.querySelector(BANNER_SELECTOR);
    if (!bannerDiv) { return }

    bannerDiv.remove();
    wrapper.removeClass('has-banner');
    wrapper.removeAttribute('path');

    const markdown = wrapper.querySelector('.markdown-preview-section') as HTMLDivElement;
    markdown.style.marginTop = '';
  }

  // Restyle the current banner
  restyleBanner(wrapper: HTMLDivElement) {
    const { style } = this.plugin.settings;
    const bannerEl = wrapper.querySelector('.obsidian-banner') as HTMLDivElement;

    if (style === 'gradient') {
      bannerEl.addClass('gradient');
    } else {
      bannerEl.removeClass('gradient');
    }
  }

  // Calculate percentage of scroll based on an image's centered position
  calcBannerOffset(img: HTMLImageElement, wrapper: HTMLDivElement): Partial<BannerMetadata> {
    const { className, height, width } = img;
    const { top, left } = img.style;
    const { clientHeight, clientWidth } = wrapper;
    if (className === 'full-width') {
      return { banner_y: (Math.abs(parseInt(top)) + (clientHeight / 2)) / height };
    } else {
      return { banner_x: (Math.abs(parseInt(left)) + (clientWidth / 2)) / width };
    }
  }

  // Set banner image positioning
  setBannerOffset(wrapper: HTMLDivElement) {
    const bannerEl = wrapper.querySelector('.obsidian-banner');
    const img = bannerEl.querySelector('img');

    // If image hasn't been loaded yet, do nothing
    if (!img.complete) { return }

    // Detect transitions between full-width <-> full-height
    if (img.className === 'full-width' && img.height < bannerEl.clientHeight) {
      img.className = 'full-height';
    } else if (img.className === 'full-height' && img.width < bannerEl.clientWidth) {
      img.className = 'full-width';
    }

    // Update positioning based on their class
    const { banner_x = 0.5, banner_y = 0.5 } = this.metaManager.getBannerData(wrapper.getAttribute('filepath'));
    if (img.className === 'full-width') {
      const value = clamp((bannerEl.clientHeight / 2) - (img.height * banner_y), bannerEl.clientHeight - img.height, 0);
      img.style.top = `${value}px`;
      img.style.left = '';
    } else {
      const value = clamp((bannerEl.clientWidth / 2) - (img.width * banner_x), bannerEl.clientWidth - img.width, 0);
      img.style.top = '';
      img.style.left = `${value}px`;
    }
  }

  // Get mouse position
  getMousePos(e: MouseEvent, div: HTMLDivElement): XY {
    return { x: e.pageX - div.offsetTop, y: e.pageY - div.offsetLeft };
  }

  // Parse source as a URL or a local file path
  parseSource(src: string): string {
    if (isURL(src)) { return src }
    const file = this.vault.getAbstractFileByPath(src);
    return (file instanceof TFile) ? this.vault.adapter.getResourcePath(src) : null;
  }

  // Find the file that was duplicated from the given file, if that's the case
  findDuplicateOf({ basename, parent }: TFile): TFile {
    const words = basename.split(' ');
    words.pop();
    const potentialName = words.join(' ');

    const siblings = parent.children.filter(a => a instanceof TFile) as TFile[];
    return siblings.find(f => f.basename === potentialName);
  }

  // Update `filepath` attribute reference
  updateFilepathAttr(oldPath: string, newPath: string) {
    this.prevPath = newPath;
    this.workspace.containerEl
      .querySelectorAll(`.markdown-preview-view.has-banner[filepath="${oldPath}"]`)
      .forEach(v => v.setAttribute('filepath', newPath));
  }
}
