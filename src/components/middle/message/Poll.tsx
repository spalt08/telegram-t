import React, {
  FC, useCallback, useState, useEffect,
} from '../../../lib/teact/teact';

import { ApiPoll, PollAnswer } from '../../../api/types';

import RadioGroup from '../../ui/RadioGroup';

import './Poll.scss';

type OwnProps = {
  messageId: number;
  poll: ApiPoll;
  onSendVote: (options: string[]) => void;
};

const Poll: FC<OwnProps> = ({ messageId, poll, onSendVote }) => {
  const [loadingOption, setLoadingOption] = useState<string | undefined>(undefined);
  const { summary, results } = poll;
  const { results: voteResults, totalVoters } = results;
  const hasVoted = voteResults && voteResults.some((r) => r.chosen);
  const canVote = !summary.closed && !hasVoted;
  const maxVotersCount = voteResults ? Math.max(...voteResults.map((r) => r.voters)) : totalVoters;

  useEffect(() => {
    if (
      loadingOption
      && poll.results.results
      && poll.results.results.some((result) => result.chosen)
    ) {
      setLoadingOption(undefined);
    }
  }, [loadingOption, poll.results.results]);

  const handleRadioChange = useCallback(
    (option: string) => {
      setLoadingOption(option);
      onSendVote([option]);
    }, [onSendVote],
  );

  function renderResultOption(answer: PollAnswer) {
    if (!voteResults || !totalVoters) {
      return null;
    }

    const result = voteResults.find((r) => r.option === answer.option);

    return result && (
      <div className="poll-answer">
        <div className="poll-answer-share">{getPercentage(result.voters, totalVoters)}%</div>
        <div className="poll-answer-right">
          <div className="poll-answer-text">
            {answer.text}
            {result.chosen && <span className="poll-chosen-answer">(your choice)</span>}
          </div>
          <div
            className="poll-answer-line"
            // @ts-ignore
            style={`width: ${getPercentage(result.voters, maxVotersCount)}%`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="Poll">
      <div className="poll-question">{summary.question}</div>
      <div className="poll-type">{getPollTypeString(summary)}</div>
      {canVote && (
        <div className="poll-answers">
          <RadioGroup
            name={`poll-${messageId}`}
            options={summary.answers.map((a) => ({ label: a.text, value: a.option }))}
            onChange={handleRadioChange}
            disabled={!!loadingOption}
            loadingOption={loadingOption}
          />
        </div>
      )}
      {!canVote && (
        <div className="poll-results">
          {summary.answers.map(renderResultOption)}
        </div>
      )}
      <div className="poll-voters-count">{getReadableVotersCount(results.totalVoters)}</div>
    </div>
  );
};

function getPollTypeString(summary: ApiPoll['summary']) {
  if (summary.closed) {
    return 'Final results';
  }

  return summary.publicVoters ? 'Public Poll' : 'Anonymous Poll';
}

function getReadableVotersCount(count?: number) {
  if (!count) {
    return 'No voters yet';
  }

  if (count === 1) {
    return '1 voter';
  }

  return `${count} voters`;
}

function getPercentage(value: number, total: number) {
  return ((value / total) * 100).toFixed();
}

export default Poll;
