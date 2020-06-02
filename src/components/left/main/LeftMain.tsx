import React, {
  FC, memo, useState, useRef, useCallback, useEffect,
} from '../../../lib/teact/teact';

import { LeftColumnContent } from '../../../types';

import { IS_TOUCH_ENV } from '../../../util/environment';

import Transition from '../../ui/Transition';
import LeftMainHeader from './LeftMainHeader';
import ConnectionState from '../ConnectionState';
import ChatList from './ChatList';
import LeftRecent from './LeftRecent.async';
import LeftSearch from './LeftSearch.async';
import ContactList from './ContactList.async';
import NewChatButton from '../NewChatButton';

type OwnProps = {
  content: LeftColumnContent;
  searchQuery?: string;
  contactsFilter: string;
  onSearchQuery: (query: string) => void;
  onContentChange: (content: LeftColumnContent) => void;
  onReset: () => void;
};

type StateProps = {

};

const TRANSITION_RENDER_COUNT = Object.keys(LeftColumnContent).length / 2;
const BUTTON_CLOSE_DELAY_MS = 250;
let closeTimeout: number;

const LeftMain: FC<OwnProps & StateProps> = ({
  content,
  searchQuery,
  contactsFilter,
  onSearchQuery,
  onContentChange,
  onReset,
}) => {
  const [isNewChatButtonShown, setIsNewChatButtonShown] = useState(IS_TOUCH_ENV);

  const isMouseInside = useRef(false);

  const handleSelectSettings = useCallback(() => {
    onContentChange(LeftColumnContent.Settings);
  }, [onContentChange]);

  const handleSelectContacts = useCallback(() => {
    onContentChange(LeftColumnContent.Contacts);
  }, [onContentChange]);

  const handleSelectNewChannel = useCallback(() => {
    onContentChange(LeftColumnContent.NewChannel);
  }, [onContentChange]);

  const handleSelectNewGroup = useCallback(() => {
    onContentChange(LeftColumnContent.NewGroupStep1);
  }, [onContentChange]);

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

  return (
    <div
      id="LeftColumn-main"
      onMouseEnter={!IS_TOUCH_ENV ? handleMouseEnter : undefined}
      onMouseLeave={!IS_TOUCH_ENV ? handleMouseLeave : undefined}
    >
      <LeftMainHeader
        content={content}
        contactsFilter={contactsFilter}
        onSearchQuery={onSearchQuery}
        onSelectSettings={handleSelectSettings}
        onSelectContacts={handleSelectContacts}
        onSelectNewGroup={handleSelectNewGroup}
        onReset={onReset}
      />
      <ConnectionState />
      <Transition name="zoom-fade" renderCount={TRANSITION_RENDER_COUNT} activeKey={content}>
        {() => {
          switch (content) {
            case LeftColumnContent.ChatList:
              return <ChatList />;
            case LeftColumnContent.RecentChats:
              return <LeftRecent onReset={onReset} />;
            case LeftColumnContent.GlobalSearch:
              return <LeftSearch searchQuery={searchQuery} onReset={onReset} />;
            case LeftColumnContent.Contacts:
              return <ContactList filter={contactsFilter} />;
            default:
              return undefined;
          }
        }}
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

export default memo(LeftMain);