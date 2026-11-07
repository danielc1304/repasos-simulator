/**
 * Quiz Parser Service - Handles quiz validation and normalization
 */
import { validateQuiz, generateId, deepClone } from '../utils/helpers.js';

export class QuizParser {
  static parse(rawQuiz) {
    const quiz = deepClone(rawQuiz);

    // Generate IDs for questions if missing
    quiz.questions = quiz.questions.map((q, index) => ({
      ...q,
      id: q.id || `q${index + 1}`,
      type: q.type || 'multiple_choice'
    }));

    // Validate
    const validation = validateQuiz(quiz);
    if (!validation.valid) {
      throw new Error(`Quiz inválido:\n${validation.errors.join('\n')}`);
    }

    // Normalize: add defaults
    quiz.questions = quiz.questions.map(q => ({
      ...q,
      explanation: q.explanation || '',
      points: q.points || 1
    }));

    return quiz;
  }

  static async loadFromFile(file) {
    const { parseQuizFile } = await import('../utils/helpers.js');
    const rawQuiz = await parseQuizFile(file);
    return this.parse(rawQuiz);
  }

  static async loadFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error cargando quiz: ${response.status}`);
    const rawQuiz = await response.json();
    return this.parse(rawQuiz);
  }
}