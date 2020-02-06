import React, { FC } from '../../lib/teact/teact';

import Button from '../ui/Button';

type IProps = {
  onSearchClick: () => void;
};

const HeaderActions: FC<IProps> = ({ onSearchClick }) => {
  function stopPropagation(e: React.MouseEvent<any, MouseEvent>) {
    e.stopPropagation();
  }

  return (
    <div className="HeaderActions" onClick={stopPropagation}>
      <Button
        round
        color="translucent"
        size="smaller"
        onClick={onSearchClick}
      >
        <i className="icon-search" />
      </Button>
      <Button
        round
        color="translucent"
        size="smaller"
        className="not-implemented"
        onClick={() => { }}
      >
        <i className="icon-more" />
      </Button>
    </div>
  );
};

export default HeaderActions;
