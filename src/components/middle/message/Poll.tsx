import React, {
  FC,
  useCallback,
  useEffect,
  useState,
  memo,
  useMemo,
  useRef,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../lib/teact/teactn';

import { GlobalActions } from '../../../global/types';
import {
  ApiMessage, ApiPoll, ApiUser, PollAnswer,
} from '../../../api/types';

import { pick } from '../../../util/iteratees';
import renderText from '../../common/helpers/renderText';
import { renderTextWithEntities } from '../../common/helpers/renderMessageText';
import { formatMediaDuration } from '../../../util/dateFormat';

import CheckboxGroup from '../../ui/CheckboxGroup';
import RadioGroup from '../../ui/RadioGroup';
import Avatar from '../../common/Avatar';
import Button from '../../ui/Button';
import Notification from '../../ui/Notification';

import './Poll.scss';

type OwnProps = {
  message: ApiMessage;
  poll: ApiPoll;
  onSendVote: (options: string[]) => void;
};

type StateProps = {
  recentVoterIds?: number[];
  usersById: Record<number, ApiUser>;
};

type DispatchProps = Pick<GlobalActions, ('loadMessage' | 'openPollResults')>;

const NBSP = '\u00A0';

const Poll: FC<OwnProps & StateProps & DispatchProps> = ({
  message,
  poll,
  recentVoterIds,
  usersById,
  loadMessage,
  onSendVote,
  openPollResults,
}) => {
  const { id: messageId, chatId } = message;
  const { summary, results } = poll;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [chosenOptions, setChosenOptions] = useState<string[]>([]);
  const [isSolutionShown, setIsSolutionShown] = useState<boolean>(false);
  const [wasSubmitted, setWasSubmitted] = useState<boolean>(false);
  const [closePeriod, setClosePeriod] = useState<number>(
    !summary.closed && summary.closeDate && summary.closeDate > 0
      ? Math.min(summary.closeDate - Math.floor(Date.now() / 1000), summary.closePeriod!)
      : 0,
  );
  const countdownRef = useRef<HTMLDivElement>();
  const { results: voteResults, totalVoters } = results;
  const hasVoted = voteResults && voteResults.some((r) => r.chosen);
  const canVote = !summary.closed && !hasVoted;
  const canViewResult = !canVote && summary.publicVoters && Boolean(results.totalVoters);
  const isMultiple = canVote && summary.multipleChoice;
  const maxVotersCount = voteResults ? Math.max(...voteResults.map((r) => r.voters)) : totalVoters;
  const correctResults = voteResults ? voteResults.reduce((answers: string[], r) => {
    if (r.correct) {
      answers.push(r.option);
    }

    return answers;
  }, []) : [];
  const answers = summary.answers.map((a) => ({
    label: a.text,
    value: a.option,
    hidden: Boolean(summary.quiz && summary.closePeriod && closePeriod <= 0),
  }));
  const hasOneHundredPercentsAnswer = voteResults ? voteResults.some((r) => r.voters === totalVoters) : false;

  useEffect(() => {
    if (
      isSubmitting
      && poll.results.results
      && poll.results.results.some((result) => result.chosen)
    ) {
      setIsSubmitting(false);
    }
  }, [isSubmitting, poll.results.results]);

  useEffect(() => {
    if (closePeriod > 0) {
      setTimeout(() => setClosePeriod(closePeriod - 1), 1000);
    }

    const countdownEl = countdownRef.current;

    if (countdownEl) {
      const circumference = 6 * 2 * Math.PI;
      const svgEl = countdownEl.lastElementChild;
      const timerEl = countdownEl.firstElementChild;
      if (closePeriod <= 5) {
        countdownEl.classList.add('hurry-up');
      }

      if (!svgEl || !timerEl) {
        countdownEl.innerHTML = `
        <span>${formatMediaDuration(closePeriod)}</span>
        <svg width="16px" height="16px">
          <circle cx="8" cy="8" r="6" class="poll-countdown-progress" transform="rotate(-90, 8, 8)"
            stroke-dasharray="${circumference} ${circumference}"
            stroke-dashoffset="0"
          />
        </svg>`;
      } else {
        const strokeDashOffset = ((summary.closePeriod! - closePeriod) / summary.closePeriod!) * circumference;
        timerEl.textContent = formatMediaDuration(closePeriod);
        (svgEl.firstElementChild as SVGElement).setAttribute('stroke-dashoffset', `-${strokeDashOffset}`);
      }
    }
  }, [closePeriod, summary.closePeriod]);

  useEffect(() => {
    if (summary.quiz && (closePeriod <= 0 || (hasVoted && !summary.closed))) {
      loadMessage({ chatId, messageId });
    }
  }, [chatId, closePeriod, hasVoted, loadMessage, messageId, summary.closed, summary.quiz]);

  // If the client time is not synchronized, the poll must be updated after the closePeriod time has expired.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (summary.quiz && !summary.closed && summary.closePeriod && summary.closePeriod > 0) {
      timer = setTimeout(() => {
        loadMessage({ chatId, messageId });
      }, summary.closePeriod * 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [canVote, chatId, loadMessage, messageId, summary.closePeriod, summary.closed, summary.quiz]);

  const recentVoters = useMemo(() => {
    return recentVoterIds ? recentVoterIds.reduce((result: ApiUser[], id) => {
      const user = usersById[id];
      if (user) {
        result.push(user);
      }

      return result;
    }, []) : [];
  }, [usersById, recentVoterIds]);

  const handleRadioChange = useCallback(
    (option: string) => {
      setChosenOptions([option]);
      setIsSubmitting(true);
      setWasSubmitted(true);
      onSendVote([option]);
    }, [onSendVote],
  );

  const handleCheckboxChange = useCallback(
    (options: string[]) => {
      setChosenOptions(options);
    }, [],
  );

  const handleVoteClick = useCallback(
    () => {
      setIsSubmitting(true);
      setWasSubmitted(true);
      onSendVote(chosenOptions);
    }, [onSendVote, chosenOptions],
  );

  const handleViewResultsClick = useCallback(
    () => {
      openPollResults({ chatId, messageId });
    }, [chatId, messageId, openPollResults],
  );

  const handleSolutionShow = useCallback(() => {
    setIsSolutionShown(true);
  }, []);

  const handleSolutionHide = useCallback(() => {
    setIsSolutionShown(false);
    setWasSubmitted(false);
  }, []);

  // Show the solution to quiz if the answer was incorrect
  useEffect(() => {
    if (wasSubmitted && hasVoted && summary.quiz && results.results && poll.results.solution) {
      const correctResult = results.results.find((r) => r.chosen && r.correct);
      if (!correctResult) {
        setIsSolutionShown(true);
      }
    }
  }, [hasVoted, wasSubmitted, results.results, summary.quiz, poll.results.solution]);

  function renderResultOption(answer: PollAnswer) {
    if (!voteResults) {
      return undefined;
    }
    const result = voteResults.find((r) => r.option === answer.option);
    const correctAnswer = correctResults.length === 0 || correctResults.indexOf(answer.option) !== -1;
    const showIcon = (correctResults.length > 0 && correctAnswer) || (result && result.chosen);

    return result && (
      <div className={`poll-answer ${hasOneHundredPercentsAnswer ? 'extra-width' : ''}`}>
        <div className="poll-answer-share">
          {getPercentage(result.voters, totalVoters || 0)}%
          {showIcon && (
            <span className={`poll-answer-chosen${!correctAnswer ? ' wrong' : ''}`}>
              <i className={correctAnswer ? 'icon-check' : 'icon-close'} />
            </span>
          )}
        </div>
        <div className="poll-answer-right">
          <div className="poll-answer-text">
            {renderText(answer.text)}
          </div>
          <div
            className={`poll-answer-line${showIcon && !correctAnswer ? ' wrong' : ''}`}
            // @ts-ignore
            style={`width: ${getPercentage(result.voters, maxVotersCount)}%`}
          />
        </div>
      </div>
    );
  }

  function renderRecentVoters() {
    return (
      recentVoters.length > 0 && (
        <div className="poll-recent-voters">
          {recentVoters.map((user) => (
            <Avatar
              size="tiny"
              user={user}
            />
          ))}
        </div>
      )
    );
  }

  function renderSolution() {
    return (
      isSolutionShown && poll.results.solution && (
        <Notification
          message={renderTextWithEntities(poll.results.solution, poll.results.solutionEntities)}
          onDismiss={handleSolutionHide}
        />
      )
    );
  }

  return (
    <div className="Poll">
      {renderSolution()}
      <div className="poll-question">{renderText(summary.question)}</div>
      <div className="poll-type">
        {getPollTypeString(summary)}
        {renderRecentVoters()}
        {closePeriod > 0 && canVote && <div ref={countdownRef} className="poll-countdown" />}
        {summary.quiz && poll.results.solution && !canVote && (
          <Button
            round
            ripple
            size="tiny"
            color="translucent"
            className="poll-quiz-help"
            disabled={isSolutionShown}
            onClick={handleSolutionShow}
          >
            <i className="icon-lamp" />
          </Button>
        )}
      </div>
      {canVote && (
        <div className="poll-answers">
          {isMultiple
            ? (
              <CheckboxGroup
                options={answers}
                onChange={handleCheckboxChange}
                disabled={isSubmitting}
                loadingOptions={isSubmitting ? chosenOptions : undefined}
                round
              />
            )
            : (
              <RadioGroup
                name={`poll-${messageId}`}
                options={answers}
                onChange={handleRadioChange}
                disabled={isSubmitting}
                loadingOption={isSubmitting ? chosenOptions[0] : undefined}
              />
            )}
        </div>
      )}
      {!canVote && (
        <div className="poll-results">
          {summary.answers.map(renderResultOption)}
        </div>
      )}
      {!canViewResult && !isMultiple && (
        <div className="poll-voters-count">{getReadableVotersCount(summary.quiz, results.totalVoters)}</div>
      )}
      {isMultiple && (
        <Button
          isText
          ripple
          disabled={chosenOptions.length === 0}
          size="tiny"
          onMouseDown={handleVoteClick}
        >
          Vote
        </Button>
      )}
      {canViewResult && (
        <Button
          isText
          ripple
          size="tiny"
          onClick={handleViewResultsClick}
        >
          View Results
        </Button>
      )}
    </div>
  );
};

function getPollTypeString(summary: ApiPoll['summary']) {
  // When we just created the poll, some properties don't exist.
  if (typeof summary.publicVoters === 'undefined') {
    return NBSP;
  }

  if (summary.quiz) {
    return summary.publicVoters ? 'Quiz' : 'Anonymous Quiz';
  }

  if (summary.closed) {
    return 'Final results';
  }

  return summary.publicVoters ? 'Poll' : 'Anonymous Poll';
}

function getReadableVotersCount(isQuiz: true | undefined, count?: number) {
  if (!count) {
    return isQuiz ? 'No answers yet' : 'No voters yet';
  }

  return isQuiz ? `${count} answered` : `${count} voted`;
}

function getPercentage(value: number, total: number) {
  return total > 0 ? ((value / total) * 100).toFixed() : 0;
}

export default memo(withGlobal<OwnProps>(
  (global, { poll }) => {
    const { recentVoters } = poll.results;
    const { byId: usersById } = global.users;
    if (!recentVoters || recentVoters.length === 0) {
      return {};
    }

    return {
      recentVoterIds: recentVoters,
      usersById,
    };
  },
  (setGlobal, actions): DispatchProps => pick(actions, ['loadMessage', 'openPollResults']),
)(Poll));
