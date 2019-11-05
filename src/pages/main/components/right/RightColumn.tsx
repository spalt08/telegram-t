import React, { FC } from '../../../../lib/reactt';
import { DispatchMap, GlobalState, withGlobal } from '../../../../lib/reactnt';

import Button from '../../../../components/ui/Button';

type IProps = Pick<DispatchMap, 'signOut'>

function onSignOut(signOut: Function) {
  if (confirm('Are you sure?')) {
    signOut();
  }
}

const RightColumn: FC<IProps> = ({ signOut }) => {
  return (
    <div>
      Right Column
      <br />
      <br />
      <Button onClick={() => onSignOut(signOut)}>Sign Out</Button>
    </div>
  );
};

export default withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { signOut } = actions;
    return { signOut };
  },
)(RightColumn);
