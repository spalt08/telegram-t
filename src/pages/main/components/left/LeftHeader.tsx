import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import DropdownMenu from '../../../../components/ui/DropdownMenu';
import MenuItem from '../../../../components/ui/MenuItem';
import Button from '../../../../components/ui/Button';
import SearchInput from './SearchInput';
import './LeftHeader.scss';

type IProps = Pick<GlobalActions, 'signOut'>;

function onSignOut(signOut: Function) {
  // eslint-disable-next-line no-restricted-globals, no-alert
  if (confirm('Are you sure?')) {
    signOut();
  }
}

const MenuButton: FC<{ onClick: () => void; isOpen?: boolean }> = ({ onClick, isOpen }) => (
  <Button round size="smaller" color="translucent" className={isOpen ? 'active' : ''} onClick={onClick}>
    <i className="icon-menu" />
  </Button>
);

const LeftHeader: FC<IProps> = ({ signOut }) => {
  return (
    <div id="LeftHeader">
      <DropdownMenu
        trigger={MenuButton}
      >
        <MenuItem className="not-implemented" icon="new-group">New Group</MenuItem>
        <MenuItem className="not-implemented" icon="user">Contacts</MenuItem>
        <MenuItem className="not-implemented" icon="archive">Archived</MenuItem>
        <MenuItem className="not-implemented" icon="saved-messages">Saved</MenuItem>
        <MenuItem className="not-implemented" icon="settings">Settings</MenuItem>
        <MenuItem className="not-implemented" icon="help">Help</MenuItem>
        <MenuItem icon="logout" onClick={() => onSignOut(signOut)}>Log Out</MenuItem>
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
