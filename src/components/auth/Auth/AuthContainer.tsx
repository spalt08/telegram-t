import { addReducer, withGlobal, GlobalState } from '../../../lib/reactnt';

import Auth from './Auth';

addReducer('signIn', (state: GlobalState) => {
  console.log('START SIGN IN');

  return ({
    ...state,
    isInitialized: true,
  });
});

addReducer('signOut', (state: GlobalState) => {
  console.log('START SIGN OUT');

  return ({
    ...state,
    isInitialized: false,
  });
});

const AuthContainer = withGlobal(
  global => {
    const { isInitialized } = global;
    return { isInitialized };
  },
  (setGlobal, dispatch) => ({
    signIn: () => {
      dispatch.signIn();
    },
    signOut: () => {
      dispatch.signOut();
    },
  }),
)(Auth);

export default AuthContainer;
