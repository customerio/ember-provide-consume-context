// We can't install @glimmer/interfaces as a dependency, so we copy the opcodes
// that are relevant to us.
// https://github.com/glimmerjs/glimmer-vm/issues/1294
// https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/vm/lib/opcodes.ts#L196
export const enum Op {
  GetComponentSelf = 90,
  DidRenderLayout = 100,
}
