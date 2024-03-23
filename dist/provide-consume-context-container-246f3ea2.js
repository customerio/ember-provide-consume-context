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
function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");
  return _classApplyDescriptorGet(receiver, descriptor);
}
function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");
  _classApplyDescriptorSet(receiver, descriptor, value);
  return value;
}
function _classExtractFieldDescriptor(receiver, privateMap, action) {
  if (!privateMap.has(receiver)) {
    throw new TypeError("attempted to " + action + " private field on non-instance");
  }
  return privateMap.get(receiver);
}
function _classApplyDescriptorGet(receiver, descriptor) {
  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }
  return descriptor.value;
}
function _classApplyDescriptorSet(receiver, descriptor, value) {
  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }
    descriptor.value = value;
  }
}
function _checkPrivateRedeclaration(obj, privateCollection) {
  if (privateCollection.has(obj)) {
    throw new TypeError("Cannot initialize the same private elements twice on an object");
  }
}
function _classPrivateFieldInitSpec(obj, privateMap, value) {
  _checkPrivateRedeclaration(obj, privateMap);
  privateMap.set(obj, value);
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

const EMBER_PROVIDE_CONSUME_CONTEXT_KEY = Symbol.for('EMBER_PROVIDE_CONSUME_CONTEXT_KEY');
function setContextMetadataOnContextProviderInstance(instance, contextDefinitions) {
  const currentContexts = Object.getOwnPropertyDescriptor(instance, EMBER_PROVIDE_CONSUME_CONTEXT_KEY);
  const contextsValue = {
    ...currentContexts?.value,
    ...Object.fromEntries(contextDefinitions)
  };
  Object.defineProperty(instance, EMBER_PROVIDE_CONSUME_CONTEXT_KEY, {
    value: contextsValue,
    writable: true,
    configurable: true
  });
}
var _globalContexts = /*#__PURE__*/new WeakMap();
class ProvideConsumeContextContainer {
  constructor() {
    _defineProperty(this, "stack", new StackImpl());
    // The keys of the WeakMap are component instances (actual Glimmer components,
    // not the VM ones).
    // The values are objects that map a string ID (provider ID) to the provider
    // component instance.
    _defineProperty(this, "contexts", new WeakMap());
    // Global contexts are registered by test-support helpers to allow easily
    // providing context values in tests.
    _classPrivateFieldInitSpec(this, _globalContexts, {
      writable: true,
      value: null
    });
    _defineProperty(this, "registerMockProvider", (name, value) => {
      const mockProviderContext = {
        instance: {
          get value() {
            return value;
          }
        },
        key: 'value'
      };
      if (_classPrivateFieldGet(this, _globalContexts)?.[name] != null) {
        console.warn(`A context provider with name "${name}" is already defined, and will be overwritten.`);
      }
      _classPrivateFieldSet(this, _globalContexts, {
        ..._classPrivateFieldGet(this, _globalContexts),
        [name]: mockProviderContext
      });
    });
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
    const actualComponentInstance = instance?.state?.component;
    if (actualComponentInstance != null) {
      const isProviderInstance = actualComponentInstance[EMBER_PROVIDE_CONSUME_CONTEXT_KEY];
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

    // If global contexts are defined, make sure providers can read them
    if (_classPrivateFieldGet(this, _globalContexts) != null) {
      providerContexts = {
        ..._classPrivateFieldGet(this, _globalContexts)
      };
    }
    if (this.contexts.has(current)) {
      // If a provider is nested within another provider, we merge their
      // contexts
      const context = this.contexts.get(current);
      if (context != null) {
        providerContexts = {
          ...providerContexts,
          ...context
        };
      }
    }
    const registeredContexts = provider[EMBER_PROVIDE_CONSUME_CONTEXT_KEY];
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
    const globalContexts = _classPrivateFieldGet(this, _globalContexts) ?? {};

    // If a current context reference or global contexts exist, register them to the component
    if (this.contexts.has(current) || Object.keys(globalContexts).length > 0) {
      const context = this.contexts.get(current);
      const mergedContexts = {
        ...globalContexts,
        ...context
      };
      this.contexts.set(component, mergedContexts);
    }
  }
}

export { EMBER_PROVIDE_CONSUME_CONTEXT_KEY as E, ProvideConsumeContextContainer as P, setContextMetadataOnContextProviderInstance as s };
//# sourceMappingURL=provide-consume-context-container-246f3ea2.js.map
