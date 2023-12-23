import { describe, it } from 'node:test';
import { tspl } from '@matteo.collina/tspl';
import { ExpirableMap } from '../src/Map';
import { sleep } from '../src/utils';

describe('ExpirableMap', async () => {
  it('should create a map', (t) => {
    const { equal } = tspl(t, { plan: 3 });

    const emptyMap = new ExpirableMap();
    const simpleMap = new ExpirableMap([
      ['a', 1, 10],
      ['b', 2, 20]
    ]);
    const simpleMapWithDefaultTtl = new ExpirableMap([
      ['a', 1],
      ['b', 2]
    ]);

    equal(emptyMap.size, 0);
    equal(simpleMap.size, 2);
    equal(simpleMapWithDefaultTtl.size, 2);
  });

  it('should initialize the map with the given values', (t) => {
    const { equal } = tspl(t, { plan: 2 });

    const map = new ExpirableMap([
      ['a', 1, 10],
      ['b', 2, 20]
    ]);

    equal(map.get('a'), 1);
    equal(map.get('b'), 2);
  });

  it('should set the expiration time for a key', (t) => {
    const { equal } = tspl(t, { plan: 2 });

    const map = new ExpirableMap();
    map.set('a', 1, 10);

    equal(map.size, 1);
    equal(map.get('a'), 1);
  });

  it('should remove the key after the expiration time', async (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const map = new ExpirableMap();
    map.set('a', 1, 10);

    equal(map.size, 1);
    equal(map.get('a'), 1);

    await sleep(20);

    equal(map.size, 0);
    equal(map.get('a'), undefined);
  });

  it('should keep the key if the expiration time is 0', async (t) => {
    const { equal } = tspl(t, { plan: 6 });

    const map = new ExpirableMap();

    map.set('a', 1, 0);
    equal(map.size, 1);
    equal(map.get('a'), 1);

    map.set('a', 1, 30);
    equal(map.size, 1);
    equal(map.get('a'), 1);

    await sleep(20);

    equal(map.size, 1);
    equal(map.get('a'), 1);
  });

  it('should remove the key when set twice without keepAlive and time passed', async (t) => {
    const { equal } = tspl(t, { plan: 6 });

    const map = new ExpirableMap([], { defaultTtl: 100, keepAlive: false });

    map.set('a', 1);
    equal(map.size, 1);
    equal(map.get('a'), 1);

    map.set('a', 1, 3000);
    equal(map.size, 1);
    equal(map.get('a'), 1);

    await sleep(500);

    equal(map.size, 0);
    equal(map.get('a'), undefined);
  });

  it('should maintain the key when fristly set with time and then set with 0', async (t) => {
    const { equal } = tspl(t, { plan: 6 });

    const map = new ExpirableMap();

    map.set('a', 1, 10);
    equal(map.size, 1);
    equal(map.get('a'), 1);

    map.set('a', 1, 0);
    equal(map.size, 1);
    equal(map.get('a'), 1);

    await sleep(20);

    equal(map.size, 1);
    equal(map.get('a'), 1);
  });

  it('should initialize with the given entries and expiration times', async (t) => {
    const { equal } = tspl(t, { plan: 9 });

    const map = new ExpirableMap([
      ['a', 1, 10],
      ['b', 2, 20]
    ]);

    equal(map.size, 2);
    equal(map.get('a'), 1);
    equal(map.get('b'), 2);

    await sleep(15);

    equal(map.size, 1);
    equal(map.get('a'), undefined);
    equal(map.get('b'), 2);

    await sleep(15);

    equal(map.size, 0);
    equal(map.get('a'), undefined);
    equal(map.get('b'), undefined);
  });

  it('should clear the timeout in setExpiration if the timeout is already set ', async (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const map = new ExpirableMap<string, number>();
    map.set('a', 20, 100);
    map.setExpiration('a', 20);

    await sleep(20);

    equal(map.size, 0);
  });

  it('should return undefined if the map has no the key', async (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const map = new ExpirableMap();

    equal(map.setExpiration('a', 1), undefined);
  });

  it('should unref timeouts', async (t) => {
    const { equal } = tspl(t, { plan: 2 });

    const map = new ExpirableMap([], { unrefTimeouts: true });

    map.set('a', 20, 10);

    await sleep(11);

    equal(map.size, 0);
    equal(map.get('a'), undefined);
  });

  it('should throw if ttl is not a number', async (t) => {
    const { throws } = tspl(t, { plan: 1 });

    const map = new ExpirableMap();

    throws(
      () => {
        // @ts-expect-error - we're testing this
        map.set('a', 10, true);
      },
      { message: 'TTL must be a number' }
    );
  });

  it('should never expire', async (t) => {
    const { equal } = tspl(t, { plan: 6 });

    const map = new ExpirableMap();

    map.set('a', 1, 20);
    map.set('b', 2);

    equal(map.size, 2);

    await sleep(21);

    equal(map.size, 1);
    equal(map.get('a'), undefined);
    equal(map.get('b'), 2);

    map.setExpiration('b', 0);

    await sleep(20);

    equal(map.size, 1);
    equal(map.get('b'), 2);
  });
});
