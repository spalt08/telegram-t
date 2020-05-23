import React, {
  FC, useCallback, useMemo, useState, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { LeftColumnContent, SettingsScreens } from '../../types';

import { SUPPORT_BOT_ID } from '../../config';
import buildClassName from '../../util/buildClassName';
import { pick } from '../../util/iteratees';

import DropdownMenu from '../ui/DropdownMenu';
import MenuItem from '../ui/MenuItem';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import AttentionIndicator from '../ui/AttentionIndicator';
import Transition from '../ui/Transition';
import SearchInput from '../ui/SearchInput';

import './LeftHeader.scss';

type OwnProps = {
  content: LeftColumnContent;
  settingsScreen: SettingsScreens;
  contactsFilter: string;
  onSearchQuery: (query: string) => void;
  onSelectSettings: () => void;
  onSelectContacts: () => void;
  onSelectNewGroup: () => void;
  onReset: () => void;
};

type StateProps = {
  searchQuery?: string;
  isLoading: boolean;
  isSettingsAttentionNeeded: boolean;
  currentUserId?: number;
};

type DispatchProps = Pick<GlobalActions, 'signOut' | 'openChat'>;

const SETTING_KEYS_OFFSET = 100;

const LeftHeader: FC<OwnProps & StateProps & DispatchProps> = ({
  content,
  settingsScreen,
  contactsFilter,
  onSearchQuery,
  onSelectSettings,
  onSelectContacts,
  onSelectNewGroup,
  onReset,
  searchQuery,
  isLoading,
  isSettingsAttentionNeeded,
  currentUserId,
  signOut,
  openChat,
}) => {
  const hasMenu = content === LeftColumnContent.ChatList;
  const hasSearch = [
    LeftColumnContent.ChatList,
    LeftColumnContent.RecentChats,
    LeftColumnContent.GlobalSearch,
    LeftColumnContent.Contacts,
  ].includes(content);
  const isSettings = content === LeftColumnContent.Settings;

  const headerKey = hasSearch
    ? 0
    : isSettings
      ? content + settingsScreen / SETTING_KEYS_OFFSET
      : content;

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState<boolean>(false);

  const MainButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
    return ({ onTrigger, isOpen }) => (
      <Button
        round
        ripple={hasMenu}
        size="smaller"
        color="translucent"
        className={isOpen ? 'active' : ''}
        onMouseDown={hasMenu ? onTrigger : undefined}
        onClick={!hasMenu ? () => onReset() : undefined}
      >
        <div className={buildClassName('animated-menu-icon', !hasMenu && 'state-back')} />
      </Button>
    );
  }, [hasMenu, onReset]);

  const SettingsMenuButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
    return ({ onTrigger, isOpen }) => (
      <Button
        round
        ripple
        size="smaller"
        color="translucent"
        className={isOpen ? 'active' : ''}
        onMouseDown={onTrigger}
      >
        <i className="icon-more" />
      </Button>
    );
  }, []);

  const openSignOutConfirmation = useCallback(() => {
    setIsSignOutDialogOpen(true);
  }, []);

  const closeSignOutConfirmation = useCallback(() => {
    setIsSignOutDialogOpen(false);
  }, []);

  const handleSignOutMessage = useCallback(() => {
    closeSignOutConfirmation();
    signOut();
  }, [closeSignOutConfirmation, signOut]);

  const handleSearchFocus = useCallback(() => {
    if (!searchQuery) {
      onSearchQuery('');
    }
  }, [searchQuery, onSearchQuery]);

  const handleSelectSaved = useCallback(() => {
    openChat({ id: currentUserId });
  }, [currentUserId, openChat]);

  const handleSelectSupport = useCallback(() => {
    openChat({ id: SUPPORT_BOT_ID });
  }, [openChat]);

  const isSearchFocused = content === LeftColumnContent.RecentChats
    || content === LeftColumnContent.GlobalSearch
    || content === LeftColumnContent.Contacts;

  function renderSettingsHeaderContent() {
    switch (settingsScreen) {
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

  function renderHeaderContent() {
    switch (content) {
      case LeftColumnContent.Settings:
        return renderSettingsHeaderContent();
      case LeftColumnContent.NewChannel:
        return <h3>New Channel</h3>;
      case LeftColumnContent.NewGroupStep1:
        return <h3>Add Members</h3>;
      case LeftColumnContent.NewGroupStep2:
        return <h3>New Group</h3>;
      default:
        return (
          <SearchInput
            value={contactsFilter || searchQuery}
            focused={isSearchFocused}
            isLoading={isLoading}
            onChange={onSearchQuery}
            onFocus={handleSearchFocus}
          />
        );
    }
  }

  return (
    <div id="LeftHeader">
      <DropdownMenu
        trigger={MainButton}
      >
        <MenuItem
          icon="group"
          onClick={onSelectNewGroup}
        >
          New Group
        </MenuItem>
        <MenuItem
          icon="user"
          onClick={onSelectContacts}
        >
          Contacts
        </MenuItem>
        <MenuItem className="not-implemented" disabled icon="archive">Archived</MenuItem>
        <MenuItem
          icon="saved-messages"
          onClick={handleSelectSaved}
        >
          Saved
        </MenuItem>
        <MenuItem
          icon="settings"
          onClick={onSelectSettings}
          attention={isSettingsAttentionNeeded}
        >
          Settings
        </MenuItem>
        <MenuItem
          icon="help"
          onClick={handleSelectSupport}
        >
          Help
        </MenuItem>
      </DropdownMenu>
      {hasMenu && <AttentionIndicator show={isSettingsAttentionNeeded} />}
      <Transition name="slide-fade" activeKey={headerKey}>
        {renderHeaderContent}
      </Transition>
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

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { query: searchQuery, fetchingStatus } = global.globalSearch;
    const { isAnimationLevelSettingViewed } = global.settings;
    const { currentUserId } = global;

    return {
      searchQuery,
      isLoading: fetchingStatus ? Boolean(fetchingStatus.chats || fetchingStatus.messages) : false,
      isSettingsAttentionNeeded: !isAnimationLevelSettingViewed,
      currentUserId,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['signOut', 'openChat']),
)(LeftHeader));
