/**
 * Scoring Service - Handles scoring logic for all question types
 */
import { matchKeywords, calculateScore } from '../utils/helpers.js';

export class ScoringService {
  /**
   * Score a single answer
   * @returns {object} { correct: boolean, partial?: number, details: object }
   */
  static scoreAnswer(question, userAnswer) {
    switch (question.type) {
      case 'multiple_choice':
        return this.scoreMultipleChoice(question, userAnswer);
      case 'multiple_select':
        return this.scoreMultipleSelect(question, userAnswer);
      case 'open_ended':
        return this.scoreOpenEnded(question, userAnswer);
      default:
        return { correct: false, points: 0, details: {} };
    }
  }

  static scoreMultipleChoice(question, userAnswer) {
    const correct = userAnswer === question.correct;
    return {
      correct,
      points: correct ? question.points : 0,
      details: {
        userAnswer,
        correctAnswer: question.correct,
        type: 'multiple_choice'
      }
    };
  }

  static scoreMultipleSelect(question, userAnswer) {
    if (!Array.isArray(userAnswer)) userAnswer = [];

    const correctSet = new Set(question.correct);
    const userSet = new Set(userAnswer);

    // All correct selected AND no incorrect selected
    const allCorrectSelected = question.correct.every(idx => userSet.has(idx));
    const noIncorrectSelected = userAnswer.every(idx => correctSet.has(idx));
    const correct = allCorrectSelected && noIncorrectSelected;

    // Partial credit: percentage of correct selections
    const totalCorrect = question.correct.length;
    const correctSelected = question.correct.filter(idx => userSet.has(idx)).length;
    const incorrectSelected = userAnswer.filter(idx => !correctSet.has(idx)).length;
    const partial = totalCorrect > 0 ? (correctSelected - incorrectSelected) / totalCorrect : 0;

    return {
      correct,
      partial: Math.max(0, partial),
      points: correct ? question.points : Math.round(question.points * Math.max(0, partial)),
      details: {
        userAnswer,
        correctAnswer: question.correct,
        correctSelected,
        incorrectSelected,
        type: 'multiple_select'
      }
    };
  }

  static scoreOpenEnded(question, userAnswer) {
    const { matched, missing } = matchKeywords(userAnswer || '', question.expected_keywords);
    const totalKeywords = question.expected_keywords.length;
    const matchedCount = matched.length;
    const ratio = totalKeywords > 0 ? matchedCount / totalKeywords : 0;

    // Consider "correct" if matched >= 60% of keywords
    const correct = ratio >= 0.6;

    return {
      correct,
      partial: ratio,
      points: Math.round(question.points * ratio),
      details: {
        userAnswer: userAnswer || '',
        matched,
        missing,
        totalKeywords,
        matchedCount,
        ratio,
        type: 'open_ended'
      }
    };
  }

  /**
   * Score entire quiz
   */
  static scoreQuiz(quiz, answers) {
    const results = quiz.questions.map(question => {
      const userAnswer = answers[question.id];
      const scored = this.scoreAnswer(question, userAnswer);
      return { questionId: question.id, ...scored };
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = results.reduce((sum, r) => sum + (r.points || 0), 0);
    const correctCount = results.filter(r => r.correct).length;
    const skippedCount = results.filter(r => r.details.userAnswer === undefined || r.details.userAnswer === '' || (Array.isArray(r.details.userAnswer) && r.details.userAnswer.length === 0)).length;

    return {
      results,
      totalPoints,
      earnedPoints,
      correctCount,
      incorrectCount: results.length - correctCount - skippedCount,
      skippedCount,
      percentage: calculateScore(earnedPoints, totalPoints),
      passed: calculateScore(earnedPoints, totalPoints) >= 70
    };
  }
}