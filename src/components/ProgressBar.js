/**
 * Progress Bar Component - Shows quiz progress
 */
export class ProgressBar {
  constructor(totalQuestions, currentIndex, answeredCount) {
    this.totalQuestions = totalQuestions;
    this.currentIndex = currentIndex;
    this.answeredCount = answeredCount;
    this.element = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'panel';
    this.element.innerHTML = this.renderHtml();
    return this.element;
  }

  renderHtml() {
    const progressPercent = this.totalQuestions > 0
      ? Math.round(((this.currentIndex + 1) / this.totalQuestions) * 100)
      : 0;

    return `
      <div class="progress-bar" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del quiz">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted);">
        <span>Pregunta ${this.currentIndex + 1} de ${this.totalQuestions}</span>
        <span>${this.answeredCount}/${this.totalQuestions} respondidas</span>
      </div>
    `;
  }

  update(totalQuestions, currentIndex, answeredCount) {
    this.totalQuestions = totalQuestions;
    this.currentIndex = currentIndex;
    this.answeredCount = answeredCount;

    if (this.element) {
      const progressPercent = this.totalQuestions > 0
        ? Math.round(((this.currentIndex + 1) / this.totalQuestions) * 100)
        : 0;

      const fill = this.element.querySelector('.progress-fill');
      const labels = this.element.querySelectorAll('span');

      if (fill) fill.style.width = `${progressPercent}%`;
      if (labels[0]) labels[0].textContent = `Pregunta ${this.currentIndex + 1} de ${this.totalQuestions}`;
      if (labels[1]) labels[1].textContent = `${this.answeredCount}/${this.totalQuestions} respondidas`;

      this.element.querySelector('.progress-bar').setAttribute('aria-valuenow', progressPercent);
    }
  }

  destroy() {
    this.element?.remove();
    this.element = null;
  }
}