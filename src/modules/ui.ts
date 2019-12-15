import { addReducer } from '../lib/teactn';

addReducer('toggleRightColumn', (global) => {
  return {
    ...global,
    showRightColumn: !global.showRightColumn,
  };
});
