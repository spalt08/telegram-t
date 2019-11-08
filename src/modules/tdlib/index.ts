import { addReducer, GlobalState } from '../../lib/teactn';

import * as TdLib from '../../api/tdlib';

import onUpdate from './updaters';
import './actions';
import './helpers';
import './selectors';

addReducer('init', (global: GlobalState) => {
  TdLib.init(onUpdate);

  return {
    ...global,
    isInitialized: true,
  };
});
