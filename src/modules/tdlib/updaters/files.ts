import { getGlobal, setGlobal } from '../../../lib/teactn';

import { ApiFile, ApiUpdate } from '../../../api/types';
import { TdLibUpdate } from '../../../api/tdlib/types/updates';

import * as TdLib from '../../../api/tdlib';
import { onNextTick } from '../../../util/schedulers';

export function onUpdate(update: ApiUpdate | TdLibUpdate) {
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
