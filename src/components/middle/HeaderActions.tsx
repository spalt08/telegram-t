import React, { FC, useRef, useEffect } from '../../lib/teact/teact';

import Button from '../ui/Button';

type OwnProps = {
  isRightColumnShown?: boolean;
  onSearchClick: () => void;
};

let transitionTimeout: number;
const TRANSITION_DELAY_MS = 200;

const HeaderActions: FC<OwnProps> = ({ isRightColumnShown, onSearchClick }) => {
  const containerRef = useRef<HTMLDivElement>();

  // This disables pointer-events on HeaderActions while right column is opening/closing
  // to prevent unwanted hover-effects
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
    }

    container.classList.add('pointer-disabled');
    transitionTimeout = window.setTimeout(() => {
      container.classList.remove('pointer-disabled');
    }, TRANSITION_DELAY_MS);
  }, [isRightColumnShown]);

  function stopPropagation(e: React.MouseEvent<any, MouseEvent>) {
    e.stopPropagation();
  }

  return (
    <div
      ref={containerRef}
      className="HeaderActions"
      onClick={stopPropagation}
    >
      <Button
        round
        ripple={isRightColumnShown}
        color="translucent"
        size="smaller"
        onClick={onSearchClick}
      >
        <i className="icon-search" />
      </Button>
      <Button
        round
        ripple
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
