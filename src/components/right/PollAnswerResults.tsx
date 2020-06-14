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
  voters: number[];
  offset: string;
};

type DispatchProps = Pick<GlobalActions, 'getPollVotes' | 'openChat' | 'closePollResults'>;

const INITIAL_LIMIT = 4;
const VIEW_MORE_LIMIT = 50;

const isMobile = matchMedia('(max-width: 600px)');

const PollAnswerResults: FC<OwnProps & StateProps & DispatchProps> = ({
  chat,
  message,
  answer,
  answerVote,
  totalVoters,
  voters,
  offset,
  getPollVotes,
  openChat,
  closePollResults,
}) => {
  const previousChatId = usePrevious<number>(chat.id);
  const previousMessageId = usePrevious<number>(message.id);
  const previousVotersCount = usePrevious<number>(answerVote.voters);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { option, text } = answer;

  useEffect(() => {
    if (previousChatId !== chat.id
      || previousMessageId !== message.id
      || previousVotersCount === null
      || previousVotersCount <= INITIAL_LIMIT
      || (previousVotersCount > voters.length && voters.length === 0)
    ) {
      getPollVotes({
        chat, messageId: message.id, option, offset, limit: INITIAL_LIMIT,
      });
    }
    // eslint-disable-next-line
  }, [chat.id, message.id, option, voters.length, answerVote.voters]);

  const handleViewMoreClick = useCallback(() => {
    setIsLoading(true);
    getPollVotes({
      chat, messageId: message.id, option, offset, limit: VIEW_MORE_LIMIT,
    });
  }, [chat, getPollVotes, message.id, offset, option]);

  useEffect(() => {
    setIsLoading(false);
  }, [voters]);

  const handleMemberClick = useCallback((id: number) => {
    openChat({ id });
    if (isMobile.matches) {
      closePollResults();
    }
  }, [closePollResults, openChat]);

  function renderViewMoreButton() {
    const leftVotersCount = answerVote.voters - voters.length;

    return voters.length > 0 && leftVotersCount > 0 && (
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
      <div className="answer-head">
        <span className="answer-title">{text}</span>
        <span className="answer-percent">{getPercentage(answerVote.voters, totalVoters)}%</span>
      </div>
      <div className="poll-voters">
        {voters.length || answerVote.voters === 0
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
                showStatusOrTyping={false}
              />
            </ListItem>
          ))
          : <Loading />}
        {renderViewMoreButton()}
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
      voters: (voters && voters[answer.option]) || [],
      offset: (offsets && offsets[answer.option]) || '',
    };
  },
  (global, actions): DispatchProps => pick(actions, ['getPollVotes', 'openChat', 'closePollResults']),
)(PollAnswerResults));
