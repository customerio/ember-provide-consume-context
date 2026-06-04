import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import type Owner from '@ember/owner';
import type { ContextRef, ContextRefs } from 'ember-provide-consume-context';
import {
  getAllContextRefs,
  getContext,
  getContextRef,
  getContextRefs,
  provideContextRefs,
} from 'ember-provide-consume-context';

module('Integration | Utils', function (hooks) {
  setupRenderingTest(hooks);

  test('reading a context that does not exist returns `undefined`', async function (assert) {
    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      get contextValue(): string | undefined {
        return getContext(this, 'my-test-context');
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{if (eq this.contextValue undefined) "undefined" this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`<this.TestConsumerComponent />`);

    assert.dom('#content').hasText('undefined');
  });

  test('reading a context value with the functional utility works', async function (assert) {
    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      get contextValue(): string | undefined {
        return getContext(this, 'my-test-context');
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{if (eq this.contextValue undefined) "undefined" this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <ContextProvider @key="my-test-context" @value="5">
        <this.TestConsumerComponent />
      </ContextProvider>
    `);

    assert.dom('#content').hasText('5');
  });

  test('reading all context refs with the functional utility works', async function (assert) {
    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      contextRefs = getAllContextRefs(this);

      get contextValue(): string | undefined {
        return this.contextRefs.get('my-test-context');
      }

      get contextSummary(): string {
        return [
          this.contextRefs.get('my-test-context'),
          this.contextRefs.get('my-other-test-context'),
        ].join(':');
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextSummary}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <ContextProvider @key="my-test-context" @value="included">
        <ContextProvider @key="my-other-test-context" @value="also-included">
          <this.TestConsumerComponent />
        </ContextProvider>
      </ContextProvider>
    `);

    assert.dom('#content').hasText('included:also-included');
  });

  test('reading selected context refs with the functional utility works', async function (assert) {
    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      contextRefs = getContextRefs(this, {
        contextKeys: ['my-test-context'],
      });

      get contextValue(): string | undefined {
        return this.contextRefs.get('my-test-context');
      }

      get contextSummary(): string {
        return [
          this.contextRefs.get('my-test-context'),
          this.contextRefs.get('my-other-test-context') ?? 'undefined',
        ].join(':');
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextSummary}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <ContextProvider @key="my-test-context" @value="included">
        <ContextProvider @key="my-other-test-context" @value="omitted">
          <this.TestConsumerComponent />
        </ContextProvider>
      </ContextProvider>
    `);

    assert.dom('#content').hasText('included:undefined');
  });

  test('reading a single context ref with the functional utility works', async function (assert) {
    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      contextRef = getContextRef(this, 'my-test-context');

      get contextValue(): string | undefined {
        return this.contextRef?.value;
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{this.contextValue}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <ContextProvider @key="my-test-context" @value="included">
        <this.TestConsumerComponent />
      </ContextProvider>
    `);

    assert.dom('#content').hasText('included');
  });

  test('getContextRefs returns undefined without options', async function (assert) {
    class TestConsumerComponent extends Component<{
      Element: HTMLDivElement;
    }> {
      contextRefs = getContextRefs(this);
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        <div id="content">{{if this.contextRefs "present" "undefined"}}</div>
      `,
      TestConsumerComponent,
    );

    interface TestContext {
      TestConsumerComponent: typeof TestConsumerComponent;
    }
    (this as unknown as TestContext).TestConsumerComponent =
      TestConsumerComponent;

    await render<TestContext>(hbs`
      <ContextProvider @key="my-test-context" @value="included">
        <this.TestConsumerComponent />
      </ContextProvider>
    `);

    assert.dom('#content').hasText('undefined');
  });

  test('providing captured context refs with the functional utility works', async function (assert) {
    class CaptureContextRefsComponent extends Component<{
      Blocks: {
        default: [ContextRefs];
      };
    }> {
      contextRefs = getAllContextRefs(this);
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        {{yield this.contextRefs}}
      `,
      CaptureContextRefsComponent,
    );

    class ProvideContextRefsComponent extends Component<{
      Args: {
        contextRefs: ContextRefs | ContextRef | undefined;
      };
      Blocks: {
        default: [];
      };
    }> {
      constructor(
        owner: Owner,
        args: {
          contextRefs: ContextRefs | ContextRef | undefined;
        },
      ) {
        super(owner, args);

        provideContextRefs(this, args.contextRefs);
      }
    }

    setComponentTemplate(
      // @ts-ignore
      hbs`{{! @glint-ignore }}
        {{yield}}
      `,
      ProvideContextRefsComponent,
    );

    interface TestContext {
      CaptureContextRefsComponent: typeof CaptureContextRefsComponent;
      ProvideContextRefsComponent: typeof ProvideContextRefsComponent;
    }
    (this as unknown as TestContext).CaptureContextRefsComponent =
      CaptureContextRefsComponent;
    (this as unknown as TestContext).ProvideContextRefsComponent =
      ProvideContextRefsComponent;

    await render<TestContext>(hbs`
      <ContextProvider @key="my-test-context" @value="outer">
        <this.CaptureContextRefsComponent as |contextRefs|>
          <ContextProvider @key="my-test-context" @value="inner">
            <this.ProvideContextRefsComponent @contextRefs={{contextRefs}}>
              <ContextConsumer @key="my-test-context" as |value|>
                <div id="content">{{value}}</div>
              </ContextConsumer>
            </this.ProvideContextRefsComponent>
          </ContextProvider>
        </this.CaptureContextRefsComponent>
      </ContextProvider>
    `);

    assert.dom('#content').hasText('outer');
  });
});
