import { describe, it } from 'node:test';
import { tspl } from '@matteo.collina/tspl';
import { ExpirableStack } from '../src/Stack';
import { sleep } from '../src/utils';

describe('ExpirableStack', async () => {
  it('should create a stack', (t) => {
    const { equal } = tspl(t, { plan: 5 });

    const emptyStack = new ExpirableStack();
    const simpleStack = new ExpirableStack([1, 2, 3]);
    const complexStackWithoutTtl = new ExpirableStack([[1], 2, [3]]);
    const complexStackWithTtl = new ExpirableStack([[1, 10], 2, [3, 20]]);
    const stackWithObjects = new ExpirableStack([{ a: 1 }, { b: 2 }]);

    equal(emptyStack.size, 0);
    equal(simpleStack.size, 3);
    equal(complexStackWithoutTtl.size, 3);
    equal(complexStackWithTtl.size, 3);
    equal(stackWithObjects.size, 2);
  });

  it('should act as stack if defaultTtl is 0', (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const stack = new ExpirableStack([1, 2, 3]);

    equal(stack.pop(), 1);
    equal(stack.pop(), 2);
    equal(stack.pop(), 3);
    equal(stack.pop(), undefined);
  });

  it('should return the correct next element', (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const stack = new ExpirableStack([1, 2, 3]);

    equal(stack.next, 3);
  });

  it('should remove the first element after the expiration time', async (t) => {
    const { equal } = tspl(t, { plan: 3 });

    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

    equal(stack.pop(), 1);
    equal(stack.pop(), 2);
    await sleep(20);
    equal(stack.pop(), undefined);
  });

  it('should set an expirable entry and remove it after the expiration time', async (t) => {
    const { equal } = tspl(t, { plan: 5 });

    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

    equal(stack.size, 3);
    await sleep(20);
    equal(stack.size, 0);
    stack.push(4, 30);
    equal(stack.size, 1);
    await sleep(20);
    equal(stack.size, 1);
    await sleep(20);
    equal(stack.size, 0);
  });

  it('should throw an error if the ttl is not a number', (t) => {
    const { throws } = tspl(t, { plan: 1 });

    const stack = new ExpirableStack();

    throws(
      () => {
        stack.push(1, '10' as any);
      },
      { message: 'TTL must be a number' }
    );
  });

  it('should return nothing if the element popped is undefined', (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const stack = new ExpirableStack();

    equal(stack.pop(), undefined);
  });

  it('should clear the timeout in setExpiration if the timeout is already set ', async (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const key = Symbol('key');

    const stack = new ExpirableStack();
    stack.setExpiration(key, 100);
    stack.setExpiration(key, 20);

    await sleep(20);

    equal(stack.size, 0);
  });

  it('should unref the timeout if passed in options', async (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const stack = new ExpirableStack([1, 2, 3], {
      defaultTtl: 10,
      unrefTimeouts: true
    });

    await sleep(20);

    equal(stack.size, 0);
  });

  it('should next return undefined if the length is less or equal 0', (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const stack = new ExpirableStack();

    equal(stack.next, undefined);
  });

  it('should never expire', async (t) => {
    const { equal } = tspl(t, { plan: 3 });

    const stack = new ExpirableStack();
    const key = Symbol('b');

    stack.push('a', 10);
    stack.push(key);

    equal(stack.size, 2);

    await sleep(11);

    equal(stack.size, 1);

    stack.setExpiration(key, 0);
    await sleep(20);

    equal(stack.size, 1);
  });
});

describe('ExpirableStack hooks', () => {
  it('should call the beforeExpire hook before an entry expires', async (t) => {
    const { equal } = tspl(t, { plan: 3 });

    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

    let i = 0;
    stack.addHook('beforeExpire', (value) => {
      i++;
      equal(value, i);
    });

    await sleep(20);
  });

  it('should call the afterExpire hook after an entry expires', async (t) => {
    const { equal } = tspl(t, { plan: 3 });

    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

    let i = 0;
    stack.addHook('afterExpire', (value) => {
      i++;
      equal(value, i);
    });

    await sleep(20);
  });

  it('should throw an error if the hook is not valid', (t) => {
    const { throws } = tspl(t, { plan: 1 });

    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

    throws(() => {
      stack.addHook('invalidHook' as any, () => ({}));
    });
  });

  it('should throw if the hook does not exist', (t) => {
    const { throws } = tspl(t, { plan: 1 });

    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

    throws(() => {
      stack.runHook('invalidHook' as any);
    });
  });
});
