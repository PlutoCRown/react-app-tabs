import type { TabDirection } from './types';

export function clampIndex(index: number, size: number) {
  if (size <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(size - 1, index));
}

export function getBarFlexDirection(direction: TabDirection) {
  if (direction === 'left' || direction === 'right') {
    return 'column';
  }
  return 'row';
}

export function getRootFlexDirection(direction: TabDirection) {
  if (direction === 'top') {
    return 'column';
  }
  if (direction === 'bottom') {
    return 'column-reverse';
  }
  if (direction === 'left') {
    return 'row';
  }
  return 'row-reverse';
}

export function joinClassNames(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ');
}
