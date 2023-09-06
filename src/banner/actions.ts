/* eslint-disable import/no-duplicates */
import type { Action } from 'svelte/action';

type MTEvent = MouseEvent | TouchEvent;

export interface XY { x: number; y: number }
export interface DragParams extends XY { draggable: boolean }

interface DragAttributes {
  'on:dragBannerStart': (e: CustomEvent) => void;
  'on:dragBannerMove': (e: CustomEvent<XY>) => void;
  'on:dragBannerEnd': (e: CustomEvent<Partial<BannerMetadata>>) => void;
}

type DragBannerAction = Action<HTMLImageElement, DragParams, DragAttributes>;

// Clamp a value if needed, otherwise round it to 3 decimals
const clampAndRound = (min: number, value: number, max: number) => {
  if (value > max) return max;
  if (value < min) return min;
  return Math.round(value * 1000) / 1000;
};

const getMousePos = (e: MTEvent): [number, number] => {
  const { clientX, clientY } = (e instanceof MouseEvent) ? e : e.targetTouches[0];
  return [clientX, clientY];
};

// TODO: Reimplement drag modifer setting
// TODO: Reimplement experimental touch dragging
// TODO: Implement experimental dragging for embeds
// Svelte action for banner dragging
export const dragBanner: DragBannerAction = (img, { x, y, draggable: _draggable }) => {
  let draggable = _draggable;
  let dragging = false;
  let isVerticalDrag = false;
  let imageSize = { width: 0, height: 0 };
  let prev = { x: 0, y: 0 };
  let objectPos = { x, y };

  const dragStart = (e: MTEvent) => {
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
    img.dispatchEvent(new CustomEvent<Partial<BannerMetadata>>('dragBannerEnd', { detail }));
  };

  const addListeners = () => {
    img.addEventListener('mousedown', dragStart);
    img.addEventListener('mousemove', dragMove);
    img.addEventListener('mouseup', dragEnd);
    document.addEventListener('mouseup', dragEnd);
    draggable = true;
  };

  const removeListeners = () => {
    img.removeEventListener('mousedown', dragStart);
    img.removeEventListener('mousemove', dragMove);
    img.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('mouseup', dragEnd);
    draggable = false;
  };

  if (draggable) {
    addListeners();
  }

  return {
    update({ x, y, draggable: _draggable }) {
      if (draggable !== _draggable) {
        if (_draggable) {
          addListeners();
        } else {
          removeListeners();
        }
      }
      objectPos = { x, y };
      img.dispatchEvent(new CustomEvent<XY>('dragBannerMove', { detail: objectPos }));
    },
    destroy() {
      removeListeners();
    }
  };
};
