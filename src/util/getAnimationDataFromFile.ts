import { DEBUG } from '../config';

let pako: typeof import('pako/dist/pako_inflate');

export default async function getAnimationDataFromFile(path: string) {
  if (!pako) {
    pako = await import('pako/dist/pako_inflate');
  }

  const file = await fetch(path);
  const buffer = await file.arrayBuffer();

  let animationData: any;
  try {
    animationData = JSON.parse(pako.inflate(buffer, { to: 'string' }));
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    animationData = undefined;
  }
  return animationData;
}
