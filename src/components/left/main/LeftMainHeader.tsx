import React, {
  FC, useCallback, useMemo, memo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { LeftColumnContent } from '../../../types';
import { ApiChat } from '../../../api/types';

import { SUPPORT_BOT_ID } from '../../../config';
import buildClassName from '../../../util/buildClassName';
import { pick } from '../../../util/iteratees';

import DropdownMenu from '../../ui/DropdownMenu';
import MenuItem from '../../ui/MenuItem';
import Button from '../../ui/Button';
import AttentionIndicator from '../../ui/AttentionIndicator';
import SearchInput from '../../ui/SearchInput';

import './LeftMainHeader.scss';
import { isChatArchived } from '../../../modules/helpers';

type OwnProps = {
  content: LeftColumnContent;
  contactsFilter: string;
  onSearchQuery: (query: string) => void;
  onSelectSettings: () => void;
  onSelectContacts: () => void;
  onSelectNewGroup: () => void;
  onSelectArchived: () => void;
  onReset: () => void;
};

type StateProps = {
  searchQuery?: string;
  isLoading: boolean;
  isSettingsAttentionNeeded: boolean;
  currentUserId?: number;
  chatsById?: Record<number, ApiChat>;
};

type DispatchProps = Pick<GlobalActions, 'openChat'>;

const LeftMainHeader: FC<OwnProps & StateProps & DispatchProps> = ({
  content,
  contactsFilter,
  onSearchQuery,
  onSelectSettings,
  onSelectContacts,
  onSelectNewGroup,
  onSelectArchived,
  onReset,
  searchQuery,
  isLoading,
  isSettingsAttentionNeeded,
  currentUserId,
  chatsById,
  openChat,
}) => {
  const hasMenu = content === LeftColumnContent.ChatList;

  const archivedUnreadChatsCount = useMemo(() => {
    if (!hasMenu || !chatsById) {
      return 0;
    }

    return Object.values(chatsById).reduce((total, chat) => {
      if (!isChatArchived(chat)) {
        return total;
      }

      return chat.unreadCount ? total + 1 : total;
    }, 0);
  }, [hasMenu, chatsById]);

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
        <MenuItem
          icon="archive"
          onClick={onSelectArchived}
        >
          Archived
          {archivedUnreadChatsCount > 0 && (
            <div className="archived-badge">{archivedUnreadChatsCount}</div>
          )}
        </MenuItem>
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
        placeholder="Telegram Search"
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
    const { byId: chatsById } = global.chats;

    return {
      searchQuery,
      isLoading: fetchingStatus ? Boolean(fetchingStatus.chats || fetchingStatus.messages) : false,
      isSettingsAttentionNeeded: !isAnimationLevelSettingViewed,
      currentUserId,
      chatsById,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['openChat']),
)(LeftMainHeader));
