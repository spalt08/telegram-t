import React, { FC } from '../../../../lib/teact';
import { DispatchMap, withGlobal } from '../../../../lib/teactn';

import DropdownMenu from '../../../../components/ui/DropdownMenu';
import DropdownMenuItem from '../../../../components/ui/DropdownMenuItem';
import SearchInput from './SearchInput';

import './LeftHeader.scss';

type IProps = Pick<DispatchMap, 'signOut'>

function onSignOut(signOut: Function) {
  // eslint-disable-next-line no-restricted-globals no-alert
  if (confirm('Are you sure?')) {
    signOut();
  }
}

const LeftHeader: FC<IProps> = ({ signOut }) => {
  return (
    <div id="LeftHeader">
      <DropdownMenu
        size="smaller"
        color="translucent"
        icon="menu"
      >
        {/* TODO @not-implemented */}
        {/*<DropdownMenuItem icon="new-group" onClick={() => {}}>New Group</DropdownMenuItem>*/}
        {/*<DropdownMenuItem icon="user" onClick={() => {}}>Contacts</DropdownMenuItem>*/}
        {/*<DropdownMenuItem icon="archive" onClick={() => {}}>Archived</DropdownMenuItem>*/}
        {/*<DropdownMenuItem icon="saved-messages" onClick={() => {}}>Saved</DropdownMenuItem>*/}
        {/*<DropdownMenuItem icon="settings" onClick={() => {}}>Settings</DropdownMenuItem>*/}
        {/*<DropdownMenuItem icon="help" onClick={() => {}}>Help</DropdownMenuItem>*/}
        <DropdownMenuItem icon="logout" onClick={() => onSignOut(signOut)}>Log Out</DropdownMenuItem>
      </DropdownMenu>
      <SearchInput />
    </div>
  );
};

export default withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { signOut } = actions;
    return { signOut };
  },
)(LeftHeader);
