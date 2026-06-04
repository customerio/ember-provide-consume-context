import '@glimmer/env';
import { registerDestructor } from '@ember/destroyable';

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

// We set a property with this key on component instances that are context providers, to store
// the component property names that are registered to specific context names.
const EMBER_PROVIDE_CONSUME_CONTEXT_KEY = Symbol.for('EMBER_PROVIDE_CONSUME_CONTEXT_KEY');

// renderComponent can use an environment that is not the app owner's default
// renderer environment. Store the container that observed a component directly
// on the component so @consume reads use the same render tree that created it.
const EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY = Symbol.for('EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY');

// Components can read @consume values during construction, before enter() has
// the actual component instance to tag with the container above.
const EMBER_PROVIDE_CONSUME_CONTEXT_ACTIVE_CONTAINERS_KEY = Symbol.for('EMBER_PROVIDE_CONSUME_CONTEXT_ACTIVE_CONTAINERS_KEY');
function activeContainers() {
  const global = globalThis;
  return global[EMBER_PROVIDE_CONSUME_CONTEXT_ACTIVE_CONTAINERS_KEY] ??= [];
}
function activateContainer(container) {
  activeContainers().push(container);
}
function deactivateContainer(container) {
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
function clearActiveContainer(container) {
  const containers = activeContainers();
  let index = containers.lastIndexOf(container);
  while (index !== -1) {
    containers.splice(index, 1);
    index = containers.lastIndexOf(container);
  }
}
function setContextContainerOnComponent(component, container) {
  if (component[EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY] === container) {
    return;
  }
  Object.defineProperty(component, EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY, {
    value: container,
    writable: true,
    configurable: true
  });
}
function unsetContextContainerOnComponent(component, container) {
  if (component[EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY] === container) {
    delete component[EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY];
  }
}
function contextContainerFor(component) {
  return component?.[EMBER_PROVIDE_CONSUME_CONTEXT_CONTAINER_KEY] ?? activeContainers()[activeContainers().length - 1] ?? null;
}
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
var _contextKey = /*#__PURE__*/new WeakMap();
var _context = /*#__PURE__*/new WeakMap();
/**
 * A reference to one visible context provider.
 *
 * This keeps a reference to the provider instance rather than copying the
 * current value, so `value` reads stay connected to tracked provider state.
 */
class ContextRef {
  constructor(contextKey, context) {
    _classPrivateFieldInitSpec(this, _contextKey, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldInitSpec(this, _context, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _contextKey, contextKey);
    _classPrivateFieldSet(this, _context, context);
  }
  get contextKey() {
    return _classPrivateFieldGet(this, _contextKey);
  }
  get value() {
    return _classPrivateFieldGet(this, _context).instance[_classPrivateFieldGet(this, _context).key];
  }
}

/**
 * A captured set of context references visible to a component.
 *
 * The set of provider references is fixed when the refs are created, but values
 * are read from the original provider instances. That lets bridged consumers
 * continue to observe tracked provider values.
 */
var _contexts = /*#__PURE__*/new WeakMap();
class ContextRefs {
  constructor(contexts = null) {
    _classPrivateFieldInitSpec(this, _contexts, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _contexts, {
      ...contexts
    });
  }
  entries() {
    return Object.entries(_classPrivateFieldGet(this, _contexts)).map(([contextKey, context]) => {
      return [contextKey, new ContextRef(contextKey, context)];
    });
  }
  getRef(contextKey) {
    const context = _classPrivateFieldGet(this, _contexts)[contextKey];
    if (context == null) {
      return undefined;
    }
    return new ContextRef(contextKey, context);
  }
  get(contextKey) {
    return this.getRef(contextKey)?.value;
  }
}
/**
 * Registers an instance as a provider for every context ref.
 *
 * `provideContextRefs` is the public API for consumers. This private helper keeps
 * the same metadata path as the built-in provider component.
 */
function setContextMetadataOnContextRefsProviderInstance(instance, contextRefs) {
  const contextDefinitions = contextRefEntries(contextRefs).map(([contextKey, contextRef]) => {
    const propertyKey = `context:${String(contextKey)}`;
    Object.defineProperty(instance, propertyKey, {
      get() {
        return contextRef.value;
      },
      configurable: true
    });
    return [contextKey, propertyKey];
  });
  setContextMetadataOnContextProviderInstance(instance, contextDefinitions);
}
function contextRefEntries(contextRefs) {
  if (contextRefs == null) {
    return [];
  }
  if (contextRefs instanceof ContextRef) {
    return [[contextRefs.contextKey, contextRefs]];
  }
  return contextRefs.entries();
}
var _globalContexts = /*#__PURE__*/new WeakMap();
var _isCreatingComponent = /*#__PURE__*/new WeakMap();
class ProvideConsumeContextContainer {
  constructor() {
    _defineProperty(this, "stack", new StackImpl());
    // The keys of the WeakMap are component instances (actual Glimmer components,
    // not the VM ones).
    // The values are objects that map a string ID (provider ID) to the provider
    // component instance.
    // "parentContexts" contain references to contexts coming from "above", and
    // are used to read values from (which allows a component to provide and consume the same key)
    _defineProperty(this, "parentContexts", new WeakMap());
    // "nextContexts" are context maps used to propagate context values down
    // into the component tree, which includes the merged providers from the
    // current component (if any)
    _defineProperty(this, "nextContexts", new WeakMap());
    // Global contexts are registered by test-support helpers to allow easily
    // providing context values in tests.
    _classPrivateFieldInitSpec(this, _globalContexts, {
      writable: true,
      value: null
    });
    _classPrivateFieldInitSpec(this, _isCreatingComponent, {
      writable: true,
      value: false
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
    _classPrivateFieldSet(this, _isCreatingComponent, false);
    clearActiveContainer(this);
    if (this.stack.size !== 0) {
      while (!this.stack.isEmpty()) {
        this.stack.pop();
      }
    }
  }
  enter(instance) {
    // When "enter" is called, a component instance has already been created.
    // Update the flag to reflect that.
    // See the "contextsFor" method below for how this flag is used.
    _classPrivateFieldSet(this, _isCreatingComponent, false);
    deactivateContainer(this);
    const actualComponentInstance = instance?.state?.component;
    if (actualComponentInstance != null) {
      setContextContainerOnComponent(actualComponentInstance, this);
      const isProviderInstance = actualComponentInstance[EMBER_PROVIDE_CONSUME_CONTEXT_KEY] != null;
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
    const parentContexts = this.currentContexts();
    const mergedContexts = {
      ...parentContexts
    };
    const registeredContexts = provider[EMBER_PROVIDE_CONSUME_CONTEXT_KEY];

    // If the provider has registered contexts, store references
    // to them on the current contexts object
    if (registeredContexts != null) {
      Object.entries(registeredContexts).forEach(([contextKey, key]) => {
        if (key in provider) {
          mergedContexts[contextKey] = {
            instance: provider,
            key
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
  registerComponent(component) {
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
    const {
      current
    } = this;
    const globalContexts = _classPrivateFieldGet(this, _globalContexts) ?? {};
    if (this.nextContexts.has(current) || Object.keys(globalContexts).length > 0) {
      const context = this.nextContexts.get(current);
      return {
        ...globalContexts,
        ...context
      };
    }
    return {};
  }
  contextsFor(component) {
    if (this.parentContexts.has(component)) {
      return this.parentContexts.get(component);
    }

    // If a context for this component is not yet registered, but
    // we're in the phase of initializing a component, return
    // the current contexts, so that the values can be read in constructors.
    if (_classPrivateFieldGet(this, _isCreatingComponent)) {
      return this.currentContexts();
    }
    return null;
  }
  createComponent() {
    // Indicates that a component instance is being created, see
    // "contextsFor" above for how we use this.
    _classPrivateFieldSet(this, _isCreatingComponent, true);
    activateContainer(this);
  }
}

export { ContextRef as C, EMBER_PROVIDE_CONSUME_CONTEXT_KEY as E, ProvideConsumeContextContainer as P, _classPrivateFieldInitSpec as _, _classPrivateFieldSet as a, _classPrivateFieldGet as b, ContextRefs as c, contextContainerFor as d, setContextMetadataOnContextRefsProviderInstance as e, setContextMetadataOnContextProviderInstance as s };
//# sourceMappingURL=provide-consume-context-container-cc507b9e.js.map
