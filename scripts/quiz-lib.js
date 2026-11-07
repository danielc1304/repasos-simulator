/**
 * Quiz Library - Core functions for creating and validating quizzes
 * Used by CLI scripts and can be imported programmatically
 */

export function createQuiz(title, description = '') {
  return {
    title,
    description,
    questions: []
  };
}

export function addQuestion(quiz, question) {
  const validated = validateQuestion(question);
  if (!validated.valid) {
    throw new Error(`Invalid question ${question.id}: ${validated.errors.join(', ')}`);
  }
  quiz.questions.push(validated.question);
  return quiz;
}

export function validateQuestion(question) {
  const errors = [];

  if (!question.id || typeof question.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  const validTypes = ['multiple_choice', 'multiple_select', 'open_ended'];
  if (!question.type || !validTypes.includes(question.type)) {
    errors.push(`Invalid type: must be one of ${validTypes.join(', ')}`);
  }

  if (!question.question || typeof question.question !== 'string') {
    errors.push('Missing question text');
  }

  if (question.type === 'multiple_choice' || question.type === 'multiple_select') {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push('Options array required with at least 2 items');
    }
  }

  if (question.type === 'multiple_choice') {
    if (typeof question.correct !== 'number' || question.correct < 0 || question.correct >= (question.options?.length || 0)) {
      errors.push('Correct must be a valid option index');
    }
  }

  if (question.type === 'multiple_select') {
    if (!Array.isArray(question.correct) || question.correct.length === 0) {
      errors.push('Correct must be non-empty array of indices');
    }
    question.correct?.forEach(idx => {
      if (typeof idx !== 'number' || idx < 0 || idx >= (question.options?.length || 0)) {
        errors.push(`Correct index ${idx} out of bounds`);
      }
    });
  }

  if (question.type === 'open_ended') {
    if (!Array.isArray(question.expected_keywords) || question.expected_keywords.length === 0) {
      errors.push('Expected_keywords array required with at least 1 keyword');
    }
  }

  const normalized = {
    id: question.id,
    type: question.type,
    question: question.question,
    explanation: question.explanation || '',
    points: typeof question.points === 'number' && question.points > 0 ? question.points : 1
  };

  if (question.type === 'multiple_choice' || question.type === 'multiple_select') {
    normalized.options = question.options;
    normalized.correct = question.correct;
  }

  if (question.type === 'open_ended') {
    normalized.expected_keywords = question.expected_keywords;
  }

  return { valid: errors.length === 0, errors, question: normalized };
}

export function validateQuiz(quiz) {
  const errors = [];

  if (!quiz.title || typeof quiz.title !== 'string') {
    errors.push('Quiz must have a title');
  }

  if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    errors.push('Quiz must have at least one question');
  } else {
    const ids = new Set();
    quiz.questions.forEach((q, i) => {
      const v = validateQuestion(q);
      if (!v.valid) {
        errors.push(`Question ${i + 1} (${q.id || 'no-id'}): ${v.errors.join('; ')}`);
      }
      if (ids.has(q.id)) {
        errors.push(`Duplicate question id: ${q.id}`);
      }
      ids.add(q.id);
    });
  }

  return { valid: errors.length === 0, errors };
}

export function shuffleQuestions(quiz) {
  const shuffled = { ...quiz, questions: [...quiz.questions] };
  for (let i = shuffled.questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled.questions[i], shuffled.questions[j]] = [shuffled.questions[j], shuffled.questions[i]];
  }
  return shuffled;
}

export function getQuizStats(quiz) {
  const byType = {};
  let totalPoints = 0;
  quiz.questions.forEach(q => {
    byType[q.type] = (byType[q.type] || 0) + 1;
    totalPoints += q.points || 1;
  });
  return {
    totalQuestions: quiz.questions.length,
    totalPoints,
    byType
  };
}