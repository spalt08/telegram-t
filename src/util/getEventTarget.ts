export default function getEventTarget(event: React.MouseEvent<any, MouseEvent>, tag: string) {
  const initialTarget = event.target as HTMLElement;
  if (initialTarget.tagName === tag) {
    return initialTarget;
  }

  let intendedTarget = initialTarget.parentNode as HTMLElement | null;
  while (intendedTarget && intendedTarget.tagName !== tag) {
    intendedTarget = intendedTarget.parentNode as HTMLElement | null;
  }

  return intendedTarget;
}
