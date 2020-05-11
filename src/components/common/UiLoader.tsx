import React, { FC, useEffect } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions, GlobalState } from '../../global/types';

import useShowTransition from '../../hooks/useShowTransition';
import { pause } from '../../util/schedulers';
import { preloadImage } from '../../util/files';
import preloadFonts from '../../util/fonts';
import { Bundles, loadModule } from '../../util/moduleLoader';
import { pick } from '../../util/iteratees';

import './UiLoader.scss';

// @ts-ignore
import telegramLogoPath from '../../assets/telegram-logo.svg';
// @ts-ignore
import monkeyPath from '../../assets/monkey.svg';

type OwnProps = {
  page: 'main' | 'authCode' | 'authPassword' | 'authPhoneNumber';
  children: any;
};

type StateProps = Pick<GlobalState, 'isUiReady'>;

type DispatchProps = Pick<GlobalActions, 'setIsUiReady'>;

const MAX_PRELOAD_DELAY = 1000;

const preloadTasks = {
  main: () => Promise.all([
    loadModule(Bundles.Main, 'Main')
      .then(preloadFonts),
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
  (global): StateProps => pick(global, ['isUiReady']),
  (setGlobal, actions): DispatchProps => pick(actions, ['setIsUiReady']),
)(UiLoader);
