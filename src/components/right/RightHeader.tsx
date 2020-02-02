import React, { FC } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../store/types';

import Button from '../ui/Button';

import './RightHeader.scss';

type IProps = Pick<GlobalActions, 'toggleRightColumn'>;

const RightHeader: FC<IProps> = ({
  toggleRightColumn,
}) => {
  return (
    <div className="RightHeader">
      <Button
        round
        color="translucent"
        size="smaller"
        onClick={toggleRightColumn}
      >
        <i className="icon-close" />
      </Button>
      <h3>Info</h3>
      <div className="actions">
        <Button
          round
          color="translucent"
          size="smaller"
          className="not-implemented"
        >
          <i className="icon-more" />
        </Button>
      </div>
    </div>
  );
};

export default withGlobal(
  undefined,
  (setGlobal, actions) => {
    const { toggleRightColumn } = actions;
    return { toggleRightColumn };
  },
)(RightHeader);
