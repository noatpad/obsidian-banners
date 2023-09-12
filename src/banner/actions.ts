/* eslint-disable import/no-duplicates */
import { Keymap } from 'obsidian';
import type { Action } from 'svelte/action';
import type { BannerMetadataWrite } from 'src/bannerData';
import type { Embedded } from 'src/reading/BannerRenderChild';
import type { BannerDragModOption } from 'src/settings';

type MTEvent = MouseEvent | TouchEvent;

export interface XY { x: number; y: number }
interface BannerDragSettings {
  modKey: BannerDragModOption;
  enableInInternalEmbed: boolean;
  enableInPopover: boolean;
}
export interface DragParams extends XY {
  embed: Embedded;
  lock: boolean;
  settings: BannerDragSettings;
}

interface DragAttributes {
  'on:dragBannerStart': (e: CustomEvent) => void;
  'on:dragBannerMove': (e: CustomEvent<XY>) => void;
  'on:dragBannerEnd': (e: CustomEvent<Partial<BannerMetadataWrite>>) => void;
  'on:toggleDrag': (e: CustomEvent<boolean>) => void;
}

type DragBannerAction = Action<HTMLImageElement, DragParams, DragAttributes>;

// Clamp a value if needed, otherwise round it to 3 decimals
const clampAndRound = (min: number, value: number, max: number) => {
  if (value > max) return max;
  if (value < min) return min;
  return Math.round(value * 1000) / 1000;
};

const isDraggable = (embed: Embedded, settings: BannerDragSettings): boolean => {
  if (embed === 'internal') return settings.enableInInternalEmbed;
  if (embed === 'popover') return settings.enableInPopover;
  return true;
};

const getMousePos = (e: MTEvent): [number, number] => {
  const { clientX, clientY } = (e instanceof MouseEvent) ? e : e.targetTouches[0];
  return [clientX, clientY];
};

// Svelte action for banner dragging
export const dragBanner: DragBannerAction = (img, params) => {
  const {
    x,
    y,
    embed,
    lock,
    settings
  } = params;
  let draggable = !lock && isDraggable(embed, settings);
  let dragging = false;
  let isVerticalDrag = false;
  let imageSize = { width: 0, height: 0 };
  let prev = { x: 0, y: 0 };
  let objectPos = { x, y };
  let modKey = settings.modKey;

  const dragStart = (e: MTEvent) => {
    if (modKey !== 'None' && !Keymap.isModifier(e, modKey)) return;

    const [x, y] = getMousePos(e);
    prev = { x, y };
    dragging = true;

    // Get "drag area" dimensions (image size with "covered" area, then subtract image dimensions)
    const {
      clientHeight,
      clientWidth,
      naturalHeight,
      naturalWidth
    } = img;
    const clientRatio = clientWidth / clientHeight;
    const naturalRatio = naturalWidth / naturalHeight;
    isVerticalDrag = naturalRatio <= clientRatio;
    imageSize = isVerticalDrag
      ? { width: 0, height: clientWidth / naturalRatio - clientHeight }
      : { width: clientHeight * naturalRatio - clientWidth, height: 0 };
    img.dispatchEvent(new CustomEvent('dragBannerStart'));
  };

  const dragMove = (e: MTEvent) => {
    if (!dragging) return;

    // Get the movement delta
    const [x, y] = getMousePos(e);
    const delta = { x: prev.x - x, y: prev.y - y };
    prev = { x, y };

    // Calculate the drag offset and add this result to the object-position percentages
    const drag = {
      x: isVerticalDrag ? 0 : delta.x / imageSize.width,
      y: isVerticalDrag ? delta.y / imageSize.height : 0
    };
    objectPos = {
      x: clampAndRound(0, (objectPos.x) + drag.x, 1),
      y: clampAndRound(0, (objectPos.y) + drag.y, 1)
    };
    img.dispatchEvent(new CustomEvent<XY>('dragBannerMove', { detail: objectPos }));
  };

  const dragEnd = () => {
    if (!dragging) return;

    dragging = false;
    const detail = isVerticalDrag ? { y: objectPos.y } : { x: objectPos.x };
    img.dispatchEvent(new CustomEvent<Partial<BannerMetadataWrite>>('dragBannerEnd', { detail }));
  };

  const modKeyHeld = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const detail = draggable && (modKey === 'None' || Keymap.isModifier(e, modKey));
    img.dispatchEvent(new CustomEvent<boolean>('toggleDrag', { detail }));
  };

  // Drag listeners
  const addDragListeners = () => {
    img.addEventListener('mousedown', dragStart);
    img.addEventListener('mousemove', dragMove);
    img.addEventListener('mouseup', dragEnd);
    document.addEventListener('mouseup', dragEnd);
  };

  const removeDragListeners = () => {
    img.removeEventListener('mousedown', dragStart);
    img.removeEventListener('mousemove', dragMove);
    img.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('mouseup', dragEnd);
  };

  const toggleDragListeners = (newDraggable: boolean) => {
    draggable = newDraggable;
    if (draggable) addDragListeners();
    else removeDragListeners();
  };

  // Toggle listeners
  const addToggleListeners = () => {
    document.addEventListener('keydown', modKeyHeld);
    document.addEventListener('keyup', modKeyHeld);
  };

  const removeToggleListeners = () => {
    document.removeEventListener('keydown', modKeyHeld);
    document.removeEventListener('keyup', modKeyHeld);
  };

  const toggleToggleListeners = (newModKey: BannerDragModOption) => {
    modKey = newModKey;
    if (modKey === 'None') removeToggleListeners();
    else addToggleListeners();
  };

  if (draggable) addDragListeners();
  if (modKey !== 'None') addToggleListeners();

  return {
    update(params) {
      const {
        x,
        y,
        embed,
        lock,
        settings
      } = params;
      const newDraggable = !lock && isDraggable(embed, settings);
      if (draggable !== newDraggable) toggleDragListeners(newDraggable);
      if (modKey !== settings.modKey) toggleToggleListeners(settings.modKey);

      objectPos = { x, y };
      img.dispatchEvent(new CustomEvent<XY>('dragBannerMove', { detail: objectPos }));
    },
    destroy() {
      removeDragListeners();
      removeToggleListeners();
    }
  };
};
