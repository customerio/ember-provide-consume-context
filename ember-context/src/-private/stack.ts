type Option<T> = T | null;

// https://github.com/glimmerjs/glimmer-vm/blob/68d371bdccb41bc239b8f70d832e956ce6c349d8/packages/%40glimmer/util/lib/collections.ts#L18
export class Stack<T> {
  private stack: T[];
  public current: Option<T> = null;

  constructor(values: T[] = []) {
    this.stack = values;
  }

  public get size() {
    return this.stack.length;
  }

  push(item: T) {
    this.current = item;
    this.stack.push(item);
  }

  pop(): Option<T> {
    const item = this.stack.pop();
    const len = this.stack.length;
    this.current = len === 0 ? null : this.stack[len - 1] ?? null;

    return item === undefined ? null : item;
  }

  nth(from: number): Option<T> {
    const len = this.stack.length;
    return len < from ? null : this.stack[len - from] ?? null;
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }

  toArray(): T[] {
    return this.stack;
  }
}
