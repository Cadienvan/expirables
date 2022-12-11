import { ExpirableQueue } from './index';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ExpirableQueue', () => {
  it('should act as a queue if defaultTtl is 0', () => {
    const queue = new ExpirableQueue([1, 2, 3]);
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should remove the first element after the expiration time', async () => {
    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });
    expect(queue.dequeue()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    await sleep(20);
    expect(queue.dequeue()).toBeUndefined();
  });

  it('should set an expirable entry and remove it after the expiration time', async () => {
    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });
    expect(queue.size).toBe(3);
    await sleep(20);
    expect(queue.size).toBe(0);
    queue.enqueue(4, 30);
    expect(queue.size).toBe(1);
    await sleep(20);
    expect(queue.size).toBe(1);
    await sleep(20);
    expect(queue.size).toBe(0);
  });
});
