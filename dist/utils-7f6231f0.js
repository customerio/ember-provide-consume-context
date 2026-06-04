import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { d as contextContainerFor, c as ContextRefs, e as setContextMetadataOnContextRefsProviderInstance } from './provide-consume-context-container-cc507b9e.js';

let getOwner;
if (macroCondition(dependencySatisfies('ember-source', '>=4.10.0'))) {
  getOwner = importSync('@ember/owner').getOwner;
} else {
  getOwner = importSync('@ember/application').getOwner;
}
function getProvider(component, contextKey) {
  // Prefer the container attached while this component rendered. Looking up the
  // owner renderer can miss trees created with renderComponent.
  const componentContainer = contextContainerFor(component);
  const componentContainerProvider = providerFromContainer(componentContainer, component, contextKey);
  if (componentContainerProvider != null) {
    return componentContainerProvider;
  }
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
  return providerFromContainer(provideConsumeContextContainer, component, contextKey);
}

/**
 * Captures a context provider reference visible to a component.
 *
 * This returns a provider reference, not the current value. Pass the ref to
 * `provideContextRefs` to bridge one context into another render root.
 */
function getContextRef(component, contextKey) {
  return getContextRefs(component, {
    contextKeys: [contextKey]
  }).getRef(contextKey);
}

/**
 * Captures selected context provider references visible to a component.
 *
 * This is useful when rendering a new root with Ember's `renderComponent` API.
 * A new root does not automatically inherit context from the DOM element it is
 * mounted into, so pass these refs into that root and re-provide them with
 * `provideContextRefs`.
 */

function getContextRefs(component, options) {
  if (options == null) {
    return undefined;
  }
  return contextRefsFor(component, options);
}

/**
 * Captures every context provider reference visible to a component.
 */
function getAllContextRefs(component) {
  return contextRefsFor(component);
}
function contextRefsFor(component, options) {
  const componentContainer = contextContainerFor(component);
  const componentContexts = contextsFromContainer(componentContainer, component, options);
  if (componentContexts != null) {
    return new ContextRefs(componentContexts);
  }
  const appOwner = getOwner(component);

  // We can't call .lookup on a destroyed owner
  if (isDestroyed(appOwner) || isDestroying(appOwner)) {
    return new ContextRefs();
  }
  const renderer = appOwner?.lookup('renderer:-dom');
  const env = renderer?._runtime?.env ?? renderer?._context?.env;
  const provideConsumeContextContainer = env?.provideConsumeContextContainer;
  const contexts = contextsFromContainer(provideConsumeContextContainer, component, options);
  return new ContextRefs(contexts);
}

/**
 * Provides context refs from the given component.
 *
 * Call this during component construction so descendants are created after the
 * component has been registered as a context provider.
 */
function provideContextRefs(component, contextRefs) {
  setContextMetadataOnContextRefsProviderInstance(component, contextRefs);
}
function contextsFromContainer(container, component, options) {
  const contexts = container?.contextsFor(component);
  if (contexts == null || options == null) {
    return contexts;
  }
  return Object.fromEntries(options.contextKeys.map(contextKey => [contextKey, contexts[contextKey]]).filter(entry => {
    return entry[1] != null;
  }));
}
function providerFromContainer(container, component, contextKey) {
  const contextsObject = container?.contextsFor(component);
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

export { getAllContextRefs as a, getContextRef as b, getContextRefs as c, getContextValue as g, hasContext as h, provideContextRefs as p };
//# sourceMappingURL=utils-7f6231f0.js.map
