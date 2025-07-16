import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';
import { isDestroyed, isDestroying } from '@ember/destroyable';

let getOwner;
if (macroCondition(dependencySatisfies('ember-source', '>=4.10.0'))) {
  getOwner = importSync('@ember/owner').getOwner;
} else {
  getOwner = importSync('@ember/application').getOwner;
}

// TODO: See if we can type the owner
function getProvider(owner, contextKey) {
  const appOwner = getOwner(owner);

  // We can't call .lookup on a destroyed owner
  if (isDestroyed(appOwner) || isDestroying(appOwner)) {
    return null;
  }
  const renderer = appOwner?.lookup('renderer:-dom');
  if (renderer == null) {
    return null;
  }

  // In Ember 6 the path to env is renderer._context.env,
  // before that it was renderer._runtime.env
  const env = renderer._runtime?.env ?? renderer._context?.env;
  const provideConsumeContextContainer = env?.provideConsumeContextContainer;
  if (provideConsumeContextContainer == null) {
    return null;
  }
  const contextsObject = provideConsumeContextContainer.contextsFor(owner);
  return contextsObject?.[contextKey];
}
function hasContext(owner, contextKey) {
  const provider = getProvider(owner, contextKey);
  return provider != null;
}
function getContextValue(owner, contextKey) {
  if (!hasContext(owner, contextKey)) {
    return undefined;
  }
  const providerObj = getProvider(owner, contextKey);
  return providerObj.instance[providerObj.key];
}

export { getContextValue as g, hasContext as h };
//# sourceMappingURL=utils-8e9180ab.js.map
