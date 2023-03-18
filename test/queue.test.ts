import t from 'tap';
import { ExpirableQueue } from '../src/Queue';
import { sleep } from '../src/utils';

t.test('ExpirableQueue', (t) => {
  t.plan(9);

  t.test('should create a queue', (t) => {
    t.plan(4);

    const emptyQueue = new ExpirableQueue();
    const simpleQueue = new ExpirableQueue([1, 2, 3]);
    const simpleQueueWithTtl = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });
    const complexQueue = new ExpirableQueue([[1, 10], 3, [4]]);

    t.equal(emptyQueue.size, 0);
    t.equal(simpleQueue.size, 3);
    t.equal(simpleQueueWithTtl.size, 3);
    t.equal(complexQueue.size, 3);
  });

  t.test('should act as a queue if defaultTtl is 0', (t) => {
    t.plan(4);

    const queue = new ExpirableQueue([1, 2, 3]);

    t.equal(queue.dequeue(), 1);
    t.equal(queue.dequeue(), 2);
    t.equal(queue.dequeue(), 3);
    t.equal(queue.dequeue(), undefined);
  });

  t.test('should return the correct next element', (t) => {
    t.plan(1);

    const queue = new ExpirableQueue([1, 2, 3]);

    t.equal(queue.next.value, 1);
  });

  t.test('should remove the first element after the expiration time', async (t) => {
    t.plan(3);

    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });

    t.equal(queue.dequeue(), 1);
    t.equal(queue.dequeue(), 2);

    await sleep(20);

    t.equal(queue.dequeue(), undefined);
  });

  t.test('should set an expirable entry and remote it after the expiration time', async (t) => {
    t.plan(4);

    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10 });

    t.equal(queue.size, 3);
    await sleep(20);
    t.equal(queue.size, 0);
    queue.enqueue(4, 30);
    await sleep(20);
    t.equal(queue.size, 1);
    await sleep(20);
    t.equal(queue.size, 0);
  });

  t.test('should thrown if ttl is not a number', (t) => {
    t.plan(1);

    const queue = new ExpirableQueue();

    t.throws(() => queue.enqueue(1, '10' as any));
  });

  t.test('should not expire entries if ttl is 0', async (t) => {
    t.plan(2);

    const queue = new ExpirableQueue();
    const key = queue.enqueue(1);
    t.equal(queue.size, 1);

    queue.setExpiration(key, 0);

    await sleep(10);

    t.equal(queue.size, 1);
  });

  t.test('should return the queue if the element is not findable in setExpiration', (t) => {
    t.plan(1);

    const queue = new ExpirableQueue();
    queue.enqueue(1);
    const key = Symbol('random key');

    t.equal(queue.setExpiration(key, 10), queue);
  });

  t.test('should set the expiration unrefering the timer', async (t) => {
    t.plan(2);

    const queue = new ExpirableQueue([1, 2, 3], { defaultTtl: 10, unrefTimeouts: true });

    t.equal(queue.size, 3);
    await sleep(20);

    t.equal(queue.size, 0);
  });
});
