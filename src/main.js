/**
 * Repasos Simulator - Main Entry Point
 * A lightweight quiz simulator for certification exam preparation
 */
import './styles/main.css';
import { QuizLoader } from './components/QuizLoader.js';
import { QuestionCard } from './components/QuestionCard.js';
import { ProgressBar } from './components/ProgressBar.js';
import { ResultsView } from './components/ResultsView.js';
import { StorageService } from './services/StorageService.js';
import { ScoringService } from './services/ScoringService.js';
import { createToast, shuffleArray, shuffleQuestionOptions } from './utils/helpers.js';

// ========================================
// STATE MANAGEMENT
// ========================================

const State = {
  quiz: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  settings: {},
  mode: 'loading', // 'loading', 'quiz', 'results'
  components: {}
};

// ========================================
// DOM ELEMENTS
// ========================================

const app = document.getElementById('app');

// ========================================
// RENDER FUNCTIONS
// ========================================

function renderHeader() {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="header-content">
      <h1 class="app-title">📝 Repasos Simulator</h1>
      <div id="headerControls" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;"></div>
      <div id="headerActions" style="display: flex; gap: 0.5rem; align-items: center;"></div>
    </div>
  `;
  return header;
}

function renderMain() {
  const main = document.createElement('main');
  main.className = 'app-main';
  main.id = 'mainContent';
  return main;
}

function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <p>Repasos Simulator — Lightweight quiz app for exam prep. Built with vanilla JS + Vite.</p>
  `;
  return footer;
}

function initializeLayout() {
  app.innerHTML = '';
  app.appendChild(renderHeader());
  app.appendChild(renderMain());
  app.appendChild(renderFooter());
}

// ========================================
// MODE RENDERERS
// ========================================

function renderLoadingMode() {
  const main = document.getElementById('mainContent');
  main.innerHTML = '';

  const loader = new QuizLoader(onQuizLoaded);
  State.components.loader = loader;
  main.appendChild(loader.render());

  updateHeaderActions([]);
  renderHeaderControls();
}

function renderQuizMode() {
  const main = document.getElementById('mainContent');
  main.innerHTML = '';

  // Progress bar
  const answeredCount = Object.keys(State.answers).length;
  const progressBar = new ProgressBar(State.questions.length, State.currentIndex, answeredCount);
  State.components.progressBar = progressBar;
  main.appendChild(progressBar.render());

  // Question card
  const question = State.questions[State.currentIndex];
  const questionCard = new QuestionCard(
    { ...question, _index: State.currentIndex + 1 },
    State.answers[question.id],
    onAnswerChange,
    { showFeedback: State.settings.showExplanationImmediately }
  );
  State.components.questionCard = questionCard;
  main.appendChild(questionCard.render());

  // Navigation
  const nav = document.createElement('div');
  nav.className = 'quiz-nav';
  nav.innerHTML = `
    <div class="nav-progress">
      ${State.settings.showExplanationImmediately ? '<span style="color: var(--color-accent);">💡 Modo estudio: explicación inmediata</span>' : ''}
    </div>
    <div class="nav-actions">
      <button class="btn btn-secondary btn-sm" id="btnPrev" type="button" ${State.currentIndex === 0 ? 'disabled' : ''}>
        ← Anterior
      </button>
      <button class="btn btn-primary btn-sm" id="btnNext" type="button">
        ${State.currentIndex === State.questions.length - 1 ? 'Finalizar' : 'Siguiente →'}
      </button>
    </div>
  `;
  main.appendChild(nav);

  bindNavEvents(nav);
  updateHeaderActions([
    { label: '🔀 Reiniciar', variant: 'secondary', onClick: restartQuiz },
    { label: '📂 Cambiar quiz', variant: 'ghost', onClick: loadNewQuiz }
  ]);
  renderHeaderControls();
}

