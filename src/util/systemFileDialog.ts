export function openSystemFileDialog(accept = '*', callback: (e: Event) => void) {
  const fileSelector = document.createElement('input');
  fileSelector.setAttribute('type', 'file');
  fileSelector.setAttribute('accept', accept);
  fileSelector.onchange = callback;

  fileSelector.click();
}
