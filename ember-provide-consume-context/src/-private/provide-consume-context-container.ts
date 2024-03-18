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
    const { current } = this;

    let providerContexts: Contexts = {};

    // If global contexts are defined, make sure providers can read them
    if (this.#globalContexts != null) {
      providerContexts = { ...this.#globalContexts };
    }

    if (this.contexts.has(current)) {
      // If a provider is nested within another provider, we merge their
      // contexts
      const context = this.contexts.get(current);
      if (context != null) {
        providerContexts = { ...providerContexts, ...context };
      }
    }

    const registeredContexts = provider[EMBER_PROVIDE_CONSUME_CONTEXT_KEY];
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
    const { current } = this;

    const globalContexts = this.#globalContexts ?? {};

    // If a current context reference or global contexts exist, register them to the component
    if (this.contexts.has(current) || Object.keys(globalContexts).length > 0) {
      const context = this.contexts.get(current);
      const mergedContexts = { ...globalContexts, ...context };
      this.contexts.set(component, mergedContexts);
    }
  }
}
