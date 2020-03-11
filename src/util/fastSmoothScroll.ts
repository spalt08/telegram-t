import { FocusDirection } from '../types';

export default (
  container: HTMLElement,
  element: HTMLElement,
  position: ScrollLogicalPosition,
  maxDistance = 2000,
  forceDirection?: FocusDirection,
) => {
  if (forceDirection === FocusDirection.Static) {
    element.scrollIntoView({ block: position });

    return;
  }

  const { offsetTop } = element;

  if (forceDirection === undefined) {
    const offset = offsetTop - container.scrollTop;

    if (offset < -maxDistance) {
      container.scrollTop += (offset + maxDistance);
    } else if (offset > maxDistance) {
      container.scrollTop += (offset - maxDistance);
    }
  } else if (forceDirection === FocusDirection.Up) {
    container.scrollTop = offsetTop + maxDistance;
  } else if (forceDirection === FocusDirection.Down) {
    container.scrollTop = Math.max(0, offsetTop - maxDistance);
  }

  // TODO Re-implement to be `ease-out`.
  element.scrollIntoView({
    behavior: 'smooth',
    block: position,
  });
};
