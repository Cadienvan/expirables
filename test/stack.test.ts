import t from 'tap';
import { ExpirableStack } from '../src/Stack';
import { sleep } from '../src/utils';

t.test('ExpirableStack', (t) => {
  t.plan(11);

  t.test('should create a stack', (t) => {
    t.plan(5);

    const emptyStack = new ExpirableStack();
    const simpleStack = new ExpirableStack([1, 2, 3]);
    const complexStackWithoutTtl = new ExpirableStack([[1], 2, [3]]);
    const complexStackWithTtl = new ExpirableStack([[1, 10], 2, [3, 20]]);
    const stackWithObjects = new ExpirableStack([{ a: 1 }, { b: 2 }]);

    t.equal(emptyStack.size, 0);
    t.equal(simpleStack.size, 3);
    t.equal(complexStackWithoutTtl.size, 3);
    t.equal(complexStackWithTtl.size, 3);
    t.equal(stackWithObjects.size, 2);
  });

  t.test('should act as stack if defaultTtl is 0', (t) => {
    t.plan(4);

    const stack = new ExpirableStack([1, 2, 3]);

    t.equal(stack.pop(), 1);
    t.equal(stack.pop(), 2);
    t.equal(stack.pop(), 3);
    t.equal(stack.pop(), undefined);
  });

  t.test('should return the correct next element', (t) => {
    t.plan(1);

    const stack = new ExpirableStack([1, 2, 3]);

    t.equal(stack.next, 3);
  });

  t.test(
    'should allow entries to define a specific ttl and let them expire accordingly',
    async (t) => {
      t.plan(4);

      const stack = new ExpirableStack([[1, 30], 2, [3, 50]], {
        defaultTtl: 10
      }); // 2 will expire after 10ms, 1 after 30ms and 3 after 50ms

      t.equal(stack.size, 3);
      await sleep(11);
      t.equal(stack.size, 2);
      await sleep(20);
      t.equal(stack.size, 1);
      await sleep(20);
      t.equal(stack.size, 0);
    }
  );

  t.test(
    'should remove the first element after the expiration time',
    async (t) => {
      t.plan(3);

      const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

      t.equal(stack.pop(), 1);
      t.equal(stack.pop(), 2);
      await sleep(20);
      t.equal(stack.pop(), undefined);
    }
  );

  t.test(
    'should set an expirable entry and remove it after the expiration time',
    async (t) => {
      t.plan(5);

      const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

      t.equal(stack.size, 3);
      await sleep(20);
      t.equal(stack.size, 0);
      stack.push(4, 30);
      t.equal(stack.size, 1);
      await sleep(20);
      t.equal(stack.size, 1);
      await sleep(20);
      t.equal(stack.size, 0);
    }
  );

  t.test('should throw an error if the ttl is not a number', (t) => {
    t.plan(1);

    const stack = new ExpirableStack();

    t.throws(
      () => {
        stack.push(1, '10' as any);
      },
      { message: 'TTL must be a number' }
    );
  });

  t.test('should return nothing if the element popped is undefined', (t) => {
    t.plan(1);

    const stack = new ExpirableStack();

    t.equal(stack.pop(), undefined);
  });

  t.test(
    'should clear the timeout in setExpiration if the timeout is already set ',
    async (t) => {
      t.plan(1);

      const key = Symbol('key');

      const stack = new ExpirableStack();
      stack.setExpiration(key, 100);
      stack.setExpiration(key, 20);

      await sleep(20);

      t.equal(stack.size, 0);
    }
  );

  t.test('should unref the timeout if passed in options', async (t) => {
    t.plan(1);

    const stack = new ExpirableStack([1, 2, 3], {
      defaultTtl: 10,
      unrefTimeouts: true
    });

    await sleep(20);

    t.equal(stack.size, 0);
  });

  t.test(
    'should next return undefined if the length is less or equal 0',
    (t) => {
      t.plan(1);

      const stack = new ExpirableStack();

      t.equal(stack.next, undefined);
    }
  );
});

t.test('ExpirableStack hooks', (t) => {
  t.plan(4);

  t.test(
    'should call the beforeExpire hook before an entry expires',
    async (t) => {
      t.plan(3);

      const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

      let i = 0;
      stack.addHook('beforeExpire', (value) => {
        i++;
        t.equal(value, i);
      });

      await sleep(20);
    }
  );

  t.test(
    'should call the afterExpire hook after an entry expires',
    async (t) => {
      t.plan(3);

      const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

      let i = 0;
      stack.addHook('afterExpire', (value) => {
        i++;
        t.equal(value, i);
      });

      await sleep(20);
    }
  );

  t.test('should throw an error if the hook is not valid', (t) => {
    t.plan(1);

    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

    t.throws(() => {
      stack.addHook('invalidHook' as any, () => ({}));
    });
  });

  t.test('should throw if the hook does not exist', (t) => {
    t.plan(1);

    const stack = new ExpirableStack([1, 2, 3], { defaultTtl: 10 });

    t.throws(() => {
      stack.runHook('invalidHook' as any);
    });
  });
});
