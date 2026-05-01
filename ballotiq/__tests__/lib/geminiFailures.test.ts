/**
 * Tests for Gemini AI failure recovery and validation.
 */
import { parseGeminiJSON, isElectionStepsArray, isQuizQuestionsArray, isMicroQuizQuestion, isAssessmentResult } from '@/lib/gemini/validator';
import type { ElectionStep } from '@/types';

describe('Gemini JSON Validation and Fallbacks', () => {
  const mockFallbackStep: ElectionStep[] = [];

  it('handles completely malformed JSON by returning fallback', () => {
    const raw = 'Sorry, I cannot help with that.';
    const result = parseGeminiJSON(raw, isElectionStepsArray, mockFallbackStep);
    expect(result).toBe(mockFallbackStep);
  });

  it('repairs truncated JSON arrays', () => {
    const raw = '```json\n[{"id": "step1", "order": 1, "title": "A", "description": "B", "detailedExplanation": "C", "simpleExplanation": "D", "timeline": "E", "requirements": [], "tips": []}, {"id": "step2"';
    const result = parseGeminiJSON(raw, isElectionStepsArray, mockFallbackStep);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('step1');
  });

  it('rejects JSON that parses but fails type validation', () => {
    // Missing 'order' and 'tips' fields
    const raw = '[{"id": "step1", "title": "A", "description": "B", "detailedExplanation": "C", "simpleExplanation": "D", "timeline": "E", "requirements": []}]';
    const result = parseGeminiJSON(raw, isElectionStepsArray, mockFallbackStep);
    expect(result).toBe(mockFallbackStep);
  });

  it('validates correct Assessment Result', () => {
    const raw = '{"knowledgeLevel": "advanced", "recommendedStepCount": 10, "focusAreas": ["voting process"]}';
    const fallback = { knowledgeLevel: 'beginner' as const, recommendedStepCount: 5, focusAreas: [] };
    const result = parseGeminiJSON(raw, isAssessmentResult, fallback);
    expect(result.knowledgeLevel).toBe('advanced');
  });

  it('rejects invalid knowledge level in Assessment Result', () => {
    const raw = '{"knowledgeLevel": "expert", "recommendedStepCount": 10, "focusAreas": ["voting process"]}';
    const fallback = { knowledgeLevel: 'beginner' as const, recommendedStepCount: 5, focusAreas: [] };
    const result = parseGeminiJSON(raw, isAssessmentResult, fallback);
    expect(result).toBe(fallback);
  });

  it('validates Micro Quiz correctly', () => {
    const raw = '{"question": "Q?", "options": ["A", "B", "C", "D"], "correctIndex": 2, "hint": "H"}';
    const fallback = { question: "Fail", options: ["1","2","3","4"], correctIndex: 0, hint: "" };
    const result = parseGeminiJSON(raw, isMicroQuizQuestion, fallback);
    expect(result.question).toBe("Q?");
  });

  it('rejects Micro Quiz with invalid options count', () => {
    const raw = '{"question": "Q?", "options": ["A", "B", "C"], "correctIndex": 2, "hint": "H"}'; // Only 3 options
    const fallback = { question: "Fail", options: ["1","2","3","4"], correctIndex: 0, hint: "" };
    const result = parseGeminiJSON(raw, isMicroQuizQuestion, fallback);
    expect(result).toBe(fallback);
  });
});
