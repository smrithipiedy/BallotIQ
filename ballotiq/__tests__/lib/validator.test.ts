/**
 * Tests for Gemini response validator module.
 */

import {
  parseGeminiJSON,
  isElectionStepsArray,
  isQuizQuestionsArray,
  isMicroQuizQuestion,
  isAssessmentResult,
} from '@/lib/gemini/validator';

describe('parseGeminiJSON', () => {
  const alwaysTrue = (data: unknown): data is string[] => Array.isArray(data);
  const fallback = ['fallback'];

  it('returns fallback on invalid JSON', () => {
    expect(parseGeminiJSON('not json', alwaysTrue, fallback)).toEqual(fallback);
  });

  it('returns fallback when validator fails', () => {
    const alwaysFalse = (data: unknown): data is string[] => !!data && false;
    expect(parseGeminiJSON('["valid"]', alwaysFalse, fallback)).toEqual(fallback);
  });

  it('returns parsed data when valid', () => {
    expect(parseGeminiJSON('["hello"]', alwaysTrue, fallback)).toEqual(['hello']);
  });

  it('strips markdown code fences before parsing', () => {
    const raw = '```json\n["hello"]\n```';
    expect(parseGeminiJSON(raw, alwaysTrue, fallback)).toEqual(['hello']);
  });

  it('returns fallback for empty string', () => {
    expect(parseGeminiJSON('', alwaysTrue, fallback)).toEqual(fallback);
  });
});

describe('isElectionStepsArray', () => {
  const validStep = {
    id: 'step1', order: 1, title: 'Test', description: 'Desc',
    detailedExplanation: 'Detail', simpleExplanation: 'Simple',
    timeline: 'Now', requirements: [], tips: [],
  };

  it('returns true for valid array', () => {
    expect(isElectionStepsArray([validStep])).toBe(true);
  });

  it('returns false for non-array', () => {
    expect(isElectionStepsArray('not array')).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(isElectionStepsArray([])).toBe(false);
  });

  it('returns false for array missing required fields', () => {
    expect(isElectionStepsArray([{ id: 'step1' }])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isElectionStepsArray(null)).toBe(false);
  });
});

describe('isQuizQuestionsArray', () => {
  const validQ = {
    id: 'q1', question: 'Test?', options: ['A', 'B', 'C', 'D'],
    correctIndex: 0, explanation: 'Because...',
  };

  it('validates correctly for valid array', () => {
    expect(isQuizQuestionsArray([validQ])).toBe(true);
  });

  it('returns false for wrong option count', () => {
    expect(isQuizQuestionsArray([{ ...validQ, options: ['A', 'B'] }])).toBe(false);
  });

  it('returns false for invalid correctIndex', () => {
    expect(isQuizQuestionsArray([{ ...validQ, correctIndex: 5 }])).toBe(false);
  });
});

describe('isMicroQuizQuestion', () => {
  const valid = {
    question: 'Test?', options: ['A', 'B', 'C', 'D'],
    correctIndex: 1, hint: 'Think...',
  };

  it('validates correctly for valid question', () => {
    expect(isMicroQuizQuestion(valid)).toBe(true);
  });

  it('returns false for missing hint', () => {
    expect(isMicroQuizQuestion({ ...valid, hint: undefined })).toBe(false);
  });

  it('returns false for null', () => {
    expect(isMicroQuizQuestion(null)).toBe(false);
  });
});

describe('isAssessmentResult', () => {
  it('validates valid assessment result', () => {
    expect(isAssessmentResult({
      knowledgeLevel: 'beginner', recommendedStepCount: 7, focusAreas: ['voting'],
    })).toBe(true);
  });

  it('returns false for invalid knowledge level', () => {
    expect(isAssessmentResult({
      knowledgeLevel: 'expert', recommendedStepCount: 5, focusAreas: [],
    })).toBe(false);
  });

  it('returns false for zero step count', () => {
    expect(isAssessmentResult({
      knowledgeLevel: 'beginner', recommendedStepCount: 0, focusAreas: [],
    })).toBe(false);
  });
});
