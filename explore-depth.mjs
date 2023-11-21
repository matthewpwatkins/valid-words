import fs from 'fs';

const startWord = process.argv[2];
const desiredDepth = parseInt(process.argv[3]);
const prefix = new Set(process.argv.length >= 5 ? process.argv[4]?.split(',') : []);

if (blockWords.length) {
  console.log(`Blocked words: ${[...blockWords]}`);
}

if (!startWord) {
  throw new Error("Usage: node explore-depth.mjs {startWord}");
}

const wordSources = new Map();
wordSources.set(startWord, '');
let frontier = [startWord];

for (let depth = 0; depth <= desiredDepth; depth++) {
  const newFrontier = [];
  for (const word of frontier) {
    const entry = JSON.parse(fs.readFileSync(`./en_US/${word}.json`));
    for (const neighbor of entry.chain_letters_neighbors.filter(n => !blockWords.has(n) && !wordSources.has(n))) {
      wordSources.set(neighbor, word);
      newFrontier.push(neighbor);
    }
  }
  frontier = newFrontier;
  console.log(`==== Finished depth ${depth} with frontier length ${frontier.length} ====`);
}

for (const endWord of frontier) {
  const path = [endWord];
  while (path[0] !== startWord) {
    path.splice(0, 0, wordSources.get(path[0]));
  }
  console.log(path.join(','));
}