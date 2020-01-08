import React, { getDispatch, getGlobal } from './lib/teactn';
import TeactDOM from './lib/teact-dom';

import './store';
import './modules';
import { preloadSpinners } from './util/image';

import App from './App';

import './styles/index.scss';

getDispatch().init();

TeactDOM.render(
  <App />,
  document.getElementById('root'),
);

void preloadSpinners();

document.addEventListener('dblclick', () => {
  // eslint-disable-next-line no-console
  console.log('GLOBAL STATE', getGlobal());
});
