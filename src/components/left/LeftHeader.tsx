import React, {
  FC, useCallback, useMemo, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { LeftColumnContent } from '../../types';

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

const TRANSITION_RENDER_COUNT = Object.keys(LeftColumnContent).length / 2;

const LeftHeader: FC<OwnProps & StateProps & DispatchProps> = ({
  content,
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
  const headerKey = hasSearch ? 0 : content;

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState<boolean>(false);

  const MainButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
    return ({ onTrigger, isOpen }) => (
      <Button
        round
        ripple={hasMenu}
        size="smaller"
        color="translucent"
        className={isOpen ? 'active' : ''}
        onMouseDown={hasMenu ? onTrigger : () => onReset()}
      >
        <div className={buildClassName('animated-menu-icon', !hasMenu && 'state-back')} />
      </Button>
    );
  }, [hasMenu, onReset]);

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

  function renderHeaderContent() {
    switch (headerKey) {
      case LeftColumnContent.Settings:
        return <h3>Settings</h3>;
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
        <MenuItem icon="logout" onClick={openSignOutConfirmation}>Log Out</MenuItem>
      </DropdownMenu>
      {hasMenu && <AttentionIndicator show={isSettingsAttentionNeeded} />}
      <Transition name="slide-fade" activeKey={headerKey} renderCount={TRANSITION_RENDER_COUNT}>
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

export default withGlobal<OwnProps>(
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
)(LeftHeader);
