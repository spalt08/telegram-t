import React, { FC, useState, useCallback } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import { GlobalActions } from '../../../../store/types';
import DropdownMenu from '../../../../components/ui/DropdownMenu';
import MenuItem from '../../../../components/ui/MenuItem';
import Button from '../../../../components/ui/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import SearchInput from './SearchInput';
import './LeftHeader.scss';

type IProps = Pick<GlobalActions, 'signOut'>;

const MenuButton: FC<{ onClick: () => void; isOpen?: boolean }> = ({ onClick, isOpen }) => (
  <Button round size="smaller" color="translucent" className={isOpen ? 'active' : ''} onClick={onClick}>
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
        <MenuItem className="not-implemented" icon="new-group">New Group</MenuItem>
        <MenuItem className="not-implemented" icon="user">Contacts</MenuItem>
        <MenuItem className="not-implemented" icon="archive">Archived</MenuItem>
        <MenuItem className="not-implemented" icon="saved-messages">Saved</MenuItem>
        <MenuItem className="not-implemented" icon="settings">Settings</MenuItem>
        <MenuItem className="not-implemented" icon="help">Help</MenuItem>
        <MenuItem icon="logout" onClick={openSignOutConfirmation}>Log Out</MenuItem>
      </DropdownMenu>
      <SearchInput />

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
