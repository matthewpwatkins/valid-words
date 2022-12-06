import fs from 'fs';

const WORDS_DIR = 'en_US';

if (fs.existsSync(WORDS_DIR)) {
  fs.rmdirSync(WORDS_DIR, { force: true, recursive: true });
}
fs.mkdirSync(WORDS_DIR);

console.log("Starting word fetching");
let count = 0;
for (let i = 2; i <= 15; i++) {
  console.log(`Fetching words ${i} letters long`);
  const url = `https://www.wordgamedictionary.com/word-lists/${i}-letter-words/${i}-letter-words.json`;
  const res = await fetch(url);
  const resObj = await res.json();
  console.log(`Writing ${resObj.length} words`);
  for (const word of resObj) {
    fs.writeFileSync(`${WORDS_DIR}/${word.word}.json`, JSON.stringify(word));
    count++;
  }
}
console.log(`Wrote ${count} words`);