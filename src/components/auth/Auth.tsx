import React, { FC } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState } from '../../store/types';

import UiLoader from '../common/UiLoader';
import AuthPhoneNumber from './AuthPhoneNumber';
import AuthCode from './AuthCode';
import AuthRegister from './AuthRegister';
import AuthPassword from './AuthPassword';

import './Auth.scss';

type IProps = Pick<GlobalState, 'authState'>;

const Auth: FC<IProps> = ({ authState }) => {
  switch (authState) {
    case 'authorizationStateWaitCode':
      return <AuthCode />;
    case 'authorizationStateWaitPassword':
      return <AuthPassword />;
    case 'authorizationStateWaitRegistration':
      return <AuthRegister />;
    case 'authorizationStateWaitPhoneNumber':
    default:
      return <UiLoader page="authPhoneNumber" key="authPhoneNumber"><AuthPhoneNumber /></UiLoader>;
  }
};

export default withGlobal(
  global => {
    const { authState } = global;
    return { authState };
  },
)(Auth);
