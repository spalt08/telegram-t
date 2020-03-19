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
  isForwarding: boolean;
  isSearch: boolean;
  searchQuery?: string;
} & Pick<GlobalActions, 'setMessageSearchQuery' | 'searchMessages'>;

const runDebouncedForSearch = debounce((cb) => cb(), 200, false);

const RightHeader: FC<IProps> = ({
  onClose,
  isForwarding,
  isSearch,
  searchQuery,
  setMessageSearchQuery,
  searchMessages,
}) => {
  const handleSearchQueryChange = useCallback((query: string) => {
    setMessageSearchQuery({ query });
    runDebouncedForSearch(searchMessages);
  }, [searchMessages, setMessageSearchQuery]);

  function renderHeaderContent() {
    if (isForwarding) {
      return <h3>Forward</h3>;
    }

    if (isSearch) {
      return <SearchInput focused value={searchQuery} onChange={handleSearchQueryChange} />;
    }

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
      {renderHeaderContent()}
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { query: searchQuery } = selectCurrentMessageSearch(global) || {};

    return { searchQuery };
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
