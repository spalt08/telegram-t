import React, {
  FC, useState, useCallback, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import captureEscKeyListener from '../../util/captureEscKeyListener';

import LeftHeader from './LeftHeader';
import ConnectionState from './ConnectionState';
import ChatList from './ChatList';
import LeftRecent from './LeftRecent';
import LeftSearch from './LeftSearch';
import Transition from '../ui/Transition';

import './LeftColumn.scss';

enum ColumnContent {
  // eslint-disable-next-line no-shadow
  ChatList,
  RecentChats,
  GlobalSearch,
}

type StateProps = {
  searchQuery?: string;
};

type DispatchProps = Pick<GlobalActions, 'setGlobalSearchQuery'>;

const TRANSITION_RENDER_COUNT = 3;

const LeftColumn: FC<StateProps & DispatchProps> = ({ searchQuery, setGlobalSearchQuery }) => {
  const [columnContent, setColumnContent] = useState<ColumnContent>(ColumnContent.ChatList);
  const isSearchOpen = columnContent !== ColumnContent.ChatList;

  const handleOpenSearch = useCallback(() => {
    if (!searchQuery) {
      setColumnContent(ColumnContent.RecentChats);
    }
  }, [searchQuery]);

  const handleCloseSearch = useCallback(() => {
    setColumnContent(ColumnContent.ChatList);
    setGlobalSearchQuery({ query: '' });
  }, [setGlobalSearchQuery]);

  const handleSearchQueryChange = useCallback((query: string) => {
    setColumnContent(query.length ? ColumnContent.GlobalSearch : ColumnContent.RecentChats);

    if (query !== searchQuery) {
      setGlobalSearchQuery({ query });
    }
  }, [setGlobalSearchQuery, searchQuery]);

  useEffect(
    () => (isSearchOpen ? captureEscKeyListener(handleCloseSearch) : undefined),
    [isSearchOpen, handleCloseSearch],
  );

  function renderContent() {
    switch (columnContent) {
      case ColumnContent.RecentChats:
        return <LeftRecent onSearchClose={handleCloseSearch} />;
      case ColumnContent.GlobalSearch:
        return <LeftSearch searchQuery={searchQuery} onSearchClose={handleCloseSearch} />;
      default:
        return <ChatList />;
    }
  }

  return (
    <div id="LeftColumn">
      <LeftHeader
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        onSearchChange={handleSearchQueryChange}
        onSearchOpen={handleOpenSearch}
        onSearchClose={handleCloseSearch}
      />
      <ConnectionState />
      <Transition name="zoom-fade" renderCount={TRANSITION_RENDER_COUNT} activeKey={columnContent}>
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
