# @customerio/ember-context

This addon provides a way to share data through to nested components without
having to pass arguments at each level (i.e. no prop drilling).

## Compatibility

- Ember.js v4.8 or above
- Embroider or ember-auto-import v2

## Installation

```
ember install @customerio/ember-context
```

## Usage
A new context can be created with the `createContext` function:

```ts
import { createContext } from '@customerio/ember-context';

export const ThemeContext = createContext<'dark' | 'light'>('light');
```

The function returns an object which contains two properties: `Provider` and
`Consumer`, both of which are Glimmer components.

The `Provider` component allows us to provide a context value to anything that's
nested within it. It accepts a `@value` argument, which will be the context's
value.

```ts
import Component from '@glimmer/component';
import { ThemeContext } from 'my-app/contexts/theme';

export default class MyComponent extends Component {
  ThemeContext = ThemeContext;

  @tracked theme = 'light';
}
```

```hbs
<this.ThemeContext.Provider @value={{this.theme}}>
  ... anything inside here, no matter how deeply nested, will have access to the value...
</this.ThemeContext.Provider>
```


The `Consumer` component can then be used to retrieve the value of the context
anywhere within the `Provider`s tree:
```ts
import Component from '@glimmer/component';
import { ThemeContext } from 'my-app/contexts/theme';

export default class MyChildComponent extends Component {
  ThemeContext = ThemeContext;
}
```

```hbs
<this.ThemeContext.Consumer as |value|>
  {{value}}
</this.ThemeContext.Consumer>
```

The above would print `light`, which is the current value of the context. If the
context value is a tracked property and it changes, the consumers will update
accordingly.

### `inject`
A context can also be consumed from within a component class, similarly to how
Ember Services are consumed:


```ts
import Component from '@glimmer/component';
import { ThemeContext } from 'my-app/contexts/theme';
import { inject as context, type contextValueType } from '@customerio/ember-context';

export default class MyChildComponent extends Component {
  @context(ThemeContext) theme!: contextValueType<typeof ThemeContext>;
}
```

```hbs
<div ...attributes>
 {{this.theme}}
</div>
```

This would also print `light`, and would update when the context value changes.

With this decorator, context values can also be used in getters:

```ts
import Component from '@glimmer/component';
import { ThemeContext } from 'my-app/contexts/theme';
import { inject as context, type contextValueType } from '@customerio/ember-context';

export default class MyChildComponent extends Component {
  @context(ThemeContext) theme!: contextValueType<typeof ThemeContext>;

  get classNames() {
    if (this.theme === 'light') {
      return 'theme-light';
    } else if (this.theme === 'dark') {
      return 'theme-dark';
    }
  }
}
```

## Inspiration
The idea was to create an API similar to the Context API in React
- [`React Context API`](https://react.dev/reference/react/createContext): The
  addon aims to implement a context API for Ember that resembles how React
  handles contexts (where React's `useContext` hook is replaced by the `inject`
  decorator, which is more Ember idiomatic)
- [`ember-context`](https://github.com/alexlafroscia/ember-context): Another
  Ember addon that also implements a similar Context API. However, that addon's
  implementation relies has providers racing on a provider key, while our addon
  uses the actual Ember component tree

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.
