import { describe, it } from 'node:test';
import { tspl } from '@matteo.collina/tspl';
import { ExpirableLinkedList } from '../src/LinkedList';
import { sleep } from '../src/utils';

describe('LinkedList', async () => {
  it('should create a linked list', (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const emptyList = new ExpirableLinkedList();
    const simpleList = new ExpirableLinkedList([1, 2, 3]);
    const simpleListWithDefaultTtl = new ExpirableLinkedList([1, 2, 3], {
      defaultTtl: 10
    });
    const complexList = new ExpirableLinkedList([[1], 2, [3, 10]]);

    equal(emptyList.length, 0);
    equal(simpleList.length, 3);
    equal(simpleListWithDefaultTtl.length, 3);
    equal(complexList.length, 3);
  });

  it('should act as a LinkedList if defaultTtl is 0', (t) => {
    const { equal } = tspl(t, { plan: 3 });

    const list = new ExpirableLinkedList([1, 2, 3]);

    equal(list.head?.value, 1);
    equal(list.head?.next?.value, 2);
    equal(list.tail?.value, 3);
  });

  it('should prepend an element in both an empty and filled list', (t) => {
    const { equal } = tspl(t, { plan: 6 });

    const list = new ExpirableLinkedList([1, 2, 3, 4]);

    list.prepend(4, 1000); // 4 will expire after 1s, adding second parameter only for coverage

    equal(list.head?.value, 4);
    equal(list.head?.next?.value, 1);
    equal(list.head?.next?.next?.value, 2);
    equal(list.head?.next?.next?.next?.value, 3);
    equal(list.tail?.value, 4);

    const list2 = new ExpirableLinkedList();
    list2.prepend(4);

    equal(list2.head?.value, 4);
  });

  it('should clear the list', (t) => {
    const { equal } = tspl(t, { plan: 2 });

    const list = new ExpirableLinkedList([1, 2, 3]);
    equal(list.length, 3);
    list.clear();
    equal(list.length, 0);
  });

  it('should return false when removing an element that does not exist', (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const list = new ExpirableLinkedList([1, 2, 3]);
    equal(list.remove(Symbol()), false);
  });

  it('should remove the first element after the expiration time', async (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const list = new ExpirableLinkedList([1, 2, 3], {
      defaultTtl: 10,
      unrefTimeouts: true
    });

    await sleep(20);

    equal(list.head, null);
  });

  it('should set an expirable entry and remote it after the expiration time', async (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const list = new ExpirableLinkedList([1, 2, 3], {
      defaultTtl: 10
    });

    equal(list.length, 3);
    await sleep(20);
    equal(list.length, 0);

    list.prepend(4, 30);
    await sleep(10);
    equal(list.length, 1);

    await sleep(20);
    equal(list.length, 0);
  });

  it('should allow entries to define a specific ttl and let them expire accordingly', async (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const list = new ExpirableLinkedList([[1, 30], 2, [3, 50]], {
      defaultTtl: 10
    }); // 2 will expire after 10ms, 1 after 30ms and 3 after 50ms

    equal(list.length, 3);
    await sleep(11);
    equal(list.length, 2);
    await sleep(20);
    equal(list.length, 1);
    await sleep(20);
    equal(list.length, 0);
  });

  it('should remove an entry when remove is called by using the id', (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const list = new ExpirableLinkedList([1, 2, 3], { defaultTtl: 10 });
    equal(list.length, 3);
    list.remove(list.head!.id);
    equal(list.length, 2);
    list.remove(list.head!.id);
    equal(list.length, 1);
    list.remove(list.head!.id);
    equal(list.length, 0);
  });

  it('should remove an entry when remove is called by using the node', (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const list = new ExpirableLinkedList([1, 2, 3], { defaultTtl: 10 });
    equal(list.length, 3);
    list.remove(list.head!);
    equal(list.length, 2);
    list.remove(list.head!);
    equal(list.length, 1);
    list.remove(list.head!);
    equal(list.length, 0);
  });

  it('should get the correct entry when get is called by using the id', (t) => {
    const { equal } = tspl(t, { plan: 2 });

    const list = new ExpirableLinkedList();
    const key1 = list.append(1);
    const key2 = list.append(2);

    equal(list.get(key1)?.value, 1);
    equal(list.get(key2)?.value, 2);
  });

  it('should return undefined if the node is null', (t) => {
    const { equal } = tspl(t, { plan: 1 });

    const list = new ExpirableLinkedList();
    const key = list.append(1);

    // @ts-expect-error - we're testing this
    list.head! = null;

    equal(list.get(key), undefined);
  });

  it('should not expire with ttl 0 in setExpiration', async (t) => {
    const { equal } = tspl(t, { plan: 3 });

    const list = new ExpirableLinkedList();
    const val = Symbol(1);

    list.append(val);
    equal(list.length, 1);
    equal(list.head?.value, val);

    list.setExpiration(val, 0);

    await sleep(20);

    equal(list.length, 1);
  });

  it('should instance the id as linked node and as value', async (t) => {
    const { equal } = tspl(t, { plan: 4 });

    const list = new ExpirableLinkedList();
    const list2 = new ExpirableLinkedList([1], { defaultTtl: 10 });

    list.append(list2);

    equal(list.length, 1);
    equal(list.head?.value, list2);

    // @ts-expect-error - we're testing this
    list.setExpiration(list2, 10);

    await sleep(20);

    equal(list.length, 1);
    equal(list2.length, 0);
  });
});
