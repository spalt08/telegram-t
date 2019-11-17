import React, { FC } from '../../../../lib/teact';
import { withGlobal } from '../../../../lib/teactn';

import Button from '../../../../components/ui/Button';

type IProps = {
  showRightColumn: boolean;
  toggleRightColumn?: Function;
};

const HeaderActions: FC<IProps> = ({
  showRightColumn,
  toggleRightColumn,
}) => {
  return (
    <div className="HeaderActions">
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
        className={`toggle-right-pane-button ${showRightColumn ? 'active' : ''}`}
        onClick={toggleRightColumn}
      >
        <i className="icon-right-pane" />
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

export default withGlobal(
  global => {
    const { showRightColumn } = global;

    return {
      showRightColumn,
    };
  },
  (setGlobal, actions) => {
    const { toggleRightColumn } = actions;
    return { toggleRightColumn };
  },
)(HeaderActions);
