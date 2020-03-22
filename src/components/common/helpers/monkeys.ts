// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import monkeyPaths from '../../../assets/TwoFactorSetup*.tgs';

import { ApiMediaFormat } from '../../../api/types';

import * as mediaLoader from '../../../util/mediaLoader';

type Lottie = typeof import('lottie-web/build/player/lottie_light').default;
let lottiePromise: Promise<Lottie>;

function ensureLottie() {
  if (!lottiePromise) {
    lottiePromise = import('lottie-web/build/player/lottie_light') as unknown as Promise<Lottie>;
  }

  return lottiePromise;
}

export default async function getMonkeyAnimationData(name: string) {
  const [animationData] = await Promise.all([
    mediaLoader.fetch(`file${monkeyPaths[name]}`, ApiMediaFormat.Lottie),
    ensureLottie(),
  ]);

  return animationData;
}
