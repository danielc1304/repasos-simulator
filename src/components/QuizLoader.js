/**
 * Quiz Loader Component - Handles file drag & drop and quiz loading
 */
import { createToast } from '../utils/helpers.js';
import { QuizParser } from '../services/QuizParser.js';
import { StorageService } from '../services/StorageService.js';

export class QuizLoader {
  constructor(onQuizLoad) {
    this.onQuizLoad = onQuizLoad;
    this.element = null;
    this.dragCounter = 0;
  }

  render() {
    this.element = document.createElement('section');
    this.element.className = 'card';
    this.element.innerHTML = `
      <div class="drop-zone" id="dropZone">
        <svg class="drop-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        <h2 class="drop-zone-title">Arrastra tu quiz aquí</h2>
        <p class="drop-zone-desc">O haz clic para seleccionar un archivo <strong>.json</strong></p>
        <p class="drop-zone-formats">Formatos: JSON con estructura de quiz (ver ejemplo abajo)</p>
        <input type="file" id="fileInput" class="sr-only" accept=".json" aria-label="Seleccionar archivo quiz">
      </div>

      <details class="mt-3" style="border: 1px solid var(--color-border); border-radius: var(--radius); overflow: hidden;">
        <summary style="padding: 0.75rem 1rem; background: var(--color-bg); cursor: pointer; font-weight: 500;">
          Ver estructura de archivo JSON esperada
        </summary>
        <pre style="padding: 1rem; overflow-x: auto; font-size: 0.75rem; line-height: 1.5; background: var(--color-bg);"><code id="jsonExample"></code></pre>
      </details>
    `;

    this.bindEvents();
    this.renderJsonExample();
    return this.element;
  }

  bindEvents() {
    const dropZone = this.element.querySelector('#dropZone');
    const fileInput = this.element.querySelector('#fileInput');

    // Click to open file dialog
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag & drop
    ['dragenter', 'dragover'].forEach(event => {
      dropZone.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dragCounter++;
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(event => {
      dropZone.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (event === 'dragleave') {
          this.dragCounter--;
          if (this.dragCounter === 0) dropZone.classList.remove('drag-over');
        } else {
          this.dragCounter = 0;
          dropZone.classList.remove('drag-over');
          const file = e.dataTransfer.files[0];
          if (file) this.handleFile(file);
        }
      });
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFile(file);
      fileInput.value = ''; // Allow re-selecting same file
    });
  }

  async handleFile(file) {
    if (!file.name.endsWith('.json')) {
      createToast('Por favor selecciona un archivo .json', 'error');
      return;
    }

    try {
      createToast('Cargando quiz...', 'info', 0); // Persistent until next toast
      const quiz = await QuizParser.loadFromFile(file);
      StorageService.saveQuiz(quiz);
      StorageService.clearQuiz(); // Clear previous progress
      createToast(`Quiz "${quiz.title}" cargado correctamente`, 'success');
      this.onQuizLoad(quiz);
    } catch (err) {
      createToast(`Error: ${err.message}`, 'error');
      console.error(err);
    }
  }

  renderJsonExample() {
    const example = {
      title: "Mi Examen de Repaso",
      description: "Descripción opcional del quiz",
      questions: [
        {
          id: "q1",
          type: "multiple_choice",
          question: "¿Cuál es la capital de Francia?",
          options: ["Madrid", "París", "Roma", "Berlín"],
          correct: 1,
          explanation: "París es la capital y ciudad más poblada de Francia.",
          points: 1
        },
        {
          id: "q2",
          type: "multiple_select",
          question: "Selecciona los planetas del sistema solar:",
          options: ["Marte", "Sirio", "Júpiter", "Alpha Centauri"],
          correct: [0, 2],
          explanation: "Marte y Júpiter son planetas de nuestro sistema solar. Sirio y Alpha Centauri son estrellas.",
          points: 2
        },
        {
          id: "q3",
          type: "open_ended",
          question: "Explica qué es la fotosíntesis",
          expected_keywords: ["plantas", "luz", "dióxido de carbono", "oxígeno", "clorofila", "glucosa"],
          explanation: "La fotosíntesis es el proceso por el cual las plantas convierten luz, CO2 y agua en glucosa y oxígeno usando clorofila.",
          points: 3
        }
      ]
    };

    this.element.querySelector('#jsonExample').textContent = JSON.stringify(example, null, 2);
  }

  destroy() {
    this.element?.remove();
    this.element = null;
  }
}