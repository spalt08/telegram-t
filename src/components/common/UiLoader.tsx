import React, { FC, useEffect } from '../../lib/teact/teact';
import { getGlobal, withGlobal } from '../../lib/teact/teactn';

import { ApiMediaFormat } from '../../api/types';
import { GlobalActions, GlobalState } from '../../global/types';

import { getChatAvatarHash } from '../../modules/helpers/chats'; // Direct import for better module splitting
import useShowTransition from '../../hooks/useShowTransition';
import { pause } from '../../util/schedulers';
import { preloadImage } from '../../util/files';
import preloadFonts from '../../util/fonts';
import * as mediaLoader from '../../util/mediaLoader';
import { Bundles, loadModule } from '../../util/moduleLoader';
import { pick } from '../../util/iteratees';

import './UiLoader.scss';

// @ts-ignore
import telegramLogoPath from '../../assets/telegram-logo.svg';
// @ts-ignore
import monkeyPath from '../../assets/monkey.svg';

type OwnProps = {
  page: 'main' | 'authCode' | 'authPassword' | 'authPhoneNumber' | 'authQrCode';
  children: any;
};

type StateProps = Pick<GlobalState, 'uiReadyState'>;

type DispatchProps = Pick<GlobalActions, 'setIsUiReady'>;

const MAX_PRELOAD_DELAY = 1000;
const SECOND_STATE_DELAY = 1000;
const AVATARS_TO_PRELOAD = 17;

function preloadAvatars() {
  const { listIds, byId } = getGlobal().chats;
  if (!listIds) {
    return undefined;
  }

  return Promise.all(listIds.slice(0, AVATARS_TO_PRELOAD).map((chatId) => {
    const chat = byId[chatId];
    if (!chat) {
      return undefined;
    }

    const avatarHash = getChatAvatarHash(chat);
    if (!avatarHash) {
      return undefined;
    }

    return mediaLoader.fetch(avatarHash, ApiMediaFormat.DataUri);
  }));
}

const preloadTasks = {
  main: () => Promise.all([
    loadModule(Bundles.Main, 'Main')
      .then(preloadFonts),
    preloadAvatars(),
  ]),
  authPhoneNumber: () => Promise.all([
    preloadFonts(),
    preloadImage(telegramLogoPath),
  ]),
  authCode: () => preloadImage(monkeyPath),
  authPassword: () => preloadImage(monkeyPath),
  // Used only for page transition.
  authQrCode: () => Promise.resolve(),
};

const UiLoader: FC<OwnProps & StateProps & DispatchProps> = ({
  page, children, uiReadyState, setIsUiReady,
}) => {
  const { shouldRender, transitionClassNames } = useShowTransition(!uiReadyState, undefined, true);

  useEffect(() => {
    let timeout: number;

    Promise.race([
      pause(MAX_PRELOAD_DELAY),
      preloadTasks[page](),
    ]).then(() => {
      setIsUiReady({ uiReadyState: 1 });

      timeout = window.setTimeout(() => {
        setIsUiReady({ uiReadyState: 2 });
      }, SECOND_STATE_DELAY);
    });

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      setIsUiReady({ uiReadyState: 0 });
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
  (global): StateProps => pick(global, ['uiReadyState']),
  (setGlobal, actions): DispatchProps => pick(actions, ['setIsUiReady']),
)(UiLoader);
