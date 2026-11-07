/**
 * Question Card Component - Renders a single question with appropriate input
 */
import { createToast } from '../utils/helpers.js';

export class QuestionCard {
  constructor(question, userAnswer, onAnswerChange, options = {}) {
    this.question = question;
    this.userAnswer = userAnswer;
    this.onAnswerChange = onAnswerChange;
    this.showFeedback = options.showFeedback || false;
    this.isReview = options.isReview || false;
    this.element = null;
  }

  render() {
    this.element = document.createElement('article');
    this.element.className = 'question-card card';
    this.element.dataset.questionId = this.question.id;

    const header = this.renderHeader();
    const content = this.renderContent();
    const feedback = this.showFeedback || this.isReview ? this.renderFeedback() : '';

    this.element.innerHTML = `${header}${content}${feedback}`;
    this.bindEvents();
    return this.element;
  }

  renderHeader() {
    const typeLabels = {
      multiple_choice: 'Opción única',
      multiple_select: 'Múltiple selección',
      open_ended: 'Respuesta abierta'
    };

    return `
      <div class="question-header">
        <div class="question-number">${this.question._index || ''}</div>
        <div style="flex: 1;">
          <p class="question-text">${this.escapeHtml(this.question.question)}</p>
          <span class="question-type-badge">${typeLabels[this.question.type]}</span>
        </div>
      </div>
    `;
  }

  renderContent() {
    switch (this.question.type) {
      case 'multiple_choice':
        return this.renderMultipleChoice();
      case 'multiple_select':
        return this.renderMultipleSelect();
      case 'open_ended':
        return this.renderOpenEnded();
      default:
        return '<p class="text-muted">Tipo de pregunta no soportado</p>';
    }
  }

  renderMultipleChoice() {
    return `
      <div class="options-list" role="radiogroup" aria-label="Opciones de respuesta">
        ${this.question.options.map((option, index) => `
          <label class="option-item ${this.getOptionClass('multiple_choice', index)}" data-index="${index}" tabindex="0" role="radio" aria-checked="${this.userAnswer === index}">
            <span class="option-radio" aria-hidden="true"></span>
            <span class="option-text">${this.escapeHtml(option)}</span>
            ${this.renderOptionFeedback('multiple_choice', index)}
          </label>
        `).join('')}
      </div>
    `;
  }

  renderMultipleSelect() {
    return `
      <div class="options-list" role="group" aria-label="Opciones de respuesta (múltiple)">
        ${this.question.options.map((option, index) => {
          const selected = Array.isArray(this.userAnswer) && this.userAnswer.includes(index);
          return `
            <label class="option-item ${this.getOptionClass('multiple_select', index)}" data-index="${index}" tabindex="0" role="checkbox" aria-checked="${selected}">
              <span class="option-checkbox" aria-hidden="true"></span>
              <span class="option-text">${this.escapeHtml(option)}</span>
              ${this.renderOptionFeedback('multiple_select', index)}
            </label>
          `;
        }).join('')}
      </div>
    `;
  }

  renderOpenEnded() {
    const value = this.userAnswer || '';
    return `
      <div class="form-group">
        <textarea
          class="textarea open-ended-textarea"
          id="answer-${this.question.id}"
          placeholder="Escribe tu respuesta aquí..."
          aria-label="Tu respuesta"
          ${this.isReview ? 'readonly' : ''}
        >${this.escapeHtml(value)}</textarea>
        ${this.renderKeywordsFeedback()}
      </div>
    `;
  }

  getOptionClass(type, index) {
    if (!this.showFeedback && !this.isReview) {
      const isSelected = type === 'multiple_choice'
        ? this.userAnswer === index
        : Array.isArray(this.userAnswer) && this.userAnswer.includes(index);
      return isSelected ? 'selected' : '';
    }

    // Review mode - show correct/incorrect
    if (type === 'multiple_choice') {
      if (index === this.question.correct) return 'correct';
      if (this.userAnswer === index) return 'incorrect';
      return '';
    } else {
      const isCorrect = this.question.correct.includes(index);
      const isUserSelected = Array.isArray(this.userAnswer) && this.userAnswer.includes(index);
      if (isCorrect && isUserSelected) return 'correct';
      if (!isCorrect && isUserSelected) return 'incorrect';
      if (isCorrect && !isUserSelected) return 'correct';
      return '';
    }
  }

