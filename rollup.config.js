import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import resolve from 'rollup-plugin-node-resolve';

const plugins = [
  resolve()
];

const config = {
  input: 'src/delegates-focus.js',
  output: {
    format: 'iife',
    file: 'dist/delegates-focus.js'
  },
  plugins
};

if (process.env.BUILD === 'dev') {
  plugins.push([
    serve({
      open: true,
      verbose: true,
      contentBase: ['static', 'dist'],
      historyApiFallback: true,
      port: 8181,
    })
  ]);

  plugins.push(
    livereload({
      watch: 'dist'
    })
  );
}

export default config;
