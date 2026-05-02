import type { ElectionStep, KnowledgeLevel, QuizQuestion, QuizResult } from '@/types';

/**
 * Builds a depth-matched micro-quiz prompt for a specific step.
 */
export function buildMicroQuizPrompt(
  step: ElectionStep,
  knowledgeLevel: KnowledgeLevel,
): string {
  const questionSpec = knowledgeLevel === 'advanced'
    ? 'Create a HARD question testing a legal nuance, edge case, or specific statutory detail from this step. The wrong options should be plausible near-misses.'
    : knowledgeLevel === 'intermediate'
    ? 'Create a MEDIUM question testing understanding of the process, a specific deadline, or a procedural detail. Wrong options should test common misconceptions.'
    : 'Create an EASY question testing basic recall of the most important fact in this step. Wrong options should be clearly wrong but not absurd.';

  return `Generate ONE quiz question about this election step.
The question field must always be a complete, natural sentence ending with a question mark. Never use single words or short phrases as questions. BAD: 'Age?' GOOD: 'What is the minimum age required to vote in this country?'
Step title: "${step.title}"
Step content: "${step.detailedExplanation || step.description}"
Knowledge level: ${knowledgeLevel}
${questionSpec}
Respond ONLY with JSON: {"question":"...","options":["A","B","C","D"],"correctIndex":0,"hint":"..."}`;
}

/**
 * Builds the final quiz prompt. Questions must reference specific facts from steps.
 */
export function buildPersonalizedQuizPrompt(
  completedSteps: ElectionStep[],
  knowledgeLevel: KnowledgeLevel,
  countryCode: string,
): string {
  const stepDetails = completedSteps.map((s) =>
    `Step: ${s.title}\nContent: ${s.detailedExplanation || s.description}`
  ).join('\n\n');

  const difficultySpec = knowledgeLevel === 'advanced'
    ? '5 COMPLEX, SCENARIO-BASED questions testing legal application, edge cases, and specific statutory details. Do NOT repeat micro-quiz questions.'
    : knowledgeLevel === 'intermediate'
    ? '5 APPLICATION-BASED questions testing process flow, deadlines, and procedural scenarios.'
    : '5 COMPREHENSION questions testing overall process understanding and key facts.';

  return `Generate ${difficultySpec} for a certification quiz in ${countryCode}.

CRITICAL: Each question MUST be properly framed as a complete, clear, and specific sentence (e.g., "What is the minimum age to vote in ${countryCode}?" instead of just "Age?"). Questions MUST reference a specific fact, name, number, or detail from the step content below. Do NOT generate generic or vague questions.

Steps studied:
${stepDetails}

Each question object: {"id":"q1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","difficulty":"easy|medium|hard","relatedStepId":"..."}
CRITICAL: Use realistic scenarios (e.g., "If a voter is at the booth and X happens...") to test actual application of knowledge.
MANDATORY: Every question MUST be unique. Do NOT repeat the same concept, fact, or micro-quiz question.
Respond ONLY with a JSON array of 5 unique question objects. No markdown.`;
}

/**
 * Builds prompt for post-quiz performance insight.
 */
export function buildPerformanceInsightPrompt(
  results: QuizResult[],
  questions: QuizQuestion[],
  knowledgeLevel: KnowledgeLevel,
): string {
  const wrong = results
    .filter((r) => !r.isCorrect)
    .map((r) => questions.find((q) => q.id === r.questionId)?.question)
    .filter(Boolean)
    .join('; ');
  const score = results.filter((r) => r.isCorrect).length;
  return `A ${knowledgeLevel} learner scored ${score}/${results.length} on their election knowledge quiz.
${wrong ? `Questions missed: ${wrong}` : 'They got a perfect score!'}
Write a warm, specific, encouraging performance message under 100 words. Plain text only.`;
}
