import { Stack } from './stack';

// Map of component class that contain @provide decorated properties, with their
// respective context keys and property names
export const DECORATED_PROPERTY_CLASSES = new WeakMap<
  any,
  Record<string, string>
>();
// Map of instances of the ContextProvider component, or components that contain
// @provide decorated properties
export const PROVIDER_INSTANCES = new WeakMap<any, Record<string, string>>();

export function trackProviderInstanceContext(
  instance: any,
  contextKey: string,
  propertyKey: string,
) {
  const currentContexts = PROVIDER_INSTANCES.get(instance);
  if (currentContexts == null) {
    PROVIDER_INSTANCES.set(instance, {
      [contextKey]: propertyKey,
    });
  } else {
    PROVIDER_INSTANCES.set(instance, {
      ...currentContexts,
      [contextKey]: propertyKey,
    });
  }
}

export function trackMultipleProviderInstanceContexts(
  instance: any,
  contextDefinitions: [contextKey: string, propertyKey: string][],
) {
  const currentContexts = PROVIDER_INSTANCES.get(instance);
  if (currentContexts == null) {
    PROVIDER_INSTANCES.set(instance, Object.fromEntries(contextDefinitions));
  } else {
    PROVIDER_INSTANCES.set(instance, {
      ...currentContexts,
      ...Object.fromEntries(contextDefinitions),
    });
  }
}

interface Contexts {
  [contextKey: string]: ContextEntry;
}

interface ContextEntry {
  // instance is an instance of a Glimmer component
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

  enter(instance: any): void {
    const componentDefinitionClass = instance.definition.state;
    const actualComponentInstance = (instance?.state as any)?.component;

    if (actualComponentInstance != null) {
      const isDecorated = DECORATED_PROPERTY_CLASSES.has(
        componentDefinitionClass,
      );

      // If this is an instance of a component that contains @provide decorated
      // properties, add this instance - and the context keys - to the
      // PROVIDE_INSTANCES map, so that the context values can be set in the
      // next step
      if (isDecorated) {
        const contextKeys = DECORATED_PROPERTY_CLASSES.get(
          componentDefinitionClass,
        );

        if (contextKeys != null) {
          trackMultipleProviderInstanceContexts(
            actualComponentInstance,
            Object.entries(contextKeys),
          );
        }
      }

      const isProviderInstance = PROVIDER_INSTANCES.has(
        actualComponentInstance,
      );

      if (isProviderInstance) {
        this.registerProvider(actualComponentInstance);
      } else {
        this.registerComponent(actualComponentInstance);
      }

      this.stack.push(actualComponentInstance);
    }
  }

  exit(instance: any): void {
    const actualComponentInstance = (instance?.state as any)?.component;

    if (actualComponentInstance != null) {
      this.stack.pop();
    }
  }

  private registerProvider(provider: any) {
    const { current } = this;

    let providerContexts: Contexts = {};
    if (this.contexts.has(current)) {
      // If a provider is nested within another provider, we merge their
      // contexts
      const context = this.contexts.get(current);
      if (context != null) {
        providerContexts = { ...context };
      }
    }

    const registeredContexts = PROVIDER_INSTANCES.get(provider);
    if (registeredContexts != null) {
      Object.entries(registeredContexts).forEach(([contextKey, key]) => {
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

    // If a current context reference exists, register the component to it
    if (this.contexts.has(current)) {
      const context = this.contexts.get(current);
      if (context != null) {
        this.contexts.set(component, context);
      }
    }
  }
}
