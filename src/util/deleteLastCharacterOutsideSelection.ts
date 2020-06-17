export default function deleteLastCharacterOutsideSelection(html: string) {
  const tempInput = document.createElement('input');
  tempInput.style.position = 'absolute';
  tempInput.style.left = '-10000px';
  tempInput.style.top = '-10000px';
  tempInput.innerHTML = html;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('delete', false);

  const result = tempInput.innerHTML;
  document.body.removeChild(tempInput);

  return result;
}
