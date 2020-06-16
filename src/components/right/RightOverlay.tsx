import React, {
  FC, useCallback, useEffect, useState, memo,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';

import { pick } from '../../util/iteratees';
import { selectIsForwardMenuOpen, selectIsMediaViewerOpen } from '../../modules/selectors';
import captureEscKeyListener from '../../util/captureEscKeyListener';
import useShowTransition from '../../hooks/useShowTransition';

import ForwardPicker from '../common/ForwardPicker.async';
import RightHeader from './RightHeader';

import './RightOverlay.scss';

type StateProps = {
  isForwarding: boolean;
};

type DispatchProps = Pick<GlobalActions, 'closeForwardMenu'>;

const RightOverlay: FC<StateProps & DispatchProps> = ({
  isForwarding,
  closeForwardMenu,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onCloseAnimationEnd = useCallback(() => {
    if (isForwarding) {
      closeForwardMenu();
    }
  }, [isForwarding, closeForwardMenu]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => (isOpen ? captureEscKeyListener(onClose) : undefined), [isOpen, onClose]);
  useEffect(() => {
    setIsOpen(isForwarding);
  }, [isForwarding]);

  const {
    shouldRender,
    transitionClassNames,
  } = useShowTransition(isOpen, onCloseAnimationEnd, undefined, false);

  if (!shouldRender) {
    return undefined;
  }

  return (
    <div id="RightOverlay">
      <div className="overlay-backdrop" onClick={onClose} />
      <div className={`overlay-main ${transitionClassNames}`}>
        <RightHeader
          isForwarding={isForwarding}
          onClose={onClose}
        />
        {isForwarding ? (
          <ForwardPicker />
        ) : undefined}
      </div>
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const isForwarding = selectIsForwardMenuOpen(global) && selectIsMediaViewerOpen(global);

    return {
      isForwarding,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['closeForwardMenu']),
)(RightOverlay));
