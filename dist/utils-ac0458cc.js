import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';
import { isDestroyed, isDestroying } from '@ember/destroyable';

let getOwner;
if (macroCondition(dependencySatisfies('ember-source', '>=4.10.0'))) {
  getOwner = importSync('@ember/owner').getOwner;
} else {
  getOwner = importSync('@ember/application').getOwner;
}
function getProvider(component, contextKey) {
  const appOwner = getOwner(component);

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
  const contextsObject = provideConsumeContextContainer.contextsFor(component);
  return contextsObject?.[contextKey];
}

/**
 * Checks whether a context with the given key exists for the provided component.
 *
 * @param {Object} component - The component to check for the context.
 * @param {string} contextKey - The key of the context to check for.
 */
function hasContext(component, contextKey) {
  const provider = getProvider(component, contextKey);
  return provider != null;
}

/**
 * Returns the value of the context for the given key, if one exists.
 *
 * @param {Object} component - The component to check for the context.
 * @param {string} contextKey - The key of the context to check for.
 */
function getContextValue(component, contextKey) {
  if (!hasContext(component, contextKey)) {
    return undefined;
  }
  const providerObj = getProvider(component, contextKey);
  if (providerObj == null) {
    return undefined;
  }
  return providerObj.instance[providerObj.key];
}

export { getContextValue as g, hasContext as h };
//# sourceMappingURL=utils-ac0458cc.js.map