  renderOptionFeedback(type, index) {
    if (!this.showFeedback && !this.isReview) return '';

    if (type === 'multiple_choice') {
      if (index === this.question.correct) {
        return '<span class="option-feedback correct">✓ Correcta</span>';
      }
      if (this.userAnswer === index) {
        return '<span class="option-feedback incorrect">✗ Incorrecta</span>';
      }
    } else {
      const isCorrect = this.question.correct.includes(index);
      const isUserSelected = Array.isArray(this.userAnswer) && this.userAnswer.includes(index);
      if (isCorrect && isUserSelected) return '<span class="option-feedback correct">✓ Correcta</span>';
      if (!isCorrect && isUserSelected) return '<span class="option-feedback incorrect">✗ Incorrecta</span>';
      if (isCorrect && !isUserSelected) return '<span class="option-feedback correct">✓ Correcta (no seleccionada)</span>';
    }
    return '';
  }

  renderKeywordsFeedback() {
    if (!this.isReview || this.question.type !== 'open_ended') return '';

    const { matchKeywords } = require('../utils/helpers.js');
    const { matched, missing } = matchKeywords(this.userAnswer || '', this.question.expected_keywords);

    if (matched.length === 0 && missing.length === 0) return '';

    return `
      <div class="explanation-box" style="margin-top: 1rem;">
        <div class="explanation-title">🔍 Palabras clave:</div>
        <div class="keywords-list">
          ${matched.map(k => `<span class="keyword-tag found">${this.escapeHtml(k)} ✓</span>`).join('')}
          ${missing.map(k => `<span class="keyword-tag missing">${this.escapeHtml(k)} ✗</span>`).join('')}
        </div>
      </div>
    `;
  }

  renderFeedback() {
    if (!this.question.explanation) return '';

    return `
      <div class="explanation-box">
        <div class="explanation-title">💡 Explicación:</div>
        <div class="explanation-content">${this.escapeHtml(this.question.explanation)}</div>
      </div>
    `;
  }

  bindEvents() {
    if (this.isReview) return;

    const container = this.element;

    // Use event delegation for better reliability
    container.addEventListener('click', (e) => {
      const optionItem = e.target.closest('.option-item');
      if (!optionItem) return;

      const index = parseInt(optionItem.dataset.index, 10);
      if (isNaN(index)) return;

      if (this.question.type === 'multiple_choice') {
        this.onAnswerChange(this.question.id, index);
      } else if (this.question.type === 'multiple_select') {
        const current = Array.isArray(this.userAnswer) ? [...this.userAnswer] : [];
        const newAnswer = current.includes(index)
          ? current.filter(i => i !== index)
          : [...current, index];
        this.onAnswerChange(this.question.id, newAnswer);
      }
    });

    // Keyboard support
    container.addEventListener('keydown', (e) => {
      const optionItem = e.target.closest('.option-item');
      if (!optionItem) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        optionItem.click();
      }
    });

    if (this.question.type === 'open_ended') {
      const textarea = container.querySelector(`#answer-${this.question.id}`);
      if (textarea) {
        textarea.addEventListener('input', debounce(() => {
          this.onAnswerChange(this.question.id, textarea.value);
        }, 300));
      }
    }
  }

  update(question, userAnswer, options = {}) {
    this.question = question;
    this.userAnswer = userAnswer;
    this.showFeedback = options.showFeedback || false;
    this.isReview = options.isReview || false;

    const oldElement = this.element;
    const newElement = this.render();
    if (oldElement && oldElement.parentElement) {
      oldElement.outerHTML = newElement.outerHTML;
      this.element = oldElement.parentElement.querySelector(`[data-question-id="${this.question.id}"]`);
    } else {
      this.element = newElement;
    }
    // Re-bind events after DOM replacement
    this.bindEvents();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  destroy() {
    this.element?.remove();
    this.element = null;
  }
}

// Simple debounce for local use
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}