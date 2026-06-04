'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    // The Vite app needs to build dist before ember test can run against it.
    command: 'pnpm test:ember',
    // pnpm installs all workspace projects by default, even when run from this
    // app. Keep ember-try's scenario install scoped to the package it mutates.
    npmOptions: ['--filter', 'test-app-ember-7'],
    packageManager: 'pnpm',
    scenarios: [
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
    ],
  };
};
