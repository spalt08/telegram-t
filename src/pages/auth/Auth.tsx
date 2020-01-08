import React, { FC } from '../../lib/teact';
import { withGlobal } from '../../lib/teactn';

import { GlobalState } from '../../store/types';

import { preloadMonkeys } from '../../util/monkeys';

import AuthPhoneNumber from './components/AuthPhoneNumber';
import AuthCode from './components/AuthCode';
import AuthRegister from './components/AuthRegister';
import AuthPassword from './components/AuthPassword';

type IProps = Pick<GlobalState, 'authState'>;

let areMonkeysPreloaded = false;

const Auth: FC<IProps> = ({ authState }) => {
  if (!areMonkeysPreloaded) {
    void preloadMonkeys();
    areMonkeysPreloaded = true;
  }

  switch (authState) {
    case 'authorizationStateWaitCode':
      return <AuthCode />;
    case 'authorizationStateWaitPassword':
      return <AuthPassword />;
    case 'authorizationStateWaitRegistration':
      return <AuthRegister />;
    case 'authorizationStateWaitPhoneNumber':
    default:
      return <AuthPhoneNumber />;
  }
};

export default withGlobal(
  global => {
    const { authState } = global;
    return { authState };
  },
)(Auth);
