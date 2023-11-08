// We can't use enums from @glimmer/interfaces due to the issue below:
// https://github.com/glimmerjs/glimmer-vm/issues/1294
// We can use type imports, but an enum would need to be transformed into JS,
// which fails.
// We copy the opcodes from the source into here, and only the ones that are
// relevant to us.
// This is safe, because the opcodes should be stable.
// https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/vm/lib/opcodes.ts#L196
export const enum Op {
  GetComponentSelf = 90,
  DidRenderLayout = 100,
}
