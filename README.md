# Repasos Simulator

Simulador de exámenes ligero para repaso de certificaciones. Construido con **Vanilla JS + Vite** — sin frameworks pesados, cero dependencias runtime.

## Características

- ✅ **Tipos de pregunta**: Selección única, múltiple selección, respuesta abierta
- ✅ **Drag & drop** de archivos `.json` para cargar quizzes
- ✅ **Feedback inmediato** (modo estudio) o al final
- ✅ **Revisión detallada**: explicaciones, palabras clave encontradas/faltantes
- ✅ **Persistencia local**: progreso guardado en `localStorage`
- ✅ **Keyboard navigation**: ←/→ para navegar, Enter para finalizar
- ✅ **Responsive**: funciona en móvil y desktop
- ✅ **GitHub Pages ready**: `npm run build` → sube carpeta `dist/`

## Estructura del proyecto

```
repasos-simulator/
├── index.html                 # Entry point
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── quizzes/               # Tus quizzes .json aquí
│       └── gcp-associate-cloud-engineer.json
├── src/
│   ├── main.js                # App entry, state, routing
│   ├── styles/
│   │   └── main.css           # Design system + components
│   ├── components/
│   │   ├── QuizLoader.js      # Drag & drop + file parsing
│   │   ├── QuestionCard.js    # Renderizado de pregunta individual
│   │   ├── ProgressBar.js     # Barra de progreso
│   │   └── ResultsView.js     # Pantalla de resultados + revisión
│   ├── services/
│   │   ├── QuizParser.js      # Validación y normalización de quiz
│   │   ├── StorageService.js  # localStorage persistence
│   │   └── ScoringService.js  # Lógica de puntuación
│   └── utils/
│       └── helpers.js         # Utilidades puras
```

## Instalación y desarrollo

```bash
cd C:/Users/danic/Documents/Maestría/Repasos/repasos-simulator
npm install
npm run dev      # Servidor dev en http://localhost:5173
npm run build    # Build producción en ./dist
npm run preview  # Preview del build
```

## Formato de quiz (.json)

```json
{
  "title": "Mi Examen",
  "description": "Descripción opcional",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "¿Pregunta?",
      "options": ["Opción A", "Opción B", "Opción C"],
      "correct": 1,
      "explanation": "Explicación mostrada en revisión",
      "points": 1
    },
    {
      "id": "q2",
      "type": "multiple_select",
      "question": "Selecciona varias:",
      "options": ["A", "B", "C", "D"],
      "correct": [0, 2],
      "explanation": "Explicación...",
      "points": 2
    },
    {
      "id": "q3",
      "type": "open_ended",
      "question": "Explica algo:",
      "expected_keywords": ["clave1", "clave2", "concepto"],
      "explanation": "Respuesta esperada...",
      "points": 3
    }
  ]
}
```

### Tipos soportados

| `type` | UI | Validación |
|--------|-----|------------|
| `multiple_choice` | Radio buttons | Índice único en `correct` |
| `multiple_select` | Checkboxes | Array de índices en `correct` |
| `open_ended` | Textarea | Match de `expected_keywords` (≥60% = correcto) |

## Deploy a GitHub Pages

1. `npm run build` → genera carpeta `dist/`
2. En repo GitHub: Settings → Pages → Source: "Deploy from branch" → `gh-pages` branch / `dist` folder
3. O usa `gh-pages` package: `npx gh-pages -d dist`

## Atajos de teclado (modo quiz)

| Tecla | Acción |
|-------|--------|
| `←` / `→` | Pregunta anterior/siguiente |
| `Enter` (última pregunta) | Finalizar examen |
| `1-9` | Seleccionar opción (multiple_choice) |
| `Espacio` | Toggle checkbox (multiple_select) |

## Configuración (Settings)

Se guarda en `localStorage` bajo `repasos_settings`:

```json
{
  "shuffleQuestions": false,
  "showExplanationImmediately": false,
  "timerEnabled": false,
  "timerDuration": 0
}
```

## Extender

- **Nuevos tipos de pregunta**: Añade case en `QuestionCard.renderContent()` y `ScoringService.scoreAnswer()`
- **Nuevos formatos de archivo**: Extiende `QuizParser` para YAML, CSV, etc.
- **Temas**: Modifica `--color-*` en `src/styles/main.css`
- **Analytics**: Hook en `StorageService.saveResult()`

## Licencia

MIT — úsalo libremente para tus repasos.