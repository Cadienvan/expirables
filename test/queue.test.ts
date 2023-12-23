import { describe, it } from 'node:test';
import { tspl } from '@matteo.collina/tspl';
import { ExpirableQueue } from '../src/Queue';
import { sleep } from '../src/utils';

describe('ExpirableQueue', async () => {
  it('should create a queue', (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const emptyQueue = new ExpirableQueue();
    const simpleQueue = new ExpirableQueue([1, 2, 3]);
    const simpleQueueWithTtl = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });
    const complexQueue = new ExpirableQueue([[1, 10], 3, [4]]);

    equal(emptyQueue.size, 0);
    equal(simpleQueue.size, 3);
    equal(simpleQueueWithTtl.size, 3);
    equal(complexQueue.size, 3);
  });

  it('should act as a queue if defaultTtl is 0', (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const queue = new ExpirableQueue([1, 2, 3]);

    equal(queue.dequeue(), 1);
    equal(queue.dequeue(), 2);
    equal(queue.dequeue(), 3);
    equal(queue.dequeue(), undefined);
  });

  it('should return the correct next element', (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const queue = new ExpirableQueue([1, 2, 3]);

    equal(queue.next.value, 1);
  });

  it('should remove the first element after the expiration time', async (t) => {
    const { equal } = tspl(t, { plan: 3 });

    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });

    equal(queue.dequeue(), 1);
    equal(queue.dequeue(), 2);

    await sleep(20);

    equal(queue.dequeue(), undefined);
  });

  it('should set an expirable entry and remote it after the expiration time', async (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });

    equal(queue.size, 3);
    await sleep(20);
    equal(queue.size, 0);
    queue.enqueue(4, 30);
    await sleep(20);
    equal(queue.size, 1);
    await sleep(20);
    equal(queue.size, 0);
  });

  it('should thrown if ttl is not a number', (t) => {
    const { throws } = tspl(t, { plan: 1 });

    const queue = new ExpirableQueue();

    throws(() => queue.enqueue(1, '10' as any));
  });

  it('should not expire entries if ttl is 0', async (t) => {
    const { equal } = tspl(t, { plan: 2 });

    const queue = new ExpirableQueue();
    const key = queue.enqueue(1);
    equal(queue.size, 1);

    queue.setExpiration(key, 0);

    await sleep(10);

    equal(queue.size, 1);
  });

  it('should return the queue if the element is not findable in setExpiration', (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const queue = new ExpirableQueue();
    queue.enqueue(1);
    const key = Symbol('random key');

    equal(queue.setExpiration(key, 10), queue);
  });

  it('should set the expiration unrefering the timer', async (t) => {
    const { equal } = tspl(t, { plan: 2 });

    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10, unrefTimeouts: true });

    equal(queue.size, 3);
    await sleep(20);

    equal(queue.size, 0);
  });
});
