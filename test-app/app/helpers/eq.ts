import { helper } from '@ember/component/helper';

function eq([a, b]: [unknown, unknown]): boolean {
  return a === b;
}

const eqHelper = helper(eq);

export default eqHelper;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    eq: typeof eqHelper;
  }
}
