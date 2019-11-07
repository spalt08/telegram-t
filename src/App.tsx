import { FC } from './lib/teact';
import React, { DispatchMap, GlobalState, withGlobal } from './lib/teactn';

import './modules';

import Loading from './components/Loading';
import Auth from './pages/auth/Auth';
import Main from './pages/main/Main';
import Test from './pages/test/Test';

type IProps = Pick<GlobalState, 'isInitialized' | 'authState'> & Pick<DispatchMap, 'init'>

const App: FC<IProps> = ({ isInitialized, authState, init }) => {
  console.log('APP RE-RENDER', authState);

  // return <Test />;

  if (!isInitialized) {
    init();
  }

  if (authState) {
    switch (authState) {
      case 'authorizationStateWaitCode':
      case 'authorizationStateWaitPassword':
      case 'authorizationStateWaitPhoneNumber':
        return <Auth />;
      case 'authorizationStateClosed':
      case 'authorizationStateClosing':
      case 'authorizationStateLoggingOut':
      case 'authorizationStateReady':
        return <Main />;
    }
  }

  return <Loading />;
};

export default withGlobal(
  global => {
    const { isInitialized, authState } = global;
    return { isInitialized, authState };
  },
  (setGlobal, actions) => {
    const { init } = actions;
    return { init };
  },
)(App);

