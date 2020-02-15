const VIEWPORT_MARGIN = 100;

export default function determineVisibleSymbolSet(container: HTMLElement) {
  const allElements = container.querySelectorAll('.symbol-set');
  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;

  const firstVisibleElement = Array.from(allElements).find((el) => {
    const currentTop = (el as HTMLElement).offsetTop;
    const currentBottom = currentTop + (el as HTMLElement).offsetHeight;
    return currentTop <= containerBottom - VIEWPORT_MARGIN && currentBottom >= containerTop + VIEWPORT_MARGIN;
  });

  if (!firstVisibleElement) {
    return undefined;
  }

  const n = firstVisibleElement.id.lastIndexOf('-');
  return firstVisibleElement.id.substring(n + 1);
}
