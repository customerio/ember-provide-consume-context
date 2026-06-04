import EmberRouter from '@embroider/router';
import config from 'test-app-ember-7/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // Add route declarations here
});
