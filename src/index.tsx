import './util/handleError';
import './util/setupServiceWorker';

import React, { getDispatch, getGlobal } from './lib/teact/teactn';
import TeactDOM from './lib/teact/teact-dom';

import './global';

import App from './App';

import './styles/index.scss';

getDispatch().init();

TeactDOM.render(
  <App />,
  document.getElementById('root'),
);

document.addEventListener('dblclick', () => {
  // eslint-disable-next-line no-console
  console.log('GLOBAL STATE', getGlobal());
});
