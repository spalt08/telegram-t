import React, {
  FC, useState, useCallback, useEffect, useRef,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { LeftColumnContent } from '../../types';

import captureEscKeyListener from '../../util/captureEscKeyListener';
import { pick } from '../../util/iteratees';
import { IS_TOUCH_ENV } from '../../util/environment';

import Transition from '../ui/Transition';
import LeftHeader from './LeftHeader';
import ConnectionState from './ConnectionState';
import ChatList from './ChatList';
import LeftRecent from './LeftRecent.async';
import LeftSearch from './LeftSearch.async';
import Settings from './settings/Settings.async';
import ContactList from './ContactList.async';
import NewChannel from './newChat/NewChannel.async';
import NewGroupStep1 from './newChat/NewGroupStep1.async';
import NewGroupStep2 from './newChat/NewGroupStep2.async';
import NewChatButton from './NewChatButton';

import './LeftColumn.scss';

type StateProps = {
  searchQuery?: string;
};

type DispatchProps = Pick<GlobalActions, 'setGlobalSearchQuery' | 'resetChatCreation'>;

const TRANSITION_RENDER_COUNT = Object.keys(LeftColumnContent).length / 2;

const RESET_TRANSITION_DELAY_MS = 250;
const BUTTON_CLOSE_DELAY_MS = 250;
let closeTimeout: number;

const LeftColumn: FC<StateProps & DispatchProps> = ({
  searchQuery,
  setGlobalSearchQuery,
  resetChatCreation,
}) => {
  const [content, setContent] = useState<LeftColumnContent>(LeftColumnContent.ChatList);
  const [contactsFilter, setContactsFilter] = useState<string>('');

  const [isNewChatButtonShown, setIsNewChatButtonShown] = useState(IS_TOUCH_ENV);
  const [newGroupMemberIds, setNewGroupMemberIds] = useState<number[]>([]);

  const isMouseInside = useRef(false);

  // Used to reset child components in background.
  const [lastResetTime, setLastResetTime] = useState<number>(0);

  const handleReset = useCallback((forceReturnToChatList?: boolean) => {
    if (
      content === LeftColumnContent.NewGroupStep2
      && !forceReturnToChatList
    ) {
      setContent(LeftColumnContent.NewGroupStep1);
      return;
    }

    setContent(LeftColumnContent.ChatList);
    setContactsFilter('');
    setNewGroupMemberIds([]);
    setGlobalSearchQuery({ query: '' });
    resetChatCreation();
    setTimeout(() => {
      setLastResetTime(Date.now());
    }, RESET_TRANSITION_DELAY_MS);
  }, [content, setGlobalSearchQuery, resetChatCreation]);

  const handleSearchQuery = useCallback((query: string) => {
    if (content === LeftColumnContent.Contacts) {
      setContactsFilter(query);
      return;
    }

    setContent(query.length ? LeftColumnContent.GlobalSearch : LeftColumnContent.RecentChats);

    if (query !== searchQuery) {
      setGlobalSearchQuery({ query });
    }
  }, [content, setGlobalSearchQuery, searchQuery]);

  const handleSelectSettings = useCallback(() => {
    setContent(LeftColumnContent.Settings);
  }, []);

  const handleSelectContacts = useCallback(() => {
    setContent(LeftColumnContent.Contacts);
  }, []);

  const handleSelectNewChannel = useCallback(() => {
    setContent(LeftColumnContent.NewChannel);
  }, []);

  const handleSelectNewGroup = useCallback(() => {
    setContent(LeftColumnContent.NewGroupStep1);
  }, []);

  const handleNewGroupNextStep = useCallback(() => {
    setContent(LeftColumnContent.NewGroupStep2);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (content !== LeftColumnContent.ChatList) {
      return;
    }
    isMouseInside.current = true;
    setIsNewChatButtonShown(true);
  }, [content]);

  const handleMouseLeave = useCallback(() => {
    isMouseInside.current = false;

    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }

    closeTimeout = window.setTimeout(() => {
      if (!isMouseInside.current) {
        setIsNewChatButtonShown(false);
      }
    }, BUTTON_CLOSE_DELAY_MS);
  }, []);

  useEffect(
    () => (content !== LeftColumnContent.ChatList ? captureEscKeyListener(() => handleReset()) : undefined),
    [content, handleReset],
  );

  useEffect(() => {
    let autoCloseTimeout: number;
    if (content !== LeftColumnContent.ChatList) {
      autoCloseTimeout = window.setTimeout(() => {
        setIsNewChatButtonShown(false);
      }, BUTTON_CLOSE_DELAY_MS);
    } else if (isMouseInside.current) {
      setIsNewChatButtonShown(true);
    }

    return () => {
      if (autoCloseTimeout) {
        clearTimeout(autoCloseTimeout);
      }
    };
  }, [content]);

  function renderContent() {
    switch (content) {
      case LeftColumnContent.ChatList:
        return <ChatList />;
      case LeftColumnContent.RecentChats:
        return <LeftRecent onReset={handleReset} />;
      case LeftColumnContent.GlobalSearch:
        return <LeftSearch searchQuery={searchQuery} onReset={handleReset} />;
      case LeftColumnContent.Settings:
        return <Settings />;
      case LeftColumnContent.Contacts:
        return <ContactList filter={contactsFilter} />;
      case LeftColumnContent.NewChannel:
        return (
          <NewChannel
            key={lastResetTime}
            onReset={handleReset}
          />
        );
      case LeftColumnContent.NewGroupStep1:
        return (
          <NewGroupStep1
            key={lastResetTime}
            selectedMemberIds={newGroupMemberIds}
            onSelectedMemberIdsChange={setNewGroupMemberIds}
            onNextStep={handleNewGroupNextStep}
          />
        );
      case LeftColumnContent.NewGroupStep2:
        return (
          <NewGroupStep2
            key={lastResetTime}
            memberIds={newGroupMemberIds}
            onReset={handleReset}
          />
        );
      default:
        return undefined;
    }
  }

  return (
    <div
      id="LeftColumn"
      onMouseEnter={!IS_TOUCH_ENV ? handleMouseEnter : undefined}
      onMouseLeave={!IS_TOUCH_ENV ? handleMouseLeave : undefined}
    >
      <LeftHeader
        content={content}
        contactsFilter={contactsFilter}
        onSearchQuery={handleSearchQuery}
        onSelectSettings={handleSelectSettings}
        onSelectContacts={handleSelectContacts}
        onSelectNewGroup={handleSelectNewGroup}
        onReset={handleReset}
      />
      <ConnectionState />
      <Transition name="zoom-fade" renderCount={TRANSITION_RENDER_COUNT} activeKey={content}>
        {renderContent}
      </Transition>
      <NewChatButton
        isShown={isNewChatButtonShown}
        onNewPrivateChat={handleSelectContacts}
        onNewChannel={handleSelectNewChannel}
        onNewGroup={handleSelectNewGroup}
      />
    </div>
  );
};

export default withGlobal(
  (global): StateProps => {
    const { query } = global.globalSearch;
    return { searchQuery: query };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['setGlobalSearchQuery', 'resetChatCreation']),
)(LeftColumn);
