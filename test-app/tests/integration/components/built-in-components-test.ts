import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { tracked } from '@glimmer/tracking';

class Context {
  @tracked count?: number;
}

interface ThisContext {
  context: Context;
}

module('Integration | Built-in components', function (hooks) {
  setupRenderingTest(hooks);

  let context: Context;

  hooks.beforeEach(function (this: ThisContext) {
    context = new Context();
    this.context = context;
  });

  test('a consumer can read context', async function (assert) {
    await render(hbs`
      <ContextProvider @key="my-test-context" @value="5">
        <ContextConsumer @key="my-test-context" as |count|>
          <div id="content">{{count}}</div>
        </ContextConsumer>
      </ContextProvider>
    `);

    assert.dom('#content').hasText('5');
  });

  test('a consumer reads from closest context', async function (assert) {
    await render(hbs`
      <ContextProvider @key="my-test-context" @value="1">
        <ContextConsumer @key="my-test-context" as |count|>
          <div id="content-1">{{count}}</div>
        </ContextConsumer>
        <ContextProvider @key="my-test-context" @value="2">
          <ContextConsumer @key="my-test-context" as |count|>
            <div id="content-2">{{count}}</div>
          </ContextConsumer>
        </ContextProvider>
      </ContextProvider>
    `);

    assert.dom('#content-1').hasText('1');
    assert.dom('#content-2').hasText('2');
  });

  test("a consumer's value updates when provider value changes", async function (assert) {
    context.count = 1;

    await render<ThisContext>(hbs`
      <ContextProvider @key="my-test-context" @value={{this.context.count}}>
        <ContextConsumer @key="my-test-context" as |count|>
          <div id="content">{{count}}</div>
        </ContextConsumer>
      </ContextProvider>
    `);

    assert.dom('#content').hasText('1');

    context.count = 2;
    await settled();
    assert.dom('#content').hasText('2');
  });
});
