import React, {
  FC, memo, useMemo, useCallback, useState, useEffect,
} from '../../../../lib/teact/teact';
import { withGlobal } from '../../../../lib/teact/teactn';

import { GlobalActions } from '../../../../global/types';
import { ApiChatFolder, ApiChat, ApiUser } from '../../../../api/types';

import { pick } from '../../../../util/iteratees';
import { throttle } from '../../../../util/schedulers';
import getAnimationData from '../../../common/helpers/animatedAssets';

import ListItem from '../../../ui/ListItem';
import Button from '../../../ui/Button';
import Loading from '../../../ui/Loading';
import AnimatedSticker from '../../../common/AnimatedSticker';
import { getFolderDescriptionText } from '../../../../modules/helpers';

type OwnProps = {
  onCreateFolder: () => void;
  onEditFolder: (folder: ApiChatFolder) => void;
};

type StateProps = {
  chatsById: Record<number, ApiChat>;
  usersById: Record<number, ApiUser>;
  orderedFolderIds?: number[];
  foldersById: Record<number, ApiChatFolder>;
  recommendedChatFolders?: ApiChatFolder[];
};

type DispatchProps = Pick<GlobalActions, 'loadRecommendedChatFolders' | 'addChatFolder' | 'showError'>;

const runThrottledForLoadRecommended = throttle((cb) => cb(), 60000, true);

const MAX_ALLOWED_FOLDERS = 10;

const SettingsFoldersMain: FC<OwnProps & StateProps & DispatchProps> = ({
  onCreateFolder,
  onEditFolder,
  chatsById,
  usersById,
  orderedFolderIds,
  foldersById,
  recommendedChatFolders,
  loadRecommendedChatFolders,
  addChatFolder,
  showError,
}) => {
  const [animationData, setAnimationData] = useState<Record<string, any>>();
  const [isAnimationLoaded, setIsAnimationLoaded] = useState(false);
  const handleAnimationLoad = useCallback(() => setIsAnimationLoaded(true), []);

  useEffect(() => {
    if (!animationData) {
      getAnimationData('FoldersAll').then(setAnimationData);
    }
  }, [animationData]);

  // Due to the parent Transition, this component never gets unmounted,
  // that's why we use throttled API call on every update.
  useEffect(() => {
    runThrottledForLoadRecommended(() => {
      loadRecommendedChatFolders();
    });
  }, [loadRecommendedChatFolders]);

  const handleCreateFolder = useCallback(() => {
    if (Object.keys(foldersById).length >= MAX_ALLOWED_FOLDERS) {
      showError({
        error: {
          message: 'DIALOG_FILTERS_TOO_MUCH',
        },
      });

      return;
    }

    onCreateFolder();
  }, [foldersById, showError, onCreateFolder]);

  const userFolders = useMemo(() => {
    if (!orderedFolderIds) {
      return undefined;
    }

    return orderedFolderIds.map((id) => {
      const folder = foldersById[id];

      return {
        id: folder.id,
        title: folder.title,
        subtitle: getFolderDescriptionText(chatsById, usersById, folder),
      };
    });
  }, [chatsById, usersById, orderedFolderIds, foldersById]);

  const handleCreateFolderFromRecommended = useCallback((folder: ApiChatFolder) => {
    if (Object.keys(foldersById).length >= MAX_ALLOWED_FOLDERS) {
      showError({
        error: {
          message: 'DIALOG_FILTERS_TOO_MUCH',
        },
      });

      return;
    }

    addChatFolder({ folder });
  }, [foldersById, addChatFolder, showError]);

  return (
    <div className="settings-content custom-scroll">
      <div className="settings-folders-header">
        <div className="settings-folders-icon">
          {animationData && (
            <AnimatedSticker
              animationData={animationData}
              play={isAnimationLoaded}
              noLoop
              onLoad={handleAnimationLoad}
            />
          )}
        </div>

        <p className="settings-item-description mb-3">
          Create folders for different groups of chats and quickly switch between them.
        </p>

        <Button
          // TODO: Refactor button component to handle icon placemenet with props
          className="with-icon mb-2"
          color="primary"
          size="smaller"
          pill
          fluid
          onClick={handleCreateFolder}
        >
          <i className="icon-add" />
          Create Folder
        </Button>
      </div>

      <div className="settings-item pt-3">
        <h4 className="settings-item-header mb-3">Folders</h4>

        {userFolders && userFolders.length ? userFolders.map((folder) => (
          <ListItem
            className="mb-2"
            narrow
            onClick={() => onEditFolder(foldersById[folder.id])}
          >
            <div className="multiline-menu-item">
              <span className="title">{folder.title}</span>
              <span className="subtitle">{folder.subtitle}</span>
            </div>
          </ListItem>
        )) : userFolders && !userFolders.length ? (
          <p className="settings-item-description my-4">
            You have no folders yet.
          </p>
        ) : <Loading />}
      </div>

      {(recommendedChatFolders && !!recommendedChatFolders.length) && (
        <div className="settings-item pt-3">
          <h4 className="settings-item-header mb-3">Recommended folders</h4>

          {recommendedChatFolders.map((folder) => (
            <ListItem
              className="mb-2"
              narrow
              onClick={() => handleCreateFolderFromRecommended(folder)}
            >
              <div className="settings-folders-recommended-item">
                <div className="multiline-menu-item">
                  <span className="title">{folder.title}</span>
                  <span className="subtitle">{folder.description}</span>
                </div>

                <Button
                  className="px-3"
                  color="primary"
                  size="tiny"
                  pill
                  fluid
                >
                  Add
                </Button>
              </div>
            </ListItem>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const {
      chats: { byId: chatsById },
      users: { byId: usersById },
    } = global;

    const {
      orderedIds: orderedFolderIds,
      byId: foldersById,
      recommended: recommendedChatFolders,
    } = global.chatFolders;

    return {
      chatsById,
      usersById,
      orderedFolderIds,
      foldersById,
      recommendedChatFolders,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadRecommendedChatFolders', 'addChatFolder', 'showError']),
)(SettingsFoldersMain));
