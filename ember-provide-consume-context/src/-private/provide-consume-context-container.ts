import type { ComponentInstance } from '@glimmer/interfaces';
import { Stack } from '@glimmer/util';
import type ContextRegistry from '../context-registry';

export const EMBER_PROVIDE_CONSUME_CONTEXT_KEY = Symbol.for(
  'EMBER_PROVIDE_CONSUME_CONTEXT_KEY',
);

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

export class ProvideConsumeContextContainer {
  private stack = new Stack();

  get current() {
    return this.stack.current;
  }

  // The keys of the WeakMap are component instances (actual Glimmer components,
  // not the VM ones).
  // The values are objects that map a string ID (provider ID) to the provider
  // component instance.
  contexts = new WeakMap<any, Contexts>();

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

    const actualComponentInstance = (instance?.state as any)?.component;

    if (actualComponentInstance != null) {
      const isProviderInstance =
        actualComponentInstance[EMBER_PROVIDE_CONSUME_CONTEXT_KEY];

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
    const providerContexts: Contexts = this.currentContexts();

    const registeredContexts = provider[EMBER_PROVIDE_CONSUME_CONTEXT_KEY];
    // If the provider has registered contexts, store references
    // to them on the current contexts object
    if (registeredContexts != null) {
      Object.entries(
        registeredContexts as Record<keyof ContextRegistry, string>,
      ).forEach(([contextKey, key]) => {
        if (key in provider) {
          providerContexts[contextKey] = {
            instance: provider,
            key,
          };
        }
      });
    }

    this.contexts.set(provider, providerContexts);
  }

  private registerComponent(component: any) {
    const currentContexts = this.currentContexts();
    this.contexts.set(component, currentContexts);
  }

  currentContexts() {
    const { current } = this;

    const globalContexts = this.#globalContexts ?? {};

    if (this.contexts.has(current) || Object.keys(globalContexts).length > 0) {
      const context = this.contexts.get(current);
      return { ...globalContexts, ...context };
    }

    return {};
  }

  contextsFor(component: any) {
    if (this.contexts.has(component)) {
      return this.contexts.get(component);
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
  }
}
