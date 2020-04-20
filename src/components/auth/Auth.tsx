import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../../global/types';

import '../../modules/actions/initial';

import UiLoader from '../common/UiLoader';
import AuthPhoneNumber from './AuthPhoneNumber';
import AuthCode from './AuthCode.async';
import AuthPassword from './AuthPassword.async';
import AuthRegister from './AuthRegister.async';

import './Auth.scss';
import { pick } from '../../util/iteratees';

type StateProps = Pick<GlobalState, 'authState'>;
type DispatchProps = Pick<GlobalActions, 'initApi'>;

const Auth: FC<StateProps & DispatchProps> = ({ authState, initApi }) => {
  useEffect(() => {
    initApi();

    document.body.classList.add('scrollable');

    return () => {
      document.body.classList.remove('scrollable');
    };
  }, [initApi]);

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
  (global): StateProps => pick(global, ['authState']),
  (global, actions): DispatchProps => pick(actions, ['initApi']),
)(Auth);
