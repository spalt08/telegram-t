import { ChangeEvent, RefObject } from 'react';
import React, {
  FC, memo, useCallback, useEffect, useLayoutEffect, useRef, useState,
} from '../../../lib/teact/teact';

import { ApiNewPoll } from '../../../api/types';

import captureEscKeyListener from '../../../util/captureEscKeyListener';
import parseMessageInput from './helpers/parseMessageInput';

import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import InputText from '../../ui/InputText';
import Checkbox from '../../ui/Checkbox';
import RadioGroup from '../../ui/RadioGroup';

import './PollModal.scss';

export type OwnProps = {
  isOpen: boolean;
  onSend: (pollSummary: ApiNewPoll) => void;
  onClear: () => void;
};

const MAX_LIST_HEIGHT = 320;

const PollModal: FC<OwnProps> = ({ isOpen, onSend, onClear }) => {
  const questionInputRef = useRef<HTMLInputElement>();
  const optionsListRef = useRef<HTMLDivElement>();
  const solutionRef = useRef<HTMLDivElement>();

  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>(['']);
  const [isAnonimous, setIsAnonimous] = useState(true);
  const [isMultipleAnswers, setIsMultipleAnswers] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [solution, setSolution] = useState<string>();
  const [correctOption, setCorrectOption] = useState<string>();
  const [hasErrors, setHasErrors] = useState<boolean>(false);

  const focusInput = useCallback((ref: RefObject<HTMLInputElement>) => {
    if (isOpen && ref.current) {
      ref.current.focus();
    }
  }, [isOpen]);

  useEffect(() => (isOpen ? captureEscKeyListener(onClear) : undefined), [isOpen, onClear]);
  useEffect(() => {
    if (!isOpen) {
      setQuestion('');
      setOptions(['']);
      setIsAnonimous(true);
      setIsMultipleAnswers(false);
      setIsQuizMode(false);
      setSolution('');
      setHasErrors(false);
    }
  }, [isOpen]);

  useEffect(() => focusInput(questionInputRef), [focusInput, isOpen]);

  useLayoutEffect(() => {
    const solutionEl = solutionRef.current;

    if (solutionEl && solution !== solutionEl.innerHTML) {
      solutionEl.innerHTML = solution;
    }
  }, [solution]);

  const addNewOption = useCallback((newOptions: string[] = []) => {
    setOptions([...newOptions, '']);
    requestAnimationFrame(() => {
      const list = optionsListRef.current;
      if (!list) {
        return;
      }

      list.classList.toggle('overflown', list.scrollHeight > MAX_LIST_HEIGHT);
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  const handleCreate = useCallback(() => {
    setHasErrors(false);
    if (!isOpen) {
      return;
    }

    const questionTrimmed = question.trim();
    const optionsTrimmed = options.map((o) => o.trim()).filter((o) => o.length);

    if (!questionTrimmed || optionsTrimmed.length < 2) {
      setQuestion(questionTrimmed);
      if (optionsTrimmed.length) {
        if (optionsTrimmed.length < 2) {
          addNewOption(optionsTrimmed);
        } else {
          setOptions(optionsTrimmed);
        }
      } else {
        addNewOption();
      }
      setHasErrors(true);
      return;
    }

    if (isQuizMode && !correctOption) {
      setHasErrors(true);
      return;
    }

    const answers = optionsTrimmed
      .map((text, index) => ({
        text: text.trim(),
        option: String(index),
        ...(String(index) === correctOption && { correct: true }),
      }));

    const payload: ApiNewPoll = {
      summary: {
        question: questionTrimmed,
        answers,
        ...(isMultipleAnswers && { multipleChoice: isMultipleAnswers }),
        ...(isQuizMode && { quiz: isQuizMode }),
      },
    };

    if (isQuizMode) {
      const { text, entities } = (solution && parseMessageInput(solution)) || {};

      payload.quiz = {
        correctAnswers: [correctOption],
        solution: text,
        solutionEntities: entities,
      };
    }

    onSend(payload);
  }, [isOpen, question, options, onSend, isQuizMode, correctOption, solution, addNewOption]);

  const updateOption = useCallback((index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = text;
    if (newOptions[newOptions.length - 1].trim().length) {
      addNewOption(newOptions);
    } else {
      setOptions(newOptions);
    }
  }, [options, addNewOption]);

  const removeOption = useCallback((index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    requestAnimationFrame(() => {
      if (!optionsListRef.current) {
        return;
      }

      optionsListRef.current.classList.toggle('overflown', optionsListRef.current.scrollHeight > MAX_LIST_HEIGHT);
    });
  }, [options]);

  const handleIsAnonimousChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsAnonimous(e.target.checked);
  }, []);

  const handleMultipleAnswersChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsMultipleAnswers(e.target.checked);
  }, []);

  const handleQuizModeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsQuizMode(e.target.checked);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.keyCode === 13) {
      handleCreate();
    }
  }, [handleCreate]);

  const getQuestionError = useCallback(() => {
    if (hasErrors && !question.trim().length) {
      return 'Please enter the question';
    }

    return undefined;
  }, [hasErrors, question]);

  const getOptionsError = useCallback((index: number) => {
    const optionsTrimmed = options.map((o) => o.trim()).filter((o) => o.length);
    if (hasErrors && optionsTrimmed.length < 2 && !options[index].trim().length) {
      return 'Please enter at least two options';
    }
    return undefined;
  }, [hasErrors, options]);

  function renderHeader() {
    return (
      <div className="modal-header-condensed">
        <Button round color="translucent" size="smaller" ariaLabel="Cancel poll creation" onClick={onClear}>
          <i className="icon-close" />
        </Button>
        <div className="modal-title">New Poll</div>
        <Button
          color="primary"
          size="smaller"
          className="modal-action-button"
          onClick={handleCreate}
        >
          Create
        </Button>
      </div>
    );
  }

  function renderOptions() {
    return options.map((option, index) => (
      <div className="option-wrapper">
        <InputText
          label={index !== options.length - 1 ? `Option ${index + 1}` : 'Add an Option'}
          error={getOptionsError(index)}
          value={option}
          onChange={(e) => updateOption(index, e.currentTarget.value)}
          onKeyPress={handleKeyPress}
        />
        {index !== options.length - 1 && (
          <Button
            className="option-remove-button"
            round
            color="translucent"
            size="smaller"
            ariaLabel="Remove option"
            onClick={() => removeOption(index)}
          >
            <i className="icon-close" />
          </Button>
        )}
      </div>
    ));
  }

  function renderRadioOptions() {
    return renderOptions().map((label, index) => ({ value: String(index), label }));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClear} header={renderHeader()} className="PollModal">
      <InputText
        ref={questionInputRef}
        label="Ask a Question"
        value={question}
        error={getQuestionError()}
        onChange={(e) => setQuestion(e.currentTarget.value)}
        onKeyPress={handleKeyPress}
      />
      <div className="options-divider" />

      <div className="options-list custom-scroll" ref={optionsListRef}>
        <h3 className="options-header">Options</h3>

        {isQuizMode ? (
          <RadioGroup name="correctOption" options={renderRadioOptions()} onChange={setCorrectOption} />
        ) : (
          renderOptions()
        )}

      </div>

      <div className="options-divider" />

      <div className="quiz-mode">
        <Checkbox
          label="Anonimous Voting"
          checked={isAnonimous}
          onChange={handleIsAnonimousChange}
        />
        <Checkbox
          label="Multiple Answers"
          checked={isMultipleAnswers}
          disabled={isQuizMode}
          onChange={handleMultipleAnswersChange}
        />
        <Checkbox
          label="Quiz Mode"
          checked={isQuizMode}
          disabled={isMultipleAnswers}
          onChange={handleQuizModeChange}
        />
        {isQuizMode && (
          <>
            <h3 className="options-header">Solution</h3>
            <div
              ref={solutionRef}
              className="form-control"
              contentEditable
              onChange={(e) => setSolution(e.currentTarget.innerHTML)}
            />
            <div className="note">
              Users will see this comment after choosing a wrong answer, good for educational purposes.
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default memo(PollModal);
