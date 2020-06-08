import React, {
  FC, useState, useCallback, useEffect, memo,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import { ChatCreationProgress } from '../../../types';

import { pick } from '../../../util/iteratees';

import InputText from '../../ui/InputText';
import FloatingActionButton from '../../ui/FloatingActionButton';
import Spinner from '../../ui/Spinner';
import AvatarEditable from '../../ui/AvatarEditable';
import Button from '../../ui/Button';
import ListItem from '../../ui/ListItem';
import PrivateChatInfo from '../../common/PrivateChatInfo';

export type OwnProps = {
  memberIds: number[];
  onReset: (forceReturnToChatList?: boolean) => void;
};

type StateProps = {
  creationProgress?: ChatCreationProgress;
  creationError?: string;
};

type DispatchProps = Pick<GlobalActions, 'createGroupChat'>;

const CHAT_TITLE_EMPTY = 'Chat title can\'t be empty';

// TODO @implement
const MAX_USERS_FOR_LEGACY_CHAT = 199; // Accounting for current user
const CHAT_TOO_MANY_USERS = 'Sorry, creating supergroups is not yet supported';

const NewGroupStep2: FC<OwnProps & StateProps & DispatchProps> = ({
  memberIds,
  onReset,
  creationProgress,
  creationError,
  createGroupChat,
}) => {
  const [title, setTitle] = useState('');
  const [photo, setPhoto] = useState<File | undefined>();
  const [error, setError] = useState<string | undefined>();

  const isLoading = creationProgress === ChatCreationProgress.InProgress;

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setTitle(value);
  }, []);

  const handleCreateGroup = useCallback(() => {
    if (!title.length) {
      setError(CHAT_TITLE_EMPTY);
      return;
    }

    if (memberIds.length > MAX_USERS_FOR_LEGACY_CHAT) {
      setError(CHAT_TOO_MANY_USERS);
      return;
    }

    createGroupChat({
      title,
      photo,
      memberIds,
    });
  }, [title, photo, memberIds, createGroupChat]);

  useEffect(() => {
    if (creationProgress === ChatCreationProgress.Complete) {
      onReset(true);
    }
  }, [creationProgress, onReset]);

  const renderedError = creationError || (error !== CHAT_TITLE_EMPTY ? error : undefined);

  return (
    <div className="NewGroup">
      <div className="LeftHeader">
        <Button
          round
          size="smaller"
          color="translucent"
          onClick={() => onReset()}
        >
          <i className="icon-back" />
        </Button>
        <h3>New Group</h3>
      </div>
      <div className="NewGroup-inner step-2">
        <AvatarEditable
          onChange={setPhoto}
          title="Set Group photo"
        />
        <InputText
          value={title}
          onChange={handleTitleChange}
          label="Group title"
          error={error === CHAT_TITLE_EMPTY ? error : undefined}
        />

        {renderedError && (
          <p className="error">{renderedError}</p>
        )}

        <h3 className="group-members-heading">{memberIds.length} members</h3>

        <div className="group-members-list custom-scroll">
          {memberIds.map((id) => (
            <ListItem className="chat-item-clickable">
              <PrivateChatInfo userId={id} />
            </ListItem>
          ))}
        </div>
      </div>

      <FloatingActionButton
        show={title.length !== 0}
        onClick={handleCreateGroup}
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner color="white" />
        ) : (
          <i className="icon-next" />
        )}
      </FloatingActionButton>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const {
      progress: creationProgress,
      error: creationError,
    } = global.chatCreation || {};

    return {
      creationProgress,
      creationError,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['createGroupChat']),
)(NewGroupStep2));
