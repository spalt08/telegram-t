import { getGlobal, setGlobal } from '../../../lib/teactn';
import { ApiFile, TdLibUpdate } from '../../../api/tdlib/types';

import { onNextTick } from '../../../util/schedulers';
import * as TdLib from '../../../api/tdlib';

export function onUpdate(update: TdLibUpdate) {
  switch (update['@type']) {
    case 'updateFile': {
      const { file } = update;

      // Let TdLibLegacy FileStore handle the new file.
      onNextTick(() => updateFile(file.id, file));

      break;
    }
  }
}

function updateFile(fileId: number, file: ApiFile) {
  const blob = TdLib.getBlob(file);
  const blobUrl = blob ? URL.createObjectURL(blob) : undefined;
  const global = getGlobal();

  setGlobal({
    ...global,
    files: {
      ...global.files,
      byId: {
        ...global.files.byId,
        [fileId]: {
          ...(global.files.byId[fileId] || {}),
          ...file,
          blob,
          blobUrl,
        },
      },
    },
  });
}
