import type { ComponentInstance } from '@glimmer/interfaces';
import { Stack } from '@glimmer/util';
import type ContextRegistry from '../context-registry';
import { registerDestructor } from '@ember/destroyable';

// We set a property with this key on component instances that are context providers, to store
// the component property names that are registered to specific context names.
export const EMBER_PROVIDE_CONSUME_CONTEXT_KEY = Symbol.for(
  'EMBER_PROVIDE_CONSUME_CONTEXT_KEY',
);

// renderComponent can use an environment that is not the app owner's default
// renderer environment. Store the container that observed a component directly
// on the component so @consume reads use the same render tree that created it.
export const EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY = Symbol.for(
  'EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY',
);

// Components can read @consume values during construction, before enter() has
// the actual component instance to tag with the container above.
const EMBER_PROVIDE_CONSUME_CONTEXT_ACTIVE_CONTAINERS_KEY = Symbol.for(
  'EMBER_PROVIDE_CONSUME_CONTEXT_ACTIVE_CONTAINERS_KEY',
);

type GlobalWithActiveContainers = typeof globalThis & {
  [EMBER_PROVIDE_CONSUME_CONTEXT_ACTIVE_CONTAINERS_KEY]?:
    | ProvideConsumeContextContainer[]
    | undefined;
};

function activeContainers() {
  const global = globalThis as GlobalWithActiveContainers;
  return (global[EMBER_PROVIDE_CONSUME_CONTEXT_ACTIVE_CONTAINERS_KEY] ??= []);
}

function activateContainer(container: ProvideConsumeContextContainer) {
  activeContainers().push(container);
}

function deactivateContainer(container: ProvideConsumeContextContainer) {
  const containers = activeContainers();
  const lastIndex = containers.length - 1;

  if (containers[lastIndex] === container) {
    containers.pop();
    return;
  }

  const index = containers.lastIndexOf(container);
  if (index !== -1) {
    containers.splice(index, 1);
  }
}

function clearActiveContainer(container: ProvideConsumeContextContainer) {
  const containers = activeContainers();
  let index = containers.lastIndexOf(container);

  while (index !== -1) {
    containers.splice(index, 1);
    index = containers.lastIndexOf(container);
  }
}

function setContextContainerOnComponent(
  component: any,
  container: ProvideConsumeContextContainer,
) {
  if (component[EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY] === container) {
    return;
  }

  Object.defineProperty(
    component,
    EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY,
    {
      value: container,
      writable: true,
      configurable: true,
    },
  );
}

function unsetContextContainerOnComponent(
  component: any,
  container: ProvideConsumeContextContainer,
) {
  if (component[EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY] === container) {
    delete component[EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY];
  }
}

export function contextContainerFor(component: any) {
  return (
    component?.[EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY] ??
    activeContainers()[activeContainers().length - 1] ??
    null
  );
}

export function setContextMetadataOnContextProviderInstance(
  instance: any,
  contextDefinitions: [
    contextKey: keyof ContextRegistry,
    propertyKey: string,
  ][],
) {
  const currentContexts = Object.getOwnPropertyDescriptor(
    instance,
    EMBER_PROVIDE_CONSUME_CONTEXT_KEY,
  );

  const contextsValue = {
    ...currentContexts?.value,
    ...Object.fromEntries(contextDefinitions),
  };

  Object.defineProperty(instance, EMBER_PROVIDE_CONSUME_CONTEXT_KEY, {
    value: contextsValue,
    writable: true,
    configurable: true,
  });
}

interface Contexts {
  [contextKey: keyof ContextRegistry]: ContextEntry;
}

interface ContextEntry {
  // instance is an instance of a Glimmer component, or a "mock provider" from test-support helpers
  instance: any;
  // the property to read from the provider instance
  key: string;
}

/**
 * A reference to one visible context provider.
 *
 * This keeps a reference to the provider instance rather than copying the
 * current value, so `value` reads stay connected to tracked provider state.
 */
