const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    purgecss({
      content: ['./src/pages/**/*.html'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    }),
    require('autoprefixer'),
  ],
};
