import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  setupRenderWrapper,
  provide,
} from 'ember-provide-consume-context/test-support';

module('Integration | Provider test helpers', function (hooks) {
  setupRenderingTest(hooks);

  module('provide in beforeEach', function (hooks) {
    hooks.beforeEach(function (this) {
      provide('my-test-context', '1');
    });

    test('can read context provided by "provide" test helper', async function (assert) {
      await render(hbs`
        <ContextConsumer @key="my-test-context" as |count|>
          <div id="content">{{count}}</div>
        </ContextConsumer>
      `);

      assert.dom('#content').hasText('1');
    });

    test('can override "provide" context with a provider component', async function (assert) {
      await render(hbs`
        <ContextProvider @key="my-test-context" @value="2">
          <ContextConsumer @key="my-test-context" as |count|>
            <div id="content">{{count}}</div>
          </ContextConsumer>
        </ContextProvider>
      `);

      assert.dom('#content').hasText('2');
    });
  });

  module('setupRenderWrapper in beforeEach', function (hooks) {
    hooks.beforeEach(function (this) {
      setupRenderWrapper(
        hbs`<ContextProvider @key="my-test-context" @value="3">{{outlet}}</ContextProvider>`,
      );
    });

    test('can read context provided by "setupRenderWrapper" test helper', async function (assert) {
      await render(hbs`
        <ContextConsumer @key="my-test-context" as |count|>
          <div id="content">{{count}}</div>
        </ContextConsumer>
      `);

      assert.dom('#content').hasText('3');
    });

    test('can override "setupRenderWrapper" context with a provider component', async function (assert) {
      await render(hbs`
        <ContextProvider @key="my-test-context" @value="4">
          <ContextConsumer @key="my-test-context" as |count|>
            <div id="content">{{count}}</div>
          </ContextConsumer>
        </ContextProvider>
      `);

      assert.dom('#content').hasText('4');
    });
  });

  test('can read context provided by "provide" test helper', async function (assert) {
    provide('my-test-context', '5');
    await render(hbs`
      <ContextConsumer @key="my-test-context" as |count|>
        <div id="content">{{count}}</div>
      </ContextConsumer>
    `);

    assert.dom('#content').hasText('5');
  });

  test('can read context provided by "setupRenderWrapper" test helper', async function (assert) {
    setupRenderWrapper(
      hbs`<ContextProvider @key="my-test-context" @value="6">{{outlet}}</ContextProvider>`,
    );

    await render(hbs`
      <ContextConsumer @key="my-test-context" as |count|>
        <div id="content">{{count}}</div>
      </ContextConsumer>
    `);

    assert.dom('#content').hasText('6');
  });
});
