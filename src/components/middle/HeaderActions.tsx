import React, {
  FC,
  useRef,
  useCallback,
  useState,
} from '../../lib/teact/teact';

import { IAnchorPosition } from '../../types';

import { MOBILE_SCREEN_MAX_WIDTH } from '../../config';

import Button from '../ui/Button';
import HeaderMenuContainer from './HeaderMenuContainer.async';

type OwnProps = {
  chatId: number;
  isChannel?: boolean;
  canSubscribe?: boolean;
  isRightColumnShown?: boolean;
  onSearchClick: () => void;
  onSubscribeChannel: () => void;
};

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
  const isMobile = window.innerWidth <= MOBILE_SCREEN_MAX_WIDTH;

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
      {!isMobile && canSubscribe && (
        <Button
          size="tiny"
          ripple
          fluid
          onClick={onSubscribeChannel}
        >
          {isChannel ? 'Subscribe' : 'Join Group'}
        </Button>
      )}
      {!isMobile && (
        <Button
          round
          ripple={isRightColumnShown}
          color="translucent"
          size="smaller"
          onClick={onSearchClick}
          ariaLabel="Search in this chat"
        >
          <i className="icon-search" />
        </Button>
      )}
      {(isMobile || !canSubscribe) && (
        <Button
          round
          ripple
          size="smaller"
          color="translucent"
          className={isMenuOpen ? 'active' : ''}
          ref={menuButtonRef}
          onClick={handleHeaderMenuOpen}
          ariaLabel="More actions"
        >
          <i className="icon-more" />
        </Button>
      )}
      {menuPosition && (
        <HeaderMenuContainer
          chatId={chatId}
          isOpen={isMenuOpen}
          anchor={menuPosition}
          canSubscribe={canSubscribe}
          isChannel={isChannel}
          onSubscribeChannel={onSubscribeChannel}
          onSearchClick={onSearchClick}
          onClose={handleHeaderMenuClose}
          onCloseAnimationEnd={handleHeaderMenuHide}
        />
      )}
    </div>
  );
};

export default HeaderActions;
