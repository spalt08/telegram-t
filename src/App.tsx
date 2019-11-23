import { FC } from './lib/teact';
import React, { withGlobal } from './lib/teactn';

import { GlobalState } from './store/types';
import Auth from './pages/auth/Auth';
import Main from './pages/main/Main';
// import Test from './pages/test/Test';

type IProps = Pick<GlobalState, 'authState' | 'authIsSessionRemembered'>;

const App: FC<IProps> = ({ authState, authIsSessionRemembered }) => {
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
        return <Main />;
    }
  }

  return authIsSessionRemembered ? <Main /> : <Auth />;
};

export default withGlobal(
  global => {
    const { authState, authIsSessionRemembered } = global;
    return { authState, authIsSessionRemembered };
  },
)(App);
