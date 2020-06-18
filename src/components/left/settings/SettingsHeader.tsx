import React, {
  FC, useCallback, useMemo, memo, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { SettingsScreens } from '../../../types';

import { pick } from '../../../util/iteratees';

import DropdownMenu from '../../ui/DropdownMenu';
import MenuItem from '../../ui/MenuItem';
import Button from '../../ui/Button';
import ConfirmDialog from '../../ui/ConfirmDialog';

type OwnProps = {
  currentScreen: SettingsScreens;
  editedFolderId?: number;
  onReset: () => void;
  onSaveFilter: () => void;
};

type DispatchProps = Pick<GlobalActions, 'signOut' | 'deleteChatFolder'>;

const SettingsHeader: FC<OwnProps & DispatchProps> = ({
  currentScreen,
  editedFolderId,
  onReset,
  onSaveFilter,
  signOut,
  deleteChatFolder,
}) => {
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false);

  const openSignOutConfirmation = useCallback(() => {
    setIsSignOutDialogOpen(true);
  }, []);

  const closeSignOutConfirmation = useCallback(() => {
    setIsSignOutDialogOpen(false);
  }, []);

  const openDeleteFolderConfirmation = useCallback(() => {
    setIsDeleteFolderDialogOpen(true);
  }, []);

  const closeDeleteFolderConfirmation = useCallback(() => {
    setIsDeleteFolderDialogOpen(false);
  }, []);

  const handleSignOutMessage = useCallback(() => {
    closeSignOutConfirmation();
    signOut();
  }, [closeSignOutConfirmation, signOut]);

  const handleDeleteFolderMessage = useCallback(() => {
    closeDeleteFolderConfirmation();
    deleteChatFolder({ id: editedFolderId });
    onReset();
  }, [editedFolderId, closeDeleteFolderConfirmation, deleteChatFolder, onReset]);

  const SettingsMenuButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
    return ({ onTrigger, isOpen }) => (
      <Button
        round
        ripple
        size="smaller"
        color="translucent"
        className={isOpen ? 'active' : ''}
        onClick={onTrigger}
        ariaLabel="More actions"
      >
        <i className="icon-more" />
      </Button>
    );
  }, []);

  function renderHeaderContent() {
    switch (currentScreen) {
      case SettingsScreens.EditProfile:
        return <h3>Edit Profile</h3>;
      case SettingsScreens.General:
        return <h3>General</h3>;
      case SettingsScreens.Notifications:
        return <h3>Notifications</h3>;
      case SettingsScreens.Privacy:
        return <h3>Privacy and Security</h3>;
      case SettingsScreens.Language:
        return <h3>Language</h3>;

      case SettingsScreens.PrivacyPhoneNumber:
        return <h3>Phone Number</h3>;
      case SettingsScreens.PrivacyLastSeen:
        return <h3>Last Seen &amp; Online</h3>;
      case SettingsScreens.PrivacyProfilePhoto:
        return <h3>Profile Photo</h3>;
      case SettingsScreens.PrivacyForwarding:
        return <h3>Forwarding Messages</h3>;
      case SettingsScreens.PrivacyGroupChats:
        return <h3>Group Chats</h3>;

      case SettingsScreens.PrivacyActiveSessions:
        return <h3>Active Sessions</h3>;
      case SettingsScreens.PrivacyBlockedUsers:
        return <h3>Blocked Users</h3>;

      case SettingsScreens.Folders:
        return <h3>Chat Folders</h3>;
      case SettingsScreens.FoldersCreateFolder:
        return <h3>New Folder</h3>;
      case SettingsScreens.FoldersEditFolder:
        return (
          <div className="settings-main-header">
            <h3>Edit Folder</h3>

            {editedFolderId && (
              <DropdownMenu
                className="settings-more-menu"
                trigger={SettingsMenuButton}
                positionX="right"
              >
                <MenuItem icon="delete" destructive onClick={openDeleteFolderConfirmation}>Delete Folder</MenuItem>
              </DropdownMenu>
            )}
          </div>
        );
      case SettingsScreens.FoldersIncludedChats:
      case SettingsScreens.FoldersExcludedChats:
        return (
          <div className="settings-main-header">
            {currentScreen === SettingsScreens.FoldersIncludedChats ? (
              <h3>Included Chats</h3>
            ) : (
              <h3>Excluded Chats</h3>
            )}

            <Button
              round
              ripple
              size="smaller"
              color="translucent"
              className="color-primary"
              onClick={onSaveFilter}
              ariaLabel="Confirm"
            >
              <i className="icon-check" />
            </Button>
          </div>
        );

      default:
        return (
          <div className="settings-main-header">
            <h3>Settings</h3>

            <DropdownMenu
              className="settings-more-menu"
              trigger={SettingsMenuButton}
              positionX="right"
            >
              <MenuItem icon="logout" onClick={openSignOutConfirmation}>Log Out</MenuItem>
            </DropdownMenu>
          </div>
        );
    }
  }

  return (
    <div className="left-header">
      <Button
        round
        size="smaller"
        color="translucent"
        onClick={onReset}
        ariaLabel="Go back"
      >
        <i className="icon-back" />
      </Button>
      {renderHeaderContent()}
      <ConfirmDialog
        isOpen={isSignOutDialogOpen}
        onClose={closeSignOutConfirmation}
        text="Are you sure you want to log out?"
        confirmLabel="Log Out"
        confirmHandler={handleSignOutMessage}
        confirmIsDestructive
      />
      <ConfirmDialog
        isOpen={isDeleteFolderDialogOpen}
        onClose={closeDeleteFolderConfirmation}
        text="Are you sure you want to delete this folder?"
        confirmLabel="Delete"
        confirmHandler={handleDeleteFolderMessage}
        confirmIsDestructive
      />
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  undefined,
  (setGlobal, actions): DispatchProps => pick(actions, ['signOut', 'deleteChatFolder']),
)(SettingsHeader));
