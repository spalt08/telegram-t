export default function (el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight;
}
