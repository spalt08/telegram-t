import React, { FC } from '../../../../lib/teact';

import Button from '../../../../components/ui/Button';

type IProps = {};

const HeaderActions: FC<IProps> = () => {
  function stopPropagation(e: React.MouseEvent<any, MouseEvent>) {
    e.stopPropagation();
  }

  return (
    <div className="HeaderActions" onClick={stopPropagation}>
      <Button
        round
        color="translucent"
        size="smaller"
        className="not-implemented"
        onClick={() => { }}
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
