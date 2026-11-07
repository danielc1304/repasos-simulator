#!/usr/bin/env node
/**
 * Quiz Validator CLI
 * Usage: node scripts/validate-quiz.js <quiz-file.json>
 */

import { validateQuiz } from './quiz-lib.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node validate-quiz.js <quiz-file.json>');
    process.exit(1);
  }

  const filePath = resolve(process.cwd(), args[0]);

  try {
    const content = await readFile(filePath, 'utf-8');
    const quiz = JSON.parse(content);

    const { valid, errors } = validateQuiz(quiz);

    if (valid) {
      console.log(`✅ ${filePath} is valid`);
      console.log(`   Title: ${quiz.title}`);
      console.log(`   Questions: ${quiz.questions.length}`);
      const byType = {};
      quiz.questions.forEach(q => byType[q.type] = (byType[q.type] || 0) + 1);
      console.log(`   Types: ${Object.entries(byType).map(([k,v]) => `${k}:${v}`).join(', ')}`);
      process.exit(0);
    } else {
      console.log(`❌ ${filePath} has validation errors:`);
      errors.forEach(e => console.log(`  - ${e}`));
      process.exit(1);
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.error(`❌ Invalid JSON: ${e.message}`);
    } else {
      console.error(`❌ Error reading file: ${e.message}`);
    }
    process.exit(1);
  }
}

main();