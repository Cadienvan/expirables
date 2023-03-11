import { ExpirableStack } from './index';
import { sleep } from '../utils';

jest.useFakeTimers();

describe('ExpirableStack', () => {
  it('should act as a stack if defaultTtl is 0', () => {
    const stack = new ExpirableStack([1, 2, 3]);
    expect(stack.pop()).toBe(1);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(3);
    expect(stack.pop()).toBeUndefined();
  });

  it('should return the correct next element', () => {
    const stack = new ExpirableStack([1, 2, 3]);
    expect(stack.next).toBe(3);
  });

  it('should allow entries to define a specific ttl and let them expire accordingly', async () => {
    const stack = new ExpirableStack([[1, 30], 2, [3, 50]], { defaultTtl: 10 }); // 2 will expire after 10ms, 1 after 30ms and 3 after 50ms
    expect(stack.size).toBe(3);
    sleep(11);
    jest.advanceTimersByTime(11);
    expect(stack.size).toBe(2);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(stack.size).toBe(1);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(stack.size).toBe(0);
  });

  it('should remove the first element after the expiration time', async () => {
    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });
    expect(stack.pop()).toBe(1);
    expect(stack.pop()).toBe(2);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(stack.pop()).toBeUndefined();
  });

  it('should set an expirable entry and remove it after the expiration time', async () => {
    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });
    expect(stack.size).toBe(3);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(stack.size).toBe(0);
    stack.push(4, 30);
    expect(stack.size).toBe(1);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(stack.size).toBe(1);
    sleep(20);
    jest.advanceTimersByTime(20);
    expect(stack.size).toBe(0);
  });
});
