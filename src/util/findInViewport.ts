export default function findInViewport(container: HTMLElement, selector: string, margin = 0, isDense = false) {
  const viewportY1 = container.scrollTop;
  const viewportY2 = viewportY1 + container.offsetHeight;
  const allElements = container.querySelectorAll(selector);
  const { length } = allElements;
  const visibleIndexes: number[] = [];
  let isFound = false;

  for (let i = 0; i < length; i++) {
    const element = allElements[i] as HTMLElement;
    const y1 = element.offsetTop;
    const y2 = y1 + element.offsetHeight;

    if (y1 <= viewportY2 + margin && y2 >= viewportY1 - margin) {
      visibleIndexes.push(i);
      isFound = true;
    } else if (isFound && !isDense) {
      break;
    }
  }

  return { allElements, visibleIndexes };
}
