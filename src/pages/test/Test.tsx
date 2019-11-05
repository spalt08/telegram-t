import React, { GlobalState, withGlobal } from '../../lib/reactnt';
import SubTest from './SubTest';
import { FC } from '../../lib/reactt';

type IProps = Pick<GlobalState, 'authState'> & {
  rand: string;
}

const Test: FC<IProps> = ({ authState, rand }) => {
  console.log('rendering TEST', authState, rand);

  return <SubTest authState={authState} rand={rand} />;
};

// TODO Avoid multiple re-render for containers.
export default withGlobal(
  global => {
    return {
      authState: global.authState,
      rand: Math.random(),
    };
  },
)(Test);
