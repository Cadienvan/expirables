import t from 'tap';
import { ExpirableMap } from '../src/Map';
import { sleep } from '../src/utils';

t.test('ExpirableMap', (t) => {
  t.plan(13);

  t.test('should create a map', (t) => {
    t.plan(3);

    const emptyMap = new ExpirableMap();
    const simpleMap = new ExpirableMap([
      ['a', 1, 10],
      ['b', 2, 20]
    ]);
    const simpleMapWithDefaultTtl = new ExpirableMap([
      ['a', 1],
      ['b', 2]
    ]);

    t.equal(emptyMap.size, 0);
    t.equal(simpleMap.size, 2);
    t.equal(simpleMapWithDefaultTtl.size, 2);
  });

  t.test('should initialize the map with the given values', (t) => {
    t.plan(2);

    const map = new ExpirableMap([
      ['a', 1, 10],
      ['b', 2, 20]
    ]);

    t.equal(map.get('a'), 1);
    t.equal(map.get('b'), 2);
  });

  t.test('should set the expiration time for a key', (t) => {
    t.plan(2);

    const map = new ExpirableMap();
    map.set('a', 1, 10);

    t.equal(map.size, 1);
    t.equal(map.get('a'), 1);
  });

  t.test('should remove the key after the expiration time', async (t) => {
    t.plan(4);

    const map = new ExpirableMap();
    map.set('a', 1, 10);

    t.equal(map.size, 1);
    t.equal(map.get('a'), 1);

    await sleep(20);

    t.equal(map.size, 0);
    t.equal(map.get('a'), undefined);
  });

  t.test('should keep the key if the expiration time is 0', async (t) => {
    t.plan(6);

    const map = new ExpirableMap();

    map.set('a', 1, 0);
    t.equal(map.size, 1);
    t.equal(map.get('a'), 1);

    map.set('a', 1, 30);
    t.equal(map.size, 1);
    t.equal(map.get('a'), 1);

    await sleep(20);

    t.equal(map.size, 1);
    t.equal(map.get('a'), 1);
  });

  t.test(
    'should remove the key when set twice without keepAlive and time passed',
    async (t) => {
      t.plan(6);

      const map = new ExpirableMap([], { defaultTtl: 100, keepAlive: false });

      map.set('a', 1);
      t.equal(map.size, 1);
      t.equal(map.get('a'), 1);

      map.set('a', 1, 3000);
      t.equal(map.size, 1);
      t.equal(map.get('a'), 1);

      await sleep(500);

      t.equal(map.size, 0);
      t.equal(map.get('a'), undefined);
    }
  );

  t.test(
    'should maintain the key when fristly set with time and then set with 0',
    async (t) => {
      t.plan(6);

      const map = new ExpirableMap();

      map.set('a', 1, 10);
      t.equal(map.size, 1);
      t.equal(map.get('a'), 1);

      map.set('a', 1, 0);
      t.equal(map.size, 1);
      t.equal(map.get('a'), 1);

      await sleep(20);

      t.equal(map.size, 1);
      t.equal(map.get('a'), 1);
    }
  );

  t.test(
    'should initialize with the given entries and expiration times',
    async (t) => {
      t.plan(9);

      const map = new ExpirableMap([
        ['a', 1, 10],
        ['b', 2, 20]
      ]);

      t.equal(map.size, 2);
      t.equal(map.get('a'), 1);
      t.equal(map.get('b'), 2);

      await sleep(15);

      t.equal(map.size, 1);
      t.equal(map.get('a'), undefined);
      t.equal(map.get('b'), 2);

      await sleep(15);

      t.equal(map.size, 0);
      t.equal(map.get('a'), undefined);
      t.equal(map.get('b'), undefined);
    }
  );

  t.test(
    'should clear the timeout in setExpiration if the timeout is already set ',
    async (t) => {
      t.plan(1);

      const map = new ExpirableMap<string, number>();
      map.set('a', 20, 100);
      map.setExpiration('a', 20);

      await sleep(20);

      t.equal(map.size, 0);
    }
  );

  t.test('should return undefined if the map has no the key', async (t) => {
    t.plan(1);

    const map = new ExpirableMap();

    t.equal(map.setExpiration('a', 1), undefined);
  });


  t.test('should unref timeouts', async (t) => {
    t.plan(2);

    const map = new ExpirableMap([], { unrefTimeouts: true });

    map.set('a', 20, 10);

    await sleep (11);

    t.equal(map.size, 0);
    t.equal(map.get('a'), undefined);
  });

  t.test('should throw if ttl is not a number', async (t) => {
    t.plan(1);

    const map = new ExpirableMap();

    t.throws(() => {
      // @ts-expect-error - we're testing this
      map.set('a', 10, true);
    }, { message: 'TTL must be a number'})
  });

  t.test('should never expire', async (t) => {
    t.plan(6);

    const map = new ExpirableMap();

    map.set('a', 1, 20);
    map.set('b', 2);

    t.equal(map.size, 2);

    await sleep(21);

    t.equal(map.size, 1);
    t.equal(map.get('a'), undefined);
    t.equal(map.get('b'), 2);

    map.setExpiration('b', 0);

    await sleep(20);

    t.equal(map.size, 1);
    t.equal(map.get('b'), 2);
  });
});
