import { AttemptAnswer, Question } from "@/types";

const norm = (s: string) => s.trim().toLowerCase();

export function normalizeAndScore(questions: Question[], answers: AttemptAnswer[]) {
  const answerMap = new Map(answers.map(a => [a.questionId, norm(a.answerText)]));
  let score = 0;
  for (const q of questions) {
    const given = answerMap.get(q.id);
    if (given && given === norm(q.correctAnswer)) score++;
  }
  return score;
}
