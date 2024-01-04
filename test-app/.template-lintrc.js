'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  overrides: [
    {
      files: ['**/integration/**/*-test.{js,ts}'],
      rules: {
        prettier: false,
      },
    },
  ],
};
