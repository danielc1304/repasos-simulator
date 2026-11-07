/**
 * Storage Service - Handles localStorage persistence
 */
import { storage } from '../utils/helpers.js';

const STORAGE_KEYS = {
  CURRENT_QUIZ: 'repasos_current_quiz',
  QUIZ_PROGRESS: 'repasos_quiz_progress',
  QUIZ_ANSWERS: 'repasos_quiz_answers',
  QUIZ_HISTORY: 'repasos_quiz_history',
  SETTINGS: 'repasos_settings'
};

export class StorageService {
  static saveQuiz(quiz) {
    storage.set(STORAGE_KEYS.CURRENT_QUIZ, quiz);
  }

  static loadQuiz() {
    return storage.get(STORAGE_KEYS.CURRENT_QUIZ);
  }

  static clearQuiz() {
    storage.remove(STORAGE_KEYS.CURRENT_QUIZ);
    storage.remove(STORAGE_KEYS.QUIZ_PROGRESS);
    storage.remove(STORAGE_KEYS.QUIZ_ANSWERS);
  }

  static saveProgress(currentQuestionIndex, totalQuestions) {
    storage.set(STORAGE_KEYS.QUIZ_PROGRESS, { currentQuestionIndex, totalQuestions, timestamp: Date.now() });
  }

  static loadProgress() {
    return storage.get(STORAGE_KEYS.QUIZ_PROGRESS);
  }

  static saveAnswers(answers) {
    storage.set(STORAGE_KEYS.QUIZ_ANSWERS, answers);
  }

  static loadAnswers() {
    return storage.get(STORAGE_KEYS.QUIZ_ANSWERS, {});
  }

  static saveResult(result) {
    const history = storage.get(STORAGE_KEYS.QUIZ_HISTORY, []);
    history.unshift({ ...result, timestamp: Date.now() });
    // Keep only last 50 results
    storage.set(STORAGE_KEYS.QUIZ_HISTORY, history.slice(0, 50));
  }

  static loadHistory() {
    return storage.get(STORAGE_KEYS.QUIZ_HISTORY, []);
  }

  static saveSettings(settings) {
    const current = storage.get(STORAGE_KEYS.SETTINGS, {});
    storage.set(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
  }

  static loadSettings() {
    return storage.get(STORAGE_KEYS.SETTINGS, {
      shuffleQuestions: false,
      shuffleOptions: false,
      showExplanationImmediately: false,
      mode: 'evaluation', // 'evaluation' | 'study'
      timerEnabled: false,
      timerDuration: 0
    });
  }
}