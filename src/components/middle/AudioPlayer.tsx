import React, { FC, useCallback } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiAudio, ApiMessage } from '../../api/types';

import * as mediaLoader from '../../util/mediaLoader';
import { getMessageAudio, getMessageMediaHash, getUserFullName } from '../../modules/helpers';
import { selectSender } from '../../modules/selectors';
import { pick } from '../../util/iteratees';
import renderText from '../common/helpers/renderText';
import useAudioPlayer from '../../hooks/useAudioPlayer';
import buildClassName from '../../util/buildClassName';

import RippleEffect from '../ui/RippleEffect';
import Button from '../ui/Button';

import './AudioPlayer.scss';

type OwnProps = {
  message: ApiMessage;
};

type StateProps = {
  senderName?: string;
};

type DispatchProps = Pick<GlobalActions, 'focusMessage' | 'closeAudioPlayer'>;

const AudioPlayer: FC<OwnProps & StateProps & DispatchProps> = ({
  message, senderName, focusMessage, closeAudioPlayer,
}) => {
  const mediaData = mediaLoader.getFromMemory(getMessageMediaHash(message, 'inline')!) as (string | undefined);
  const { playPause, isPlaying } = useAudioPlayer(message.id, mediaData);

  const handleClick = useCallback(() => {
    focusMessage({ chatId: message.chatId, messageId: message.id });
  }, [focusMessage, message.chatId, message.id]);

  const audio = getMessageAudio(message);

  return (
    <div className="AudioPlayer">
      <Button
        round
        ripple
        color="translucent"
        size="smaller"
        className={buildClassName('toggle-play', isPlaying ? 'pause' : 'play')}
        onClick={playPause}
        ariaLabel={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        <i className="icon-play" />
        <i className="icon-pause" />
      </Button>

      <div className="AudioPlayer-content" onClick={handleClick}>
        {audio ? renderAudio(audio) : renderVoice(senderName)}
        <RippleEffect />
      </div>

      <Button
        round
        ripple
        className="player-close"
        color="translucent"
        size="smaller"
        onClick={closeAudioPlayer}
        ariaLabel="Close player"
      >
        <i className="icon-close" />
      </Button>
    </div>
  );
};

function renderAudio(audio: ApiAudio) {
  const { title, performer, fileName } = audio;

  return (
    <>
      <div className="title">{renderText(title || fileName)}</div>
      {performer && (
        <div className="subtitle">{renderText(performer)}</div>
      )}
    </>
  );
}

function renderVoice(senderName?: string) {
  return (
    <>
      <div className="title">{senderName && renderText(senderName)}</div>
      <div className="subtitle">Voice message</div>
    </>
  );
}

export default withGlobal<OwnProps>(
  (global, { message }) => {
    const sender = selectSender(global, message);
    const senderName = sender ? getUserFullName(sender) : undefined;

    return { senderName };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['focusMessage', 'closeAudioPlayer']),
)(AudioPlayer);
