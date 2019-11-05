import React, { FC } from '../../lib/reactt';
import { GlobalState, withGlobal } from '../../lib/reactnt';

import AuthPhoneNumber from './components/AuthPhoneNumber';
import AuthCode from './components/AuthCode';

type IProps = Pick<GlobalState, 'authState'>

const Auth: FC<IProps> = ({ authState }) => {
  switch (authState) {
    case 'authorizationStateWaitCode':
      return <AuthCode />;
    case 'authorizationStateWaitPassword':
      // TODO Add password support.
      return <div>NO PASSWORD SUPPORT</div>;
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
