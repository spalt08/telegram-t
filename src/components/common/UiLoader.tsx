import React, { FC, useEffect } from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../../store/types';

import useOverlay from '../../hooks/useOverlay';
import { getChatAvatarHash } from '../../modules/helpers';
import { pause } from '../../util/schedulers';
import preloadFonts from '../../util/fonts';
import * as mediaLoader from '../../util/mediaLoader';

import './UiLoader.scss';

type IProps = {
  page: 'main' | 'authPhoneNumber';
  children: any;
} & Pick<GlobalState, 'isUiReady'> & Pick<GlobalActions, 'setIsUiReady'>;

const MAX_PRELOAD_DELAY = 1000;

function preloadAvatars() {
  return Promise.all(Object.values(getGlobal().chats.byId).map((chat) => {
    const avatarHash = getChatAvatarHash(chat);
    return avatarHash ? mediaLoader.fetch(avatarHash, mediaLoader.Type.DataUri) : null;
  }));
}

const preloadTasks = {
  main: () => Promise.all([
    preloadFonts(),
    preloadAvatars(),
  ]),
  authPhoneNumber: () => preloadFonts(),
};

const UiLoader: FC<IProps> = ({
  page, children, isUiReady, setIsUiReady,
}) => {
  const { isShown, overlayClassNames, handleCloseAnimationEnd } = useOverlay(!isUiReady, undefined, true);

  useEffect(() => {
    Promise.race([
      pause(MAX_PRELOAD_DELAY),
      preloadTasks[page](),
    ]).then(() => {
      setIsUiReady({ isUiReady: true });
    });

    return () => {
      setIsUiReady({ isUiReady: false });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="UiLoader">
      {isShown && (
        <div
          key={page}
          className={['mask', 'overlay', ...overlayClassNames].join(' ')}
          onTransitionEnd={handleCloseAnimationEnd}
        >
          {page === 'main' ? (
            [
              <div className="left" />,
              <div className="middle" />,
            ]
          ) : (
            <div className="blank" />
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default withGlobal(
  (global) => {
    const { isUiReady } = global;
    return { isUiReady };
  },
  (setGlobal, actions) => {
    const { setIsUiReady } = actions;
    return { setIsUiReady };
  },
)(UiLoader);