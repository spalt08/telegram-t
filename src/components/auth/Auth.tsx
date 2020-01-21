import React, { FC } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState } from '../../store/types';

import { preloadMonkeys } from '../../util/monkeys';

import AuthPhoneNumber from './AuthPhoneNumber';
import AuthCode from './AuthCode';
import AuthRegister from './AuthRegister';
import AuthPassword from './AuthPassword';

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
