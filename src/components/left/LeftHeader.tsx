import React, { FC, useState, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import DropdownMenu from '../ui/DropdownMenu';
import MenuItem from '../ui/MenuItem';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import SearchInput from '../ui/SearchInput';
import './LeftHeader.scss';

type IProps = Pick<GlobalActions, 'signOut'>;

const MenuButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = ({ onTrigger, isOpen }) => (
  <Button round size="smaller" color="translucent" className={isOpen ? 'active' : ''} onMouseDown={onTrigger}>
    <i className="icon-menu" />
  </Button>
);

const LeftHeader: FC<IProps> = ({ signOut }) => {
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  function openSignOutConfirmation() {
    setIsSignOutDialogOpen(true);
  }

  function closeSignOutConfirmation() {
    setIsSignOutDialogOpen(false);
  }

  const handleSignOutMessage = useCallback(() => {
    closeSignOutConfirmation();
    signOut();
  }, [signOut]);

  return (
    <div id="LeftHeader">
      <DropdownMenu
        trigger={MenuButton}
      >
        <MenuItem className="not-implemented" disabled icon="group">New Group</MenuItem>
        <MenuItem className="not-implemented" disabled icon="user">Contacts</MenuItem>
        <MenuItem className="not-implemented" disabled icon="archive">Archived</MenuItem>
        <MenuItem className="not-implemented" disabled icon="saved-messages">Saved</MenuItem>
        <MenuItem className="not-implemented" disabled icon="settings">Settings</MenuItem>
        <MenuItem className="not-implemented" disabled icon="help">Help</MenuItem>
        <MenuItem icon="logout" onClick={openSignOutConfirmation}>Log Out</MenuItem>
      </DropdownMenu>
      <SearchInput className="not-implemented" onChange={() => {}} />

      <ConfirmDialog
        isOpen={isSignOutDialogOpen}
        onClose={closeSignOutConfirmation}
        text="Are you sure you want to log out?"
        confirmLabel="Log Out"
        confirmHandler={handleSignOutMessage}
        confirmIsDestructive
      />
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
