import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiMessage, PollAnswerVote } from '../../api/types';
import { selectChatMessage } from '../../modules/selectors';
import { pick } from '../../util/iteratees';
import { getMessagePoll } from '../../modules/helpers';

import PollAnswerResults from './PollAnswerResults';
import Loading from '../ui/Loading';

import './PollResults.scss';

type StateProps = {
  message?: ApiMessage;
  lastSyncTime?: number;
};

type DispatchProps = Pick<GlobalActions, 'setForwardChatIds' | 'forwardMessages' | 'loadMoreChats'>;


const PollResults: FC<StateProps & DispatchProps> = ({
  message,
  lastSyncTime,
}) => {
  if (!message) {
    return <Loading />;
  }

  const { summary, results } = getMessagePoll(message)!;
  if (!results.results) {
    return null;
  }

  const resultsByOption = results.results.reduce((
    result: Record<string, PollAnswerVote>, pollAnswerVote: PollAnswerVote,
  ) => {
    result[pollAnswerVote.option] = pollAnswerVote;

    return result;
  }, {});

  return (
    <div className="PollResults">
      <h3 className="poll-question">{summary.question}</h3>
      <div className="poll-results-list custom-scroll">
        {lastSyncTime && summary.answers.map((answer) => (
          <PollAnswerResults
            key={answer.option}
            chatId={message.chatId}
            messageId={message.id}
            answer={answer}
            answerVote={resultsByOption[answer.option]}
            totalVoters={results.totalVoters!}
          />
        ))}
        {!lastSyncTime && <Loading />}
      </div>
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    const {
      pollResults: { chatId, messageId },
      lastSyncTime,
    } = global;

    if (!chatId || !messageId) {
      return {};
    }

    const message = selectChatMessage(global, chatId, messageId);

    return {
      message,
      lastSyncTime,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['setForwardChatIds', 'forwardMessages', 'loadMoreChats']),
)(PollResults));
