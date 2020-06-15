import React, {
  FC, useCallback, useState, memo, useEffect,
} from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import usePrevious from '../../hooks/usePrevious';
import {
  ApiChat,
  ApiMessage,
  PollAnswer,
  PollAnswerVote,
} from '../../api/types';
import { GlobalActions } from '../../global/types';
import { pick } from '../../util/iteratees';

import Button from '../ui/Button';
import Loading from '../ui/Loading';
import ListItem from '../ui/ListItem';
import PrivateChatInfo from '../common/PrivateChatInfo';

import './PollAnswerResults.scss';

type OwnProps = {
  chat: ApiChat;
  message: ApiMessage;
  answer: PollAnswer;
  answerVote: PollAnswerVote;
  totalVoters: number;
};

type StateProps = {
  voters?: number[];
  offset: string;
};

type DispatchProps = Pick<GlobalActions, 'loadPollOptionResults' | 'openChat' | 'closePollResults'>;

const INITIAL_LIMIT = 4;
const VIEW_MORE_LIMIT = 50;

const PollAnswerResults: FC<OwnProps & StateProps & DispatchProps> = ({
  chat,
  message,
  answer,
  answerVote,
  totalVoters,
  voters,
  offset,
  loadPollOptionResults,
  openChat,
  closePollResults,
}) => {
  const previousVotersCount = usePrevious<number>(answerVote.voters);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { option, text } = answer;

  useEffect(() => {
    // For update when new votes arrive or when the user takes back his vote
    if (previousVotersCount === null
      || previousVotersCount <= INITIAL_LIMIT
      || answerVote.voters <= INITIAL_LIMIT
    ) {
      loadPollOptionResults({
        chat, messageId: message.id, option, offset, limit: INITIAL_LIMIT, shouldResetVoters: true,
      });
    }
    // eslint-disable-next-line
  }, [answerVote.voters]);

  const handleViewMoreClick = useCallback(() => {
    setIsLoading(true);
    loadPollOptionResults({
      chat, messageId: message.id, option, offset, limit: VIEW_MORE_LIMIT,
    });
  }, [chat, loadPollOptionResults, message.id, offset, option]);

  useEffect(() => {
    setIsLoading(false);
  }, [voters]);

  const handleMemberClick = useCallback((id: number) => {
    openChat({ id });
    closePollResults();
  }, [closePollResults, openChat]);

  function renderViewMoreButton() {
    const leftVotersCount = answerVote.voters - voters!.length;

    return voters!.length > INITIAL_LIMIT && leftVotersCount > 0 && (
      <Button
        color="translucent"
        ripple
        size="smaller"
        isText
        isLoading={isLoading}
        onClick={handleViewMoreClick}
      >
        <i className="icon-down" />
        Show {leftVotersCount} more {leftVotersCount > 1 ? 'voters' : 'voter'}
      </Button>
    );
  }

  return (
    <div className="PollAnswerResults">
      <div className="poll-voters">
        {voters
          ? voters.map((id) => (
            <ListItem
              key={id}
              className="chat-item-clickable"
              onClick={() => handleMemberClick(id)}
            >
              <PrivateChatInfo
                avatarSize="tiny"
                userId={id}
                forceShowSelf
                noStatusOrTyping
              />
            </ListItem>
          ))
          : <Loading />}
        {voters && renderViewMoreButton()}
      </div>
      <div className="answer-head">
        <span className="answer-title">{text}</span>
        <span className="answer-percent">{getPercentage(answerVote.voters, totalVoters)}%</span>
      </div>
    </div>
  );
};

function getPercentage(value: number, total: number) {
  return total > 0 ? ((value / total) * 100).toFixed() : 0;
}

export default memo(withGlobal<OwnProps>(
  (global, { answer }: OwnProps): StateProps => {
    const { voters, offsets } = global.pollResults;

    return {
      voters: voters && voters[answer.option],
      offset: (offsets && offsets[answer.option]) || '',
    };
  },
  (global, actions): DispatchProps => pick(actions, ['loadPollOptionResults', 'openChat', 'closePollResults']),
)(PollAnswerResults));
