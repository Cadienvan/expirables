import { ExpirableStack } from './index';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ExpirableStack', () => {
  it('should act as a stack if defaultTtl is 0', () => {
    const stack = new ExpirableStack([1, 2, 3]);
    expect(stack.pop()).toBe(1);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBeUndefined();
  });

  it('should remove the first element after the expiration time', async () => {
    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });
    expect(stack.pop()).toBe(1);
    expect(stack.pop()).toBe(2);
    await sleep(20);
    expect(stack.pop()).toBeUndefined();
  });

  it('should set an expirable entry and remove it after the expiration time', async () => {
    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });
    expect(stack.size).toBe(3);
    await sleep(20);
    expect(stack.size).toBe(0);
    stack.push(4, 30);
    expect(stack.size).toBe(1);
    await sleep(20);
    expect(stack.size).toBe(1);
    await sleep(20);
    expect(stack.size).toBe(0);
  });
});
