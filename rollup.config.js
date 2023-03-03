const typescript = require('@rollup/plugin-typescript')
const nodeResolve = require('@rollup/plugin-node-resolve')
const terser = require('@rollup/plugin-terser')

const pkg = require('./package.json')

function minimize(list) {
  const ret = list.map(e => ({
    ...e,
    file: e.file.replace('.js', '.min.js'),
    sourcemap: false,
    plugins: [
      terser()
    ]
  }))

  return ret
}

const outputs = [
  {
    file: pkg.exports['.'].require,
    format: 'cjs',
    sourcemap: true,
  },
  {
    file: pkg.exports['.'].import,
    format: 'esm',
    sourcemap: true,
  },
  {
    file: pkg.exports['.'].browser,
    format: 'iife',
    sourcemap: true,
    name: 'SSEClient',
  },
]

module.exports = {
  input: './index.ts',
  output: [
    ...outputs,
    ...minimize(outputs)
  ],
  plugins: [
    typescript(),
    nodeResolve()
  ],
}
