import { MarkdownPostProcessorContext, TFile, Vault, Workspace } from 'obsidian';
import clamp from 'lodash/clamp';
import isURL from 'validator/lib/isURL';
import { html } from 'common-tags';

import Banners from './main';
import MetaManager, { FrontmatterWithBannerData } from './MetaManager';
import { BannerMetadata } from './MetaManager';
import { SettingsOptions } from './Settings';

const BANNER_CLASS = 'obsidian-banner';
const BANNER_SELECTOR = `.${BANNER_CLASS}`;

interface XY {
  x: number,
  y: number
}

interface MPPCPlus extends MarkdownPostProcessorContext {
  containerEl: HTMLElement,
  frontmatter: FrontmatterWithBannerData
}

export default class BannersProcessor {
  plugin: Banners;
  settings: SettingsOptions;
  workspace: Workspace;
  vault: Vault;

  metaManager: MetaManager;
  prevPath: string;

  constructor(plugin: Banners) {
    this.plugin = plugin;
    this.settings = plugin.settings;
    this.workspace = plugin.app.workspace;
    this.vault = plugin.app.vault;

    this.metaManager = plugin.metaManager;
    this.prevPath = null;
  }

  load() {
    this.plugin.registerMarkdownPostProcessor(async (_, ctx: MPPCPlus) => {
      const { frontmatter, sourcePath } = ctx;
      const viewContainer = ctx.containerEl.parentElement as HTMLDivElement;
      const isEmbed = viewContainer.parentElement.hasClass('markdown-embed-content');

      // If banners in embeds are disabled, post-process nothing
      if (isEmbed && !this.settings.showInEmbed) {
        return;
      }

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
      const bannerEl: HTMLDivElement = viewContainer.querySelector(BANNER_SELECTOR);
      if (!bannerEl) {
        this.addBanner(viewContainer, ctx, isEmbed);
      } else {
        this.updateBanner(bannerEl, ctx);
      }

      // Since no interaction is made with embed banners, avoid changing this reference
      if (!isEmbed) {
        this.prevPath = sourcePath;
      }
    });
  }

  unload() {
    this.updateBannerElements((b) => this.removeBanner(b));
    this.prevPath = null;
  }

  // Create a banner for a given Markdown Preview View
  addBanner(wrapper: HTMLDivElement, ctx: MPPCPlus, isEmbed: boolean) {
    const { sourcePath, frontmatter: { banner: src }} = ctx;
    const { allowMobileDrag, style } = this.plugin.settings;

    const bannerEl = document.createElement('div');
    const messageBox = document.createElement('div');
    const img = document.createElement('img');

    // Set attribute to be used for modifying banner data
    wrapper.setAttribute('filepath', sourcePath);

    // Prepare loading/error message
    this.setupMessageBox(messageBox);

    // Initially make the image full-width (the more common case) and set its inital positioning
    img.draggable = false;
    img.className = 'full-width';
    img.onload = () => {
      this.setBannerOffset(wrapper);
      bannerEl.addClass('loaded');
    };
    img.onerror = () => {
      messageBox.innerHTML = '<p>Error loading banner image! Is the <em>banner</em> field valid?</p>';
      bannerEl.addClass('error');
    }
    img.src = this.parseSource(src);

    bannerEl.addClasses([BANNER_CLASS, style]);
    bannerEl.append(messageBox, img);

    // Only enable banner drag in Markdown views, not in embeds
    if (!isEmbed) {
      // Set up banner image drag handlers
      let dragging = false;
      let prevPos: XY;

      const dragStart = (e: MouseEvent | TouchEvent) => {
        // Prepare dragging behavior
        prevPos = this.getMousePos(e, bannerEl);
        dragging = true;
      };

      const dragMove = (e: MouseEvent | TouchEvent) => {
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

      const dragStop = async () => {
        // Only continue when finishing drag
        if (!dragging) { return }
        dragging = false;

        // Update banner data
        const attr = wrapper.getAttribute('filepath');
        await this.metaManager.upsertBannerData(attr, this.calcBannerOffset(img, bannerEl));
      }

      img.onmousedown = dragStart;
      img.onmousemove = dragMove;
      wrapper.onmouseup = dragStop;

      if (allowMobileDrag) {
        img.ontouchstart = dragStart;
        img.ontouchmove = dragMove;
        wrapper.ontouchend = dragStop;
      }
    }

    // Set up entire wrapper
    wrapper.prepend(bannerEl);
    wrapper.addClass('has-banner');
  }

  // Update the image on a banner
  updateBanner(bannerEl: HTMLElement, { frontmatter }: MPPCPlus) {
    // Only continue if the parsed source is different
    const { banner: src } = frontmatter;
    const parsed = this.parseSource(src);
    const img = bannerEl.querySelector('img');
    if (img.src === parsed || (img.src === 'app://obsidian.md/null' && parsed === null)) { return }

    const messageBox: HTMLDivElement = bannerEl.querySelector('.banner-message');
    this.setupMessageBox(messageBox);
    bannerEl.removeClasses(['loaded', 'error']);
    img.src = parsed;
  }

  // Remove banner from view
  removeBanner(wrapper: HTMLElement) {
    // If banner doesn't exist, do nothing
    const bannerEl = wrapper.querySelector(BANNER_SELECTOR);
    if (!bannerEl) { return }

    bannerEl.remove();
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

    this.setBannerOffset(wrapper);
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

  // Parse source as a URL or a local file path
  parseSource(src: string): string {
    if (isURL(src)) { return src }
    const file = this.vault.getAbstractFileByPath(src);
    return (file instanceof TFile) ? this.vault.adapter.getResourcePath(src) : null;
  }

  // Helper to get all specified banner wrappers and do something with them
  // `filepath` is used if you wanna target banners that pertain to a specific file
  updateBannerElements(cbPerBanner: (wrapper: HTMLDivElement) => any, filepath?: string) {
    const selector = '.markdown-preview-view.has-banner';
    if (filepath) {
      selector.concat(`[filepath="${filepath}"]`);
    }

    this.workspace.containerEl
      .querySelectorAll(selector)
      .forEach(cbPerBanner);
  }

  // Helper to update `filepath` attribute reference
  updateFilepathAttr(oldPath: string, newPath: string) {
    this.prevPath = newPath;
    this.updateBannerElements((b) => b.setAttribute('filepath', newPath), oldPath);
  }

  // Helper to get mouse position
  getMousePos(e: MouseEvent | TouchEvent, div: HTMLDivElement): XY {
    const { pageX, pageY } = (e instanceof MouseEvent) ? e : e.targetTouches[0];
    return { x: pageX - div.offsetTop, y: pageY - div.offsetLeft };
  }

  // Helper to setup loading indicator
  setupMessageBox(box: HTMLDivElement) {
    box.className = 'banner-message';
    box.innerHTML = html`
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
    `;
  }
}
