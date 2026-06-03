import type ContextRegistry from '../context-registry';
import {
  dependencySatisfies,
  importSync,
  macroCondition,
} from '@embroider/macros';
import { isDestroying, isDestroyed } from '@ember/destroyable';
import type Owner from '@ember/owner';
import {
  ContextRef,
  ContextRefs,
  type ContextRefsInput,
  contextContainerFor,
  setContextMetadataOnContextRefsProviderInstance,
  type ProvideConsumeContextContainer,
} from './provide-consume-context-container';

let getOwner: (context: unknown) => Owner | undefined;

if (macroCondition(dependencySatisfies('ember-source', '>=4.10.0'))) {
  getOwner = (importSync('@ember/owner') as any).getOwner;
} else {
  getOwner = (importSync('@ember/application') as any).getOwner;
}

interface ProviderEntry {
  instance: any;
  key: string;
}

export interface GetContextRefsOptions {
  /**
   * Context keys to include in the refs.
   */
  contextKeys: readonly (keyof ContextRegistry)[];
}

export function getProvider(
  component: object,
  contextKey: keyof ContextRegistry,
): ProviderEntry | null | undefined {
  // Prefer the container attached while this component rendered. Looking up the
  // owner renderer can miss trees created with renderComponent.
  const componentContainer = contextContainerFor(component);
  const componentContainerProvider = providerFromContainer(
    componentContainer,
    component,
    contextKey,
  );

  if (componentContainerProvider != null) {
    return componentContainerProvider;
  }

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

  return providerFromContainer(
    provideConsumeContextContainer,
    component,
    contextKey,
  );
}

/**
 * Captures a context provider reference visible to a component.
 *
 * This returns a provider reference, not the current value. Pass the ref to
 * `provideContextRefs` to bridge one context into another render root.
 */
export function getContextRef<K extends keyof ContextRegistry>(
  component: object,
  contextKey: K,
): ContextRef<K> | undefined {
  return getContextRefs(component, { contextKeys: [contextKey] }).getRef(
    contextKey,
  );
}

/**
 * Captures selected context provider references visible to a component.
 *
 * This is useful when rendering a new root with Ember's `renderComponent` API.
 * A new root does not automatically inherit context from the DOM element it is
 * mounted into, so pass these refs into that root and re-provide them with
 * `provideContextRefs`.
 */
export function getContextRefs(
  component: object,
  options: GetContextRefsOptions,
): ContextRefs;
export function getContextRefs(
  component: object,
  options?: GetContextRefsOptions,
): ContextRefs | undefined;
export function getContextRefs(
  component: object,
  options?: GetContextRefsOptions,
): ContextRefs | undefined {
  if (options == null) {
    return undefined;
  }

  return contextRefsFor(component, options);
}

/**
 * Captures every context provider reference visible to a component.
 */
export function getAllContextRefs(component: object): ContextRefs {
  return contextRefsFor(component);
}

function contextRefsFor(
  component: object,
  options?: GetContextRefsOptions,
): ContextRefs {
  const componentContainer = contextContainerFor(component);
  const componentContexts = contextsFromContainer(
    componentContainer,
    component,
    options,
  );

  if (componentContexts != null) {
    return new ContextRefs(componentContexts);
  }

  const appOwner = getOwner(component);

  // We can't call .lookup on a destroyed owner
  if (isDestroyed(appOwner as any) || isDestroying(appOwner as any)) {
    return new ContextRefs();
  }

  const renderer = appOwner?.lookup('renderer:-dom') as any;
  const env = renderer?._runtime?.env ?? renderer?._context?.env;
  const provideConsumeContextContainer = env?.provideConsumeContextContainer;
  const contexts = contextsFromContainer(
    provideConsumeContextContainer,
    component,
    options,
  );

  return new ContextRefs(contexts);
}

/**
 * Provides context refs from the given component.
 *
 * Call this during component construction so descendants are created after the
 * component has been registered as a context provider.
 */
export function provideContextRefs(
  component: object,
  contextRefs: ContextRefsInput,
): void {
  setContextMetadataOnContextRefsProviderInstance(component, contextRefs);
}

function contextsFromContainer(
  container: ProvideConsumeContextContainer | null | undefined,
  component: object,
  options?: GetContextRefsOptions,
) {
  const contexts = container?.contextsFor(component);

  if (contexts == null || options == null) {
    return contexts;
  }

  return Object.fromEntries(
    options.contextKeys
      .map((contextKey) => [contextKey, contexts[contextKey]])
      .filter((entry): entry is [keyof ContextRegistry, ProviderEntry] => {
        return entry[1] != null;
      }),
  );
}

function providerFromContainer(
  container: ProvideConsumeContextContainer | null | undefined,
  component: object,
  contextKey: keyof ContextRegistry,
): ProviderEntry | undefined {
  const contextsObject = container?.contextsFor(component);
  return contextsObject?.[contextKey] as ProviderEntry | undefined;
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
