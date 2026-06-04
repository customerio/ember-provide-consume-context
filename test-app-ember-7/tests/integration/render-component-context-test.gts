import { getOwner } from '@ember/owner';
import type Owner from '@ember/owner';
import { renderComponent } from '@ember/renderer';
import { render } from '@ember/test-helpers';
import Component from '@glimmer/component';
import type {
  ContextRef,
  ContextRefs as ContextRefsValue,
} from 'ember-provide-consume-context';
import {
  consume,
  getAllContextRefs,
  getContextRef,
  getContextRefs,
  provide,
  provideContextRefs,
} from 'ember-provide-consume-context';
import ContextConsumer from 'ember-provide-consume-context/components/context-consumer';
import ContextProvider from 'ember-provide-consume-context/components/context-provider';
import ContextSnapshot from 'ember-provide-consume-context/components/context-snapshot';
import ProvideContexts from 'ember-provide-consume-context/components/provide-contexts';
import { modifier } from 'ember-modifier';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app-ember-7/tests/helpers';

module('Integration | renderComponent context', function (hooks) {
  setupRenderingTest(hooks);

  test('a consumer can read context when renderComponent is called from a modifier', async function (assert) {
    class TestConsumerComponent extends Component {
      @consume('my-test-context') contextValue!: string;

      <template>
        <div id="render-component-content">{{this.contextValue}}</div>
      </template>
    }

    class TestHostComponent extends Component {
      renderNestedComponent = modifier((element: Element) => {
        const owner = getOwner(this);
        if (owner == null) {
          throw new Error('Could not find test owner');
        }

        const result = renderComponent(
          <template>
            <ContextProvider @key="my-test-context" @value="rendered">
              <TestConsumerComponent />
            </ContextProvider>
          </template>,
          {
            into: element,
            owner,
          },
        );

        return () => result.destroy();
      });

      <template>
        <div {{this.renderNestedComponent}}></div>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-content').hasText('rendered');
  });

  test('a consumer can read renderComponent context during initialization', async function (assert) {
    class TestConsumerComponent extends Component {
      @consume('my-test-context') contextValue!: string;
      contextValueAtInit = this.contextValue;

      <template>
        <div id="render-component-init-content">
          {{this.contextValueAtInit}}
        </div>
      </template>
    }

    class TestProviderComponent extends Component {
      @provide('my-test-context') contextValue = 'rendered';

      <template><TestConsumerComponent /></template>
    }

    class TestHostComponent extends Component {
      renderNestedComponent = modifier((element: Element) => {
        const owner = getOwner(this);
        if (owner == null) {
          throw new Error('Could not find test owner');
        }

        const result = renderComponent(TestProviderComponent, {
          into: element,
          owner,
        });

        return () => result.destroy();
      });

      <template>
        <div {{this.renderNestedComponent}}></div>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-init-content').hasText('rendered');
  });

  test('a built-in consumer can read renderComponent context', async function (assert) {
    class TestProviderComponent extends Component {
      @provide('my-test-context') contextValue = 'rendered';

      <template>
        <ContextConsumer @key="my-test-context" as |value|>
          <div id="render-component-consumer-content">{{value}}</div>
        </ContextConsumer>
      </template>
    }

    class TestHostComponent extends Component {
      renderNestedComponent = modifier((element: Element) => {
        const owner = getOwner(this);
        if (owner == null) {
          throw new Error('Could not find test owner');
        }

        const result = renderComponent(TestProviderComponent, {
          into: element,
          owner,
        });

        return () => result.destroy();
      });

      <template>
        <div {{this.renderNestedComponent}}></div>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-consumer-content').hasText('rendered');
  });

  test('a consumer rendered in a separate renderComponent root does not read DOM parent context', async function (assert) {
    class TestHostComponent extends Component {
      renderNestedComponent = modifier((element: Element) => {
        const owner = getOwner(this);
        if (owner == null) {
          throw new Error('Could not find test owner');
        }

        const result = renderComponent(
          <template>
            <ContextConsumer
              @key="my-test-context"
              @defaultValue="missing"
              as |value|
            >
              <div id="render-component-unbridged-content">{{value}}</div>
            </ContextConsumer>
          </template>,
          {
            into: element,
            owner,
          },
        );

        return () => result.destroy();
      });

      <template>
        <ContextProvider @key="my-test-context" @value="outer">
          <div {{this.renderNestedComponent}}></div>
        </ContextProvider>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-unbridged-content').hasText('missing');
  });

  test('a consumer rendered in a separate renderComponent root can read bridged context', async function (assert) {
    class TestHostComponent extends Component {
      renderNestedComponent = modifier(
        (element: Element, [contextRefs]: [ContextRefsValue]) => {
          const owner = getOwner(this);
          if (owner == null) {
            throw new Error('Could not find test owner');
          }

          const result = renderComponent(
            <template>
              <ProvideContexts @contextRefs={{contextRefs}}>
                <ContextConsumer
                  @key="my-test-context"
                  @defaultValue="missing"
                  as |value|
                >
                  <div id="render-component-bridged-content">{{value}}</div>
                </ContextConsumer>
              </ProvideContexts>
            </template>,
            {
              into: element,
              owner,
            },
          );

          return () => result.destroy();
        },
      );

      <template>
        <ContextProvider @key="my-test-context" @value="outer">
          <ContextSnapshot as |contextRefs|>
            <div {{this.renderNestedComponent contextRefs}}></div>
          </ContextSnapshot>
        </ContextProvider>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-bridged-content').hasText('outer');
  });

  test('custom components can bridge a separate renderComponent root with JS helpers', async function (assert) {
    interface ContextSnapshotWrapperSignature {
      Blocks: {
        default: [ContextRefsValue];
      };
    }

    interface ProvideContextsWrapperSignature {
      Args: {
        contextRefs: ContextRefsValue;
      };
      Blocks: {
        default: [];
      };
    }

    class ContextSnapshotWrapper extends Component<ContextSnapshotWrapperSignature> {
      contextRefs = getAllContextRefs(this);

      <template>{{yield this.contextRefs}}</template>
    }

    class ProvideContextsWrapper extends Component<ProvideContextsWrapperSignature> {
      constructor(owner: Owner, args: ProvideContextsWrapperSignature['Args']) {
        super(owner, args);

        provideContextRefs(this, args.contextRefs);
      }

      <template>
        <div>{{yield}}</div>
      </template>
    }

    class TestHostComponent extends Component {
      renderNestedComponent = modifier(
        (element: Element, [contextRefs]: [ContextRefsValue]) => {
          const owner = getOwner(this);
          if (owner == null) {
            throw new Error('Could not find test owner');
          }

          const result = renderComponent(
            <template>
              <ProvideContextsWrapper @contextRefs={{contextRefs}}>
                <ContextConsumer
                  @key="my-test-context"
                  @defaultValue="missing"
                  as |value|
                >
                  <div id="render-component-js-bridged-content">{{value}}</div>
                </ContextConsumer>
              </ProvideContextsWrapper>
            </template>,
            {
              into: element,
              owner,
            },
          );

          return () => result.destroy();
        },
      );

      <template>
        <ContextProvider @key="my-test-context" @value="outer">
          <ContextSnapshotWrapper as |contextRefs|>
            <div {{this.renderNestedComponent contextRefs}}></div>
          </ContextSnapshotWrapper>
        </ContextProvider>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-js-bridged-content').hasText('outer');
  });

  test('getContextRefs can capture only selected contexts', async function (assert) {
    interface ContextSnapshotWrapperSignature {
      Blocks: {
        default: [ContextRefsValue];
      };
    }

    interface ProvideContextsWrapperSignature {
      Args: {
        contextRefs: ContextRefsValue;
      };
      Blocks: {
        default: [];
      };
    }

    class ContextSnapshotWrapper extends Component<ContextSnapshotWrapperSignature> {
      contextRefs = getContextRefs(this, {
        contextKeys: ['my-test-context'],
      });

      <template>{{yield this.contextRefs}}</template>
    }

    class ProvideContextsWrapper extends Component<ProvideContextsWrapperSignature> {
      constructor(owner: Owner, args: ProvideContextsWrapperSignature['Args']) {
        super(owner, args);

        provideContextRefs(this, args.contextRefs);
      }

      <template>
        <div>{{yield}}</div>
      </template>
    }

    class TestHostComponent extends Component {
      renderNestedComponent = modifier(
        (element: Element, [contextRefs]: [ContextRefsValue]) => {
          const owner = getOwner(this);
          if (owner == null) {
            throw new Error('Could not find test owner');
          }

          const result = renderComponent(
            <template>
              <ProvideContextsWrapper @contextRefs={{contextRefs}}>
                <ContextConsumer
                  @key="my-test-context"
                  @defaultValue="missing"
                  as |value|
                >
                  <div id="render-component-selected-context">{{value}}</div>
                </ContextConsumer>
                <ContextConsumer
                  @key="my-other-test-context"
                  @defaultValue="missing"
                  as |value|
                >
                  <div id="render-component-omitted-context">{{value}}</div>
                </ContextConsumer>
              </ProvideContextsWrapper>
            </template>,
            {
              into: element,
              owner,
            },
          );

          return () => result.destroy();
        },
      );

      <template>
        <ContextProvider @key="my-test-context" @value="included">
          <ContextProvider @key="my-other-test-context" @value="omitted">
            <ContextSnapshotWrapper as |contextRefs|>
              <div {{this.renderNestedComponent contextRefs}}></div>
            </ContextSnapshotWrapper>
          </ContextProvider>
        </ContextProvider>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-selected-context').hasText('included');
    assert.dom('#render-component-omitted-context').hasText('missing');
  });

  test('getContextRef can capture a single context', async function (assert) {
    interface ContextRefWrapperSignature {
      Blocks: {
        default: [ContextRef | undefined];
      };
    }

    class ContextRefWrapper extends Component<ContextRefWrapperSignature> {
      contextRef = getContextRef(this, 'my-test-context');

      <template>{{yield this.contextRef}}</template>
    }

    class TestHostComponent extends Component {
      renderNestedComponent = modifier(
        (element: Element, [contextRef]: [ContextRef | undefined]) => {
          const owner = getOwner(this);
          if (owner == null) {
            throw new Error('Could not find test owner');
          }

          const result = renderComponent(
            <template>
              <ProvideContexts @contextRefs={{contextRef}}>
                <ContextConsumer
                  @key="my-test-context"
                  @defaultValue="missing"
                  as |value|
                >
                  <div id="render-component-single-ref-context">{{value}}</div>
                </ContextConsumer>
                <ContextConsumer
                  @key="my-other-test-context"
                  @defaultValue="missing"
                  as |value|
                >
                  <div id="render-component-single-ref-omitted-context">
                    {{value}}
                  </div>
                </ContextConsumer>
              </ProvideContexts>
            </template>,
            {
              into: element,
              owner,
            },
          );

          return () => result.destroy();
        },
      );

      <template>
        <ContextProvider @key="my-test-context" @value="included">
          <ContextProvider @key="my-other-test-context" @value="omitted">
            <ContextRefWrapper as |contextRef|>
              <div {{this.renderNestedComponent contextRef}}></div>
            </ContextRefWrapper>
          </ContextProvider>
        </ContextProvider>
      </template>
    }

    await render(<template><TestHostComponent /></template>);

    assert.dom('#render-component-single-ref-context').hasText('included');
    assert
      .dom('#render-component-single-ref-omitted-context')
      .hasText('missing');
  });

  test('getContextRefs returns undefined without options', async function (assert) {
    class TestChildComponent extends Component {
      contextRefs = getContextRefs(this);

      <template>
        <div id="get-context-refs-without-options">
          {{if this.contextRefs "present" "missing"}}
        </div>
      </template>
    }

    await render(
      <template>
        <ContextProvider @key="my-test-context" @value="outer">
          <TestChildComponent />
        </ContextProvider>
      </template>,
    );

    assert.dom('#get-context-refs-without-options').hasText('missing');
  });
});
