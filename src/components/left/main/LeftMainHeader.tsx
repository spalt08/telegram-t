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
import { isChatArchived } from '../../../modules/helpers';

import DropdownMenu from '../../ui/DropdownMenu';
import MenuItem from '../../ui/MenuItem';
import Button from '../../ui/Button';
import SearchInput from '../../ui/SearchInput';

import './LeftMainHeader.scss';

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
        onClick={hasMenu ? onTrigger : () => onReset()}
        ariaLabel={hasMenu ? 'Open menu' : 'Return to chat list'}
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
    <div id="LeftMainHeader" className="left-header">
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
      <SearchInput
        inputId="telegram-search-input"
        value={contactsFilter || searchQuery}
        focused={isSearchFocused}
        isLoading={isLoading}
        placeholder={content === LeftColumnContent.Contacts ? 'Search Contacts' : 'Telegram Search'}
        onChange={onSearchQuery}
        onFocus={handleSearchFocus}
      />
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { query: searchQuery, fetchingStatus } = global.globalSearch;
    const { currentUserId } = global;
    const { byId: chatsById } = global.chats;

    return {
      searchQuery,
      isLoading: fetchingStatus ? Boolean(fetchingStatus.chats || fetchingStatus.messages) : false,
      currentUserId,
      chatsById,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['openChat']),
)(LeftMainHeader));
