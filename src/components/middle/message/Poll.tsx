import React, { FC } from '../../../lib/teact/teact';

import { ApiPoll, PollAnswer } from '../../../api/types';

import RadioGroup from '../../ui/RadioGroup';

import './Poll.scss';

type IProps = {
  messageId: number;
  poll: ApiPoll;
};

const Poll: FC<IProps> = ({ messageId, poll }) => {
  const { summary, results } = poll;
  const { results: voteResults, totalVoters } = results;
  const hasVoted = voteResults && voteResults.some((r) => r.chosen);
  const canVote = !summary.closed && !hasVoted;
  const maxVotersCount = voteResults ? Math.max(...voteResults.map((r) => r.voters)) : totalVoters;

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
        <div className="poll-answers not-implemented">
          <RadioGroup
            name={`poll-${messageId}`}
            options={summary.answers.map((a) => ({ label: a.text, value: a.option }))}
            onChange={() => {}}
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
