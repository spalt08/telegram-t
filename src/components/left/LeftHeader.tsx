import React, {
  FC, useCallback, useMemo, useState,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { LeftColumnContent } from '../../types';

import buildClassName from '../../util/buildClassName';

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
  onSearchQuery: (query: string) => void;
  onSelectSettings: () => void;
  onReset: () => void;
};

type StateProps = {
  searchQuery?: string;
  isLoading: boolean;
  isSettingsAttentionNeeded: boolean;
};

type DispatchProps = Pick<GlobalActions, 'signOut'>;

const TRANSITION_RENDER_COUNT = Object.keys(LeftColumnContent).length / 2;

const LeftHeader: FC<OwnProps & StateProps & DispatchProps> = ({
  content,
  onSearchQuery,
  onSelectSettings,
  onReset,
  searchQuery,
  isLoading,
  isSettingsAttentionNeeded,
  signOut,
}) => {
  const hasMenu = content === LeftColumnContent.ChatList;
  const hasSearch = [
    LeftColumnContent.ChatList, LeftColumnContent.RecentChats, LeftColumnContent.GlobalSearch,
  ].includes(content);
  const headerKey = hasSearch ? 0 : content;

  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState<boolean>(false);

  const MainButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
    return ({ onTrigger, isOpen }) => (
      <Button
        round
        size="smaller"
        color="translucent"
        className={isOpen ? 'active' : ''}
        onMouseDown={hasMenu ? onTrigger : onReset}
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
    onSearchQuery('');
  }, [onSearchQuery]);

  function renderHeaderContent() {
    switch (headerKey) {
      case LeftColumnContent.Settings:
        return <h3>Settings</h3>;
      default:
        return (
          <SearchInput
            value={searchQuery}
            focused={content !== LeftColumnContent.ChatList}
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
        <MenuItem className="not-implemented" disabled icon="group">New Group</MenuItem>
        <MenuItem className="not-implemented" disabled icon="user">Contacts</MenuItem>
        <MenuItem className="not-implemented" disabled icon="archive">Archived</MenuItem>
        <MenuItem className="not-implemented" disabled icon="saved-messages">Saved</MenuItem>
        <MenuItem
          icon="settings"
          onClick={onSelectSettings}
          attention={isSettingsAttentionNeeded}
        >
          Settings
        </MenuItem>
        <MenuItem className="not-implemented" disabled icon="help">Help</MenuItem>
        <MenuItem icon="logout" onClick={openSignOutConfirmation}>Log Out</MenuItem>
      </DropdownMenu>
      <AttentionIndicator show={isSettingsAttentionNeeded} />
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

    return {
      searchQuery,
      isLoading: fetchingStatus ? Boolean(fetchingStatus.chats || fetchingStatus.messages) : false,
      isSettingsAttentionNeeded: !isAnimationLevelSettingViewed,
    };
  },
  (setGlobal, actions): DispatchProps => {
    const { signOut } = actions;
    return { signOut };
  },
)(LeftHeader);
