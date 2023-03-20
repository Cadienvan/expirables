import t from 'tap';
import { ExpirableLinkedList } from '../src/LinkedList';
import { sleep } from '../src/utils';

t.test('LinkedList', (t) => {
  t.plan(14);

  t.test('should create a linked list', (t) => {
    t.plan(4);

    const emptyList = new ExpirableLinkedList();
    const simpleList = new ExpirableLinkedList([1, 2, 3]);
    const simpleListWithDefaultTtl = new ExpirableLinkedList([1, 2, 3], {
      defaultTtl: 10
    });
    const complexList = new ExpirableLinkedList([[1], 2, [3, 10]]);

    t.equal(emptyList.length, 0);
    t.equal(simpleList.length, 3);
    t.equal(simpleListWithDefaultTtl.length, 3);
    t.equal(complexList.length, 3);
  });

  t.test('should act as a LinkedList if defaultTtl is 0', (t) => {
    t.plan(3);

    const list = new ExpirableLinkedList([1, 2, 3]);

    t.equal(list.head?.value, 1);
    t.equal(list.head?.next?.value, 2);
    t.equal(list.tail?.value, 3);
  });

  t.test('should prepend an element in both an empty and filled list', (t) => {
    t.plan(6);

    const list = new ExpirableLinkedList([1, 2, 3, 4]);

    list.prepend(4, 1000); // 4 will expire after 1s, adding second parameter only for coverage

    t.equal(list.head?.value, 4);
    t.equal(list.head?.next?.value, 1);
    t.equal(list.head?.next?.next?.value, 2);
    t.equal(list.head?.next?.next?.next?.value, 3);
    t.equal(list.tail?.value, 4);

    const list2 = new ExpirableLinkedList();
    list2.prepend(4);

    t.equal(list2.head?.value, 4);
  });

  t.test('should clear the list', (t) => {
    t.plan(2);

    const list = new ExpirableLinkedList([1, 2, 3]);
    t.equal(list.length, 3);
    list.clear();
    t.equal(list.length, 0);
  });

  t.test('should return false when removing an element that does not exist', (t) => {
    t.plan(1);

    const list = new ExpirableLinkedList([1, 2, 3]);
    t.equal(list.remove(Symbol()), false);
  });

  t.test('should remove the first element after the expiration time', async (t) => {
    t.plan(1);

    const list = new ExpirableLinkedList([1, 2, 3], {
      defaultTtl: 10,
      unrefTimeouts: true
    });

    await sleep(20);

    t.equal(list.head, null);
  });

  t.test('should set an expirable entry and remote it after the expiration time', async (t) => {
    t.plan(4);

    const list = new ExpirableLinkedList([1, 2, 3], {
      defaultTtl: 10
    });

    t.equal(list.length, 3);
    await sleep(20);
    t.equal(list.length, 0);

    list.prepend(4, 30);
    await sleep(10);
    t.equal(list.length, 1);

    await sleep(20);
    t.equal(list.length, 0);
  });

  t.test('should allow entries to define a specific ttl and let them expire accordingly', async (t) => {
    t.plan(4);

    const list = new ExpirableLinkedList([[1, 30], 2, [3, 50]], {
      defaultTtl: 10
    }); // 2 will expire after 10ms, 1 after 30ms and 3 after 50ms

    t.equal(list.length, 3);
    await sleep(11);
    t.equal(list.length, 2);
    await sleep(20);
    t.equal(list.length, 1);
    await sleep(20);
    t.equal(list.length, 0);
  });

  t.test('should remove an entry when remove is called by using the id', (t) => {
    t.plan(4);

    const list = new ExpirableLinkedList([1, 2, 3], { defaultTtl: 10 });
    t.equal(list.length, 3);
    list.remove(list.head!.id);
    t.equal(list.length, 2);
    list.remove(list.head!.id);
    t.equal(list.length, 1);
    list.remove(list.head!.id);
    t.equal(list.length, 0);
  });

  t.test('should remove an entry when remove is called by using the node', (t) => {
    t.plan(4);

    const list = new ExpirableLinkedList([1, 2, 3], { defaultTtl: 10 });
    t.equal(list.length, 3);
    list.remove(list.head!);
    t.equal(list.length, 2);
    list.remove(list.head!);
    t.equal(list.length, 1);
    list.remove(list.head!);
    t.equal(list.length, 0);
  });

  t.test('should get the correct entry when get is called by using the id', (t) => {
    t.plan(2);

    const list = new ExpirableLinkedList();
    const key1 = list.append(1);
    const key2 = list.append(2);

    t.equal(list.get(key1)?.value, 1);
    t.equal(list.get(key2)?.value, 2);
  });

  t.test('should return undefined if the node is null', (t) => {
    t.plan(1);

    const list = new ExpirableLinkedList();
    const key = list.append(1);

    // @ts-expect-error - we're testing this
    list.head! = null;

    t.equal(list.get(key), undefined);
  });

  t.test('should not expire with ttl 0 in setExpiration', async (t) => {
    t.plan(3);

    const list = new ExpirableLinkedList();
    const val = Symbol(1);

    list.append(val);
    t.equal(list.length, 1);
    t.equal(list.head?.value, val);

    list.setExpiration(val, 0);

    await sleep(20);

    t.equal(list.length, 1);
  });

  t.test('should instance the id as linked node and as value', async (t) => {
    t.plan(4);

    const list = new ExpirableLinkedList();
    const list2 = new ExpirableLinkedList([1], { defaultTtl: 10 });

    list.append(list2);

    t.equal(list.length, 1);
    t.equal(list.head?.value, list2);

    // @ts-expect-error - we're testing this
    list.setExpiration(list2, 10);

    await sleep(20);

    t.equal(list.length, 1);
    t.equal(list2.length, 0);
  });
});
