import React, {
  FC, memo, useEffect, useCallback,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { SettingsScreens } from '../../../types';
import { ApiWallpaper } from '../../../api/types';

import { pick } from '../../../util/iteratees';
import { throttle } from '../../../util/schedulers';

import ListItem from '../../ui/ListItem';
import Checkbox from '../../ui/Checkbox';
import Loading from '../../ui/Loading';
import WallpaperTile from './WallpaperTile';

import './SettingsGeneralChatBackground.scss';

type OwnProps = {
  onScreenSelect: (screen: SettingsScreens) => void;
};

type StateProps = {
  customChatBackgroundSlug?: string;
  isBackgroundBlurred?: boolean;
  loadedWallpapers?: ApiWallpaper[];
};

type DispatchProps = Pick<GlobalActions, 'setSettingOption' | 'loadWallpapers'>;

const runThrottled = throttle((cb) => cb(), 60000, true);

const SettingsGeneralChatBackground: FC<OwnProps & StateProps & DispatchProps> = ({
  customChatBackgroundSlug,
  isBackgroundBlurred,
  loadedWallpapers,
  setSettingOption,
  loadWallpapers,
}) => {
  // Due to the parent Transition, this component never gets unmounted,
  // that's why we use throttled API call on every update.
  useEffect(() => {
    runThrottled(() => {
      loadWallpapers();
    });
  }, [loadWallpapers]);

  const handleWallPaperSelect = useCallback((slug: string, blobUrl: string) => {
    setSettingOption({
      customChatBackground: {
        slug,
        blobUrl,
      },
    });
  }, [setSettingOption]);

  const handleWallPaperBlurChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingOption({ isBackgroundBlurred: e.target.checked });
  }, [setSettingOption]);

  return (
    <div className="SettingsGeneralChatBackground settings-content custom-scroll">
      <div className="settings-item pt-3">
        <ListItem
          icon="camera-add"
          className="not-implemented mb-0"
        >
          Upload Wallpaper
        </ListItem>

        <ListItem
          icon="colorize"
          className="not-implemented"
        >
          Pick a Color
        </ListItem>

        <Checkbox
          label="Blur Wallpaper Image"
          checked={!!isBackgroundBlurred}
          onChange={handleWallPaperBlurChange}
        />
      </div>

      {loadedWallpapers ? (
        <div className="settings-wallpapers">
          {loadedWallpapers.map((wallpaper) => (
            <WallpaperTile
              wallpaper={wallpaper}
              isSelected={customChatBackgroundSlug === wallpaper.slug}
              onClick={handleWallPaperSelect}
            />
          ))}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { isBackgroundBlurred, customChatBackground } = global.settings.byKey;
    const { slug: customChatBackgroundSlug } = customChatBackground || {};
    const { loadedWallpapers } = global.settings;

    return {
      customChatBackgroundSlug,
      isBackgroundBlurred,
      loadedWallpapers,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['setSettingOption', 'loadWallpapers']),
)(SettingsGeneralChatBackground));
