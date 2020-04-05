import React, {
  FC, useState, useCallback, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { LeftColumnContent } from '../../types';

import captureEscKeyListener from '../../util/captureEscKeyListener';

import LeftHeader from './LeftHeader';
import ConnectionState from './ConnectionState';
import ChatList from './ChatList';
import LeftRecent from './LeftRecent';
import LeftSearch from './LeftSearch';
import Transition from '../ui/Transition';
import Settings from './settings/Settings';

import './LeftColumn.scss';

type StateProps = {
  searchQuery?: string;
};

type DispatchProps = Pick<GlobalActions, 'setGlobalSearchQuery'>;

const TRANSITION_RENDER_COUNT = Object.keys(LeftColumnContent).length / 2;

const LeftColumn: FC<StateProps & DispatchProps> = ({ searchQuery, setGlobalSearchQuery }) => {
  const [content, setContent] = useState<LeftColumnContent>(LeftColumnContent.ChatList);

  const handleReset = useCallback(() => {
    setContent(LeftColumnContent.ChatList);
    setGlobalSearchQuery({ query: '' });
  }, [setGlobalSearchQuery]);

  const handleSearchQuery = useCallback((query: string) => {
    setContent(query.length ? LeftColumnContent.GlobalSearch : LeftColumnContent.RecentChats);

    if (query !== searchQuery) {
      setGlobalSearchQuery({ query });
    }
  }, [setGlobalSearchQuery, searchQuery]);

  const handleSelectSettings = useCallback(() => {
    setContent(LeftColumnContent.Settings);
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
    }

    return undefined;
  }

  return (
    <div id="LeftColumn">
      <LeftHeader
        content={content}
        onSearchQuery={handleSearchQuery}
        onSelectSettings={handleSelectSettings}
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
