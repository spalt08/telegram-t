import { getDispatch } from '../lib/teact/teactn';

import { DEBUG } from '../config';

export { default as Main } from '../components/Main';

if (DEBUG) {
  // eslint-disable-next-line no-console
  console.log('>>> START INIT API');
}

getDispatch().initApi();
