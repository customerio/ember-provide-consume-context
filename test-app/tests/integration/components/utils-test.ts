import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { getContext } from 'ember-provide-consume-context';

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

    await render(hbs`
      <ContextProvider @key="my-test-context" @value="5">
        <this.TestConsumerComponent />
      </ContextProvider>
    `);

    assert.dom('#content').hasText('5');
  });
});
