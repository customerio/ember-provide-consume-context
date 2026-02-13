import type ContextRegistry from '../context-registry';
import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import type Owner from '@ember/owner';

let getOwner: (context: unknown) => Owner | undefined;

if (macroCondition(dependencySatisfies('ember-source', '>=4.10.0'))) {
  getOwner = (importSync('@ember/owner') as any).getOwner;
} else {
  getOwner = (importSync('@ember/application') as any).getOwner;
}

export function getProvider(
  component: object,
  contextKey: keyof ContextRegistry,
) {
  const appOwner = getOwner(component);

  // We can't call .lookup on a destroyed owner
  if (isDestroyed(appOwner as any) || isDestroying(appOwner as any)) {
    return null;
  }

  const renderer = appOwner?.lookup('renderer:-dom') as any;

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
export function hasContext(
  component: object,
  contextKey: keyof ContextRegistry,
) {
  const provider = getProvider(component, contextKey);
  return provider != null;
}

/**
 * Returns the value of the context for the given key, if one exists.
 *
 * @param {Object} component - The component to check for the context.
 * @param {string} contextKey - The key of the context to check for.
 */
export function getContextValue<K extends keyof ContextRegistry>(
  component: object,
  contextKey: K,
): ContextRegistry[K] | undefined {
  if (!hasContext(component, contextKey)) {
    return undefined;
  }
  const providerObj = getProvider(component, contextKey);
  if (providerObj == null) {
    return undefined;
  }
  return providerObj.instance[providerObj.key];
}
