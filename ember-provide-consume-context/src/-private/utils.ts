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

// TODO: See if we can type the owner
export function getProvider(owner: any, contextKey: keyof ContextRegistry) {
  const appOwner = getOwner(owner);

  // We can't call .lookup on a destroyed owner
  if (isDestroyed(appOwner) || isDestroying(appOwner)) return false;

  const renderer = appOwner?.lookup('renderer:-dom') as any;

  if (renderer == null) {
    return null;
  }

  const provideConsumeContextContainer =
    renderer._runtime?.env?.provideConsumeContextContainer;

  if (provideConsumeContextContainer == null) {
    return null;
  }

  const contextsObject = provideConsumeContextContainer.contextsFor(owner);
  return contextsObject?.[contextKey];
}

export function hasContext(owner: any, contextKey: keyof ContextRegistry) {
  const provider = getProvider(owner, contextKey);
  return provider != null;
}

export function getContextValue<K extends keyof ContextRegistry>(
  owner: any,
  contextKey: K,
): ContextRegistry[K] | undefined {
  if (!hasContext(owner, contextKey)) {
    return undefined;
  }
  const providerObj = getProvider(owner, contextKey);
  return providerObj.instance[providerObj.key];
}
