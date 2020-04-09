import React, { FC } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalState } from '../../global/types';

import UiLoader from '../common/UiLoader';
import AuthPhoneNumber from './AuthPhoneNumber';
import AuthCode from './AuthCode.async';
import AuthPassword from './AuthPassword.async';
import AuthRegister from './AuthRegister.async';

import './Auth.scss';

type StateProps = Pick<GlobalState, 'authState'>;

const Auth: FC<StateProps> = ({ authState }) => {
  switch (authState) {
    case 'authorizationStateWaitCode':
      return <UiLoader page="authCode" key="authCode"><AuthCode /></UiLoader>;
    case 'authorizationStateWaitPassword':
      return <UiLoader page="authPassword" key="authPassword"><AuthPassword /></UiLoader>;
    case 'authorizationStateWaitRegistration':
      return <AuthRegister />;
    case 'authorizationStateWaitPhoneNumber':
    default:
      return <UiLoader page="authPhoneNumber" key="authPhoneNumber"><AuthPhoneNumber /></UiLoader>;
  }
};

export default withGlobal(
  (global): StateProps => {
    const { authState } = global;
    return { authState };
  },
)(Auth);
