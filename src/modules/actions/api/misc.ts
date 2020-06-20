import { addReducer, getGlobal, setGlobal } from '../../../lib/teact/teactn';
import { callApi } from '../../../api/gramjs';

addReducer('loadWallpapers', () => {
  void loadWallpapers();
});

async function loadWallpapers() {
  const result = await callApi('fetchWallpapers', 0);
  if (!result) {
    return;
  }

  const global = getGlobal();
  setGlobal({
    ...global,
    settings: {
      ...global.settings,
      loadedWallpapers: result.wallpapers,
    },
  });
}
