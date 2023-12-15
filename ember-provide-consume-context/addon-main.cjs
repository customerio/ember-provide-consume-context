'use strict';

const { addonV1Shim } = require('@embroider/addon-shim');
const shimmed = addonV1Shim(__dirname);
const embroiderHooks = {
  options: {
    '@embroider/macros': {
      setOwnConfig: {
        staticEmberSource: false,
      },
    },
  },

  config() {
    return this.options['@embroider/macros']['setOwnConfig'];
  },
};

module.exports = Object.assign({}, shimmed, embroiderHooks);
