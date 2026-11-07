#!/usr/bin/env node
/**
 * Quiz Converter - Convert from Markdown or CSV to quiz JSON
 * Usage: node scripts/convert-to-quiz.js --from md|csv --input file --output file
 */

import { createQuiz, addQuestion, validateQuiz } from './quiz-lib.js';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

function parseMarkdown(content) {
  const lines = content.split('\n');
  const quiz = { title: '', description: '', questions: [] };
  let currentQuestion = null;
  let inOptions = false;
  let optionPrefix = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Title
    if (line.startsWith('# ') && !quiz.title) {
      quiz.title = line.slice(2).trim();
      continue;
    }

    // Description (first paragraph after title)
    if (quiz.title && !quiz.description && line && !line.startsWith('#') && !line.startsWith('##')) {
      quiz.description = line;
      continue;
    }

    // Question header: ## Question N (type)
    const qMatch = line.match(/^##\s+.*?\((multiple_choice|multiple_select|open_ended)\)$/i);
    if (qMatch) {
      if (currentQuestion) quiz.questions.push(currentQuestion);
      currentQuestion = {
        id: `q${quiz.questions.length + 1}`,
        type: qMatch[1].toLowerCase(),
        question: '',
        options: [],
        correct: [],
        expected_keywords: [],
        explanation: '',
        points: 1
      };
      inOptions = false;
      continue;
    }

    if (!currentQuestion) continue;

    // Question text
    if (line.startsWith('**Q:**') || line.startsWith('**Question:**')) {
      currentQuestion.question = line.replace(/^\*\*Q:\*\*/, '').replace(/^\*\*Question:\*\*/, '').trim();
      continue;
    }

    // Options section
    if (line.startsWith('**Options:**')) {
      inOptions = true;
      continue;
    }

    // Option lines: - Text ✓ or - Text
    if (inOptions && line.startsWith('- ')) {
      const optText = line.slice(2).trim();
      const isCorrect = optText.endsWith('✓') || optText.endsWith('☑') || optText.endsWith('[x]');
      const cleanText = optText.replace(/✓|☑|\[x\]/gi, '').trim();
      currentQuestion.options.push(cleanText);
      if (isCorrect) {
        if (currentQuestion.type === 'multiple_choice') {
          currentQuestion.correct = currentQuestion.options.length - 1;
        } else {
          currentQuestion.correct.push(currentQuestion.options.length - 1);
        }
      }
      continue;
    }

    // Keywords
    if (line.startsWith('**Keywords:**')) {
      currentQuestion.expected_keywords = line.replace('**Keywords:**', '').split(',').map(s => s.trim()).filter(Boolean);
      continue;
    }

    // Explanation
    if (line.startsWith('**Explanation:**')) {
      currentQuestion.explanation = line.replace('**Explanation:**', '').trim();
      continue;
    }

    // Points
    if (line.startsWith('**Points:**')) {
      currentQuestion.points = parseInt(line.replace('**Points:**', '').trim(), 10) || 1;
      continue;
    }
  }

  if (currentQuestion) quiz.questions.push(currentQuestion);
  return quiz;
}

function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have header + at least one row');

  const headers = lines[0].split(',').map(h => h.trim());
  const quiz = { title: 'Imported Quiz', description: '', questions: [] };

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => row[h] = values[idx]);

    const q = {
      id: row.id || `q${i}`,
      type: row.type || 'multiple_choice',
      question: row.question || '',
      explanation: row.explanation || '',
      points: parseInt(row.points, 10) || 1
    };

    if (q.type === 'multiple_choice' || q.type === 'multiple_select') {
      // Options are in columns option1, option2, ... or options (semicolon separated)
      if (row.options) {
        q.options = row.options.split(';').map(s => s.trim());
      } else {
        q.options = [];
        let optNum = 1;
        while (row[`option${optNum}`]) {
          q.options.push(row[`option${optNum}`].trim());
          optNum++;
        }
      }

      if (q.type === 'multiple_choice') {
        q.correct = parseInt(row.correct, 10) || 0;
      } else {
        q.correct = (row.correct || '').split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      }
    } else if (q.type === 'open_ended') {
      q.expected_keywords = (row.keywords || row.expected_keywords || '').split(',').map(s => s.trim()).filter(Boolean);
    }

    quiz.questions.push(q);
  }

  return quiz;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const fromIdx = args.indexOf('--from');
  const inputIdx = args.indexOf('--input');
  const outputIdx = args.indexOf('--output');

  if (fromIdx === -1 || inputIdx === -1 || outputIdx === -1) {
    console.error('Usage: node convert-to-quiz.js --from md|csv --input file --output file');
    process.exit(1);
  }

  const format = args[fromIdx + 1];
  const inputPath = resolve(process.cwd(), args[inputIdx + 1]);
  const outputPath = resolve(process.cwd(), args[outputIdx + 1]);

  try {
    const content = await readFile(inputPath, 'utf-8');
    let quiz;

    if (format === 'md') {
      quiz = parseMarkdown(content);
    } else if (format === 'csv') {
      quiz = parseCSV(content);
    } else {
      throw new Error('Format must be md or csv');
    }

    const { valid, errors } = validateQuiz(quiz);
    if (!valid) {
      console.error('❌ Converted quiz has validation errors:');
      errors.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }

    await writeFile(outputPath, JSON.stringify(quiz, null, 2));
    console.log(`✅ Converted ${quiz.questions.length} questions to ${outputPath}`);
  } catch (e) {
    console.error(`❌ Error: ${e.message}`);
    process.exit(1);
  }
}

main();