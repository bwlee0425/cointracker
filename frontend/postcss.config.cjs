// postcss.config.cjs
const tailwindcss = require('@tailwindcss/postcss'); // 중요!
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    tailwindcss,
    autoprefixer,
  ],
};
