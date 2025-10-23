import {
  ProvideConsumeContextDidRenderOpcode,
  ProvideConsumeContextUpdateOpcode,
} from './opcodes';
import { ProvideConsumeContextContainer } from './provide-consume-context-container';
import type { ComponentInstance } from '@glimmer/interfaces';
import type {
  LowLevelVM as GlimmerLowLevelVM,
  EnvironmentImpl as GlimmerEnvironmentImpl,
} from '@glimmer/runtime';
import { Op } from './@glimmer/opcodes';

function overrideVM(runtime: any) {
  const LowLevelVM = runtime.LowLevelVM as any;

  // Ember 6
  if (LowLevelVM.prototype.evaluateOuter != null) {
    const originalEvaluateOuter = LowLevelVM.prototype.evaluateOuter;
    LowLevelVM.prototype.evaluateOuter = function (opcode: any, vm: any) {
      try {
        const { type, op1 } = opcode;

        if (type === Op.GetComponentSelf) {
          // Get the component instance from the VM
          // (that's the VM's component instance, not the Glimmer Component one)
          // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/compiled/opcodes/component.ts#L579
          const instance = vm.fetchValue(op1);

          // Add the component to the stack
          this.context.env.provideConsumeContextContainer?.enter(instance);
          // When there are updates/rerenders, make sure we add to the stack again
          vm.updateWith(new ProvideConsumeContextUpdateOpcode(instance));
        }

        if (type === Op.DidRenderLayout) {
          // Get the component instance from the VM
          // (that's the VM's component instance, not the Glimmer Component one)
          // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/compiled/opcodes/component.ts#L832
          const instance = vm.fetchValue(op1);

          // After the component has rendered, remove it from the stack
          this.context.env.provideConsumeContextContainer?.exit(instance);
          // On updates/rerenders, make sure to remove from the stack again
          vm.updateWith(new ProvideConsumeContextDidRenderOpcode(instance));
        }
      } catch {
        // ignore
      }

      return originalEvaluateOuter.call(this, opcode, vm);
    };
  }

  // Ember before 6
  if (LowLevelVM.prototype.next != null) {
    const originalNext = LowLevelVM.prototype.next;
    // We can't reach into the opcode definitions themselves, but we can hook into
    // when they're evaluated ("next"), and execute additional code when the
    // opcodes we're interested are called.
    // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/vm/append.ts#L603C1-L603C1
    LowLevelVM.prototype.next = function (this: GlimmerLowLevelVM) {
      // The actual evaluation happens in the "low level VM":
      // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/vm/low-level.ts#L112
      // but that isn't exposed to us.
      // Luckily, the VM we do have access to exposes the "pc" register, and the
      // "program" instance, which is all we need to get the current opcode.
      const opcode = this.program.opcode(this.pc);

      // Getting "type" may fail with "Expected value to be present", coming from
      // https://github.com/glimmerjs/glimmer-vm/blob/f03632077d98910de7ae3f7c22ebed98cb4f909a/packages/%40glimmer/program/lib/program.ts#L116
      try {
        const { type, op1 } = opcode;

        if (type === Op.GetComponentSelf) {
          // Get the component instance from the VM
          // (that's the VM's component instance, not the Glimmer Component one)
          // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/compiled/opcodes/component.ts#L579
          const instance = this.fetchValue<ComponentInstance>(op1);

          // Add the component to the stack
          this.env.provideConsumeContextContainer?.enter(instance);
          // When there are updates/rerenders, make sure we add to the stack again
          this.updateWith(new ProvideConsumeContextUpdateOpcode(instance));
        }

        if (type === Op.DidRenderLayout) {
          // Get the component instance from the VM
          // (that's the VM's component instance, not the Glimmer Component one)
          // https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/runtime/lib/compiled/opcodes/component.ts#L832
          const instance = this.fetchValue<ComponentInstance>(op1);

          // After the component has rendered, remove it from the stack
          this.env.provideConsumeContextContainer?.exit(instance);
          // On updates/rerenders, make sure to remove from the stack again
          this.updateWith(new ProvideConsumeContextDidRenderOpcode(instance));
        }
      } catch {
        // ignore
      }

      return originalNext.apply(this);
    };
  }
}

function overrideEnvironment(runtime: any) {
  const EnvironmentImpl =
    runtime.EnvironmentImpl as typeof GlimmerEnvironmentImpl;

  const originalBegin = EnvironmentImpl.prototype.begin;
  EnvironmentImpl.prototype.begin = function () {
    if (this.provideConsumeContextContainer == null) {
      this.provideConsumeContextContainer =
        new ProvideConsumeContextContainer();
    }

    // When a render transaction is started, let our container know to reset
    // the stack
    (this as any).provideConsumeContextContainer?.begin();

    return originalBegin.apply(this);
  };

  const originalCommit = EnvironmentImpl.prototype.commit;
  EnvironmentImpl.prototype.commit = function () {
    if (this.provideConsumeContextContainer == null) {
      this.provideConsumeContextContainer =
        new ProvideConsumeContextContainer();
    }

    // When a render transaction is finished, let our container lnow to reset
    // the stack
    this.provideConsumeContextContainer?.commit();

    return originalCommit.apply(this);
  };
}

export function overrideGlimmerRuntime(runtime: any) {
  overrideVM(runtime);
  overrideEnvironment(runtime);
}
