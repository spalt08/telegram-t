import React, { FC } from '../../lib/teact/teact';

import './SearchInput.scss';

const SearchInput: FC = () => {
  return (
    <div className="SearchInput not-implemented">
      <input
        type="text"
        placeholder="Search"
        className="form-control"
      />
      <i className="icon-search" />
    </div>
  );
};

export default SearchInput;
