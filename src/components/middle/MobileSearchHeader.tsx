import React, {
  FC, memo, useCallback, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { pick } from '../../util/iteratees';

import SearchInput from '../ui/SearchInput';
import Button from '../ui/Button';

import './MobileSearchHeader.scss';

type StateProps = {};

type DispatchProps = Pick<GlobalActions, 'closeMessageTextSearch'>;

const NOOP = () => undefined;

const MobileSearchHeader: FC<StateProps & DispatchProps> = ({
  closeMessageTextSearch,
}) => {
  useEffect(() => {
    const dummySearchInput = document.querySelector<HTMLDivElement>('.dummy-search-input')!;
    const currentTop = dummySearchInput.getBoundingClientRect().top;

    if (currentTop > 0) {
      dummySearchInput.dataset.top = String(dummySearchInput.getBoundingClientRect().top);
    }
  }, []);

  const handleCloseSearch = useCallback(() => {
    document.getElementById('magic-input')!.blur();
    closeMessageTextSearch();
  }, [closeMessageTextSearch]);

  return (
    <div id="MobileSearchHeader" onScroll={(e) => e.preventDefault()}>
      <Button
        size="smaller"
        round
        color="translucent"
        onClick={handleCloseSearch}
      >
        <i className="icon-back" />
      </Button>
      <SearchInput className="dummy-search-input" disabled onChange={NOOP} />
    </div>
  );
};

export default memo(withGlobal(
  undefined,
  (setGlobal, actions): DispatchProps => pick(actions, ['closeMessageTextSearch']),
)(MobileSearchHeader));
