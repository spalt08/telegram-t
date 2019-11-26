export function getElementIndex(element: HTMLElement) {
  let node: Element | null = element;
  let index = 0;
  while (node) {
    node = node.previousElementSibling;
    if (node) {
      index++;
    }
  }
  return index;
}
