import React, { FC, memo } from '../../lib/teact/teact';
import { withGlobal } from '../../lib/teact/teactn';

import { GlobalActions } from '../../global/types';
import { ApiMessage, PollAnswerVote, ApiChat } from '../../api/types';
import { selectChat, selectChatMessage } from '../../modules/selectors';
import { pick } from '../../util/iteratees';
import { getMessagePoll } from '../../modules/helpers';

import PollAnswerResults from './PollAnswerResults';
import Loading from '../ui/Loading';

import './PollResults.scss';

type StateProps = {
  chat?: ApiChat;
  message?: ApiMessage;
  lastSyncTime?: number;
};

type DispatchProps = Pick<GlobalActions, 'setForwardChatIds' | 'forwardMessages' | 'loadMoreChats'>;


const PollResults: FC<StateProps & DispatchProps> = ({
  chat,
  message,
  lastSyncTime,
}) => {
  if (!message || !chat) {
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
            chat={chat}
            message={message}
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

    const chat = selectChat(global, chatId);
    const message = selectChatMessage(global, chatId, messageId);

    return {
      chat,
      message,
      lastSyncTime,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['setForwardChatIds', 'forwardMessages', 'loadMoreChats']),
)(PollResults));
