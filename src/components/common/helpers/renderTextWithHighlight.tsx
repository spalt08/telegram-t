import React from '../../../lib/teact/teact';
import { TextPart } from './renderMessageText';

export default function renderTextWithHighlight(text: string, query: string): TextPart[] {
  const lowerCaseText = text.toLowerCase();
  const queryPosition = lowerCaseText.indexOf(query.toLowerCase());
  if (queryPosition < 0) {
    return [text];
  }

  const content: TextPart[] = [];
  content.push(text.substring(0, queryPosition));
  content.push(
    <span className="matching-text-highlight">{text.substring(queryPosition, queryPosition + query.length)}</span>,
  );
  content.push(text.substring(queryPosition + query.length));

  return content;
}
