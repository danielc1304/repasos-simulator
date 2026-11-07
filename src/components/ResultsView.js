/**
 * Results View Component - Shows quiz results with detailed review
 */
import { createToast } from '../utils/helpers.js';
import { ScoringService } from '../services/ScoringService.js';
import { StorageService } from '../services/StorageService.js';
import { QuestionCard } from './QuestionCard.js';

export class ResultsView {
  constructor(quiz, answers, onRestart, onLoadNew) {
    this.quiz = quiz;
    this.answers = answers;
    this.onRestart = onRestart;
    this.onLoadNew = onLoadNew;
    this.scoredResult = ScoringService.scoreQuiz(quiz, answers);
    this.element = null;
  }

  render() {
    this.element = document.createElement('section');
    this.element.className = 'card';
    this.element.innerHTML = this.renderResults();
    this.bindEvents();
    return this.element;
  }

  renderResults() {
    const { correctCount, incorrectCount, skippedCount, percentage, passed, totalPoints, earnedPoints } = this.scoredResult;

    return `
      <div class="results-header">
        <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${this.quiz.title}</h1>
        <p class="text-muted">${this.quiz.description || ''}</p>
        <div class="results-score">${percentage}%</div>
        <div class="mt-2" style="font-size: 1rem;">
          <span class="${passed ? 'summary-correct' : 'summary-incorrect'}" style="font-weight: 600;">
            ${passed ? '✅ Aprobado' : '❌ No aprobado'} (mínimo 70%)
          </span>
        </div>
      </div>

      <div class="results-summary">
        <div class="summary-item summary-correct">
          <div class="summary-value">${correctCount}</div>
          <div class="summary-label">Correctas</div>
        </div>
        <div class="summary-item summary-incorrect">
          <div class="summary-value">${incorrectCount}</div>
          <div class="summary-label">Incorrectas</div>
        </div>
        <div class="summary-item summary-skipped">
          <div class="summary-value">${skippedCount}</div>
          <div class="summary-label">Sin responder</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${earnedPoints}/${totalPoints}</div>
          <div class="summary-label">Puntos</div>
        </div>
      </div>

      <div class="mt-3" style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
        <button class="btn btn-primary" id="btnRestart" type="button">🔄 Reintentar este quiz</button>
        <button class="btn btn-secondary" id="btnNewQuiz" type="button">📂 Cargar otro quiz</button>
      </div>

      <hr style="margin: 2rem 0; border-color: var(--color-border);">

      <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem;">📋 Revisión detallada</h2>

      <div id="questionsReview">
        ${this.scoredResult.results.map((result, index) => this.renderQuestionReview(result, index)).join('')}
      </div>
    `;
  }

  renderQuestionReview(result, index) {
    const question = this.quiz.questions.find(q => q.id === result.questionId);
    if (!question) return '';

    const statusClass = result.correct ? 'correct' : (result.details.userAnswer === undefined || result.details.userAnswer === '' || (Array.isArray(result.details.userAnswer) && result.details.userAnswer.length === 0) ? 'skipped' : 'incorrect');
    const statusText = result.correct ? '✓' : (statusClass === 'skipped' ? '⊘' : '✗');

    const typeLabels = {
      multiple_choice: 'Opción única',
      multiple_select: 'Múltiple selección',
      open_ended: 'Respuesta abierta'
    };

    // Render the question card in review mode
    const questionCard = new QuestionCard(
      { ...question, _index: index + 1 },
      result.details.userAnswer,
      () => {},
      { showFeedback: true, isReview: true }
    );
    const cardHtml = questionCard.render().outerHTML;

    return `
      <article class="question-review" data-question-id="${question.id}">
        <div class="question-review-header">
          <div class="review-status ${statusClass}" aria-label="${statusClass}">${statusText}</div>
          <h3 style="flex: 1; font-size: 1rem;">${this.escapeHtml(question.question)}</h3>
          <span class="review-type-badge">${typeLabels[question.type]}</span>
        </div>
        ${cardHtml}
      </article>
    `;
  }

  bindEvents() {
    this.element.querySelector('#btnRestart')?.addEventListener('click', () => {
      this.onRestart();
    });

    this.element.querySelector('#btnNewQuiz')?.addEventListener('click', () => {
      this.onLoadNew();
    });
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