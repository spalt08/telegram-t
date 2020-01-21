import { pause } from './schedulers';

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import monkeyPaths from '../assets/TwoFactorSetup*.tgs';

const cache: Record<string, AnyLiteral> = {};
let pako: typeof import('../lib/pako_inflate');

export async function preloadMonkeys(lazyTimeout = 1000) {
  await pause(lazyTimeout);

  Object
    .keys(monkeyPaths)
    .forEach(async (name) => {
      cache[name] = await getMonkeyAnimationData(name);
    });
}

export default async function getMonkeyAnimationData(name: string) {
  if (!cache[name]) {
    if (!pako) {
      pako = await import('../lib/pako_inflate');
    }

    const file = await fetch(monkeyPaths[name]);
    const buffer = await file.arrayBuffer();
    const json = pako.inflate(buffer, { to: 'string' });
    cache[name] = JSON.parse(json);
  }

  return cache[name];
}
