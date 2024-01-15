import fs from 'fs';

const startWord = process.argv[2];
const endWord = process.argv[3];
const blockWords = new Set(process.argv.length >= 5 ? process.argv[4]?.split(',') : []);

for (const blockedWord of blockWords) {
  fs.copyFileSync(`./en_US/${blockedWord}.json`, `./blocked/en_US/${blockedWord}.json`);
  const entry = JSON.parse(fs.readFileSync(`./en_US/${blockedWord}.json`));
  for (const neighbor of entry.chain_letters_neighbors) {
    const neighborEntry = JSON.parse(fs.readFileSync(`./en_US/${neighbor}.json`));
    neighborEntry.chain_letters_neighbors = neighborEntry.chain_letters_neighbors.filter(w => w !== blockedWord);
    fs.writeFileSync(`./en_US/${neighbor}.json`, JSON.stringify(neighborEntry));
  }
  fs.rmSync(`./en_US/${blockedWord}.json`);
}

if (!startWord || !endWord) {
  throw new Error("Usage: node find-shortest-paths.mjs {startWord} {endWord}");
}

const findPath = (startWord, endWord, blockWords) => {
  const wordSources = new Map();
  wordSources.set(startWord, '');
  let frontier = [startWord];
  while (frontier.length) {
    const newFrontier = [];
    for (const word of frontier) {
      const entry = JSON.parse(fs.readFileSync(`./en_US/${word}.json`));
      for (const neighbor of entry.chain_letters_neighbors.filter(n => !blockWords.has(n) && !wordSources.has(n))) {
        wordSources.set(neighbor, word);
        if (neighbor === endWord) {
          const path = [endWord];
          while (path[0] !== startWord) {
            path.splice(0, 0, wordSources.get(path[0]));
          }
          return path;
        }
        newFrontier.push(neighbor);
      }
    }
    frontier = newFrontier;
  }
  return undefined;
};

const path = findPath(startWord, endWord, blockWords);

if (path) {
  console.log(`,\n  "best_path": ${JSON.stringify(path)}`);
} else {
  console.log(`There is no path ${startWord} => ${endWord}`);
}