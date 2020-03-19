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

type IProps = {
  searchQuery?: string;
} & Pick<GlobalActions, 'setGlobalSearchQuery'>;

const TRANSITION_RENDER_COUNT = 3;

const LeftColumn: FC<IProps> = ({ searchQuery, setGlobalSearchQuery }) => {
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
      <Transition activeKey={columnContent} renderCount={TRANSITION_RENDER_COUNT} name="zoom-fade">
        {renderContent}
      </Transition>
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { query } = global.globalSearch;

    return { searchQuery: query };
  },
  (setGlobal, actions) => {
    const { setGlobalSearchQuery } = actions;
    return { setGlobalSearchQuery };
  },
)(LeftColumn);
