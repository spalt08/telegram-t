import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from '../../lib/teact/teact';

import { TextPart } from '../common/helpers/renderMessageText';

import AnimationFade from './AnimationFade';
import Portal from './Portal';

import './Notification.scss';

type OwnProps = {
  message?: TextPart[];
  onDismiss: () => void;
};

const DISMISS_TIMEOUT = 5000;
const ANIMATION_DURATION = 150;

const Notification: FC<OwnProps> = ({ message, onDismiss }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>|undefined>();

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    setTimeout(onDismiss, ANIMATION_DURATION);
  }, [onDismiss]);

  useEffect(() => {
    timerRef.current = setTimeout(handleDismiss, DISMISS_TIMEOUT);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handleDismiss]);

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    timerRef.current = setTimeout(handleDismiss, DISMISS_TIMEOUT);
  }, [handleDismiss]);

  function renderComponent() {
    return (
      <div
        className="Notification"
        onClick={handleDismiss}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="content">
          {message}
        </div>
      </div>
    );
  }

  return (
    <Portal className="Notification-portal" containerId="#middle-column-portals">
      <AnimationFade isOpen={isOpen} className="Notification-container">
        {renderComponent}
      </AnimationFade>
    </Portal>
  );
};

export default memo(Notification);
