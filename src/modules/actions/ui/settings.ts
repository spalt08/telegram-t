import { addReducer } from '../../../lib/teact/teactn';
import { ISettings } from '../../../types';

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
