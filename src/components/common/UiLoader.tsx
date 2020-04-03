import React, { FC, useEffect } from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { ApiMediaFormat } from '../../api/types';
import { GlobalActions, GlobalState } from '../../global/types';

import useShowTransition from '../../hooks/useShowTransition';
import { getChatAvatarHash } from '../../modules/helpers';
import { pause } from '../../util/schedulers';
import { preloadImage } from '../../util/files';
import preloadFonts from '../../util/fonts';
import * as mediaLoader from '../../util/mediaLoader';

// @ts-ignore
import telegramLogoPath from '../../assets/telegram-logo.svg';
// @ts-ignore
import monkeyPath from '../../assets/monkey.svg';

import './UiLoader.scss';

type OwnProps = {
  page: 'main' | 'authCode' | 'authPassword' | 'authPhoneNumber';
  children: any;
};

type StateProps = Pick<GlobalState, 'isUiReady'>;

type DispatchProps = Pick<GlobalActions, 'setIsUiReady'>;

const MAX_PRELOAD_DELAY = 1000;

function preloadAvatars() {
  return Promise.all(Object.values(getGlobal().chats.byId).map((chat) => {
    const avatarHash = getChatAvatarHash(chat);
    return avatarHash ? mediaLoader.fetch(avatarHash, ApiMediaFormat.DataUri) : null;
  }));
}

const preloadTasks = {
  main: () => Promise.all([
    preloadFonts(),
    preloadAvatars(),
  ]),
  authPhoneNumber: () => Promise.all([
    preloadFonts(),
    preloadImage(telegramLogoPath),
  ]),
  authCode: () => preloadImage(monkeyPath),
  authPassword: () => preloadImage(monkeyPath),
};

const UiLoader: FC<OwnProps & StateProps & DispatchProps> = ({
  page, children, isUiReady, setIsUiReady,
}) => {
  const { shouldRender, transitionClassNames } = useShowTransition(!isUiReady, undefined, true);

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
      {shouldRender && (
        <div key={page} className={['mask', transitionClassNames].join(' ')}>
          {page === 'main' ? (
            <>
              <div className="left" />
              <div className="middle" />
            </>
          ) : (
            <div className="blank" />
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default withGlobal<OwnProps>(
  (global): StateProps => {
    const { isUiReady } = global;
    return { isUiReady };
  },
  (setGlobal, actions): DispatchProps => {
    const { setIsUiReady } = actions;
    return { setIsUiReady };
  },
)(UiLoader);
