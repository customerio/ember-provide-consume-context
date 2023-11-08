import { getOwner } from '@ember/owner';
import type ContextRegistry from '../context-registry';

// TODO: See if we can type the owner
export function getProvider(owner: any, contextKey: keyof ContextRegistry) {
  const renderer = getOwner(owner)?.lookup('renderer:-dom') as any;

  if (renderer == null) {
    return null;
  }

  const provideConsumeContextContainer =
    renderer._runtime?.env?.provideConsumeContextContainer;

  if (provideConsumeContextContainer == null) {
    return null;
  }

  const contextsObject = provideConsumeContextContainer.contexts.get(owner);
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