function renderResultsMode() {
  const main = document.getElementById('mainContent');
  main.innerHTML = '';

  const resultsView = new ResultsView(State.quiz, State.answers, restartQuiz, loadNewQuiz);
  State.components.resultsView = resultsView;
  main.appendChild(resultsView.render());

  updateHeaderActions([
    { label: '📂 Cargar otro quiz', variant: 'ghost', onClick: loadNewQuiz }
  ]);
  renderHeaderControls();

  // Save to history
  StorageService.saveResult({
    quizTitle: State.quiz.title,
    score: State.scoredResult.percentage,
    correct: State.scoredResult.correctCount,
    total: State.questions.length,
    date: new Date().toISOString()
  });
}

// ========================================
// EVENT HANDLERS
// ========================================

function onQuizLoaded(quiz) {
  State.quiz = quiz;
  State.questions = quiz.questions;
  State.settings = StorageService.loadSettings();

  // Apply shuffle questions if enabled
  if (State.settings.shuffleQuestions) {
    State.questions = shuffleArray(State.questions);
  }

  // Apply shuffle options if enabled (preserves correct answer)
  if (State.settings.shuffleOptions) {
    State.questions = State.questions.map(q => {
      if (q.type === 'multiple_choice' || q.type === 'multiple_select') {
        const { options, correct } = shuffleQuestionOptions(q);
        return { ...q, options, correct };
      }
      return q;
    });
  }

  // Load saved progress
  const savedProgress = StorageService.loadProgress();
  const savedAnswers = StorageService.loadAnswers();

  if (savedProgress && savedProgress.totalQuestions === State.questions.length) {
    State.currentIndex = savedProgress.currentQuestionIndex;
    State.answers = savedAnswers;
  } else {
    State.currentIndex = 0;
    State.answers = {};
  }

  State.mode = 'quiz';
  renderQuizMode();
}

function onAnswerChange(questionId, answer) {
  State.answers[questionId] = answer;

  // Auto-save progress
  StorageService.saveAnswers(State.answers);
  StorageService.saveProgress(State.currentIndex, State.questions.length);

  // Update progress bar
  const answeredCount = Object.keys(State.answers).length;
  State.components.progressBar?.update(State.questions.length, State.currentIndex, answeredCount);

  // Always update question card to reflect selection visually
  const question = State.questions[State.currentIndex];
  if (question && question.id === questionId) {
    State.components.questionCard?.update(
      { ...question, _index: State.currentIndex + 1 },
      State.answers[question.id],
      { showFeedback: State.settings.showExplanationImmediately }
    );
  }
}

function hasAnsweredCurrentQuestion() {
  const question = State.questions[State.currentIndex];
  if (!question) return true;
  const answer = State.answers[question.id];
  if (answer === undefined || answer === null) return false;
  if (question.type === 'multiple_select' && Array.isArray(answer)) return answer.length > 0;
  if (question.type === 'open_ended' && typeof answer === 'string') return answer.trim().length > 0;
  return true;
}

function bindNavEvents(nav) {
  nav.querySelector('#btnPrev')?.addEventListener('click', () => {
    if (State.currentIndex > 0) {
      State.currentIndex--;
      renderQuizMode();
    }
  });

  nav.querySelector('#btnNext')?.addEventListener('click', () => {
    if (!hasAnsweredCurrentQuestion()) {
      createToast('Por favor selecciona una respuesta antes de continuar', 'warning');
      return;
    }
    if (State.currentIndex < State.questions.length - 1) {
      State.currentIndex++;
      renderQuizMode();
    } else {
      finishQuiz();
    }
  });
}

function finishQuiz() {
  State.scoredResult = ScoringService.scoreQuiz(State.quiz, State.answers);
  State.mode = 'results';
  renderResultsMode();
}

function restartQuiz() {
  State.currentIndex = 0;
  State.answers = {};
  StorageService.clearQuiz();
  State.mode = 'quiz';
  renderQuizMode();
}

function loadNewQuiz() {
  // Clean up components
  Object.values(State.components).forEach(c => c?.destroy?.());
  State.components = {};

  State.quiz = null;
  State.questions = [];
  State.currentIndex = 0;
  State.answers = {};
  State.mode = 'loading';

  renderLoadingMode();
}

