const typescript = require('@rollup/plugin-typescript')

const pkg = require('./package.json')

module.exports = {
  input: './index.ts',
  output: [
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
      name: 'SSEClient'
    },
  ],
  plugins: [
    typescript()
  ],
}
