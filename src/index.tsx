import React, { getDispatch, getGlobal } from './lib/teactn';
import TeactDOM from './lib/teact-dom';

import './store';
import './modules';
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