function updateHeaderActions(actions) {
  const container = document.querySelector('#headerActions');
  if (!container) return;

  container.innerHTML = actions.map(action => `
    <button class="btn btn-${action.variant} btn-sm" type="button">${action.label}</button>
  `).join('');

  container.querySelectorAll('button').forEach((btn, index) => {
    btn.addEventListener('click', actions[index].onClick);
  });
}

function renderHeaderControls() {
  const container = document.querySelector('#headerControls');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
      <!-- Mode toggle -->
      <div class="mode-toggle" title="Cambiar modo">
        <input type="radio" name="mode" value="evaluation" id="modeEvaluation" ${State.settings.mode === 'evaluation' ? 'checked' : ''}>
        <label for="modeEvaluation" class="mode-toggle-option">📝 Evaluación</label>
        <input type="radio" name="mode" value="study" id="modeStudy" ${State.settings.mode === 'study' ? 'checked' : ''}>
        <label for="modeStudy" class="mode-toggle-option">📚 Repaso</label>
      </div>

      <!-- Shuffle questions -->
      <label class="slide-toggle" title="Aleatorizar orden de preguntas">
        <input type="checkbox" id="shuffleQuestionsToggle" ${State.settings.shuffleQuestions ? 'checked' : ''}>
        <span class="slide-toggle-track" aria-hidden="true"></span>
        <span class="slide-toggle-label">🔀 Preguntas</span>
      </label>

      <!-- Shuffle options -->
      <label class="slide-toggle" title="Aleatorizar opciones de cada pregunta">
        <input type="checkbox" id="shuffleOptionsToggle" ${State.settings.shuffleOptions ? 'checked' : ''}>
        <span class="slide-toggle-track" aria-hidden="true"></span>
        <span class="slide-toggle-label">🔀 Opciones</span>
      </label>
    </div>
  `;

  // Bind events
  container.querySelector('#modeEvaluation')?.addEventListener('change', () => setMode('evaluation'));
  container.querySelector('#modeStudy')?.addEventListener('change', () => setMode('study'));

  container.querySelector('#shuffleQuestionsToggle')?.addEventListener('change', (e) => {
    State.settings.shuffleQuestions = e.target.checked;
    StorageService.saveSettings(State.settings);
    createToast(e.target.checked ? 'Shuffle preguntas activado (se aplica al cargar quiz)' : 'Shuffle preguntas desactivado', 'info');
  });

  container.querySelector('#shuffleOptionsToggle')?.addEventListener('change', (e) => {
    State.settings.shuffleOptions = e.target.checked;
    StorageService.saveSettings(State.settings);
    createToast(e.target.checked ? 'Shuffle opciones activado (se aplica al cargar quiz)' : 'Shuffle opciones desactivado', 'info');
  });
}

function setMode(mode) {
  State.settings.mode = mode;
  State.settings.showExplanationImmediately = mode === 'study';
  StorageService.saveSettings(State.settings);
  // Only re-render quiz if we're in quiz mode
  if (State.mode === 'quiz') {
    renderQuizMode();
  }
}

// ========================================
// INITIALIZATION
// ========================================

function init() {
  // Load settings first so header controls render correctly
  State.settings = StorageService.loadSettings();
  
  initializeLayout();
  renderLoadingMode();

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (State.mode !== 'quiz') return;

    // Left/Right arrows for navigation
    if (e.key === 'ArrowLeft' && State.currentIndex > 0) {
      e.preventDefault();
      State.currentIndex--;
      renderQuizMode();
    } else if (e.key === 'ArrowRight' && State.currentIndex < State.questions.length - 1) {
      e.preventDefault();
      if (!hasAnsweredCurrentQuestion()) {
        createToast('Por favor selecciona una respuesta antes de continuar', 'warning');
        return;
      }
      State.currentIndex++;
      renderQuizMode();
    }
    // Enter to submit on last question
    else if (e.key === 'Enter' && State.currentIndex === State.questions.length - 1 && e.target.tagName !== 'TEXTAREA') {
      if (!hasAnsweredCurrentQuestion()) {
        createToast('Por favor selecciona una respuesta antes de finalizar', 'warning');
        return;
      }
      e.preventDefault();
      finishQuiz();
    }
  });

  console.log('🎯 Repasos Simulator initialized');
}

// Start app
init();