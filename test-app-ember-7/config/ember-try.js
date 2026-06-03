'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    // The Vite app needs to build dist before ember test can run against it.
    command: 'pnpm test:ember',
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
