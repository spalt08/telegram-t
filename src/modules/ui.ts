import { addReducer } from '../lib/teact/teactn';

addReducer('setIsUiReady', (global, actions, payload) => {
  const { isUiReady } = payload!;

  return {
    ...global,
    isUiReady,
  };
});

addReducer('toggleRightColumn', (global) => {
  return {
    ...global,
    showRightColumn: !global.showRightColumn,
  };
});
