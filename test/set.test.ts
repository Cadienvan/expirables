import t from 'tap';
import { ExpirableSet } from '../src/Set';
import { sleep } from '../src/utils';

t.test('ExpirableSet', (t) => {
  t.plan(10);

  t.test('should create a set', (t) => {
    t.plan(4);

    const emptySet = new ExpirableSet();
    const simpleSet = new ExpirableSet(['a', 'b']);
    const simpleSetWithTtl = new ExpirableSet([10, 20], { defaultTtl: 10 });
    const complexSet = new ExpirableSet([['a', 10], 10, [1]]);

    t.equal(emptySet.size, 0);
    t.equal(simpleSet.size, 2);
    t.equal(simpleSetWithTtl.size, 2);
    t.equal(complexSet.size, 3);
  });

  t.test('shoud initialize the set with the given values', (t) => {
    t.plan(3);

    const set = new ExpirableSet(['a', 'b']);
    t.equal(set.size, 2);
    t.ok(set.has('a'));
    t.ok(set.has('b'));
  });

  t.test('should remove the key after the expiration time', async (t) => {
    t.plan(4);

    const set = new ExpirableSet(['a'], { defaultTtl: 10, keepAlive: true });

    t.equal(set.size, 1);
    t.ok(set.has('a'));

    await sleep(15);

    t.equal(set.size, 0);
    t.notOk(set.has('a'));
  });

  t.test('should keep they alive when re-set before expiring', async (t) => {
    t.plan(6);

    const set = new ExpirableSet(['a'], { defaultTtl: 10, keepAlive: true });

    t.equal(set.size, 1);
    t.ok(set.has('a'));

    set.add('a', 30);

    t.equal(set.size, 1);
    t.ok(set.has('a'));

    await sleep(20);

    t.equal(set.size, 1);
    t.ok(set.has('a'));
  });

  t.test('should remove the key when twice withouth keepAlive and time passed', async (t) => {
    t.plan(6);

    const set = new ExpirableSet(['a'], { defaultTtl: 20, keepAlive: false });

    t.equal(set.size, 1);
    t.ok(set.has('a'));

    set.add('a');

    t.equal(set.size, 1);
    t.ok(set.has('a'));

    await sleep(25);

    t.equal(set.size, 0);
    t.notOk(set.has('a'));
  });

  t.test('should maintain the key when firstly set with time and then set with 0', async (t) => {
    t.plan(6);
    const set = new ExpirableSet(['a'], { defaultTtl: 10, keepAlive: true });

    t.equal(set.size, 1);
    t.ok(set.has('a'));

    set.add('a', 0);

    t.equal(set.size, 1);
    t.ok(set.has('a'));

    await sleep(20);

    t.equal(set.size, 1);
    t.ok(set.has('a'));
  });

  t.test('should initialize the map with the given entries and expiration time', async (t) => {
    t.plan(9);

    const set = new ExpirableSet([
      ['a', 10],
      ['b', 20]
    ]);

    t.equal(set.size, 2);
    t.ok(set.has('a'));
    t.ok(set.has('b'));

    await sleep(15);

    t.equal(set.size, 1);
    t.notOk(set.has('a'));
    t.ok(set.has('b'));

    await sleep(10);

    t.equal(set.size, 0);
    t.notOk(set.has('a'));
    t.notOk(set.has('b'));
  });

  t.test('should not expire', async (t) => {
    t.plan(4);

    const set = new ExpirableSet([1, 2, 3]);

    set.setExpiration(1, 0);
    set.setExpiration(2, 10);
    set.setExpiration(3, 0);

    await sleep(20);

    t.equal(set.size, 2);
    t.ok(set.has(1));
    t.ok(set.has(3));
    t.notOk(set.has(2));
  });

  t.test('should set the expiration unrefering the timeout', async (t) => {
    t.plan(2);

    const set = new ExpirableSet([1], { unrefTimeouts: true });

    set.setExpiration(1, 10);

    t.equal(set.size, 1);

    await sleep(15);

    t.notOk(set.has(1));
  });

  t.test('should thrown if ttl is not a number', (t) => {
    t.plan(1);

    const set = new ExpirableSet();

    t.throws(() => {
      // @ts-expect-error - we're testing this
      set.add(1, 'kaboom');
    }, { message: 'TTL must be a number' });
  })
});
