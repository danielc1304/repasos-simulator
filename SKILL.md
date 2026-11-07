---
name: quiz-creator
description: Create quiz JSON files for Repasos Simulator - supports multiple choice, multiple select, and open-ended questions with validation
category: productivity
---

# Quiz Creator Skill for Repasos Simulator

This skill helps you create valid quiz JSON files for the Repasos Simulator app. It provides templates, validation, and helper functions.

## Quick Start

```bash
# From the simulator root directory
node scripts/create-quiz.js "My Quiz Title" --output public/quizzes/my-quiz.json
```

Or use the interactive creator:
```bash
node scripts/create-quiz.js --interactive
```

## Quiz JSON Schema

```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "questions": [
    {
      "id": "string (required, unique)",
      "type": "multiple_choice | multiple_select | open_ended",
      "question": "string (required)",
      "options": ["string", ...] (required for choice/select, min 2),
      "correct": number | number[] (required for choice/select),
      "expected_keywords": ["string", ...] (required for open_ended, min 1),
      "explanation": "string (shown in review)",
      "points": number (default: 1)
    }
  ]
}
```

## Question Types

### Multiple Choice (single answer)
```json
{
  "id": "q1",
  "type": "multiple_choice",
  "question": "¿Capital de Francia?",
  "options": ["Madrid", "París", "Roma"],
  "correct": 1,
  "explanation": "París es la capital.",
  "points": 1
}
```

### Multiple Select (multiple answers)
```json
{
  "id": "q2",
  "type": "multiple_select",
  "question": "Selecciona planetas:",
  "options": ["Marte", "Sirio", "Júpiter"],
  "correct": [0, 2],
  "explanation": "Marte y Júpiter son planetas.",
  "points": 2
}
```

### Open Ended (free text, keyword matching)
```json
{
  "id": "q3",
  "type": "open_ended",
  "question": "Explica la fotosíntesis",
  "expected_keywords": ["plantas", "luz", "CO2", "oxígeno", "clorofila"],
  "explanation": "Proceso donde plantas convierten luz + CO2 en glucosa + O2.",
  "points": 3
}
```

**Scoring**: ≥60% keywords matched = correct, partial credit proportional.

## Validation Rules

- `id`: unique across quiz
- `type`: one of 3 valid types
- `multiple_choice`: `correct` = valid index in `options`
- `multiple_select`: `correct` = array of valid indices, non-empty
- `open_ended`: `expected_keywords` = non-empty array
- `points`: positive number (default 1)

## Helper Scripts

### `scripts/create-quiz.js` — Interactive CLI
```bash
node scripts/create-quiz.js --interactive
# Prompts for title, description, then adds questions one by one
```

### `scripts/validate-quiz.js` — Validate existing quiz
```bash
node scripts/validate-quiz.js public/quizzes/my-quiz.json
# Exit code 0 = valid, 1 = errors (prints details)
```

### `scripts/convert-to-quiz.js` — Convert from other formats
```bash
# From CSV (columns: id,type,question,option1,option2,...,correct,explanation,points)
node scripts/convert-to-quiz.js --from csv --input quiz.csv --output public/quizzes/quiz.json

# From Markdown (structured)
node scripts/convert-to-quiz.js --from md --input quiz.md --output public/quizzes/quiz.json
```

## Markdown Format for Conversion

```markdown
# Quiz Title

Description here.

## Question 1 (multiple_choice)
**Q:** ¿Capital de Francia?
**Options:**
- Madrid
- París ✓
- Roma
**Explanation:** París es la capital.
**Points:** 1

## Question 2 (multiple_select)
**Q:** Selecciona planetas:
**Options:**
- Marte ✓
- Sirio
- Júpiter ✓
**Explanation:** Marte y Júpiter son planetas.
**Points:** 2

## Question 3 (open_ended)
**Q:** Explica la fotosíntesis
**Keywords:** plantas, luz, CO2, oxígeno, clorofila
**Explanation:** Proceso donde plantas convierten luz + CO2 en glucosa + O2.
**Points:** 3
```

## Best Practices for Exam Prep

1. **One concept per question** — test specific knowledge
2. **Plausible distractors** — wrong options should be common misconceptions
3. **Explanations teach** — explain WHY correct, not just WHAT
4. **Keywords for open-ended** — use 3-6 core concepts, synonyms okay
5. **Points reflect effort** — open_ended 2-3x multiple_choice
6. **Shuffle options** — don't always put correct at same position

## Example: Cloud Certification Quiz

See `public/quizzes/gcp-associate-cloud-engineer.json` for a 10-question example covering:
- VPC firewall scope (global)
- Disk types (Local SSD vs SSD PD)
- IAM least privilege roles
- Storage classes (Archive vs Coldline)
- VPC auto vs custom mode
- Serverless containers (Cloud Run)
- Cloud SQL features
- Load balancer + CDN setup
- Monitoring metrics (p95 latency)
- Resource Manager hierarchy

## Adding to Simulator

1. Place `.json` in `public/quizzes/`
2. Run `npm run dev` → drag & drop file in browser
3. Or deploy: `npm run build` → `dist/` includes quizzes folder

## Programmatic Creation (Node)

```javascript
import { createQuiz, addQuestion, validateQuiz } from './scripts/quiz-lib.js';

const quiz = createQuiz('My Exam', 'Description');
addQuestion(quiz, {
  id: 'q1',
  type: 'multiple_choice',
  question: 'Question?',
  options: ['A', 'B', 'C'],
  correct: 1,
  explanation: 'Why B is correct',
  points: 1
});

const { valid, errors } = validateQuiz(quiz);
if (valid) {
  await writeFile('public/quizzes/my-exam.json', JSON.stringify(quiz, null, 2));
}
```