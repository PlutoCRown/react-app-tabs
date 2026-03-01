export function ensureItemVisible(container: HTMLDivElement | null, item: HTMLElement | null) {
  if (!container || !item) {
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const epsilon = 1;
  const fullyVisible =
    itemRect.left >= containerRect.left + epsilon &&
    itemRect.right <= containerRect.right - epsilon;
  if (fullyVisible) {
    return;
  }

  if (itemRect.left < containerRect.left) {
    const delta = itemRect.left - containerRect.left;
    container.scrollTo({ left: container.scrollLeft + delta, behavior: 'smooth' });
    return;
  }

  if (itemRect.right > containerRect.right) {
    const delta = itemRect.right - containerRect.right;
    container.scrollTo({ left: container.scrollLeft + delta, behavior: 'smooth' });
  }
}
