import React, {
  FC,
  useRef,
  useEffect,
  useCallback,
  useState,
} from '../../lib/teact/teact';

import Button from '../ui/Button';
import HeaderMenuContainer from './HeaderMenuContainer.async';

type IAnchorPosition = {
  x: number;
  y: number;
};

type OwnProps = {
  chatId: number;
  isChannel?: boolean;
  canSubscribe?: boolean;
  isRightColumnShown?: boolean;
  onSearchClick: () => void;
  onSubscribeChannel: () => void;
};

let transitionTimeout: number;
const TRANSITION_DELAY_MS = 200;

const HeaderActions: FC<OwnProps> = ({
  chatId,
  isChannel,
  canSubscribe,
  isRightColumnShown,
  onSearchClick,
  onSubscribeChannel,
}) => {
  const containerRef = useRef<HTMLDivElement>();
  const menuButtonRef = useRef<HTMLButtonElement>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<IAnchorPosition | undefined>(undefined);

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

  const handleHeaderMenuOpen = useCallback(() => {
    setIsMenuOpen(true);
    const rect = menuButtonRef.current!.getBoundingClientRect();
    setMenuPosition({ x: rect.right, y: rect.bottom });
  }, []);

  const handleHeaderMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleHeaderMenuHide = useCallback(() => {
    setMenuPosition(undefined);
  }, []);

  function stopPropagation(e: React.MouseEvent<any, MouseEvent>) {
    e.stopPropagation();
  }

  return (
    <div
      ref={containerRef}
      className="HeaderActions"
      onClick={stopPropagation}
    >
      {canSubscribe && (
        <Button
          size="tiny"
          ripple
          fluid
          onClick={onSubscribeChannel}
        >
          {isChannel ? 'Subscribe' : 'Join Group'}
        </Button>
      )}
      <Button
        round
        ripple={isRightColumnShown}
        color="translucent"
        size="smaller"
        onClick={onSearchClick}
      >
        <i className="icon-search" />
      </Button>
      {!canSubscribe && (
        <Button
          round
          ripple
          size="smaller"
          color="translucent"
          ref={menuButtonRef}
          onClick={handleHeaderMenuOpen}
        >
          <i className="icon-more" />
        </Button>
      )}
      {menuPosition && (
        <HeaderMenuContainer
          chatId={chatId}
          isOpen={isMenuOpen}
          anchor={menuPosition}
          onClose={handleHeaderMenuClose}
          onCloseAnimationEnd={handleHeaderMenuHide}
        />
      )}
    </div>
  );
};

export default HeaderActions;
