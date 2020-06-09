import React, {
  FC, useState, useCallback, useEffect, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { LeftColumnContent, SettingsScreens } from '../../types';

import captureEscKeyListener from '../../util/captureEscKeyListener';
import { pick } from '../../util/iteratees';

import Transition from '../ui/Transition';
import LeftMain from './main/LeftMain';
import Settings from './settings/Settings.async';
import NewChannel from './newChat/NewChannel.async';
import NewGroup from './newChat/NewGroup.async';
import ArchivedChats from './ArchivedChats.async';

import './LeftColumn.scss';

type StateProps = {
  searchQuery?: string;
};

type DispatchProps = Pick<GlobalActions, 'setGlobalSearchQuery' | 'resetChatCreation'>;

enum ContentType {
  Main,
  // eslint-disable-next-line no-shadow
  Settings,
  Archived,
  // eslint-disable-next-line no-shadow
  NewGroup,
  // eslint-disable-next-line no-shadow
  NewChannel
}

const RENDER_COUNT = Object.keys(ContentType).length / 2;
const RESET_TRANSITION_DELAY_MS = 250;

const LeftColumn: FC<StateProps & DispatchProps> = ({
  searchQuery,
  setGlobalSearchQuery,
  resetChatCreation,
}) => {
  const [content, setContent] = useState<LeftColumnContent>(LeftColumnContent.ChatList);
  const [settingsScreen, setSettingsScreen] = useState(SettingsScreens.Main);
  const [contactsFilter, setContactsFilter] = useState<string>('');

  // Used to reset child components in background.
  const [lastResetTime, setLastResetTime] = useState<number>(0);

  let contentType: ContentType = ContentType.Main;
  switch (content) {
    case LeftColumnContent.Archived:
      contentType = ContentType.Archived;
      break;
    case LeftColumnContent.Settings:
      contentType = ContentType.Settings;
      break;
    case LeftColumnContent.NewChannel:
      contentType = ContentType.NewChannel;
      break;
    case LeftColumnContent.NewGroupStep1:
    case LeftColumnContent.NewGroupStep2:
      contentType = ContentType.NewGroup;
      break;
  }

  const handleReset = useCallback((forceReturnToChatList?: boolean) => {
    if (
      content === LeftColumnContent.NewGroupStep2
      && !forceReturnToChatList
    ) {
      setContent(LeftColumnContent.NewGroupStep1);
      return;
    }

    if (content === LeftColumnContent.Settings) {
      switch (settingsScreen) {
        case SettingsScreens.EditProfile:
        case SettingsScreens.General:
        case SettingsScreens.Notifications:
        case SettingsScreens.Privacy:
        case SettingsScreens.Language:
          setSettingsScreen(SettingsScreens.Main);
          return;
        case SettingsScreens.PrivacyPhoneNumber:
        case SettingsScreens.PrivacyLastSeen:
        case SettingsScreens.PrivacyProfilePhoto:
        case SettingsScreens.PrivacyForwarding:
        case SettingsScreens.PrivacyGroupChats:
        case SettingsScreens.PrivacyActiveSessions:
        case SettingsScreens.PrivacyBlockedUsers:
          setSettingsScreen(SettingsScreens.Privacy);
          return;
        default:
          break;
      }
    }

    setContent(LeftColumnContent.ChatList);
    setContactsFilter('');
    setGlobalSearchQuery({ query: '' });
    resetChatCreation();
    setTimeout(() => {
      setLastResetTime(Date.now());
    }, RESET_TRANSITION_DELAY_MS);
  }, [content, settingsScreen, setGlobalSearchQuery, resetChatCreation]);

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

  useEffect(
    () => (content !== LeftColumnContent.ChatList ? captureEscKeyListener(() => handleReset()) : undefined),
    [content, handleReset],
  );

  return (
    <Transition
      id="LeftColumn"
      name="slide-layers"
      renderCount={RENDER_COUNT}
      activeKey={contentType}
    >
      {() => {
        switch (contentType) {
          case ContentType.Archived:
            return (
              <ArchivedChats
                onReset={handleReset}
              />
            );
          case ContentType.Settings:
            return (
              <Settings
                currentScreen={settingsScreen}
                onScreenSelect={setSettingsScreen}
                onReset={handleReset}
              />
            );
          case ContentType.NewChannel:
            return (
              <NewChannel
                key={lastResetTime}
                onReset={handleReset}
              />
            );
          case ContentType.NewGroup:
            return (
              // @optimization No `key` here to re-use previously rendered subtree
              <NewGroup
                content={content}
                onContentChange={setContent}
                onReset={handleReset}
              />
            );
          default:
            return (
              <LeftMain
                content={content}
                searchQuery={searchQuery}
                contactsFilter={contactsFilter}
                onContentChange={setContent}
                onSearchQuery={handleSearchQuery}
                onReset={handleReset}
              />
            );
        }
      }}
    </Transition>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const { query } = global.globalSearch;
    return { searchQuery: query };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['setGlobalSearchQuery', 'resetChatCreation']),
)(LeftColumn));
