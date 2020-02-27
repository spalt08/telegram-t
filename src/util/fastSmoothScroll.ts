export default (
  container: HTMLElement, element: HTMLElement, position: ScrollLogicalPosition, maxDistance = 2000,
) => {
  const offset = element.offsetTop - container.scrollTop;
  if (offset < -maxDistance) {
    container.scrollTop += (offset + maxDistance);
  } else if (offset > maxDistance) {
    container.scrollTop += (offset - maxDistance);
  }

  // TODO Re-implement to be `ease-out`.
  element.scrollIntoView({
    behavior: 'smooth',
    block: position,
  });
};
