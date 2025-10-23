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

  return provideConsumeContextContainer.getContextProvider(owner, contextKey);
}

export function hasContext(owner: any, contextKey: keyof ContextRegistry) {
  const provider = getProvider(owner, contextKey);
  return provider != null;
}

export function getContextValue<K extends keyof ContextRegistry>(
  owner: any,
  contextKey: K,
): ContextRegistry[K] | undefined {
  const result = getProvider(owner, contextKey);

  if (result == null) {
    return undefined;
  }

  const [instance, key] = result;
  return instance[key];
}