export class ContextRef<
  K extends keyof ContextRegistry = keyof ContextRegistry,
> {
  #contextKey: K;
  #context: ContextEntry;

  constructor(contextKey: K, context: ContextEntry) {
    this.#contextKey = contextKey;
    this.#context = context;
  }

  get contextKey() {
    return this.#contextKey;
  }

  get value(): ContextRegistry[K] | undefined {
    return this.#context.instance[this.#context.key];
  }
}

/**
 * A captured set of context references visible to a component.
 *
 * The set of provider references is fixed when the refs are created, but values
 * are read from the original provider instances. That lets bridged consumers
 * continue to observe tracked provider values.
 */
export class ContextRefs {
  #contexts: Contexts;

  constructor(contexts: Contexts | null | undefined = null) {
    this.#contexts = { ...contexts };
  }

  entries() {
    return Object.entries(this.#contexts).map(([contextKey, context]) => {
      return [
        contextKey,
        new ContextRef(contextKey, context as ContextEntry),
      ] as [keyof ContextRegistry, ContextRef];
    });
  }

  getRef<K extends keyof ContextRegistry>(
    contextKey: K,
  ): ContextRef<K> | undefined {
    const context = this.#contexts[contextKey];

    if (context == null) {
      return undefined;
    }

    return new ContextRef(contextKey, context);
  }

  get<K extends keyof ContextRegistry>(
    contextKey: K,
  ): ContextRegistry[K] | undefined {
    return this.getRef(contextKey)?.value;
  }
}

export type ContextRefsInput = ContextRef | ContextRefs | null | undefined;

/**
 * Registers an instance as a provider for every context ref.
 *
 * `provideContextRefs` is the public API for consumers. This private helper keeps
 * the same metadata path as the built-in provider component.
 */
export function setContextMetadataOnContextRefsProviderInstance(
  instance: object,
  contextRefs: ContextRefsInput,
) {
  const contextDefinitions = contextRefEntries(contextRefs).map(
    ([contextKey, contextRef]) => {
      const propertyKey = `context:${String(contextKey)}`;

      Object.defineProperty(instance, propertyKey, {
        get() {
          return contextRef.value;
        },
        configurable: true,
      });

      return [contextKey, propertyKey] as [
        contextKey: keyof ContextRegistry,
        propertyKey: string,
      ];
    },
  );

  setContextMetadataOnContextProviderInstance(instance, contextDefinitions);
}

function contextRefEntries(
  contextRefs: ContextRefsInput,
): [keyof ContextRegistry, ContextRef][] {
  if (contextRefs == null) {
    return [];
  }

  if (contextRefs instanceof ContextRef) {
    return [[contextRefs.contextKey, contextRefs]];
  }

  return contextRefs.entries();
}

export class ProvideConsumeContextContainer {
  private stack = new Stack();

  get current() {
    return this.stack.current;
  }

  // The keys of the WeakMap are component instances (actual Glimmer components,
  // not the VM ones).
  // The values are objects that map a string ID (provider ID) to the provider
  // component instance.
  // "parentContexts" contain references to contexts coming from "above", and
  // are used to read values from (which allows a component to provide and consume the same key)
  parentContexts = new WeakMap<any, Contexts>();
  // "nextContexts" are context maps used to propagate context values down
  // into the component tree, which includes the merged providers from the
  // current component (if any)
  nextContexts = new WeakMap<any, Contexts>();

  // Global contexts are registered by test-support helpers to allow easily
  // providing context values in tests.
  #globalContexts: Contexts | null = null;

  #isCreatingComponent = false;

  begin(): void {
    this.reset();
  }

  commit(): void {
    this.reset();
  }

  private reset(): void {
    this.#isCreatingComponent = false;
    clearActiveContainer(this);

    if (this.stack.size !== 0) {
      while (!this.stack.isEmpty()) {
        this.stack.pop();
      }
    }
  }

