import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import Button from '../ui/Button';

import './RightHeader.scss';
import SearchInput from '../ui/SearchInput';
import { debounce } from '../../util/schedulers';

type IProps = {
  isSearch: boolean;
  searchQuery?: string;
} & Pick<GlobalActions, 'toggleRightColumn' | 'closeMessageSearch' | 'setMessageSearchQuery' | 'searchMessages'>;

const runDebouncedForSearch = debounce((cb) => cb(), 200, false);

const RightHeader: FC<IProps> = ({
  isSearch,
  searchQuery,
  toggleRightColumn,
  closeMessageSearch,
  setMessageSearchQuery,
  searchMessages,
}) => {
  const handleSearchQueryChange = useCallback((query: string) => {
    setMessageSearchQuery({ query });
    runDebouncedForSearch(searchMessages);
  }, [searchMessages, setMessageSearchQuery]);

  function renderRegularHeader() {
    return [
      <h3>Info</h3>,
      <Button
        round
        color="translucent"
        size="smaller"
        className="more-button not-implemented"
      >
        <i className="icon-more" />
      </Button>,
    ];
  }

  function renderSearch() {
    return <SearchInput value={searchQuery} onChange={handleSearchQueryChange} />;
  }

  return (
    <div className="RightHeader">
      <Button
        round
        color="translucent"
        size="smaller"
        onClick={isSearch ? closeMessageSearch : toggleRightColumn}
      >
        <i className="icon-close" />
      </Button>
      {isSearch ? renderSearch() : renderRegularHeader()}
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { messageSearch } = global;

    return {
      isSearch: messageSearch.isTextSearch,
      searchQuery: messageSearch.query,
    };
  },
  (setGlobal, actions) => {
    const {
      toggleRightColumn, closeMessageSearch, setMessageSearchQuery, searchMessages,
    } = actions;
    return {
      toggleRightColumn, closeMessageSearch, setMessageSearchQuery, searchMessages,
    };
  },
)(RightHeader);
