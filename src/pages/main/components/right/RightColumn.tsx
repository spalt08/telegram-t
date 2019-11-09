import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import Button from '../../../../components/ui/Button';

import './RightColumn.scss';

type IProps = Pick<DispatchMap, 'signOut'>

function onSignOut(signOut: Function) {
  // eslint-disable-next-line no-restricted-globals
  if (confirm('Are you sure?')) {
    signOut();
  }
}

const RightColumn: FC<IProps> = ({ signOut }) => {
  return (
    <div id="RightColumn">
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