  registerMockProvider = <
    T extends keyof ContextRegistry,
    U extends ContextRegistry[T],
  >(
    name: T,
    value: U,
  ) => {
    const mockProviderContext = {
      instance: {
        get value() {
          return value;
        },
      },
      key: 'value',
    };

    if (this.#globalContexts?.[name] != null) {
      console.warn(
        `A context provider with name "${name}" is already defined, and will be overwritten.`,
      );
    }

    this.#globalContexts = {
      ...this.#globalContexts,
      [name]: mockProviderContext,
    };
  };

  enter(instance: ComponentInstance): void {
    // When "enter" is called, a component instance has already been created.
    // Update the flag to reflect that.
    // See the "contextsFor" method below for how this flag is used.
    this.#isCreatingComponent = false;
    deactivateContainer(this);

    const actualComponentInstance = (instance?.state as any)?.component;

    if (actualComponentInstance != null) {
      setContextContainerOnComponent(actualComponentInstance, this);

      const isProviderInstance =
        actualComponentInstance[EMBER_PROVIDE_CONSUME_CONTEXT_KEY] != null;

      if (isProviderInstance) {
        this.registerProvider(actualComponentInstance);
      } else {
        this.registerComponent(actualComponentInstance);
      }

      this.stack.push(actualComponentInstance);
    }
  }

  exit(instance: ComponentInstance): void {
    const actualComponentInstance = (instance?.state as any)?.component;

    if (actualComponentInstance != null) {
      this.stack.pop();
    }
  }

  private registerProvider(provider: any) {
    const parentContexts: Contexts = this.currentContexts();
    const mergedContexts: Contexts = { ...parentContexts };

    const registeredContexts = provider[EMBER_PROVIDE_CONSUME_CONTEXT_KEY];

    // If the provider has registered contexts, store references
    // to them on the current contexts object
    if (registeredContexts != null) {
      Object.entries(
        registeredContexts as Record<keyof ContextRegistry, string>,
      ).forEach(([contextKey, key]) => {
        if (key in provider) {
          mergedContexts[contextKey] = {
            instance: provider,
            key,
          };
        }
      });
    }

    const isNew = !this.parentContexts.has(provider);
    this.parentContexts.set(provider, parentContexts);
    this.nextContexts.set(provider, mergedContexts);
    if (isNew) {
      registerDestructor(provider, () => {
        this.parentContexts.delete(provider);
        this.nextContexts.delete(provider);
        unsetContextContainerOnComponent(provider, this);
      });
    }
  }

  private registerComponent(component: any) {
    const currentContexts = this.currentContexts();

    const isNew = !this.parentContexts.has(component);
    this.parentContexts.set(component, currentContexts);
    this.nextContexts.set(component, currentContexts);
    if (isNew) {
      registerDestructor(component, () => {
        this.parentContexts.delete(component);
        this.nextContexts.delete(component);
        unsetContextContainerOnComponent(component, this);
      });
    }
  }

  currentContexts() {
    const { current } = this;

    const globalContexts = this.#globalContexts ?? {};

    if (
      this.nextContexts.has(current) ||
      Object.keys(globalContexts).length > 0
    ) {
      const context = this.nextContexts.get(current);
      return { ...globalContexts, ...context };
    }

    return {};
  }

  contextsFor(component: any) {
    if (this.parentContexts.has(component)) {
      return this.parentContexts.get(component);
    }

    // If a context for this component is not yet registered, but
    // we're in the phase of initializing a component, return
    // the current contexts, so that the values can be read in constructors.
    if (this.#isCreatingComponent) {
      return this.currentContexts();
    }

    return null;
  }

  createComponent() {
    // Indicates that a component instance is being created, see
    // "contextsFor" above for how we use this.
    this.#isCreatingComponent = true;
    activateContainer(this);
  }
}
