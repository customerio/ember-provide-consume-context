import { ContextProvider } from './create-context';
import { Stack } from './stack';

export class ProvideConsumeContextContainer {
  private stack = new Stack();

  get current() {
    return this.stack.current;
  }

  // The keys of the WeakMap are component instances (actual Glimmer components,
  // not the VM ones).
  // The values are objects that map a string ID (provider ID) to the provider
  // component instance.
  contexts = new WeakMap<any, Record<string, any>>();

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
    const actualComponentInstance = (instance?.state as any)?.component;

    if (actualComponentInstance != null) {
      // TODO: Can the Provider component be built into Glimmer? Should we do this
      // with some sort of manager?
      if (actualComponentInstance instanceof ContextProvider) {
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

    let providerContexts: Record<any, any> = {};
    if (this.contexts.has(current)) {
      // If a provider is nested within another provider, we merge their
      // contexts
      const context = this.contexts.get(current);
      if (context != null) {
        providerContexts = { ...context };
      }
    }
    // Currently testing this by requiring Provider components to have a string
    // "id", which is then used to retrieve the context value.
    // TODO: Similar to the TODO in "enter" below, how do we make this less
    // coupled to a Provider implementation that doesn't exist in here?
    providerContexts[provider.id] = provider;

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
