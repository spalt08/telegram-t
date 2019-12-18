import React, { withGlobal } from '../../lib/teactn';
import { GlobalState } from '../../store/types';
import SubTest from './SubTest';
import { FC } from '../../lib/teact';

type IProps = Pick<GlobalState, 'authState'> & {
  rand: string;
};

const Test: FC<IProps> = ({ authState, rand }) => {
  // eslint-disable-next-line no-console
  console.log('rendering TEST', authState, rand);

  return <SubTest authState={authState} rand={rand} />;
};

export default withGlobal(
  global => {
    return {
      authState: global.authState,
      rand: Math.random(),
    };
  },
)(Test);
