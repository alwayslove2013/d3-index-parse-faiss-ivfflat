var globals = {
  'd3-fetch': 'd3'
}

export default {
  entry: 'index.js',
  moduleName: 'd3',
  globals: globals,
  external: Object.keys(globals),
  format: 'umd',
  dest: 'build/d3-index-parser-faiss-ivfflat.js'
};