import React, {
  FC, useCallback, useMemo, memo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { LeftColumnContent } from '../../../types';

import { SUPPORT_BOT_ID } from '../../../config';
import buildClassName from '../../../util/buildClassName';
import { pick } from '../../../util/iteratees';

import DropdownMenu from '../../ui/DropdownMenu';
import MenuItem from '../../ui/MenuItem';
import Button from '../../ui/Button';
import AttentionIndicator from '../../ui/AttentionIndicator';
import SearchInput from '../../ui/SearchInput';

import './LeftMainHeader.scss';

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

type DispatchProps = Pick<GlobalActions, 'openChat'>;

const LeftMainHeader: FC<OwnProps & StateProps & DispatchProps> = ({
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
  openChat,
}) => {
  const hasMenu = content === LeftColumnContent.ChatList;

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

  return (
    <div id="LeftMainHeader" className="LeftHeader">
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
      <SearchInput
        value={contactsFilter || searchQuery}
        focused={isSearchFocused}
        isLoading={isLoading}
        onChange={onSearchQuery}
        onFocus={handleSearchFocus}
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
  (setGlobal, actions): DispatchProps => pick(actions, ['openChat']),
)(LeftMainHeader));
