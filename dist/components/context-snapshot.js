import { _ as _classPrivateFieldInitSpec, a as _classPrivateFieldSet, b as _classPrivateFieldGet } from '../provide-consume-context-container-cc507b9e.js';
import Component from '@glimmer/component';
import { a as getAllContextRefs } from '../utils-7f6231f0.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

var TEMPLATE = precompileTemplate("{{yield this.contextRefs}}\n");

var _contextRefs = /*#__PURE__*/new WeakMap();
/**
 * Yields a snapshot of all contexts visible at this point in the component tree.
 *
 * Pass the yielded value to `<ProvideContexts>` or `provideContextRefs()` to
 * bridge context into a separately rendered component root.
 */
class ContextSnapshot extends Component {
  constructor(owner, args) {
    super(owner, args);
    _classPrivateFieldInitSpec(this, _contextRefs, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldSet(this, _contextRefs, getAllContextRefs(this));
  }
  get contextRefs() {
    return _classPrivateFieldGet(this, _contextRefs);
  }
}
setComponentTemplate(TEMPLATE, ContextSnapshot);

export { ContextSnapshot as default };
//# sourceMappingURL=context-snapshot.js.map
