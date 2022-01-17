var tape = require("tape"),
    indexParser = require("../build/d3-index-parser-faiss-ivfflat"),
    fs = require("fs");

tape("foo() returns the answer to the ultimate question of life, the universe, and everything.", function(test) {
  const filePath = './test/data/index'
  const file = fs.readFileSync(filePath)
  const fileArrayBuffer = file.buffer
  test.equal(indexParser.indexParser(fileArrayBuffer), 40);
  test.end();
});
