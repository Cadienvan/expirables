import { describe, it } from 'node:test';
import { tspl } from '@matteo.collina/tspl';
import { ExpirableSet } from '../src/Set/index.js';
import { sleep } from '../src/utils/index.js';

describe('ExpirableSet', async () => {
  it('should create a set', (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const emptySet = new ExpirableSet();
    const simpleSet = new ExpirableSet(['a', 'b']);
    const simpleSetWithTtl = new ExpirableSet([10, 20], { defaultTtl: 10 });
    const complexSet = new ExpirableSet([['a', 10], 10, [1]]);

    equal(emptySet.size, 0);
    equal(simpleSet.size, 2);
    equal(simpleSetWithTtl.size, 2);
    equal(complexSet.size, 3);
  });

  it('shoud initialize the set with the given values', (t) => {
    const { equal } = tspl(t, { plan: 3 });

    const set = new ExpirableSet(['a', 'b']);
    equal(set.size, 2);
    equal(set.has('a'), true);
    equal(set.has('b'), true);
  });

  it('should remove the key after the expiration time', async (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const set = new ExpirableSet(['a'], { defaultTtl: 10, keepAlive: true });

    equal(set.size, 1);
    equal(set.has('a'), true);

    await sleep(15);

    equal(set.size, 0);
    equal(set.has('a'), false);
  });

  it('should keep they alive when re-set before expiring', async (t) => {
    const { equal } = tspl(t, { plan: 6 });

    const set = new ExpirableSet(['a'], { defaultTtl: 10, keepAlive: true });

    equal(set.size, 1);
    equal(set.has('a'), true);

    set.add('a', 30);

    equal(set.size, 1);
    equal(set.has('a'), true);

    await sleep(20);

    equal(set.size, 1);
    equal(set.has('a'), true);
  });

  it('should remove the key when twice withouth keepAlive and time passed', async (t) => {
    const { equal } = tspl(t, { plan: 6 });

    const set = new ExpirableSet(['a'], { defaultTtl: 20, keepAlive: false });

    equal(set.size, 1);
    equal(set.has('a'), true);

    set.add('a');

    equal(set.size, 1);
    equal(set.has('a'), true);

    await sleep(25);

    equal(set.size, 0);
    equal(set.has('a'), false);
  });

  it('should maintain the key when firstly set with time and then set with 0', async (t) => {
    const { equal } = tspl(t, { plan: 6 });
    const set = new ExpirableSet(['a'], { defaultTtl: 10, keepAlive: true });

    equal(set.size, 1);
    equal(set.has('a'), true);

    set.add('a', 0);

    equal(set.size, 1);
    equal(set.has('a'), true);

    await sleep(20);

    equal(set.size, 1);
    equal(set.has('a'), true);
  });

  it('should initialize the map with the given entries and expiration time', async (t) => {
    const { equal } = tspl(t, { plan: 9 });

    const set = new ExpirableSet([
      ['a', 10],
      ['b', 20]
    ]);

    equal(set.size, 2);
    equal(set.has('a'), true);
    equal(set.has('b'), true);

    await sleep(15);

    equal(set.size, 1);
    equal(set.has('a'), false);
    equal(set.has('b'), true);

    await sleep(10);

    equal(set.size, 0);
    equal(set.has('a'), false);
    equal(set.has('b'), false);
  });

  it('should not expire', async (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const set = new ExpirableSet([1, 2, 3]);

    set.setExpiration(1, 0);
    set.setExpiration(2, 10);
    set.setExpiration(3, 0);

    await sleep(20);

    equal(set.size, 2);
    equal(set.has(1), true);
    equal(set.has(3), true);
    equal(set.has(2), false);
  });

  it('should set the expiration unrefering the timeout', async (t) => {
    const { equal, } = tspl(t, { plan: 2 });

    const set = new ExpirableSet([1], { unrefTimeouts: true });

    set.setExpiration(1, 10);

    equal(set.size, 1);

    await sleep(15);

    equal(set.has(1), false);
  });

  it('should thrown if ttl is not a number', (t) => {
    const { throws } = tspl(t, { plan: 1 });

    const set = new ExpirableSet();

    throws(() => {
      // @ts-expect-error - we're testing this
      set.add(1, 'kaboom');
    }, { message: 'TTL must be a number' });
  })
});
