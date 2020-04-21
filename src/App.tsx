import { FC } from './lib/teact/teact';
import React, { withGlobal } from './lib/teact/teactn';

import { GlobalState } from './global/types';

import { pick } from './util/iteratees';

import Auth from './components/auth/Auth';
import UiLoader from './components/common/UiLoader';
import Main from './components/Main.async';
// import Test from './pages/test/Test';

type StateProps = Pick<GlobalState, 'authState' | 'authIsSessionRemembered'>;

const App: FC<StateProps> = ({ authState, authIsSessionRemembered }) => {
  // return <Test />;

  if (authState) {
    switch (authState) {
      case 'authorizationStateWaitCode':
      case 'authorizationStateWaitPassword':
      case 'authorizationStateWaitRegistration':
      case 'authorizationStateWaitPhoneNumber':
        return <Auth />;
      case 'authorizationStateClosed':
      case 'authorizationStateClosing':
      case 'authorizationStateLoggingOut':
      case 'authorizationStateReady':
        return renderMain();
    }
  }

  return authIsSessionRemembered ? renderMain() : <Auth />;
};

function renderMain() {
  return (
    <UiLoader page="main" key="main">
      <Main />
    </UiLoader>
  );
}

export default withGlobal(
  (global): StateProps => pick(global, ['authState', 'authIsSessionRemembered']),
)(App);
