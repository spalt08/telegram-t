export default function findInViewport(
  container: HTMLElement,
  selector: string,
  margin = 0,
  isDense = false,
  shouldContainFully = false,
) {
  const viewportY1 = container.scrollTop;
  const viewportY2 = viewportY1 + container.offsetHeight;
  const allElements = container.querySelectorAll<HTMLElement>(selector);
  const { length } = allElements;
  const visibleIndexes: number[] = [];
  let isFound = false;

  for (let i = 0; i < length; i++) {
    const element = allElements[i];
    const y1 = element.offsetTop;
    const y2 = y1 + element.offsetHeight;
    const isVisible = shouldContainFully
      ? y1 >= viewportY1 - margin && y2 <= viewportY2 + margin
      : y1 <= viewportY2 + margin && y2 >= viewportY1 - margin;

    if (isVisible) {
      visibleIndexes.push(i);
      isFound = true;
    } else if (isFound && !isDense) {
      break;
    }
  }

  return { allElements, visibleIndexes };
}
