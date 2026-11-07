/**
 * Utility functions for Repasos Simulator
 */

/**
 * Generates a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clones an object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Validate quiz schema
 */
export function validateQuiz(quiz) {
  const errors = [];

  if (!quiz.title || typeof quiz.title !== 'string') {
    errors.push('Quiz must have a title (string)');
  }

  if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    errors.push('Quiz must have at least one question');
  } else {
    quiz.questions.forEach((q, index) => {
      if (!q.id) errors.push(`Question ${index + 1}: missing id`);
      if (!q.type || !['multiple_choice', 'multiple_select', 'open_ended'].includes(q.type)) {
        errors.push(`Question ${q.id || index + 1}: invalid type (must be multiple_choice, multiple_select, or open_ended)`);
      }
      if (!q.question || typeof q.question !== 'string') {
        errors.push(`Question ${q.id || index + 1}: missing question text`);
      }

      if (q.type === 'multiple_choice') {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question ${q.id}: multiple_choice needs at least 2 options`);
        }
        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct >= (q.options?.length || 0)) {
          errors.push(`Question ${q.id}: correct index out of bounds`);
        }
      }

      if (q.type === 'multiple_select') {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question ${q.id}: multiple_select needs at least 2 options`);
        }
        if (!Array.isArray(q.correct) || q.correct.length === 0) {
          errors.push(`Question ${q.id}: multiple_select needs correct array with at least one index`);
        }
        q.correct?.forEach(idx => {
          if (typeof idx !== 'number' || idx < 0 || idx >= (q.options?.length || 0)) {
            errors.push(`Question ${q.id}: correct index ${idx} out of bounds`);
          }
        });
      }

      if (q.type === 'open_ended') {
        if (!Array.isArray(q.expected_keywords) || q.expected_keywords.length === 0) {
          errors.push(`Question ${q.id}: open_ended needs expected_keywords array`);
        }
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Simple keyword matching for open-ended questions
 */
export function matchKeywords(answer, expectedKeywords) {
  if (!answer || !expectedKeywords?.length) return { matched: [], missing: expectedKeywords || [] };

  const normalizedAnswer = answer.toLowerCase();
  const matched = [];
  const missing = [];

  expectedKeywords.forEach(keyword => {
    const normalizedKeyword = keyword.toLowerCase();
    // Check for partial match (keyword contained in answer)
    if (normalizedAnswer.includes(normalizedKeyword)) {
      matched.push(keyword);
    } else {
      // Also check word boundaries for better matching
      const words = normalizedAnswer.split(/\W+/);
      if (words.some(w => w.includes(normalizedKeyword) || normalizedKeyword.includes(w))) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    }
  });

  return { matched, missing };
}

/**
 * Calculate score percentage
 */
export function calculateScore(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * LocalStorage helpers
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Create a toast notification element
 */
export function createToast(message, type = 'info', duration = 3000) {
  const container = getOrCreateToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="btn btn-ghost btn-sm" aria-label="Cerrar">✕</button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => toast.remove(), duration);
  }

  return toast;
}

function getOrCreateToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Parse file as JSON
 */
export function parseQuizFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const quiz = JSON.parse(content);
        resolve(quiz);
      } catch (err) {
        reject(new Error('Archivo JSON inválido: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}