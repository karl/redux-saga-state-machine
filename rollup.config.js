import pkg from './package.json';

export default [
  {
    input: 'src/index.js',
    external: ['xstate'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
];
