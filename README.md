# Valid Words

This repository holds a list of all valid words. Currently only English. 

## Usage

You could clone this into your own project and query it. Or, since each word is its own file, you could use a rawgit solution or jsDelivr to proxy it and make quick realtime lookups. 404 = word is not valid. For example:

```js
const wordExists = async (word) => {
  const res = await fetch(`https://cdn.jsdelivr.net/gh/TodoCleverNameHere/valid-words@master/en_US/${word}.json`);
  return res.ok;
};
```
