import '@glimmer/env';

function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : String(i);
}
function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

class StackImpl {
  constructor(values = []) {
    this.current = null;
    this.stack = values;
  }
  get size() {
    return this.stack.length;
  }
  push(item) {
    this.current = item;
    this.stack.push(item);
  }
  pop() {
    let item = this.stack.pop();
    let len = this.stack.length;
    this.current = len === 0 ? null : this.stack[len - 1];
    return item === undefined ? null : item;
  }
  nth(from) {
    let len = this.stack.length;
    return len < from ? null : this.stack[len - from];
  }
  isEmpty() {
    return this.stack.length === 0;
  }
  toArray() {
    return this.stack;
  }
}

// Map of component class that contain @provide decorated properties, with their
// respective context keys and property names
const DECORATED_PROPERTY_CLASSES = new WeakMap();
// Map of instances of the ContextProvider component, or components that contain
// @provide decorated properties
const PROVIDER_INSTANCES = new WeakMap();
function trackProviderInstanceContexts(instance, contextDefinitions) {
  const currentContexts = PROVIDER_INSTANCES.get(instance);
  if (currentContexts == null) {
    PROVIDER_INSTANCES.set(instance, Object.fromEntries(contextDefinitions));
  } else {
    PROVIDER_INSTANCES.set(instance, {
      ...currentContexts,
      ...Object.fromEntries(contextDefinitions)
    });
  }
}
class ProvideConsumeContextContainer {
  constructor() {
    _defineProperty(this, "stack", new StackImpl());
    // The keys of the WeakMap are component instances (actual Glimmer components,
    // not the VM ones).
    // The values are objects that map a string ID (provider ID) to the provider
    // component instance.
    _defineProperty(this, "contexts", new WeakMap());
  }
  get current() {
    return this.stack.current;
  }
  begin() {
    this.reset();
  }
  commit() {
    this.reset();
  }
  reset() {
    if (this.stack.size !== 0) {
      while (!this.stack.isEmpty()) {
        this.stack.pop();
      }
    }
  }
  enter(instance) {
    const componentDefinitionClass = instance.definition.state;
    const actualComponentInstance = instance?.state?.component;
    if (actualComponentInstance != null) {
      const isDecorated = DECORATED_PROPERTY_CLASSES.has(componentDefinitionClass);

      // If this is an instance of a component that contains @provide decorated
      // properties, add this instance - and the context keys - to the
      // PROVIDE_INSTANCES map, so that the context values can be set in the
      // next step
      if (isDecorated) {
        const contextKeys = DECORATED_PROPERTY_CLASSES.get(componentDefinitionClass);
        if (contextKeys != null) {
          trackProviderInstanceContexts(actualComponentInstance, Object.entries(contextKeys));
        }
      }
      const isProviderInstance = PROVIDER_INSTANCES.has(actualComponentInstance);
      if (isProviderInstance) {
        this.registerProvider(actualComponentInstance);
      } else {
        this.registerComponent(actualComponentInstance);
      }
      this.stack.push(actualComponentInstance);
    }
  }
  exit(instance) {
    const actualComponentInstance = instance?.state?.component;
    if (actualComponentInstance != null) {
      this.stack.pop();
    }
  }
  registerProvider(provider) {
    const {
      current
    } = this;
    let providerContexts = {};
    if (this.contexts.has(current)) {
      // If a provider is nested within another provider, we merge their
      // contexts
      const context = this.contexts.get(current);
      if (context != null) {
        providerContexts = {
          ...context
        };
      }
    }
    const registeredContexts = PROVIDER_INSTANCES.get(provider);
    if (registeredContexts != null) {
      Object.entries(registeredContexts).forEach(([contextKey, key]) => {
        if (key in provider) {
          providerContexts[contextKey] = {
            instance: provider,
            key
          };
        }
      });
    }
    this.contexts.set(provider, providerContexts);
  }
  registerComponent(component) {
    const {
      current
    } = this;

    // If a current context reference exists, register the component to it
    if (this.contexts.has(current)) {
      const context = this.contexts.get(current);
      if (context != null) {
        this.contexts.set(component, context);
      }
    }
  }
}

export { DECORATED_PROPERTY_CLASSES as D, ProvideConsumeContextContainer as P, trackProviderInstanceContexts as t };
//# sourceMappingURL=provide-consume-context-container-a9f92938.js.map
