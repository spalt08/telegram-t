import { ApiMediaFormat } from '../../../api/types';

import * as mediaLoader from '../../../util/mediaLoader';

// @ts-ignore
import MonkeyIdle from '../../../assets/TwoFactorSetupMonkeyIdle.tgs';
// @ts-ignore
import MonkeyTracking from '../../../assets/TwoFactorSetupMonkeyTracking.tgs';
// @ts-ignore
import MonkeyClose from '../../../assets/TwoFactorSetupMonkeyClose.tgs';
// @ts-ignore
import MonkeyPeek from '../../../assets/TwoFactorSetupMonkeyPeek.tgs';

const MONKEY_PATHS = {
  MonkeyIdle,
  MonkeyTracking,
  MonkeyClose,
  MonkeyPeek,
};

type Lottie = typeof import('lottie-web/build/player/lottie_light').default;
let lottiePromise: Promise<Lottie>;

function ensureLottie() {
  if (!lottiePromise) {
    lottiePromise = import('lottie-web/build/player/lottie_light') as unknown as Promise<Lottie>;
  }

  return lottiePromise;
}

export default async function getMonkeyAnimationData(name: keyof typeof MONKEY_PATHS) {
  const path = MONKEY_PATHS[name].replace(window.location.origin, '');

  const [animationData] = await Promise.all([
    mediaLoader.fetch(`file${path}`, ApiMediaFormat.Lottie),
    ensureLottie(),
  ]);

  return animationData;
}
