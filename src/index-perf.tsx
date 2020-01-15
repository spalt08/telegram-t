import React, { getGlobal, setGlobal } from './lib/teactn';
import TeactDOM from './lib/teact-dom';

// import './store';
import './modules';

import App from './App';

import './styles/index.scss';

function renderApp() {
  return TeactDOM.render(
    <App />,
    document.getElementById('root'),
  );
}

function renderNothing() {
  TeactDOM.render(
    <div />,
    document.getElementById('root'),
  );
}

// getDispatch().init();
// renderApp();

(window as any).perf = {
  getGlobal,
  setGlobal,
  renderApp,
  renderNothing,
};
