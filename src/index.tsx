import React, { getGlobal } from './lib/teactn';
import TeactDOM from './lib/teact-dom';

import App from './App';
import './styles/index.scss';

TeactDOM.render(
  <App />,
  document.getElementById('root'),
);

document.addEventListener('dblclick', () => {
  console.log('GLOBAL STATE', getGlobal());
});
