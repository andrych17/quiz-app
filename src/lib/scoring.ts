import { AttemptAnswer, Question } from "@/types";

const norm = (s: string) => s.trim().toLowerCase();

export function normalizeAndScore(questions: Question[], answers: AttemptAnswer[]) {
  const answerMap = new Map(answers.map(a => [a.questionId, norm(a.answerText)]));
  let score = 0;
  
  for (const q of questions) {
    const given = answerMap.get(q.id);
    
    if (q.questionType === 'multiple-select') {
      // For multiple-select, check if all correct answers are selected
      const correctAnswers = q.correctAnswer.split(',').map(s => norm(s));
      const givenAnswers = given ? given.split(',').map(s => norm(s)) : [];
      
      // Check if arrays are equal (all correct answers selected, no incorrect ones)
      const isCorrect = correctAnswers.length === givenAnswers.length &&
        correctAnswers.every(ans => givenAnswers.includes(ans));
      
      if (isCorrect) score++;
    } else {
      // For single answer questions (multiple-choice or text)
      if (given && given === norm(q.correctAnswer)) score++;
    }
  }
  
  return score;
}
