import { WebpMachine as TWebpMachine, PolyfillDocumentOptions as TPolyfillDocumentOptions } from 'webp-hero';

import { DEBUG } from '../config';
import { isWebpSupported } from './environment';

type WebpHero = typeof import('webp-hero');

let wepbHeroPromise: Promise<WebpHero>;
let webpHero: TWebpMachine;

export default async (params: TPolyfillDocumentOptions) => {
  if (isWebpSupported()) {
    return;
  }

  if (!webpHero) {
    await ensureWebpHero();
  }

  await exec(params);
};

async function ensureWebpHero() {
  if (!wepbHeroPromise) {
    wepbHeroPromise = import('webp-hero/dist/webp-machine') as unknown as Promise<WebpHero>;
    const { WebpMachine } = await wepbHeroPromise;

    webpHero = new WebpMachine({
      detectWebpImage: (imgEl) => {
        return /(^blob:http|webp;base64|\.webp.*$)/i.test(imgEl.src);
      },
      detectWebpBackground: (el) => {
        return /url\([^/\w]*(blob|\/webp;)/i.test(el.style.backgroundImage || '');
      },
    });
  }

  return wepbHeroPromise;
}

async function exec(params: TPolyfillDocumentOptions) {
  try {
    await webpHero.polyfillDocument(params);
  } catch (err) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}
