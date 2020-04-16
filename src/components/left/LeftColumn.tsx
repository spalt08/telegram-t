import React, {
  FC, useState, useCallback, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { LeftColumnContent } from '../../types';

import captureEscKeyListener from '../../util/captureEscKeyListener';

import Transition from '../ui/Transition';
import LeftHeader from './LeftHeader';
import ConnectionState from './ConnectionState';
import ChatList from './ChatList';
import LeftRecent from './LeftRecent.async';
import LeftSearch from './LeftSearch.async';
import Settings from './settings/Settings.async';
import ContactList from './ContactList.async';

import './LeftColumn.scss';

type StateProps = {
  searchQuery?: string;
};

type DispatchProps = Pick<GlobalActions, 'setGlobalSearchQuery'>;

const TRANSITION_RENDER_COUNT = Object.keys(LeftColumnContent).length / 2;

const LeftColumn: FC<StateProps & DispatchProps> = ({ searchQuery, setGlobalSearchQuery }) => {
  const [content, setContent] = useState<LeftColumnContent>(LeftColumnContent.ChatList);
  const [contactsFilter, setContactsFilter] = useState<string>('');

  const handleReset = useCallback(() => {
    setContent(LeftColumnContent.ChatList);
    setContactsFilter('');
    setGlobalSearchQuery({ query: '' });
  }, [setGlobalSearchQuery]);

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

  useEffect(
    () => (content !== LeftColumnContent.ChatList ? captureEscKeyListener(handleReset) : undefined),
    [content, handleReset],
  );

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
      default:
        return null;
    }
  }

  return (
    <div id="LeftColumn">
      <LeftHeader
        content={content}
        contactsFilter={contactsFilter}
        onSearchQuery={handleSearchQuery}
        onSelectSettings={handleSelectSettings}
        onSelectContacts={handleSelectContacts}
        onReset={handleReset}
      />
      <ConnectionState />
      <Transition name="zoom-fade" renderCount={TRANSITION_RENDER_COUNT} activeKey={content}>
        {renderContent}
      </Transition>
    </div>
  );
};

export default withGlobal(
  (global): StateProps => {
    const { query } = global.globalSearch;

    return { searchQuery: query };
  },
  (setGlobal, actions): DispatchProps => {
    const { setGlobalSearchQuery } = actions;
    return { setGlobalSearchQuery };
  },
)(LeftColumn);
