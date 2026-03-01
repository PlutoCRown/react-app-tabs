import type React from 'react';

type GestureSession = {
  id: number;
  layer: number;
  onMove: (dx: number, dy: number) => void;
  onEnd: (dx: number, dy: number) => void;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

export function getClientPoint(
  event: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent,
) {
  if ('touches' in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) {
      return null;
    }
    return { x: touch.clientX, y: touch.clientY };
  }
  return { x: event.clientX, y: event.clientY };
}

export const gestureManager = (() => {
  let current: GestureSession | null = null;
  let attached = false;

  const handleMove = (event: MouseEvent | TouchEvent) => {
    if (!current) {
      return;
    }
    const point = getClientPoint(event);
    if (!point) {
      return;
    }
    current.currentX = point.x;
    current.currentY = point.y;
    current.onMove(point.x - current.startX, point.y - current.startY);
  };

  const handleEnd = () => {
    if (!current) {
      return;
    }
    const dx = current.currentX - current.startX;
    const dy = current.currentY - current.startY;
    current.onEnd(dx, dy);
    current = null;
  };

  return {
    ensureListeners() {
      if (attached || typeof document === 'undefined') {
        return;
      }
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('touchmove', handleMove, { passive: true });
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
      document.addEventListener('touchcancel', handleEnd);
      attached = true;
    },
    start(session: GestureSession) {
      if (!current || session.layer > current.layer) {
        current = session;
      }
    },
    maybeEnd(id: number) {
      if (!current || current.id !== id) {
        return;
      }
      const dx = current.currentX - current.startX;
      const dy = current.currentY - current.startY;
      current.onEnd(dx, dy);
      current = null;
    },
  };
})();
