import type { ComponentInstance } from '@glimmer/interfaces';
import type { UpdatingVM } from '@glimmer/runtime';

export class ProvideConsumeContextUpdateOpcode {
  // "instance" is a VM component instance
  constructor(private instance: ComponentInstance) {}

  // vm is an instance of the updating VM:
  // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/vm/update.ts#L33
  evaluate(vm: UpdatingVM) {
    vm.env.provideConsumeContextContainer?.enter(this.instance);
  }
}

export class ProvideConsumeContextDidRenderOpcode {
  // "instance" is a VM component instance
  constructor(private instance: ComponentInstance) {}

  // vm is an instance of the updating VM:
  // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/vm/update.ts#L33
  evaluate(vm: UpdatingVM) {
    vm.env.provideConsumeContextContainer?.exit(this.instance);
  }
}
