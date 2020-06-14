let fileSelector: HTMLInputElement;

export function openSystemFilesDialog(accept = '*', callback: (e: Event) => void) {
  if (!fileSelector) {
    fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.multiple = true;
  }

  fileSelector.setAttribute('accept', accept);

  fileSelector.onchange = null;
  fileSelector.value = '';
  fileSelector.onchange = callback;

  fileSelector.click();
}
