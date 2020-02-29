export default function trapFocus(element: HTMLElement) {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const focusableElements = Array.from(
      element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
    ) as HTMLElement[];
    if (!focusableElements.length) {
      return;
    }

    const currentFocusedIndex = focusableElements.findIndex((em) => em.isSameNode(document.activeElement));
    let newFocusedIndex = 0;
    if (currentFocusedIndex >= 0) {
      if (e.shiftKey) {
        newFocusedIndex = currentFocusedIndex > 0
          ? currentFocusedIndex - 1
          : focusableElements.length - 1;
      } else {
        newFocusedIndex = currentFocusedIndex < focusableElements.length - 1
          ? currentFocusedIndex + 1
          : 0;
      }
    }

    focusableElements[newFocusedIndex].focus();
  }

  element.addEventListener('keydown', handleKeyDown, false);

  return () => {
    element.removeEventListener('keydown', handleKeyDown, false);
  };
}
