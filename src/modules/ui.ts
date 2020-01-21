import { addReducer } from '../lib/teact/teactn';

addReducer('toggleRightColumn', (global) => {
  return {
    ...global,
    showRightColumn: !global.showRightColumn,
  };
});
