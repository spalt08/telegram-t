import React, { withGlobal } from '../../lib/teact/teactn';
import { GlobalState } from '../../global/types';
import SubTest from './SubTest';
import { FC } from '../../lib/teact/teact';

type StateProps = Pick<GlobalState, 'authState'> & {
  rand: string;
};

const Test: FC<StateProps> = ({ authState, rand }) => {
  // eslint-disable-next-line no-console
  console.log('rendering TEST', authState, rand);

  return <SubTest authState={authState} rand={rand} />;
};

export default withGlobal(
  (global): StateProps => {
    return {
      authState: global.authState,
      rand: Math.random().toString(),
    };
  },
)(Test);
