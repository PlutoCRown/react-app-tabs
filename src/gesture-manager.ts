import type React from 'react';

type GestureCandidate = {
  id: number;
  name: string;
  layer: number;
  canHandle: (dx: number, dy: number) => { accept: boolean; reason: string };
  onStart?: () => void;
  onMove: (dx: number, dy: number) => void;
  onEnd: (dx: number, dy: number) => void;
};

type GestureSession = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  candidates: Map<number, GestureCandidate>;
  ownerId: number | null;
  ownerBaseDx: number;
  ownerBaseDy: number;
};

let session: GestureSession | null = null;
let attached = false;

function getOwnerCandidate() {
  if (!session || session.ownerId === null) {
    return null;
  }
  return session.candidates.get(session.ownerId) ?? null;
}

function pickOwner(dx: number, dy: number) {
  if (!session) {
    return { owner: null as GestureCandidate | null, flow: [] as string[] };
  }

  let picked: GestureCandidate | null = null;
  const flow: string[] = [];
  const candidates = [...session.candidates.values()].sort((a, b) => b.layer - a.layer);

  for (const candidate of candidates) {
    const decision = candidate.canHandle(dx, dy);
    if (!decision.accept) {
      flow.push(`触碰事件交给${candidate.name}，拒绝接管（${decision.reason}）`);
      continue;
    }
    if (!picked) {
      picked = candidate;
      flow.push(`触碰事件交给${candidate.name}，同意接管（${decision.reason}）`);
    } else {
      flow.push(`触碰事件交给${candidate.name}，同意接管但层级较低（${decision.reason}）`);
    }
  }

  return { owner: picked, flow };
}

function assignOwner(nextOwner: GestureCandidate | null, dx: number, dy: number) {
  if (!session) {
    return;
  }

  const currentOwner = getOwnerCandidate();
  if (currentOwner?.id === nextOwner?.id) {
    return;
  }

  if (!nextOwner) {
    session.ownerId = null;
    session.ownerBaseDx = 0;
    session.ownerBaseDy = 0;
    return;
  }

  session.ownerId = nextOwner.id;
  session.ownerBaseDx = dx;
  session.ownerBaseDy = dy;
  nextOwner.onStart?.();
}

function dispatchMove(point: { x: number; y: number }) {
  if (!session) {
    return;
  }

  session.currentX = point.x;
  session.currentY = point.y;

  const dx = point.x - session.startX;
  const dy = point.y - session.startY;
  const { owner: nextOwner, flow } = pickOwner(dx, dy);
  assignOwner(nextOwner, dx, dy);
  if (flow.length > 0) {
    console.log('[react-app-tabs][manager] 手势决策', {
      flow,
      result: nextOwner ? `${nextOwner.name} 接管` : '无组件接管',
    });
  }

  const owner = getOwnerCandidate();
  if (!owner) {
    return;
  }
  owner.onMove(dx - session.ownerBaseDx, dy - session.ownerBaseDy);
}

function dispatchEnd() {
  if (!session) {
    return;
  }

  const dx = session.currentX - session.startX;
  const dy = session.currentY - session.startY;
  const owner = getOwnerCandidate();
  if (owner) {
    owner.onEnd(dx - session.ownerBaseDx, dy - session.ownerBaseDy);
  }

  session = null;
}

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

export const gestureManager = {
  ensureListeners() {
    if (attached || typeof document === 'undefined') {
      return;
    }

    const handleMove = (event: MouseEvent | TouchEvent) => {
      const point = getClientPoint(event);
      if (!point) {
        return;
      }
      dispatchMove(point);
    };

    const handleEnd = () => {
      dispatchEnd();
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
    attached = true;
  },

  registerCandidate(
    event: React.MouseEvent | React.TouchEvent,
    candidate: GestureCandidate,
  ) {
    const point = getClientPoint(event);
    if (!point) {
      return;
    }

    if (!session) {
      session = {
        startX: point.x,
        startY: point.y,
        currentX: point.x,
        currentY: point.y,
        candidates: new Map(),
        ownerId: null,
        ownerBaseDx: 0,
        ownerBaseDy: 0,
      };
    }

    session.candidates.set(candidate.id, candidate);
  },

  maybeEnd(id: number) {
    if (!session || session.ownerId !== id) {
      return;
    }
    dispatchEnd();
  },
};
