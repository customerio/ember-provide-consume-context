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

  let contextsValue = currentContexts?.value;

  if (contextsValue == null) {
    contextsValue = new Map();
    Object.defineProperty(instance, EMBER_PROVIDE_CONSUME_CONTEXT_KEY, {
      value: contextsValue,
      writable: true,
      configurable: true,
    });
  }

  contextDefinitions.forEach(([contextKey, propertyKey]) => {
    (contextsValue as Map<keyof ContextRegistry, string>).set(
      contextKey,
      propertyKey,
    );
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

  // A map of component instances linked to their parent component instances
  PARENTS = new WeakMap<any, any>();
  ROOTS = new WeakMap<any, any>();

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
    const parentComponentInstance = this.current;
    const actualComponentInstance = (instance?.state as any)?.component;

    if (parentComponentInstance != null && actualComponentInstance != null) {
      this.PARENTS.set(actualComponentInstance, parentComponentInstance);
    }

    // If there is an actual component instance, but no parent previously registered,
    // consider this a root component. We then use this to stop parent traversal
    // at roots when looking for context providers.
    if (parentComponentInstance == null && actualComponentInstance != null) {
      this.ROOTS.set(actualComponentInstance, true);
    }

    if (actualComponentInstance != null) {
      this.stack.push(actualComponentInstance);
    }
  }

  exit(instance: ComponentInstance): void {
    const actualComponentInstance = (instance?.state as any)?.component;

    if (actualComponentInstance != null) {
      this.stack.pop();
    }
  }

  getContextProvider(
    component: any,
    contextKey: keyof ContextRegistry,
  ): [any, string] | null {
    const isRoot = this.ROOTS.has(component);

    let parent = isRoot ? null : this.PARENTS.get(component) ?? this.current;

    while (parent != null) {
      // If the parent has registered providers, see if one matches the requested key
      if (parent[EMBER_PROVIDE_CONSUME_CONTEXT_KEY] != null) {
        const hasContextKey =
          parent[EMBER_PROVIDE_CONSUME_CONTEXT_KEY].has(contextKey);

        if (hasContextKey) {
          return [
            parent,
            parent[EMBER_PROVIDE_CONSUME_CONTEXT_KEY].get(contextKey)!,
          ];
        }
      }

      parent = this.PARENTS.get(parent);
    }

    // If there's no parent with the right context key, check the global context
    if (parent == null) {
      const globalContexts = this.#globalContexts ?? {};

      const globalContextHasKey = globalContexts[contextKey] != null;

      if (globalContextHasKey) {
        return [
          globalContexts[contextKey]!.instance,
          globalContexts[contextKey]!.key,
        ];
      }
    }

    return null;
  }
}
