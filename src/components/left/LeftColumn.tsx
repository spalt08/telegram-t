import React, {
  FC, useState, useCallback, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { LeftColumnContent } from '../../types';

import captureEscKeyListener from '../../util/captureEscKeyListener';
import { pick } from '../../util/iteratees';

import Transition from '../ui/Transition';
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
        return undefined;
    }
  }

  return (
    <div id="LeftColumn">
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
  (setGlobal, actions): DispatchProps => pick(actions, ['setGlobalSearchQuery']),
)(LeftColumn);
