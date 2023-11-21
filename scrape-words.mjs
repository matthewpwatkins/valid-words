import fs from 'fs';
import { wordsAreCloseEnough } from './WordJudge.mjs';

const WORD_LIST_DIR = 'input-en_US';
const OUTPUT_WORDS_DIR = 'en_US';
const MIN_LENGTH = 2;
const MAX_LENGTH = 15;

const retry = async (callback, numRetries) => {
  for (let i = 0; i < numRetries; i++) {
    try {
      const res = await callback();
      return res;
    } catch (err) {
      console.error(err);
    }
  }
}

let totalCount = 0;
if (fs.existsSync(WORD_LIST_DIR)) {
  for (let wordLength = MIN_LENGTH; wordLength <= MAX_LENGTH; wordLength++) {
    const fileContents = fs.readFileSync(WORD_LIST_DIR + `/${wordLength}.json`);
    totalCount += JSON.parse(fileContents).length;
  }
} else {
  fs.mkdirSync(WORD_LIST_DIR);
  for (let wordLength = MIN_LENGTH; wordLength <= MAX_LENGTH; wordLength++) {
    console.log(`${new Date()}: Querying words with ${wordLength} letters`);
    const url = `https://www.wordgamedictionary.com/word-lists/${wordLength}-letter-words/${wordLength}-letter-words.json`;
    const res = await retry(async () => await fetch(url), 5);
    const obj = await res.json();
    totalCount += obj.length;
    const filePath = WORD_LIST_DIR + `/${wordLength}.json`;
    fs.writeFileSync(filePath, JSON.stringify(obj));
  }
}

let processedWords = 0;
const entryPages = [];
for (let wordLength = MIN_LENGTH; wordLength <= MAX_LENGTH; wordLength++) {
  const previousEntryPage = entryPages.length ? entryPages[entryPages.length - 1] : [];
  const currentEntryPage = [];
  const wordPage = JSON.parse(fs.readFileSync(WORD_LIST_DIR + `/${wordLength}.json`, { encoding: 'utf8', flag: 'r' }));

  for (let i = 0; i < wordPage.length; i++) {
    const word = wordPage[i].word;
    const entry = {
      word: word,
      chain_letters_neighbors: []
    };

    for (const previousEntry of previousEntryPage) {
      if (wordsAreCloseEnough(word, previousEntry.word)) {
        previousEntry.chain_letters_neighbors.push(word);
        entry.chain_letters_neighbors.push(previousEntry.word);
      }
    }

    for (const currentEntry of currentEntryPage) {
      if (wordsAreCloseEnough(word, currentEntry.word)) {
        currentEntry.chain_letters_neighbors.push(word);
        entry.chain_letters_neighbors.push(currentEntry.word);
      }
    }

    currentEntryPage.push(entry);
    processedWords++;
    if (processedWords % 100 === 0) {
      console.log(`At ${Math.round(processedWords * 1000 / totalCount) / 10}% with word ${word}`);
    }
  }
  entryPages.push(currentEntryPage);
}

console.log(`${new Date()}: Preparing directory (${OUTPUT_WORDS_DIR})`);
if (fs.existsSync(OUTPUT_WORDS_DIR)) {
  fs.rmdirSync(OUTPUT_WORDS_DIR, { force: true, recursive: true });
}
fs.mkdirSync(OUTPUT_WORDS_DIR);

for (const entries of entryPages) {
  for (let i = 0; i < entries.length; i++) {
    if (i >= 500 && i % 500 === 0) {
      console.log(`${new Date()}: Writing next 500 words`);
    }
    const entry = entries[i];
    fs.writeFileSync(`${OUTPUT_WORDS_DIR}/${entry.word}.json`, JSON.stringify(entry));
  }
}

console.log(`${new Date()}: Done`);