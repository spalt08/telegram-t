import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { debounce } from '../../util/schedulers';
import { selectCurrentMessageSearch } from '../../modules/selectors';

import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';

import './RightHeader.scss';

type IProps = {
  onClose: () => void;
  isSearch: boolean;
  searchQuery?: string;
} & Pick<GlobalActions, 'setMessageSearchQuery' | 'searchMessages'>;

const runDebouncedForSearch = debounce((cb) => cb(), 200, false);

const RightHeader: FC<IProps> = ({
  onClose,
  isSearch,
  searchQuery,
  setMessageSearchQuery,
  searchMessages,
}) => {
  const handleSearchQueryChange = useCallback((query: string) => {
    setMessageSearchQuery({ query });
    runDebouncedForSearch(searchMessages);
  }, [searchMessages, setMessageSearchQuery]);

  function renderRegularHeader() {
    return (
      <>
        <h3>Info</h3>
        <Button
          round
          color="translucent"
          size="smaller"
          className="more-button not-implemented"
        >
          <i className="icon-more" />
        </Button>
      </>
    );
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
        onClick={onClose}
      >
        <i className="icon-close" />
      </Button>
      {isSearch ? renderSearch() : renderRegularHeader()}
    </div>
  );
};

export default withGlobal(
  (global) => {
    const currentSearch = selectCurrentMessageSearch(global);

    if (!currentSearch) {
      return {};
    }

    return {
      isSearch: currentSearch.currentType === 'text',
      searchQuery: currentSearch.query,
    };
  },
  (setGlobal, actions) => {
    const {
      setMessageSearchQuery, searchMessages,
    } = actions;
    return {
      setMessageSearchQuery, searchMessages,
    };
  },
)(RightHeader);
