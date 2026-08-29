import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;

// 1. Verificar medicalQuestionsAndCards.js
const medCardsPath = path.resolve(__dirname, '../frontend/src/data/medicalQuestionsAndCards.js');
const medCardsContent = fs.readFileSync(medCardsPath, 'utf8');
const medCardsMatches = medCardsContent.match(emojiRegex);
console.log(`[AUDIT] medicalQuestionsAndCards.js emojis encontrados: ${medCardsMatches ? medCardsMatches.length : 0}`);

// 2. Verificar deptq-dataset.json se existir
const deptqPath = path.resolve(__dirname, '../src/database/deptq-dataset.json');
if (fs.existsSync(deptqPath)) {
  const deptqContent = fs.readFileSync(deptqPath, 'utf8');
  const deptqMatches = deptqContent.match(emojiRegex);
  console.log(`[AUDIT] deptq-dataset.json emojis encontrados: ${deptqMatches ? deptqMatches.length : 0}`);
  if (deptqMatches && deptqMatches.length > 0) {
    const cleaned = deptqContent.replace(emojiRegex, '');
    fs.writeFileSync(deptqPath, cleaned, 'utf8');
    console.log(`[CLEAN] Emojis removidos de deptq-dataset.json com sucesso.`);
  }
}

// 3. Verificar rumedq-dataset.json se existir
const rumedqPath = path.resolve(__dirname, '../src/database/rumedq-dataset.json');
if (fs.existsSync(rumedqPath)) {
  const rumedqContent = fs.readFileSync(rumedqPath, 'utf8');
  const rumedqMatches = rumedqContent.match(emojiRegex);
  console.log(`[AUDIT] rumedq-dataset.json emojis encontrados: ${rumedqMatches ? rumedqMatches.length : 0}`);
  if (rumedqMatches && rumedqMatches.length > 0) {
    const cleaned = rumedqContent.replace(emojiRegex, '');
    fs.writeFileSync(rumedqPath, cleaned, 'utf8');
    console.log(`[CLEAN] Emojis removidos de rumedq-dataset.json com sucesso.`);
  }
}

// 4. Verificar questoes-fix.sql
const fixSqlPath = path.resolve(__dirname, '../src/database/questoes-fix.sql');
if (fs.existsSync(fixSqlPath)) {
  const fixSqlContent = fs.readFileSync(fixSqlPath, 'utf8');
  const fixSqlMatches = fixSqlContent.match(emojiRegex);
  console.log(`[AUDIT] questoes-fix.sql emojis encontrados: ${fixSqlMatches ? fixSqlMatches.length : 0}`);
  if (fixSqlMatches && fixSqlMatches.length > 0) {
    const cleaned = fixSqlContent.replace(emojiRegex, '');
    fs.writeFileSync(fixSqlPath, cleaned, 'utf8');
    console.log(`[CLEAN] Emojis removidos de questoes-fix.sql.`);
  }
}

console.log('[AUDIT CONCLUÍDO] Todos os datasets e arquivos de dados auditados!');
