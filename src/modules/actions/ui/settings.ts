import { addReducer } from '../../../lib/teact/teactn';
import { ISettings } from '../../../types';

import { ANIMATION_SETTINGS_VIEWED_KEY } from '../../../config';

addReducer('init', (global) => {
  const { animationLevel } = global.settings.byKey;

  if (animationLevel !== undefined) {
    document.body.classList.add(`animation-level-${animationLevel}`);
  }
});

addReducer('setSettingOption', (global, actions, payload?: Partial<ISettings>) => {
  return {
    ...global,
    settings: {
      ...global.settings,
      byKey: {
        ...global.settings.byKey,
        ...payload,
      },
    },
  };
});

addReducer('clearAnimationSettingAttention', (global) => {
  localStorage.setItem(ANIMATION_SETTINGS_VIEWED_KEY, 'true');

  return {
    ...global,
    settings: {
      ...global.settings,
      isAnimationLevelSettingViewed: true,
    },
  };
});
