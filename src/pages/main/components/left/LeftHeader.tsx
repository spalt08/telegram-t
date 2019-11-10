import React, { FC } from '../../../../lib/teact';

import Button from '../../../../components/ui/Button';
import SearchInput from './SearchInput';

import './LeftHeader.scss';

const LeftHeader: FC = () => {
  return (
    <div id="LeftHeader">
      {/* TODO @not-implemented */}
      <Button round size="smaller" color="translucent" onClick={() => {}}>
        <i className="icon-menu" />
      </Button>
      <SearchInput />
    </div>
  );
};

export default LeftHeader;
