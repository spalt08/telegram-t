// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import monkeyPaths from '../assets/TwoFactorSetup*.tgs';

const cache: Record<string, AnyLiteral> = {};

let pako: typeof import('../../../lib/pako_inflate');
let lottie: typeof import('lottie-web/build/player/lottie_light').default;

export default async function getMonkeyAnimationData(name: string) {
  if (!cache[name]) {
    if (!pako || !lottie) {
      await preloadLibs();
    }

    const file = await fetch(monkeyPaths[name]);
    const buffer = await file.arrayBuffer();
    const json = pako.inflate(buffer, { to: 'string' });
    cache[name] = JSON.parse(json);
  }

  return cache[name];
}

async function preloadLibs() {
  const [loadedPako, loadedLottie] = await Promise.all([
    (pako || import('../../../lib/pako_inflate')),
    (lottie || import('lottie-web/build/player/lottie_light')),
  ]);

  pako = loadedPako;
  lottie = loadedLottie;
}
