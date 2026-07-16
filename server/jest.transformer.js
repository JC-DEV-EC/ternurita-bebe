const { transform } = require('sucrase');

module.exports = {
  process(sourceText, sourcePath) {
    const { code } = transform(sourceText, {
      transforms: ['imports'],
      filePath: sourcePath,
    });
    return { code };
  },
};