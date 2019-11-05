import React, { getGlobal, setGlobal } from './lib/reactnt';
import ReacttDOM from './lib/reactt-dom';

import App from './App';
import './global.scss';

ReacttDOM.render(
  <App />,
  document.getElementById('root'),
);

document.addEventListener('dblclick', () => {
  console.log('GLOBAL STATE', getGlobal());
});

document.addEventListener('contextmenu', () => {
  setGlobal({
    ...getGlobal(),
    authState: 'authorizationStateReady',
  });
});
