#!/usr/bin/env node
/**
 * Interactive Quiz Creator CLI
 * Usage: node scripts/create-quiz.js [title] [--output path] [--interactive]
 */

import { createQuiz, addQuestion, validateQuiz, getQuizStats } from './quiz-lib.js';
import { writeFile } from 'fs/promises';
import { stdin, stdout } from 'process';
import readline from 'readline';

const rl = readline.createInterface({ input: stdin, output: stdout });

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function promptQuestion(quiz, index) {
  console.log(`\n--- Question ${index + 1} ---`);
  console.log('Types: 1) multiple_choice  2) multiple_select  3) open_ended');

  const typeChoice = await question('Type (1/2/3): ');
  const typeMap = { '1': 'multiple_choice', '2': 'multiple_select', '3': 'open_ended' };
  const type = typeMap[typeChoice];
  if (!type) {
    console.log('Invalid type, skipping...');
    return quiz;
  }

  const id = await question('Question ID (e.g., q1): ') || `q${index + 1}`;
  const qText = await question('Question text: ');

  let options = [], correct, expectedKeywords;

  if (type === 'multiple_choice' || type === 'multiple_select') {
    console.log('Enter options (empty line to finish, min 2):');
    let optNum = 1;
    while (true) {
      const opt = await question(`  Option ${optNum}: `);
      if (!opt && options.length >= 2) break;
      if (opt) { options.push(opt); optNum++; }
    }

    if (type === 'multiple_choice') {
      const correctIdx = parseInt(await question(`Correct option index (0-${options.length - 1}): `), 10);
      correct = isNaN(correctIdx) ? 0 : correctIdx;
    } else {
      const correctInput = await question('Correct indices (comma-separated, e.g., 0,2): ');
      correct = correctInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    }
  } else {
    const kwInput = await question('Expected keywords (comma-separated): ');
    expectedKeywords = kwInput.split(',').map(s => s.trim()).filter(Boolean);
  }

  const explanation = await question('Explanation (shown in review): ');
  const points = parseInt(await question('Points (default 1): '), 10) || 1;

  const q = { id, type, question: qText, explanation, points };
  if (type !== 'open_ended') { q.options = options; q.correct = correct; }
  else { q.expected_keywords = expectedKeywords; }

  try {
    addQuestion(quiz, q);
    console.log('✓ Question added');
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
  }

  return quiz;
}

async function main() {
  const args = process.argv.slice(2);
  const interactive = args.includes('--interactive') || args.includes('-i');
  const outputIdx = args.indexOf('--output');
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : 'public/quizzes/quiz.json';

  let title = args.find(a => !a.startsWith('-')) || await question('Quiz title: ');
  const description = await question('Description (optional): ');

  const quiz = createQuiz(title, description);

  if (interactive || !args.find(a => !a.startsWith('-'))) {
    let addMore = true;
    let qIndex = 0;
    while (addMore) {
      await promptQuestion(quiz, qIndex++);
      const cont = await question('\nAdd another question? (Y/n): ');
      addMore = !cont || cont.toLowerCase() === 'y';
    }
  }

  const { valid, errors } = validateQuiz(quiz);
  if (!valid) {
    console.log('\n❌ Validation errors:');
    errors.forEach(e => console.log(`  - ${e}`));
    process.exit(1);
  }

  const stats = getQuizStats(quiz);
  console.log('\n📊 Quiz Stats:');
  console.log(`  Questions: ${stats.totalQuestions}`);
  console.log(`  Total Points: ${stats.totalPoints}`);
  console.log(`  By Type: ${Object.entries(stats.byType).map(([k,v]) => `${k}:${v}`).join(', ')}`);

  await writeFile(outputPath, JSON.stringify(quiz, null, 2));
  console.log(`\n✅ Quiz saved to ${outputPath}`);

  rl.close();
}

main().catch(e => {
  console.error('Error:', e.message);
  rl.close();
  process.exit(1);
});