import React, {
  FC, useState, useCallback, useEffect,
} from '../../lib/teact/teact';

import captureEscKeyListener from '../../util/captureEscKeyListener';

import LeftHeader from './LeftHeader';
import ConnectionState from './ConnectionState';
import ChatList from './ChatList';
import LeftRecent from './LeftRecent';

import './LeftColumn.scss';
import Transition from '../ui/Transition';

enum ColumnContent {
  'ChatList',
  'RecentChats',
  'GlobalSearch',
}

const LeftColumn: FC = () => {
  const [columnContent, setColumnContent] = useState<ColumnContent>(ColumnContent.ChatList);
  const isSearchOpen = columnContent !== ColumnContent.ChatList;

  const handleOpenSearch = useCallback(() => {
    setColumnContent(ColumnContent.RecentChats);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setColumnContent(ColumnContent.ChatList);
  }, []);

  useEffect(
    () => (isSearchOpen ? captureEscKeyListener(handleCloseSearch) : undefined),
    [isSearchOpen, handleCloseSearch],
  );

  return (
    <div id="LeftColumn">
      <LeftHeader
        isSearchOpen={isSearchOpen}
        onSearchOpen={handleOpenSearch}
        onSearchClose={handleCloseSearch}
      />
      <ConnectionState />
      <Transition activeKey={columnContent} name="zoom-fade">
        {() => (
          <div className="column-content">
            {isSearchOpen ? (
              <LeftRecent onSearchClose={handleCloseSearch} />
            ) : (
              <ChatList />
            )}
          </div>
        )}
      </Transition>
    </div>
  );
};

export default LeftColumn;
