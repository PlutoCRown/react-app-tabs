import type React from 'react';

type GestureDecision = { accept: boolean; reason: string };

type GestureCandidate = {
  id: string | number;
  name: string;
  layer: number;
  canHandle: (dx: number, dy: number) => GestureDecision;
  onStart?: () => void;
  onMove: (dx: number, dy: number, requestRepick: () => void) => void;
  onEnd: (dx: number, dy: number) => void;
};

type RegisteredInnerScroll = {
  id: string;
  name: string;
  layer: number;
  getElement: () => HTMLElement | null;
  shouldAllowParentSwipe: (dx: number, dy: number) => boolean;
};

type GestureSession = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTarget: Element | null;
  candidates: Map<string | number, GestureCandidate>;
  ownerId: string | number | null;
  ownerBaseDx: number;
  ownerBaseDy: number;
  repickRequested: boolean;
};

let session: GestureSession | null = null;
let attached = false;
const innerScrollRegistry = new Map<string, RegisteredInnerScroll>();

function getOwnerCandidate() {
  if (!session || session.ownerId === null) {
    return null;
  }
  return session.candidates.get(session.ownerId) ?? null;
}

function registerInnerScrollCandidatesForTarget(target: Element | null) {
  if (!session || !target) {
    return;
  }
  let node: Element | null = target;
  while (node) {
    const id = node.getAttribute('data-tab-inner-scroll-id');
    if (id) {
      const entry = innerScrollRegistry.get(id);
      if (entry) {
        const element = entry.getElement();
        if (element === node) {
          const candidateId = `inner:${id}`;
          if (!session.candidates.has(candidateId)) {
            session.candidates.set(candidateId, {
              id: candidateId,
              name: entry.name,
              layer: entry.layer + 0.5,
              canHandle: (dx, dy) => {
                const allowParent = entry.shouldAllowParentSwipe(dx, dy);
                if (allowParent) {
                  return { accept: false, reason: '已到边界' };
                }
                return { accept: true, reason: '可继续滚动' };
              },
              onMove: (_dx, _dy, _requestRepick) => {},
              onEnd: () => {},
            });
          }
        }
      }
    }
    node = node.parentElement;
  }
}

function pickOwner(dx: number, dy: number) {
  if (!session) {
    return { owner: null as GestureCandidate | null, flow: [] as string[] };
  }

  const flow: string[] = [];
  const candidates = [...session.candidates.values()].sort((a, b) => b.layer - a.layer);

  let owner: GestureCandidate | null = null;
  for (const candidate of candidates) {
    const decision = candidate.canHandle(dx, dy);
    if (!decision.accept) {
      flow.push(`触碰事件交给${candidate.name}，拒绝接管（${decision.reason}）`);
      continue;
    }

    flow.push(`触碰事件交给${candidate.name}，同意滚动（${decision.reason}）`);
    owner = candidate;
    break;
  }

  return { owner, flow };
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

  if (session.ownerId === null || session.repickRequested) {
    session.repickRequested = false;
    const { owner: nextOwner, flow } = pickOwner(dx, dy);
    assignOwner(nextOwner, dx, dy);
    if (flow.length > 0) {
      console.log('[react-app-tabs][manager] 手势决策', {
        flow,
        result: nextOwner ? `${nextOwner.name} 接管` : 'InnerScroll 接管',
      });
    }
  }

  const owner = getOwnerCandidate();
  if (!owner) {
    return;
  }

  owner.onMove(dx - session.ownerBaseDx, dy - session.ownerBaseDy, () => {
    if (!session) {
      return;
    }
    session.repickRequested = true;
  });
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

  registerCandidate(event: React.MouseEvent | React.TouchEvent, candidate: GestureCandidate) {
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
        startTarget: event.target instanceof Element ? event.target : null,
        candidates: new Map(),
        ownerId: null,
        ownerBaseDx: 0,
        ownerBaseDy: 0,
        repickRequested: false,
      };
    }

    registerInnerScrollCandidatesForTarget(event.target instanceof Element ? event.target : null);
    session.candidates.set(candidate.id, candidate);
  },

  registerInnerScroll(entry: RegisteredInnerScroll) {
    innerScrollRegistry.set(entry.id, entry);
  },

  unregisterInnerScroll(id: string) {
    innerScrollRegistry.delete(id);
  },

  maybeEnd(id: number) {
    if (!session || session.ownerId !== id) {
      return;
    }
    dispatchEnd();
  },
};
