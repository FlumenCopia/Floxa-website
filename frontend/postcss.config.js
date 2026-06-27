const autoprefixer = require('autoprefixer');

const stripSourceMapReferences = {
  postcssPlugin: 'strip-source-map-references',
  Once(root) {
    root.walkComments((comment) => {
      if (comment.text.trim().startsWith('# sourceMappingURL=')) {
        comment.remove();
      }
    });
  },
};

module.exports = {
  plugins: {
    autoprefixer: {},
  },
};