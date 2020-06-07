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

import './NewChannel.scss';

const CHAT_TITLE_EMPTY = 'Channel title can\'t be empty';

export type OwnProps = {
  onReset: () => void;
};

type StateProps = {
  creationProgress?: ChatCreationProgress;
  creationError?: string;
};

type DispatchProps = Pick<GlobalActions, 'createChannel'>;

const NewChannel: FC<OwnProps & StateProps & DispatchProps> = ({
  onReset,
  creationProgress,
  creationError,
  createChannel,
}) => {
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [photo, setPhoto] = useState<File | undefined>();
  const [error, setError] = useState<string | undefined>();

  const isLoading = creationProgress === ChatCreationProgress.InProgress;

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setTitle(value);
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    setAbout(value);
  }, []);

  const handleCreateChannel = useCallback(() => {
    if (!title.length) {
      setError(CHAT_TITLE_EMPTY);
      return;
    }

    createChannel({
      title,
      about,
      photo,
    });
  }, [about, photo, title, createChannel]);

  useEffect(() => {
    if (creationProgress === ChatCreationProgress.Complete) {
      onReset();
    }
  }, [creationProgress, onReset]);

  return (
    <div className="NewChannel">
      <div className="LeftHeader">
        <Button
          round
          size="smaller"
          color="translucent"
          onClick={onReset}
        >
          <i className="icon-back" />
        </Button>
        <h3>New Channel</h3>
      </div>
      <div className="NewChannel-inner">
        <AvatarEditable
          onChange={setPhoto}
          title="Set Channel photo"
        />
        <InputText
          value={title}
          onChange={handleTitleChange}
          label="Channel title"
          error={error === CHAT_TITLE_EMPTY ? error : undefined}
        />
        <InputText
          value={about}
          onChange={handleDescriptionChange}
          label="Description (optional)"
        />
        <p className="note">You can provide an optional description for your channel.</p>
        {creationError && (
          <p className="error">{creationError}</p>
        )}
      </div>

      <FloatingActionButton
        show={title.length !== 0}
        onClick={handleCreateChannel}
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
  (setGlobal, actions): DispatchProps => pick(actions, ['createChannel']),
)(NewChannel));
